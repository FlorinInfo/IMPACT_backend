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
        this.details = "Comuna furnizata lipseste sau este invalida.";
        this.statusCode = 400;
    }
}

class LocalityInvalidError extends Error {
    constructor() {
        super("LocalityInvalidError");
        this.type = "LocalityInvalidError";
        this.title = "locality";
        this.details = "Localitatea furnizata lipseste sau este invalida.";
        this.statusCode = 400;
    }
}

module.exports = {
    NameInvalidError,
    VillageInvalidError,
    LocalityInvalidError,
};
