const express = require("express");
const router = express.Router();
const {
    createUser,
    getUsers,
    modifyUser,
    deleteUser,
} = require("../controllers/user.js");
const { identifyUser } = require("../middlewares/permissions.js");

router.post("/", createUser);
router.get("/", identifyUser, getUsers);
router.patch("/:userId", identifyUser, modifyUser);
router.delete("/:userId", identifyUser, deleteUser);

module.exports = router;
