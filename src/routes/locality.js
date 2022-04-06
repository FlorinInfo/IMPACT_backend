const express = require("express");
const router = express.Router();
const { createLocality, getLocalities } = require("../controllers/locality.js");

router.post("/", createLocality);
router.get("/", getLocalities);

module.exports = router;
