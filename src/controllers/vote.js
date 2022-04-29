const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { validateVoteType } = require("../validators/vote.js");
const {
    VoteAlreadyExistsError,
    VoteNotExistsError,
} = require("../errors/vote.js");
const { checkInt } = require("../validators/general.js");
const { InvalidIntegerError } = require("../errors/general.js");

async function modifyVote(req, res, next) {
    try {
        let err;
        const errors = [];
        const currentUser = req.currentUser;
        let { articleId, userId } = req.params;
        const { type } = req.body;

        err = validateVoteType(type);
        if (err) errors.push(err);

        [articleId, userId] = [
            {
                value: articleId,
                title: "articleId",
                details: "Id-ul articolului",
            },
            { value: userId, title: "userId", details: "Id-ul utilizatorului" },
        ].map(({ value, title, details }) => {
            let v;
            if (value) {
                // Try to parse value to integer
                v = parseInt(value, 10);
                if (!checkInt(v)) {
                    errors.push(new InvalidIntegerError({ title, details }));
                }
            }
            return v;
        });

        const oldVote = await prisma.articleVote.findUnique({
            where: {
                userId_articleId: { userId: currentUser.id, articleId },
            },
        });
        if (!oldVote) return next([new VoteInvalidError()]);

        if (oldVote.type === "UPVOTE" && type === "DOWNVOTE") {
            const updateVote = await prisma.articleVote.update({
                where: {
                    userId_articleId: { userId: currentUser.id, articleId },
                },
                data: {
                    type,
                },
            });

            const updateArticle = await prisma.article.update({
                where: { id: articleId },
                data: {
                    votePoints: {
                        increment: -2,
                    },
                },
            });
        } else if (oldVote.type === "DOWNVOTE" && type === "UPVOTE") {
            const updateVote = await prisma.articleVote.update({
                where: {
                    userId_articleId: { userId: currentUser.id, articleId },
                },
                data: {
                    type,
                },
            });

            const updateArticle = await prisma.article.update({
                where: { id: articleId },
                data: {
                    votePoints: {
                        increment: 2,
                    },
                },
            });
        }

        res.sendStatus(204);
    } catch (err) {
        return next([err]);
    }
}

async function createVote(req, res, next) {
    try {
        const currentUser = req.currentUser;
        let { articleId } = req.params;
        let { type } = req.body;

        articleId = parseInt(articleId, 10);
        if (!checkInt(articleId)) {
            return next([
                new InvalidIntegerError({
                    title: "articleId",
                    details: "Id-ul articolului",
                }),
            ]);
        }

        err = validateVoteType(req.body);
        if (err) return next([err]);

        let vote = await prisma.articleVote.findUnique({
            where: {
                userId_articleId: { userId: currentUser.id, articleId },
            },
        });
        if (vote) return next([new VoteAlreadyExistsError()]);

        vote = await prisma.articleVote.create({
            data: {
                user: {
                    connect: { id: currentUser.id },
                },
                article: { connect: { id: articleId } },
                type: type,
            },
        });
        if (type === "UPVOTE") {
            const updateArticle = await prisma.article.update({
                where: { id: articleId },
                data: {
                    votePoints: {
                        increment: 1,
                    },
                },
            });
        } else {
            const updateArticle = await prisma.article.update({
                where: { id: articleId },
                data: {
                    votePoints: {
                        increment: -1,
                    },
                },
            });
        }

        res.sendStatus(201);
    } catch (err) {
        return next([err]);
    }
}

async function deleteVote(req, res, next) {
    try {
        const currentUser = req.currentUser;
        let { articleId } = req.params;

        articleId = parseInt(articleId, 10);
        if (!checkInt(articleId)) {
            return next([
                new InvalidIntegerError({
                    title: "articleId",
                    details: "Id-ul articolului",
                }),
            ]);
        }

        let vote = await prisma.articleVote.findUnique({
            where: {
                userId_articleId: { userId: currentUser.id, articleId },
            },
        });
        if (!vote) return next([new VoteNotExistsError()]);

        const deleteVote = await prisma.articleVote.delete({
            where: {
                userId_articleId: { userId: currentUser.id, articleId },
            },
        });
        if (vote.type === "UPVOTE") {
            const updateArticle = await prisma.article.update({
                where: { id: articleId },
                data: {
                    votePoints: {
                        increment: -1,
                    },
                },
            });
        } else {
            const updateArticle = await prisma.article.update({
                where: { id: articleId },
                data: {
                    votePoints: {
                        increment: 1,
                    },
                },
            });
        }

        return res.sendStatus(204);
    } catch (err) {
        return next([err]);
    }
}

module.exports = {
    modifyVote,
    createVote,
    deleteVote,
};
