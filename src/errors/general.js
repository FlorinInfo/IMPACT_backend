class InvalidIntegerError extends Error {
    constructor({ title, details }) {
        super("InvalidIntegerError");
        this.type = "InvalidIntegerError";
        this.title = title;
        this.details = `${details} trebuie sa fie un numar intreg.`;
        this.statusCode = 401;
    }
}

class ZoneInvalidError extends Error {
    constructor() {
        super("ZoneInvalidError");
        this.type = "ZoneInvalidError";
        this.title = "zone";
        this.details = "Aceast tip de zona nu exista.";
        this.statusCode = 400;
    }
}

module.exports = { InvalidIntegerError, ZoneInvalidError };
