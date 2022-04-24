const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { validateArticleBody } = require("../validators/article.js");
const { InvalidIntegerError } = require("../errors/general.js");
const { InsufficientPermissionsError } = require("../errors/permissions.js");
const { checkInt } = require("../validators/general.js");
const { checkPermissionsHierarchically } = require("../utils/permissions.js");
const {
    LocalityInvalidError,
    VillageInvalidError,
} = require("../errors/locality.js");
const { CustomHTTPError } = require("../errors/custom.js");

async function getArticles(req, res, next) {
    try {
        let err;
        let errors = [];
        const articlesQuery = {};
        let articlesOrder;
        const currentUser = req.currentUser;

        let { countyId, villageId, localityId, offset, limit } = req.query;
        let { recent, completed, best, admin } = req.query;

        if (!!recent + !!completed + !!best + !!admin > 1) {
            return next([
                new CustomHTTPError({
                    type: "ActionInvalidError",
                    title: "search",
                    details: "Trebuie sa folosesti doar un filtru.",
                    statusCode: 400,
                }),
            ]);
        }

        [offset, limit, countyId, villageId, localityId] = [
            { value: offset, title: "offset", details: "Offset-ul" },
            { value: limit, title: "limit", details: "Limita" },
            { value: countyId, title: "countyId", details: "Id-ul judetului" },
            {
                value: villageId,
                title: "villageId",
                details: "Id-ul comunei/orasului",
            },
            {
                value: localityId,
                title: "localityId",
                details: "Id-ul localitatii",
            },
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

        if (errors.length) return next(errors);

        if (recent === "true") {
            articlesOrder = { createTime: "desc" };
        } else if (completed === "true") {
            articlesQuery["status"] = "EFECTUAT";
        } else if (best === "true") {
            articlesOrder = { votePoints: "desc" };
        } else if (admin === "true") {
            const articlesCount = await prisma.article.count({
                where: {
                    admin: true,
                },
            });
            const articles = await prisma.article.findMany({
                skip: offset,
                take: limit,
                where: { admin: true },
            });

            return res.status(200).json({ articles, limit: articlesCount });
        }

        if (!!countyId + !!villageId + !!localityId !== 1) {
            return next([
                new CustomHTTPError({
                    type: "ActionInvalidError",
                    title: "search",
                    details: "Trebuie sa folosesti doar un filtru de locatie.",
                    statusCode: 400,
                }),
            ]);
        }

        if (!currentUser.admin) {
            if (localityId) {
                const locality = await prisma.locality.findUnique({
                    where: {
                        id: localityId,
                    },
                    select: {
                        id: true,
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

                articlesQuery["localityId"] = localityId;
            } else if (villageId) {
                if (currentUser.zoneRole === "CETATEAN") {
                    if (currentUser.villageId !== villageId) {
                        err = new InsufficientPermissionsError({});
                    }
                } else {
                    const village = await prisma.village.findUnique({
                        where: {
                            id: villageId,
                        },
                        select: {
                            id: true,
                            countyId: true,
                        },
                    });

                    err = checkPermissionsHierarchically(
                        currentUser,
                        village.countyId,
                        village.id
                    );
                }

                if (err) return next([err]);
                articlesQuery["villageId"] = villageId;
            } else if (countyId) {
                if (currentUser.countyId !== countyId) {
                    err = new InsufficientPermissionsError({});
                }
                if (err) return next([err]);
                articlesQuery["countyId"] = countyId;
            }
        } else {
            if (localityId) {
                articlesQuery["localityId"] = localityId;
            } else if (villageId) {
                articlesQuery["villageId"] = villageId;
            } else if (countyId) {
                articlesQuery["countyId"] = countyId;
            }
        }

        let articles;
        const articlesCount = await prisma.article.count({
            where: articlesQuery,
            select: {
                id: true,
                title: true,
                description: true,
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                roleUser: true,
                status: true,
                createTime: true,
                articleGallery: {
                    select: {
                        url: true,
                        type: true,
                    },
                },
                admin: true,
            },
        });

        if (articlesOrder) {
            articles = await prisma.article.findMany({
                where: articlesQuery,
                orderBy: articlesOrder,
                take: limit,
                skip: offset,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    author: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    roleUser: true,
                    status: true,
                    createTime: true,
                    articleGallery: {
                        select: {
                            url: true,
                            type: true,
                        },
                    },
                    admin: true,
                },
            });
        } else {
            articles = await prisma.article.findMany({
                where: articlesQuery,
                take: limit,
                skip: offset,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    author: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    roleUser: true,
                    status: true,
                    createTime: true,
                    articleGallery: {
                        select: {
                            url: true,
                            type: true,
                        },
                    },
                    admin: true,
                },
            });
        }

        res.status(200).json({ articles, limit: articlesCount });
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
                        return next([new InsufficientPermissionsError({})]);

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
                        return next([new InsufficientPermissionsError({})]);

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
                    return next([new InsufficientPermissionsError({})]);
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

        res.status(201).json({ id: createArticle.id });
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
