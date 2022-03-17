const {
    EmailInvalidError,
    ValidationError,
    PasswordInvalidError
} = require('../utils/errors.js');

function validateUserData({
    lastName,
    firstName,
    password,
    address,
    email,
}) {
    if (
        lastName === undefined ||
        firstName === undefined ||
        address === undefined
    ) {
        throw new ValidationError();
    }
    validateEmail(email);
    validatePassword(password);
}

function validateEmail(email) {
    let mailFormat =
        /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (!email.match(mailFormat)) {
        throw new EmailInvalidError();
    }
}

function validatePassword(password) {
    let passwordFormat = /^(?=.{6,})/;
    if (!password.match(passwordFormat)) {
        throw new PasswordInvalidError();
    }
}

module.exports = {
    validateUserData
}
