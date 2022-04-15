class MailgunError extends Error {
    constructor() {
        super("MailgunError");
        this.type = "MailgunError";
        this.title = "sendEmail";
        this.details = "A fost o problema la trimiterea emailului de confirmare.";
        this.statusCode = 500;
    }
}

module.exports = {
    MailgunError,
};
