const express = require("express");
const router = express.Router();
const { createUser, getUsers, modifyUser } = require("../controllers/user.js");
const { identifyUser } = require("../middlewares/permissions.js");

router.post("/", createUser);
router.get("/", identifyUser, getUsers);
router.patch("/:userId", identifyUser, modifyUser);

module.exports = router;
