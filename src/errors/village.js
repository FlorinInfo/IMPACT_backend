class NameInvalidError extends Error {
    constructor() {
        super("NameInvalidError");
        this.type = "NameInvalidError";
        this.title = "name";
        this.details = "Numele furnizat lipseste sau este invalid.";
        this.statusCode = 400;
    }
}

class CountyInvalidError extends Error {
    constructor() {
        super("CountyInvalidError");
        this.type = "CountyInvalidError";
        this.title = "county";
        this.details = "Judetul furnizat lipseste sau este invalid.";
        this.statusCode = 400;
    }
}

class CityInvalidError extends Error {
    constructor() {
        super("CityInvalidError");
        this.type = "CityInvalidError";
        this.title = "city";
        this.details = "Trebuie specificat daca este oras sau comuna.";
        this.statusCode = 400;
    }
}

module.exports = {
    NameInvalidError,
    CountyInvalidError,
    CityInvalidError,
};
