const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { InvalidJWT } = require("../errors/jwt.js");
const { InsufficientPermissionsError } = require("../errors/permissions.js");
const { InvalidUserError } = require("../errors/user.js");
const { InvalidIntegerError } = require("../errors/general.js");
const { ArticleInvalidError } = require("../errors/article.js");

const { checkPermissionsHierarchically } = require("../utils/permissions.js");
const { decodeToken } = require("../utils/jwt.js");
const { checkInt } = require("../validators/general.js");

async function identifyUser(req, res, next) {
    try {
        let token = req.get("Authorization");
        if (!token) {
            return next([
                new InvalidJWT({
                    details: "Tokenul de autentificare lipseste.",
                }),
            ]);
        }
        token = token.split(" ")[1];
        if (!token) {
            return next([
                new InvalidJWT({
                    details: "Tokenul de autentificare este invalid.",
                }),
            ]);
        }

        let [tokenBody, err] = decodeToken(token);
        if (err) return next([err]);

        const userId = tokenBody.userId;
        const currentUser = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!currentUser) {
            return next([
                new InvalidUserError({ statusCode: 401, title: "permission" }),
            ]);
        }

        req.currentUser = currentUser;
        return next();
    } catch (err) {
        return next([err]);
    }
}

function isAdmin(req, res, next) {
    const currentUser = req.currentUser;
    if (currentUser.admin) {
        return next();
    } else {
        return next([new InsufficientPermissionsError({})]);
    }
}

function isAdminOrSelf(req, res, next) {
    const currentUser = req.currentUser;
    let { userId } = req.params;

    userId = parseInt(userId, 10);
    if (!checkInt(userId)) {
        return next([
            new InvalidIntegerError({
                title: "userId",
                details: "Id-ul utilizatorului",
            }),
        ]);
    }

    if (currentUser.admin || currentUser.id === userId) {
        return next();
    } else {
        return next([new InsufficientPermissionsError({})]);
    }
}

function isSelf(req, res, next) {
    const currentUser = req.currentUser;
    let { userId } = req.params;

    userId = parseInt(userId, 10);
    if (!checkInt(userId)) {
        return next([
            new InvalidIntegerError({
                title: "userId",
                details: "Id-ul utilizatorului",
            }),
        ]);
    }

    if (currentUser.id === userId) {
        return next();
    } else {
        return next([new InsufficientPermissionsError({})]);
    }
}

function isApproved(req, res, next) {
    const currentUser = req.currentUser;
    if (currentUser.status === "APROBAT") {
        return next();
    } else {
        return next([
            new InsufficientPermissionsError({ type: "not-approved" }),
        ]);
    }
}

async function canSeeArticle(req, res, next) {
    try {
        let err;
        const currentUser = req.currentUser;
        let { articleId } = req.params;
        if (!articleId) {
            articleId = req.body.articleId;
        }

        articleId = parseInt(articleId, 10);
        if (!checkInt(articleId)) {
            return next([
                new InvalidIntegerError({
                    title: "articleId",
                    details: "Id-ul articolului",
                }),
            ]);
        }
        const article = await prisma.article.findUnique({
            where: {
                id: articleId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                articleGallery: {
                    select: {
                        url: true,
                        type: true,
                    },
                },
                votes: {
                    where: {
                        userId: currentUser.id,
                    },
                    select: {
                        type: true,
                    },
                },
                favorites: {
                    where: {
                        userId: currentUser.id,
                    },
                    select: {
                        createTime: true,
                    },
                },
                village: {
                    select: {
                        id: true,
                        countyId: true,
                    },
                },
                locality: {
                    select: {
                        id: true,
                        villageId: true,
                        village: {
                            select: {
                                id: true,
                                countyId: true,
                            },
                        },
                    },
                },
            },
        });
        if (!article) {
            return next([new ArticleInvalidError()]);
        }

        if (currentUser.admin || article.admin) {
            req.article = article;
            return next();
        } else if (
            article.localityId === currentUser.localityId ||
            article.villageId === currentUser.villageId ||
            article.countyId === currentUser.countyId
        ) {
            req.article = article;
            return next();
        } else if (
            currentUser.zoneRole === "MODERATOR" ||
            currentUser.zoneRole === "ADMINISTRATOR"
        ) {
            if (article.localityId) {
                err = checkPermissionsHierarchically(
                    currentUser,
                    article.locality.village.countyId,
                    article.locality.villageId,
                    article.localityId
                );
                if (err) return next([err]);
            } else if (article.villageId) {
                err = checkPermissionsHierarchically(
                    currentUser,
                    article.village.countyId,
                    article.villageId
                );
                if (err) return next([err]);
            }
            req.article = article;
            return next();
        } else return next([new InsufficientPermissionsError({})]);
    } catch (err) {
        return next([err]);
    }
}

module.exports = {
    identifyUser,
    isAdmin,
    isAdminOrSelf,
    isApproved,
    canSeeArticle,
    isSelf,
};
