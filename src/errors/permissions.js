class InsufficientPermissionsError extends Error {
    constructor({ type }) {
        super("InsufficientPermissionsError");
        this.type = type ? type : "InsuffiecentPermissionsError";
        this.title = "permission";
        this.details = "Nu ai suficiente permisiuni.";
        this.statusCode = 403;
    }
}

module.exports = {
    InsufficientPermissionsError,
};
