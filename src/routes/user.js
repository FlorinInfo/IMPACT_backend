const express = require("express");
const router = express.Router();
const {
    createUser,
    getUsers,
    modifyUser,
    deleteUser,
    getUser,
} = require("../controllers/user.js");
const {
    identifyUser,
    canSeeUser,
} = require("../middlewares/permissions.js");

router.post("/", createUser);
router.get("/", identifyUser, getUsers);
router.get("/:userId", identifyUser, canSeeUser, getUser);
router.patch("/:userId", identifyUser, modifyUser);
router.delete("/:userId", identifyUser, deleteUser);

module.exports = router;
