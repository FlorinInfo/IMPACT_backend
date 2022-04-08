const { ServerError } = require("../errors/server.js");

function errorHandler(err, req, res, next) {
    console.log(err);
    if (!Array.isArray(err)) err = [new ServerError()];
    const errors = {};
    err.forEach((e) => {
        errors[e.title] = e;
    });
    res.status(200).json({ errors: errors });
}

module.exports = {
    errorHandler,
};
