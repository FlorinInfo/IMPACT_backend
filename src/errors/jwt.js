class InvalidJWT extends Error {
    constructor({ details }) {
        super("InvalidJWT");
        this.type = "InvalidJWT";
        this.title = "permission";
        this.details = details;
        this.statusCode = 401;
    }
}

module.exports = {
    InvalidJWT,
};
