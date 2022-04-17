const { PhotoInvalidError } = require("../errors/user.js");

function uploadImage(req, res, next) {
    if (!req.file) {
        return next([new PhotoInvalidError()]);
    } else {
        const photoUrl = req.protocol + 's' + "://" + req.hostname + "/" + req.file.path;
        res.status(201).json({
            photoUrl: photoUrl,
        });
    }
}

module.exports = {
    uploadImage,
};
