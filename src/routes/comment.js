const express = require("express");
const router = express.Router({ mergeParams: true });
const {
    createComment,
    getComments,
    deleteComment,
} = require("../controllers/comment.js");
const {
    identifyUser,
    isApproved,
    canSeeArticle,
} = require("../middlewares/permissions.js");

router.post("/", identifyUser, isApproved, canSeeArticle, createComment);
router.get("/", identifyUser, isApproved, canSeeArticle, getComments);
router.delete(
    "/:commentId",
    identifyUser,
    isApproved,
    canSeeArticle,
    deleteComment
);

module.exports = router;
