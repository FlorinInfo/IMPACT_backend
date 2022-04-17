const jwt = require("jsonwebtoken");
const jwtSecret = process.env.SECRET_JWT;
const { InvalidJWT } = require("../errors/jwt.js");

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
        return [jwt.verify(token, jwtSecret), null];
    } catch (err) {
        switch (err.name) {
            case "JsonWebTokenError":
                return [
                    null,
                    new InvalidJWT({
                        details: "Tokenul nu este corect.",
                    }),
                ];
            case "NotBeforeError":
                return [
                    null,
                    new InvalidJWT({
                        details: "Tokenul nu este inca valabil.",
                    }),
                ];
            case "TokenExpiredError":
                return [
                    null,
                    new InvalidJWT({
                        details: "Tokenul este expirat.",
                    }),
                ];
            default:
                return [null, err];
        }
    }
}

module.exports = {
    generateToken,
    decodeToken,
};
