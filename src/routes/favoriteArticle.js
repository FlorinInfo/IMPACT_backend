const express = require("express");
const router = express.Router();
const {
    createFavoriteArticle,
    deleteFavoriteArticle,
} = require("../controllers/favoriteArticle.js");
const {
    identifyUser,
    isApproved,
    isSelf,
    canSeeArticle,
} = require("../middlewares/permissions.js");

router.post(
    "/",
    identifyUser,
    isApproved,
    canSeeArticle,
    createFavoriteArticle
);
router.delete(
    "/:articleId-:userId",
    identifyUser,
    isApproved,
    isSelf,
    canSeeArticle,
    deleteFavoriteArticle
);

module.exports = router;
