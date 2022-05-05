const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
    FavoriteArticleAlreadyExistsError,
    FavoriteArticleNotExistsError,
} = require("../errors/favoriteArticle.js");
const { checkInt } = require("../validators/general.js");
const { InvalidIntegerError } = require("../errors/general.js");
const { getFirstDayOfMonth } = require("../utils/date.js");

async function createFavoriteArticle(req, res, next) {
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

        let favoriteArticle = await prisma.articleFavorite.findUnique({
            where: {
                userId_articleId: { userId: currentUser.id, articleId },
            },
        });
        if (favoriteArticle)
            return next([new FavoriteArticleAlreadyExistsError()]);

        favoriteArticle = await prisma.articleFavorite.create({
            data: {
                user: {
                    connect: { id: currentUser.id },
                },
                article: { connect: { id: articleId } },
            },
        });

        const updateUser = await prisma.user.update({
            where: { id: currentUser.id },
            data: {
                monthlyPoints: {
                    increment: 2,
                },
                points: {
                    increment: 2,
                },
            },
        });

        res.sendStatus(201);
    } catch (err) {
        return next([err]);
    }
}

async function deleteFavoriteArticle(req, res, next) {
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

        let favoriteArticle = await prisma.articleFavorite.findUnique({
            where: {
                userId_articleId: { userId: currentUser.id, articleId },
            },
        });
        if (!favoriteArticle)
            return next([new FavoriteArticleNotExistsError()]);

        const updateUserData = {};
        updateUserData["points"] = { increment: -2 };
        const currentDate = new Date();
        if (
            favoriteArticle.createTime >=
            getFirstDayOfMonth(
                currentDate.getFullYear(),
                currentDate.getMonth()
            )
        ) {
            updateUserData["monthlyPoints"] = { increment: -2 };
        }
        const updateUser = await prisma.user.update({
            where: { id: currentUser.id },
            data: updateUserData,
        });

        const deleteFavoriteArticle = await prisma.articleFavorite.delete({
            where: {
                userId_articleId: { userId: currentUser.id, articleId },
            },
        });

        return res.sendStatus(204);
    } catch (err) {
        return next([err]);
    }
}

module.exports = {
    createFavoriteArticle,
    deleteFavoriteArticle,
};
