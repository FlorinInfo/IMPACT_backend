class CustomHTTPError extends Error {
    constructor({ type, title, details, statusCode }) {
        super(type);
        this.type = type;
        this.title = title;
        this.details = details;
        this.statusCode = statusCode;
    }
}

module.exports = {
    CustomHTTPError,
};
