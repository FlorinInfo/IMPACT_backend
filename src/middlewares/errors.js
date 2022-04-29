const { ServerError } = require("../errors/server.js");
const { CustomHTTPError } = require("../errors/custom.js");

function errorHandler(err, req, res, next) {
    console.log(err);
    if (err.type === "entity.parse.failed") {
        err = [
            new CustomHTTPError({
                type: "JSONParseError",
                details: "The JSON received it's invalid",
                title: "JSONParseError",
                statusCode: 400,
            }),
        ];
    }
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
