const express = require("express");
const router = express.Router();
const { createCounty, getCounties } = require("../controllers/county.js");

router.post("/", createCounty);
router.get("/", getCounties);

module.exports = router;
