const { validateZone, checkString } = require("./general.js");
const {
    TitleInvalidError,
    DescriptionInvalidError,
    ArticleGalleryInvalidError,
    UrlInvalidError,
    MediaTypeInvalidError,
} = require("../errors/article.js");

const { LocalityInvalidError } = require("../errors/locality.js");

function validateArticleBody(
    { zone, title, description, articleGallery, zoneId },
    currentUser
) {
    const errors = [];
    let err;

    if (currentUser.admin === false) {
        err = validateZone(zone);
        if (err) errors.push(err);
    }

    if (!checkString(title)) errors.push(new TitleInvalidError());
    if (!checkString(description)) errors.push(new DescriptionInvalidError());
    if (!Array.isArray(articleGallery))
        errors.push(new ArticleGalleryInvalidError());
    else {
        let articleGalleryErrors = false;
        articleGallery.forEach((mediaElement) => {
            let errors = validateMediaElement(mediaElement);
            if (errors.length > 0) articleGalleryErrors = true;
        });
        if (articleGalleryErrors) {
            errors.push(new ArticleGalleryInvalidError());
        }
    }

    if (
        currentUser.localityId === null &&
        zone === "LOCALITY" &&
        zoneId === undefined
    ) {
        errors.push(new LocalityInvalidError());
    }

    return errors;
}

function validateMediaElement({ type, url }) {
    const errors = [];
    let err;

    err = validateMediaType(type);
    if (err) errors.push(err);

    if (!checkString(url)) errors.push(new UrlInvalidError());

    return errors;
}

function validateMediaType(type) {
    if (type !== "video" && type !== "image")
        return new MediaTypeInvalidError();
}

module.exports = {
    validateArticleBody,
};
