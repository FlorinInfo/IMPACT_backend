const { PhotoInvalidError } = require("../utils/errors.js");

function uploadImage(req, res) {
    if (!req.file) {
        throw new PhotoInvalidError();
    } else {
        const fileUrl = req.protocol + "://" + req.host + "/" + req.file.path;
        res.status(200).json({
            photoUrl: fileUrl,
        });
    }
}

module.exports = {
    uploadImage,
};
