const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
    CommentNotExistsError,
    MessageInvalidError,
} = require("../errors/comment.js");
const { checkInt, checkString } = require("../validators/general.js");
const { InvalidIntegerError } = require("../errors/general.js");
const { checkPermissionsHierarchically } = require("../utils/permissions.js");
const { InsufficientPermissionsError } = require("../errors/permissions.js");
const { CustomHTTPError } = require("../errors/custom.js");
const { getFirstDayOfMonth } = require("../utils/date.js");

async function createComment(req, res, next) {
    try {
        const currentUser = req.currentUser;
        const currentArticle = req.article;
        const articleId = currentArticle.id;
        let { text, commentId } = req.body;

        if (!checkString(text)) return next([new MessageInvalidError()]);

        const commentData = {
            author: {
                connect: { id: currentUser.id },
            },
            article: { connect: { id: articleId } },
            text,
        };

        if (commentId) {
            if (!checkInt(commentId))
                return next([
                    new InvalidIntegerError({
                        title: "commentId",
                        details: "Id-ul comentariului",
                    }),
                ]);
            const comment = await prisma.comment.findUnique({
                where: {
                    id: commentId,
                },
            });
            if (!comment) return next([new CommentNotExistsError()]);

            if (comment.articleId != articleId)
                return next([
                    new CustomHTTPError({
                        type: "ActionInvalidError",
                        title: "comment",
                        details: "Comentariul nu corespunde articolului.",
                        statusCode: 400,
                    }),
                ]);

            if (comment.commentId) {
                commentData["comment"] = {
                    connect: { id: comment.commentId },
                };
                commentData["parrentComment"] = {
                    connect: { id: commentId },
                };
            } else {
                commentData["comment"] = {
                    connect: { id: commentId },
                };
                commentData["parrentComment"] = {
                    connect: { id: commentId },
                };
            }
        }

        if (currentUser.admin) {
            commentData["admin"] = true;
        } else {
            if (
                currentUser.zoneRole !== "CETATEAN" &&
                currentUser.zoneRoleOn === "LOCALITY" &&
                (currentArticle.zone === "COUNTY" ||
                    currentArticle.zone === "VILLAGE")
            ) {
                commentData["roleUser"] = "CETATEAN";
            } else if (
                currentUser.zoneRole !== "CETATEAN" &&
                currentUser.zoneRoleOn === "VILLAGE" &&
                currentArticle.zone === "COUNTY"
            ) {
                commentData["roleUser"] = "CETATEAN";
            } else {
                commentData["roleUser"] = currentUser.zoneRole;
            }
        }

        let comment = await prisma.comment.create({
            data: commentData,
        });

        const updateUser = await prisma.user.update({
            where: { id: currentUser.id },
            data: {
                monthlyPoints: {
                    increment: 3,
                },
                points: {
                    increment: 3,
                },
            },
        });

        return res.status(201).json({ id: comment.id });
    } catch (err) {
        return next([err]);
    }
}

async function getComments(req, res, next) {
    try {
        const articleId = req.article.id;

        const comments = await prisma.comment.findMany({
            where: {
                articleId,
                commentId: null,
            },
            include: {
                replies: {
                    select: {
                        id: true,
                        author: {
                            select: {
                                lastName: true,
                                firstName: true,
                                monthlyPoints: true,
                            },
                        },
                        createTime: true,
                        authorId: true,
                        admin: true,
                        roleUser: true,
                        text: true,
                        parrentComment: {
                            select: {
                                author: {
                                    select: {
                                        lastName: true,
                                        firstName: true,
                                        id: true,
                                    },
                                },
                                authorId: true,
                                id: true,
                            },
                        },
                    },
                },
                author: {
                    select: {
                        lastName: true,
                        firstName: true,
                        monthlyPoints: true,
                    },
                },
            },
        });

        return res.status(200).json(comments);
    } catch (err) {
        return next([err]);
    }
}

async function deleteComment(req, res, next) {
    try {
        const currentArticle = req.article;
        const currentUser = req.currentUser;
        let { commentId } = req.params;

        commentId = parseInt(commentId, 10);
        if (!checkInt(commentId)) {
            return next([
                new InvalidIntegerError({
                    title: "id",
                    details: "Id-ul comentariului",
                }),
            ]);
        }

        let comment = await prisma.comment.findUnique({
            where: {
                id: commentId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                    },
                },
            },
        });
        if (!comment) return next([new CommentNotExistsError()]);

        if (!currentUser.admin && currentUser.id !== comment.authorId) {
            if (currentUser.zoneRole === "CETATEAN")
                return next([new InsufficientPermissionsError({})]);
            if (
                currentUser.zoneRole === "MODERATOR" &&
                currentArticle.roleUser === "ADMINISTRATOR"
            )
                return next([new InsufficientPermissionsError({})]);

            let localityId, villageId, countyId;
            if (currentArticle.locality) {
                localityId = currentArticle.localityId;
                villageId = currentArticle.locality.village.id;
                countyId = currentArticle.locality.village.countyId;
            } else if (currentArticle.village) {
                villageId = currentArticle.villageId;
                countyId = currentArticle.village.countyId;
            } else {
                countyId = currentArticle.countyId;
            }

            err = checkPermissionsHierarchically(
                currentUser,
                countyId,
                villageId,
                localityId
            );
            if (err) return next([err]);
        }

        const updateUserData = {};
        updateUserData["points"] = { increment: -3 };
        const currentDate = new Date();
        if (
            comment.createTime >=
            getFirstDayOfMonth(
                currentDate.getFullYear(),
                currentDate.getMonth()
            )
        ) {
            updateUserData["monthlyPoints"] = { increment: -3 };
        }
        const updateUser = await prisma.user.update({
            where: { id: comment.author.id },
            data: updateUserData,
        });

        const deteleComment = await prisma.comment.delete({
            where: {
                id: commentId,
            },
        });

        return res.sendStatus(204);
    } catch (err) {
        return next([err]);
    }
}

module.exports = {
    deleteComment,
    getComments,
    createComment,
};
