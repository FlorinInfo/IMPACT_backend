class TitleInvalidError extends Error {
    constructor() {
        super("TitleInvalidError");
        this.type = "TitleInvalidError";
        this.title = "title";
        this.details = "Titlul este invalid sau lipseste.";
        this.statusCode = 400;
    }
}

class DescriptionInvalidError extends Error {
    constructor() {
        super("DescriptionInvalidError");
        this.type = "DescriptionInvalidError";
        this.title = "description";
        this.details = "Descrierea este invalida sau lipseste.";
        this.statusCode = 400;
    }
}

class ArticleGalleryInvalidError extends Error {
    constructor() {
        super("ArticleGalleryInvalidError");
        this.type = "ArticleGalleryInvalidError";
        this.title = "articleGallery";
        this.details = "Galeria de articole media este invalida sau lipseste.";
        this.statusCode = 400;
    }
}

class UrlInvalidError extends Error {
    constructor() {
        super("UrlInvalidError");
        this.type = "UrlInvalidError";
        this.title = "url";
        this.details = "Url-ul este invalid sau lipseste.";
        this.statusCode = 400;
    }
}

class MediaTypeInvalidError extends Error {
    constructor() {
        super("MediaTypeInvalidError");
        this.type = "MediaTypeInvalidError";
        this.title = "mediaType";
        this.details = "Tipul continutului media este invalid sau lipseste.";
        this.statusCode = 400;
    }
}

class StatusInvalidError extends Error {
    constructor() {
        super("StatusInvalidError");
        this.type = "StatusInvalidError";
        this.title = "status";
        this.details = "Status-ul este invalid.";
        this.statusCode = 400;
    }
}

class ArticleInvalidError extends Error {
    constructor() {
        super("ArticleInvalidError");
        this.type = "ArticleInvalidError";
        this.title = "article";
        this.details = "Articolul nu exista.";
        this.statusCode = 404;
    }
}

module.exports = {
    TitleInvalidError,
    DescriptionInvalidError,
    ArticleGalleryInvalidError,
    UrlInvalidError,
    MediaTypeInvalidError,
    StatusInvalidError,
    ArticleInvalidError,
};
