const express = require("express");
const router = express.Router();
const { createVillage, getVillages } = require("../controllers/village.js");
const { identifyUser, isAdmin } = require("../middlewares/permissions.js");

router.post("/", identifyUser, isAdmin, createVillage);
router.get("/", getVillages);

module.exports = router;
