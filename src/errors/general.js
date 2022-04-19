class InvalidIntegerError extends Error {
    constructor({ title, details }) {
        super("InvalidIntegerError");
        this.type = "InvalidIntegerError";
        this.title = title;
        this.details = `${details} trebuie sa fie un numar intreg.`;
        this.statusCode = 400;
    }
}

class InvalidBooleanError extends Error {
    constructor({ title, details }) {
        super("InvalidBooleanError");
        this.type = "InvalidBooleanError";
        this.title = title;
        this.details = `${details} trebuie sa fie o valoare booleana.`;
        this.statusCode = 400;
    }
}

class ZoneInvalidError extends Error {
    constructor() {
        super("ZoneInvalidError");
        this.type = "ZoneInvalidError";
        this.title = "zone";
        this.details = "Aceast tip de zona nu exista.";
        this.statusCode = 400;
    }
}

class MediaInvalidError extends Error {
    constructor() {
        super("MediaInvalidError");
        this.type = "MediaInvalidError";
        this.title = "media";
        this.details = "Continutul media lipseste sau este invalid.";
        this.statusCode = 400;
    }
}

class VideoInvalidError extends Error {
    constructor() {
        super("VideoInvalidError");
        this.type = "VideoInvalidError";
        this.title = "video";
        this.details =
            "Videoclipul este invalid, momentan acceptam doar formatul mp4.";
        this.statusCode = 400;
    }
}

class ImageInvalidError extends Error {
    constructor() {
        super("ImageInvalidError");
        this.type = "ImageInvalidError";
        this.title = "image";
        this.details =
            "Imaginea este invalida, momentan acceptam un numar redus de formate.";
        this.statusCode = 400;
    }
}

module.exports = {
    InvalidIntegerError,
    ZoneInvalidError,
    InvalidBooleanError,
    MediaInvalidError,
    VideoInvalidError,
    ImageInvalidError,
};
