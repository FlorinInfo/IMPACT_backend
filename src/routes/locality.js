const express = require("express");
const router = express.Router();
const { createLocality, getLocalities } = require("../controllers/locality.js");
const { identifyUser, isAdmin } = require("../middlewares/permissions.js");

router.post("/", identifyUser, isAdmin, createLocality);
router.get("/", getLocalities);

module.exports = router;
