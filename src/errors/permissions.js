class InvalidUser extends Error {
    constructor() {
        super("InvalidUser");
        this.type = "InvalidUser";
        this.title = "permission";
        this.details = "The user doesn't exists.";
        this.statusCode = 401;
    }
}

module.exports = {
    InvalidUser,
};
