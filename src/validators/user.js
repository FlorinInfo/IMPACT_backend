const {
    EmailInvalidError,
    ValidationError,
    PasswordInvalidError,
    PhotoInvalidError,
    AddressInvalidError,
    LastNameInvalidError,
    FirstNameInvalidError,
} = require("../errors/user.js");

function validateUserData({
    lastName,
    firstName,
    password,
    address,
    email,
    photoUrl,
}) {
    const errors = [];
    let err;

    if (!lastName || !lastName.trim()) errors.push(new LastNameInvalidError());
    if (!firstName || !firstName.trim()) errors.push(new FirstNameInvalidError());
    if (!address || !address.trim()) errors.push(new AddressInvalidError());

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
    if (!email.match(mailFormat)) {
        return new EmailInvalidError();
    }
}

function validatePassword(password) {
    let passwordFormat = /^(?=.{6,})/;
    if (!password.match(passwordFormat)) {
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
