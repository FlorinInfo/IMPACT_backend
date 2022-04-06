class NameInvalidError extends Error {
    constructor() {
        super("NameInvalidError");
        this.type = "NameInvalidError";
        this.title = "name";
        this.details = "Numele furnizat lipseste sau este invalid.";
        this.statusCode = 400;
    }
}

module.exports = {
    NameInvalidError,
};
