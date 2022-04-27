const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const {
    validateArticleBody,
    validateArticleStatus,
} = require("../validators/article.js");
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
        const currentUser = req.currentUser;
        let select = {
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
            votePoints: true,
            votes: {
                where: {
                    userId: currentUser.id,
                },
                select: {
                    type: true,
                },
            },
        };

        let err;
        let errors = [];
        const articlesQuery = {};
        let articlesOrder;

        let { countyId, villageId, localityId, offset, limit, cursor } =
            req.query;
        let { recent, completed, best, admin, inProgress } = req.query;

        if (!!recent + !!completed + !!best + !!admin + !!inProgress > 1) {
            return next([
                new CustomHTTPError({
                    type: "ActionInvalidError",
                    title: "search",
                    details: "Trebuie sa folosesti doar un filtru.",
                    statusCode: 400,
                }),
            ]);
        }

        [offset, limit, countyId, villageId, localityId, cursor] = [
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
            { value: cursor, title: "cursor", details: "Cursor-ul" },
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
        } else if (inProgress === "true") {
            articlesQuery["status"] = {
                not: "EFECTUAT",
            };
        } else if (best === "true") {
            articlesOrder = { votePoints: "desc" };
        } else if (admin === "true") {
            const articlesCount = await prisma.article.count({
                where: {
                    admin: true,
                },
            });
            let articles;
            if (cursor) {
                articles = await prisma.article.findMany({
                    skip: 1,
                    cursor: {
                        id: cursor,
                    },
                    take: limit,
                    where: { admin: true },
                    select,
                });
            } else {
                articles = await prisma.article.findMany({
                    skip: offset,
                    take: limit,
                    where: { admin: true },
                    select,
                });
            }

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
        });

        if (articlesOrder) {
            if (cursor) {
                articles = await prisma.article.findMany({
                    where: articlesQuery,
                    orderBy: articlesOrder,
                    take: limit,
                    skip: 1,
                    cursor: {
                        id: cursor,
                    },
                    select,
                });
            } else {
                articles = await prisma.article.findMany({
                    where: articlesQuery,
                    orderBy: articlesOrder,
                    take: limit,
                    skip: offset,
                    select,
                });
            }
        } else {
            if (cursor) {
                articles = await prisma.article.findMany({
                    where: articlesQuery,
                    take: limit,
                    cursor: {
                        id: cursor,
                    },
                    skip: 1,
                    select,
                });
            } else {
                articles = await prisma.article.findMany({
                    where: articlesQuery,
                    take: limit,
                    skip: offset,
                    select,
                });
            }
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
                if (zoneId !== undefined && zoneId !== currentUser.countyId) {
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

            if (
                currentUser.zoneRole !== "CETATEAN" &&
                currentUser.zoneRoleOn === "LOCALITY" &&
                (zone === "COUNTY" || zone === "VILLAGE")
            ) {
                article["roleUser"] = "CETATEAN";
            } else if (
                currentUser.zoneRole !== "CETATEAN" &&
                currentUser.zoneRoleOn === "VILLAGE" &&
                zone === "COUNTY"
            ) {
                article["roleUser"] = "CETATEAN";
            } else {
                article["roleUser"] = currentUser.zoneRole;
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
        const currentArticle = req.article;
        res.status(200).json(currentArticle);
    } catch (err) {
        return next([err]);
    }
}

async function modifyArticle(req, res, next) {
    try {
        let err;
        const newData = {};
        const currentUser = req.currentUser;
        const currentArticle = req.article;

        const { status } = req.body;

        if (status) {
            err = validateArticleStatus(status);
            if (err) return next([err]);
            newData["status"] = status;
        }

        if (currentUser.zoneRole === "CETATEAN")
            return next([new InsufficientPermissionsError({})]);

        if (!currentUser.admin) {
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

        const updateArticle = await prisma.article.update({
            where: {
                id: currentArticle.id,
            },
            data: newData,
        });

        res.sendStatus(204);
    } catch (err) {
        return next([err]);
    }
}

async function deleteArticle(req, res, next) {
    try {
        const currentArticle = req.article;
        const currentUser = req.currentUser;
        if (
            !currentUser.admin &&
            (currentUser.zoneRole !== currentArticle.roleUser ||
                currentUser.id !== currentArticle.authorId)
        ) {
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

        const deleteArticle = await prisma.article.delete({
            where: {
                id: currentArticle.id,
            },
        });

        res.sendStatus(204);
    } catch (err) {
        return next([err]);
    }
}

module.exports = {
    getArticles,
    getArticle,
    createArticle,
    modifyArticle,
    deleteArticle,
};
