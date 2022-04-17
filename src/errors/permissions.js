class InsufficientPermissionsError extends Error {
    constructor() {
        super("InsufficentPermissionsError");
        this.type = "InsuffiecentPermissionsError";
        this.title = "permission";
        this.details = "Nu ai suficiente permisiuni.";
        this.statusCode = 401;
    }
}

module.exports = {
    InsufficientPermissionsError,
};
