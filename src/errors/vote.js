class VoteTypeInvalidError extends Error {
    constructor() {
        super("VoteTypeInvalidError");
        this.type = "VoteTypeInvalidError";
        this.title = "type";
        this.details =
            "Tipul votului este invalid, votul poate sa fie doar UPVOTE sau DOWNVOTE.";
        this.statusCode = 400;
    }
}

class VoteAlreadyExistsError extends Error {
    constructor() {
        super("VoteAlreadyExistsError");
        this.type = "VoteAlreadyExistsError";
        this.title = "vote";
        this.details =
            "Exista deja un vot de la user-ul curent pentru postarea data.";
        this.statusCode = 409;
    }
}

class VoteNotExistsError extends Error {
    constructor() {
        super("VoteNotExistsError");
        this.type = "VoteNotExistsError";
        this.title = "vote";
        this.details =
            "Nu exista un vot de la user-ul curent pentru postarea data.";
        this.statusCode = 404;
    }
}

module.exports = {
    VoteTypeInvalidError,
    VoteAlreadyExistsError,
    VoteNotExistsError,
};
