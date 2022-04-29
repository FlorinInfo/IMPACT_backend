const express = require("express");
const router = express.Router({ mergeParams: true });
const {
    createVote,
    modifyVote,
    deleteVote,
} = require("../controllers/vote.js");
const {
    identifyUser,
    isApproved,
    isSelf,
    canSeeArticle,
} = require("../middlewares/permissions.js");

router.post("/", identifyUser, isApproved, canSeeArticle, createVote);
router.patch("/", identifyUser, isApproved, isSelf, canSeeArticle, modifyVote);
router.delete("/", identifyUser, isApproved, isSelf, canSeeArticle, deleteVote);

module.exports = router;
