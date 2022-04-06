const express = require("express");
const router = express.Router();
const { createVillages, getVillages } = require("../controllers/village.js");

router.post("/", createVillage);
router.get("/", getVillages);

module.exports = router;
