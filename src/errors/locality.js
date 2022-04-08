class NameInvalidError extends Error {
    constructor() {
        super("NameInvalidError");
        this.type = "NameInvalidError";
        this.title = "name";
        this.details = "Numele furnizat lipseste sau este invalid.";
        this.statusCode = 400;
    }
}

class VillageInvalidError extends Error {
    constructor() {
        super("VillageInvalidError");
        this.type = "VillageInvalidError";
        this.title = "village";
        this.details = "Coumna furnizata lipseste sau este invalida.";
        this.statusCode = 400;
    }
}

module.exports = {
    NameInvalidError,
    VillageInvalidError,
};
