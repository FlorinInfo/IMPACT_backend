const express = require("express");
const router = express.Router();
const { nanoid } = require("nanoid");

const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./images");
    },
    filename: function (req, file, callback) {
        const fileExtension = file.originalname.split(".").pop();
        const fileName = nanoid() + "." + fileExtension;
        callback(null, fileName);
    },
});
const upload = multer({ storage });

const { uploadImage } = require("../controllers/media.js");

router.post("/upload-image", upload.single("image"), uploadImage);

module.exports = router;
