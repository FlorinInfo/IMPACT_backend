const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { validateArticleBody } = require("../validators/article.js");

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
        let errors = [];
        let article;

        const currentUser = req.currentUser;
        const { zone, title, description, articleGallery, zoneId } = req.body;

        errors = validateArticleBody(req.body, currentUser);
        if (errors.length) return next(errors);

        if (zone === "LOCALITY") {
            if(currentUser.
            article = {
                locality: {
                    connect: {
                        id: currentUser.localityId,
                    },
                },
            };
        } else if (zone === "VILLAGE") {
            article = {
                village: {
                    connect: {
                        id: currentUser.villageId,
                    },
                },
            };
        } else if (zone === "COUNTY") {
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
