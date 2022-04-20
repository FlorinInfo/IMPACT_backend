const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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

        const currentUser = req.currentUser;
        const { zone, title, description, articleGalery } = req.body;

        errors = validateArticleBody(req.body);
        if (errors.length) return next(errors);
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
