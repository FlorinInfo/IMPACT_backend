const express = require("express");
const router = express.Router();
const { createCounty, getCounties } = require("../controllers/county.js");
const { identifyUser, isAdmin } = require("../middlewares/permissions.js");

router.post("/", identifyUser, isAdmin, createCounty);
router.get("/", getCounties);

module.exports = router;
