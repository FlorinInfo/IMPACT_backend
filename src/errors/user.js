class ValidationError extends Error {
    constructor(message) {
        super(message ? message : "ValidationError");
        this.type = "ValidationError";
        this.title = "validationError";
        this.details = "Corpul cererii este invalid, consultati documentatia.";
        this.statusCode = 400;
    }
}

class EmailInvalidError extends ValidationError {
    constructor() {
        super("EmailInvalidError");
        this.type = "EmailInvalidError";
        this.title = "email";
        this.details =
            "Email-ul nu are forma corecta, furnizati o adresa de email corecta.";
    }
}

class AddressInvalidError extends ValidationError {
    constructor() {
        super("AddressInvalidError");
        this.type = "AddressInvalidError";
        this.title = "address";
        this.details = "Adresa furnizata nu este corecta sau lipseste.";
    }
}

class LastNameInvalidError extends ValidationError {
    constructor() {
        super("LastNameInvalidError");
        this.type = "LastNameInvalidError";
        this.title = "lastName";
        this.details = "Numele nu exista sau este invalid.";
    }
}

class FirstNameInvalidError extends ValidationError {
    constructor() {
        super("FirstNameInvalidError");
        this.type = "FirstNameInvalidError";
        this.title = "firstName";
        this.details = "Prenumele nu exista sau este invalid.";
    }
}

class PasswordInvalidError extends ValidationError {
    constructor() {
        super("PasswordInvalidError");
        this.type = "PasswordInvalidError";
        this.title = "password";
        this.details =
            "Parola furnizata nu are forma corecta, parola trebuie sa contina minimum 6 caractere.";
    }
}

class CountyInvalidError extends ValidationError {
    constructor() {
        super("CountyInvalidError");
        this.type = "CountyInvalidError";
        this.title = "county";
        this.details = "Judetul introdus nu exista sau este invalid.";
    }
}

class VillageInvalidError extends ValidationError {
    constructor() {
        super("VillageInvalidError");
        this.type = "VillageInvalidError";
        this.title = "village";
        this.details = "Comuna/Orasul introdus nu exista sau este invalid.";
    }
}

class LocalityInvalidError extends ValidationError {
    constructor() {
        super("LocalityInvalidError");
        this.type = "LocalityInvalidError";
        this.title = "locality";
        this.details = "Localitatea introdusa nu exista sau este invalida.";
    }
}

class PhotoInvalidError extends Error {
    constructor() {
        super("PhotoInvalidError");
        this.type = "PhotoInvalidError";
        this.title = "photo";
        this.details = "Poza furnizata lipseste sau este invalida.";
        this.statusCode = 400;
    }
}

class EmailNotExistsError extends Error {
    constructor() {
        super("EmailNotExistsError");
        this.type = "EmailNotExistsError";
        this.title = "email";
        this.details = "Nu exista un cont cu aceasta adresa de email.";
        this.statusCode = 404;
    }
}

class WrongPasswordError extends Error {
    constructor() {
        super("WrongPassowordError");
        this.type = "WrongPasswordError";
        this.title = "password";
        this.details = "Parola nu corespunde adresei de email.";
        this.statusCode = 400;
    }
}

class EmailAlreadyExistsError extends Error {
    constructor() {
        super("EmailAlreadyExistsError");
        this.type = "EmailAlreadyExistsError";
        this.title = "email";
        this.details =
            "Acesta adresa de email este deja folosita, va rugam sa va logati sau sa adaugati alta adresa.";
        this.statusCode = 409;
    }
}

class RoleInvalidError extends Error {
    constructor() {
        super("RoleInvalidError");
        this.type = "RoleInvalidError";
        this.title = "role";
        this.details = "Acest rol nu exista.";
        this.statusCode = 400;
    }
}

class StatusInvalidError extends Error {
    constructor() {
        super("StatusInvalidError");
        this.type = "StatusInvalidError";
        this.title = "status";
        this.details = "Acest status nu exista.";
        this.statusCode = 400;
    }
}

class InvalidUserError extends Error {
    constructor({ title, statusCode }) {
        super("InvalidUserError");
        this.type = "InvalidUserError";
        this.title = title;
        this.details = "Utilizatorul nu exista.";
        this.statusCode = statusCode;
    }
}

class AdministratorConflictError extends Error {
    constructor() {
        super("AdministratorConflictError");
        this.type = "AdministratorConflictError";
        this.title = "administrator";
        this.details = "Poate sa fie doar un administrator intr-o zona.";
        this.statusCode = 409;
    }
}

class ReferralInvalidError extends Error {
    constructor() {
        super("ReferralInvalidError");
        this.type = "ReferralInvalidError";
        this.title = "referral";
        this.details = "Codul de referral este invalid.";
        this.statusCode = 400;
    }
}

module.exports = {
    ValidationError,
    EmailInvalidError,
    PasswordInvalidError,
    PhotoInvalidError,
    EmailNotExistsError,
    WrongPasswordError,
    EmailAlreadyExistsError,
    AddressInvalidError,
    LastNameInvalidError,
    FirstNameInvalidError,
    CountyInvalidError,
    VillageInvalidError,
    LocalityInvalidError,
    RoleInvalidError,
    StatusInvalidError,
    InvalidUserError,
    AdministratorConflictError,
    ReferralInvalidError,
};
