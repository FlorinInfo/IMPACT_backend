const express = require("express");
const router = express.Router();
const { nanoid } = require("nanoid");
const multer = require("multer");

const { isApproved, identifyUser } = require("../middlewares/permissions.js");
const { uploadMedia } = require("../controllers/media.js");

const storageImagesIC = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./assets/imagesIC");
    },
    filename: function (req, file, callback) {
        const fileExtension = file.originalname.split(".").pop();
        const fileName = nanoid() + "." + fileExtension;
        callback(null, fileName);
    },
});

const storageImagesArticles = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./assets/imagesArticles");
    },
    filename: function (req, file, callback) {
        const fileExtension = file.originalname.split(".").pop();
        const fileName = nanoid() + "." + fileExtension;
        callback(null, fileName);
    },
});

const storageVideosArticles = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./assets/videosArticles");
    },
    filename: function (req, file, callback) {
        const fileExtension = file.originalname.split(".").pop();
        const fileName = nanoid() + "." + fileExtension;
        callback(null, fileName);
    },
});

const uploaderImageIC = multer({ storage: storageImagesIC });
const uploaderImageArticle = multer({ storage: storageImagesArticles });
const uploaderVideoArticle = multer({ storage: storageVideosArticles });

router.post("/upload-image-ic", uploaderImageIC.single("image"), uploadMedia);
router.post(
    "/upload-image-article",
    identifyUser,
    isApproved,
    uploaderImageArticle.single("image"),
    uploadMedia
);
router.post(
    "/upload-video-article",
    identifyUser,
    isApproved,
    uploaderVideoArticle.single("video"),
    uploadMedia
);

module.exports = router;
