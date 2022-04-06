class InvalidJWT extends Error {
    constructor({ details }) {
        super("InvalidJWT");
        this.type = "InvalidJWT";
        this.title = "invalidJWT";
        this.details = details;
        this.statusCode = 400;
    }
}

module.exports = {
    InvalidJWT,
};
