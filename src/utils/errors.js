class ValidationError extends Error {
    constructor(message) {
        super(message ? message : "Invalid body");
        this.name = "ValidationError";
        this.description = "The body provided is invalid.";
        this.statusCode = 400;
    }
}

class EmailInvalidError extends ValidationError {
    constructor() {
        super("Invalid email");
        this.name = "EmailInvalidError";
        this.description = "The email provided is invalid.";
    }
}

class PasswordInvalidError extends ValidationError {
    constructor() {
        super("Invalid password");
        this.name = "PasswordInvalidError";
        this.description =
            "The password provided is invalid. The password must contain at least 6 characters.";
    }
}

class PhotoInvalidError extends Error {
    constructor() {
        super("Invalid photo");
        this.name = "PhotoInvalidError";
        this.description = "The photo provided is missing or is invalid.";
        this.statusCode = 400;
    }
}

module.exports = {
    ValidationError,
    EmailInvalidError,
    PasswordInvalidError,
    PhotoInvalidError
}
