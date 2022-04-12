class InvalidIntegerError extends Error {
    constructor({ title, details }) {
        super("InvalidIntegerError");
        this.type = "InvalidIntegerError";
        this.title = title;
        this.details = `${details} trebuie sa fie un numar intreg.`;
        this.statusCode = 401;
    }
}

module.exports = { InvalidIntegerError };
