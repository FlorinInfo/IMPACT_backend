const { PhotoInvalidError } = require("../utils/errors.js");

function uploadImage(req, res) {
    if (!req.file) {
        throw new PhotoInvalidError();
    } else {
        const photoUrl = req.protocol + "://" + req.hostname + "/" + req.file.path;
        res.status(200).json({
            photoUrl: photoUrl,
        });
    }
}

module.exports = {
    uploadImage,
};
