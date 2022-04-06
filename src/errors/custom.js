class CustomHTTPError extends Error {
    constructor({ title, title, details, statusCode }) {
        super(type);
        this.type = type;
        this.title = title;
        this.details = description;
        this.statusCode = statusCode;
    }
}

module.exports = {
    CustomHTTPError,
};
