const express = require("express");
const router = express.Router();
const {
    createArticle,
    getArticles,
    getArticle,
    deleteArticle,
    modifyArticle,
} = require("../controllers/article.js");
const {
    identifyUser,
    isApproved,
    canSeeArticle,
} = require("../middlewares/permissions.js");

router.post("/", identifyUser, isApproved, createArticle);
router.get("/", identifyUser, isApproved, getArticles);
router.get("/:articleId", identifyUser, isApproved, canSeeArticle, getArticle);
router.delete(
    "/:articleId",
    identifyUser,
    isApproved,
    canSeeArticle,
    deleteArticle
);
router.patch(
    "/:articleId",
    identifyUser,
    isApproved,
    canSeeArticle,
    modifyArticle
);

const votes = require("./vote.js");
router.use("/:articleId/users/:userId/vote", votes);

const favoriteArticles = require("./favoriteArticle.js");
router.use("/:articleId/users/:userId/favorite", favoriteArticles);

module.exports = router;
