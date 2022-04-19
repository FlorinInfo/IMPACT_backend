const {
    VideoInvalidError,
    ImageInvalidError,
} = require("../errors/general.js");

function imageFilter(req, file, cb) {
    const imageFormat = /^.+\.(gif|jpe?g|tiff?|png|webp|bmp)$/i;
    if (!file.originalname.match(imageFortmat)) {
        req.errors = [new ImageInvalidError()];
        return cb(null, false);
    }
    return cb(null, true);
}

function videoFilter(req, file, cb) {
    const videoFormat = /^.+\.(mp4)$/i;
    if (
        !file.originalname.match(videoFormat) ||
        file.mimetype !== "video/mp4"
    ) {
        req.errors = [new VideoInvalidError()];
        return cb(null, false);
    }
    return cb(null, true);
}

module.exports = {
    imageFilter,
    videoFilter,
};
