const express = require("express");
const router = express.Router();
const {
    createArticle,
    getArticles,
    getArticle,
} = require("../controllers/article.js");
const { identifyUser, isApproved } = require("../middlewares/permissions.js");

router.post("/", identifyUser, isApproved, createArticle);
router.get("/", identifyUser, isApproved, getArticles);
router.get("/:articleId", identifyUser, isApproved, getArticle);

module.exports = router;
