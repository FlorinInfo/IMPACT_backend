const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { validateArticleBody } = require("../validators/article.js");
const { InvalidIntegerError } = require("../errors/general.js");
const { InsufficientPermissionsError } = require("../errors/permissions.js");
const { checkInt } = require("../validators/general.js");
const { checkPermissionsHierarchically } = require("../utils/permissions.js");
const { LocalityInvalidError, VillageInvalidError } = require("../errors/locality.js");

async function getArticles(req, res, next) {
    try {
        const articles = await prisma.article.findMany();

        res.status(200).json(articles);
    } catch (err) {
        return next([err]);
    }
}

async function createArticle(req, res, next) {
    try {
        let err;
        let errors = [];
        let article;

        const currentUser = req.currentUser;
        const { zone, title, description, articleGallery } = req.body;
        let { zoneId } = req.body;

        errors = validateArticleBody(req.body, currentUser);

        if (zoneId !== undefined) {
            zoneId = parseInt(zoneId, 10);
            if (!checkInt(zoneId)) {
                errors.push([
                    new InvalidIntegerError({
                        title: "zoneId",
                        details: "Id-ul zonei",
                    }),
                ]);
            }
        }

        if (errors.length) return next(errors);

        if (currentUser.admin === false) {
            if (zone === "LOCALITY") {
                if (zoneId !== undefined && zoneId !== currentUser.localityId) {
                    if (
                        currentUser.zoneRole !== "MODERATOR" &&
                        currentUser.zoneRole !== "ADMINISTRATOR"
                    )
                        return next([new InsufficientPermissionsError()]);

                    const locality = await prisma.locality.findUnique({
                        where: {
                            id: zoneId,
                        },
                        select: {
                            village: {
                                select: {
                                    id: true,
                                    countyId: true,
                                },
                            },
                        },
                    });
                    if (!locality) return next([new LocalityInvalidError()]);

                    err = checkPermissionsHierarchically(
                        currentUser,
                        locality.village.countyId,
                        locality.village.id,
                        locality.id
                    );
                    if (err) return next([err]);
                    article = {
                        locality: {
                            connect: {
                                id: zoneId,
                            },
                        },
                    };
                } else {
                    article = {
                        locality: {
                            connect: {
                                id: currentUser.localityId,
                            },
                        },
                    };
                }
            } else if (zone === "VILLAGE") {
                if (zoneId !== undefined && zoneId !== currentUser.villageId) {
                    if (
                        currentUser.zoneRole !== "MODERATOR" &&
                        currentUser.zoneRole !== "ADMINISTRATOR"
                    )
                        return next([new InsufficientPermissionsError()]);

                    const village = await prisma.village.findUnique({
                        where: {
                            id: zoneId,
                        },
                        select: {
                            id: true,
                            countyId: true,
                        },
                    });
                    if (!village) return next([new VillageInvalidError()]);

                    err = checkPermissionsHierarchically(
                        currentUser,
                        village.countyId,
                        village.id
                    );
                    if (err) return next([err]);
                    article = {
                        village: {
                            connect: {
                                id: zoneId,
                            },
                        },
                    };
                } else {
                    article = {
                        village: {
                            connect: {
                                id: currentUser.villageId,
                            },
                        },
                    };
                }
            } else if (zone === "COUNTY") {
                if (zoneId !== undefined && zoneId !== currentUser.county) {
                    return next([new InsufficientPermissionsError()]);
                }

                article = {
                    county: {
                        connect: {
                            id: currentUser.countyId,
                        },
                    },
                };
            }

            if (Array.isArray(articleGallery) && articleGallery.length > 0) {
                article = {
                    ...article,
                    zone,
                    title,
                    description,
                    author: {
                        connect: {
                            id: currentUser.id,
                        },
                    },
                    roleUser: currentUser.zoneRole,
                    articleGallery: {
                        createMany: {
                            data: articleGallery.map(({ type, url }) => {
                                return { type, url };
                            }),
                        },
                    },
                };
            } else {
                article = {
                    ...article,
                    zone,
                    title,
                    author: {
                        connect: {
                            id: currentUser.id,
                        },
                    },
                    description,
                    roleUser: currentUser.zoneRole,
                };
            }
        } else {
            if (Array.isArray(articleGallery) && articleGallery.length > 0) {
                article = {
                    title,
                    description,
                    author: {
                        connect: {
                            id: currentUser.id,
                        },
                    },
                    articleGallery: {
                        createMany: {
                            data: articleGallery.map(({ type, url }) => {
                                return { type, url };
                            }),
                        },
                    },
                    admin: true,
                };
            } else {
                article = {
                    title,
                    author: {
                        connect: {
                            id: currentUser.id,
                        },
                    },
                    description,
                    admin: true,
                };
            }
        }

        const createArticle = await prisma.article.create({
            data: article,
        });

        res.sendStatus(201);
    } catch (err) {
        return next([err]);
    }
}

async function getArticle(req, res, next) {
    try {
    } catch (err) {
        return next([err]);
    }
}

module.exports = {
    getArticles,
    getArticle,
    createArticle,
};
