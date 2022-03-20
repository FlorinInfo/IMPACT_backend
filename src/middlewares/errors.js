const {
    ValidationError
} = require('../utils/errors.js');

function errorHandler(err, req, res, next) {
    if (err instanceof ValidationError) {
        res.status(err.statusCode).json({
            description: err.description,
        });
    } else {
        res.status(500).json({
           description: "Server error",
        });
    }
}

module.exports = {
    errorHandler
}
