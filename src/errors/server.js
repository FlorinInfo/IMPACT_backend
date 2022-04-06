class ServerError extends Error {
    constructor() {
        super("ServerError");
        this.type = "ServerError";
        this.title = "serverError";
        this.details =
            "Detalii necunoscute, va rugam trimiteti o copie la request la un administrator.";
        this.statusCode = 400;
    }
}

module.exports = {
    ServerError,
};
