class MessageInvalidError extends Error {
    constructor({ details }) {
        super("MessageInvalidError");
        this.type = "MessageInvalidError";
        this.title = "text";
        this.details = "Mesajul lipseste.";
        this.statusCode = 400;
    }
}

class CommentNotExistsError extends Error {
    constructor() {
        super("CommentNotExistsError");
        this.type = "CommentNotExistsError";
        this.title = "comment";
        this.details = "Comentariul nu exista.";
        this.statusCode = 404;
    }
}

module.exports = {
    MessageInvalidError,
    CommentNotExistsError,
};
