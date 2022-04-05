const {
    ValidationError
} = require('../utils/errors.js');

function errorHandler(err, req, res, next) {
    if (err.statusCode) {
        res.status(err.statusCode).json({
            description: err.description,
            error: true
        });
    } else {
        res.status(500).json({
           description: "Server error",
            error: true
        });
    }
}

module.exports = {
    errorHandler
}
