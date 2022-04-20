const { MediaInvalidError } = require("../errors/general.js");

function uploadMedia(req, res, next) {
    if (req.errors && req.errors.length) {
        return next(req.errors);
    } else if (!req.file) {
        return next([new MediaInvalidError()]);
    } else {
        console.log(req.file);
        const url =
            req.protocol + "s" + "://" + req.hostname + "/" + req.file.path;
        res.status(201).json({
            url,
        });
    }
}

module.exports = {
    uploadMedia,
};
