class InvalidUserError extends Error {
    constructor() {
        super("InvalidUserError");
        this.type = "InvalidUserError";
        this.title = "permission";
        this.details = "The user doesn't exists.";
        this.statusCode = 401;
    }
}

class InsufficientPermissionsError extends Error {
    constructor() {
        super("InsufficentPermissionsError");
        this.type = "InsuffiecentPermissionsError";
        this.title = "permission";
        this.details = "insufficient permissions";
        this.statusCode = 401;
    }
}

module.exports = {
    InvalidUserError,
    InsufficientPermissionsError,
};
