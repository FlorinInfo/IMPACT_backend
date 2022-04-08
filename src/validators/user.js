const {
    EmailInvalidError,
    ValidationError,
    PasswordInvalidError,
    PhotoInvalidError,
    AddressInvalidError,
    LastNameInvalidError,
    FirstNameInvalidError,
    CountyInvalidError,
    VillageInvalidError,
    LocalityInvalidError,
} = require("../errors/user.js");
const { checkString, checkInt } = require("../utils/validators.js");

function validateUserData({
    lastName,
    firstName,
    password,
    address,
    email,
    photoUrl,
    countyId,
    villageId,
    localityId,
}) {
    const errors = [];
    let err;

    if (!checkString(lastName)) errors.push(new LastNameInvalidError());
    if (!checkString(firstName)) errors.push(new FirstNameInvalidError());
    if (!checkString(address)) errors.push(new AddressInvalidError());
    if (!checkInt(countyId)) errors.push(new CountyInvalidError());
    if (!checkInt(villageId)) errors.push(new VillageInvalidError());
    if (localityId !== undefined && !checkInt(localityId))
        errors.push(new LocalityInvalidError());

    err = validatePhotoUrl(photoUrl);
    if (err) errors.push(err);

    err = validateEmail(email);
    if (err) errors.push(err);

    err = validatePassword(password);
    if (err) errors.push(err);

    return errors;
}

function validateUserDataLogin({ email, password }) {
    const errors = [];
    let err;

    err = validateEmail(email);
    if (err) errors.push(err);

    return errors;
}

function validateEmail(email) {
    let mailFormat =
        /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (!checkString(email) || !email.match(mailFormat)) {
        return new EmailInvalidError();
    }
}

function validatePassword(password) {
    let passwordFormat = /^(?=.{6,})/;
    if (!checkString(password) || !password.match(passwordFormat)) {
        return new PasswordInvalidError();
    }
}

function validatePhotoUrl(photoUrl) {
    if (!photoUrl || !photoUrl.trim()) return new PhotoInvalidError();
}

module.exports = {
    validateUserData,
    validateUserDataLogin,
};
