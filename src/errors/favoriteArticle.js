class FavoriteArticleAlreadyExistsError extends Error {
    constructor() {
        super("FavoriteArticleAlreadyExistsError");
        this.type = "FavoriteArticleAlreadyExistsError";
        this.title = "favoriteArticle";
        this.details = "Articolul este deja adaugat la favorite de user.";
        this.statusCode = 409;
    }
}

class FavoriteArticleNotExistsError extends Error {
    constructor() {
        super("FavoriteArticleNotExistsError");
        this.type = "FavoriteArticleNotExistsError";
        this.title = "favoriteArticle";
        this.details = "Utilizatorul nu are la favorite acest articol.";
        this.statusCode = 404;
    }
}

module.exports = {
    FavoriteArticleNotExistsError,
    FavoriteArticleAlreadyExistsError,
};
