const jwt = require("jsonwebtoken");
const jwtSecret = process.env.SECRET_JWT;
const { InvalidJWT } = require("./errors.js");

function generateToken(userId) {
    return jwt.sign(
        {
            userId,
        },
        jwtSecret,
        { expiresIn: 60 * 60 * 24 }
    );
}

function decodeToken(token) {
    try {
        return (decoded = jwt.verify(token, jwtSecret));
    } catch (err) {
        if (
            [
                "JsonWebTokenError",
                "NotBeforeError",
                "TokenExpirationError",
            ].includes(err.name)
        ) {
            throw new InvalidJWT({ description: err.name });
        } else {
            throw new Error();
        }
    }
}

module.exports = {
    generateToken,
    decodeToken,
};
