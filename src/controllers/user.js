const {
    validateUserData,
    validateUserDataLogin,
} = require("../validators/user.js");
const argon2 = require("argon2");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
    ValidationError,
    InvalidUser,
    CustomHTTPError,
} = require("../utils/errors.js");
const { decodeToken, generateToken } = require("../utils/jwt.js");
const { getCookies } = require("../utils/cookies.js");

async function login(req, res, next) {
    try {
        validateUserDataLogin(req.body);
        const { password, email } = req.body;
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (!user)
            throw new CustomHTTPError({
                description: "Nu exista un cont cu aceasta adresa de email.",
                statusCode: 400,
                name: "InvalidEmail",
            });

        if (await argon2.verify(user.password, password)) {
            res.status(200).json({
                token: generateToken(user.id),
            });
        } else {
            throw new CustomHTTPError({
                description: "Parola introdusa este gresita.",
                statusCode: 400,
                name: "InvalidPassword",
            });
        }
    } catch (err) {
        next(err);
    }
}

async function createUser(req, res, next) {
    try {
        validateUserData(req.body);
        const { password, address, lastName, firstName, photoUrl, email } =
            req.body;

        const userAlreadyExists = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (userAlreadyExists)
            throw new CustomHTTPError({
                description: "This email is already used!",
                statusCode: 409,
                name: "EmailAlreadyUsed",
            });

        const passwordHashed = await argon2.hash(password);
        const user = await prisma.user.create({
            data: {
                password: passwordHashed,
                address,
                lastName,
                firstName,
                photoUrl,
                email,
            },
        });

        res.status(200).json({
            token: generateToken(user.id),
        });
    } catch (err) {
        next(err);
    }
}

function getUsers(req, res) {
    const cookies = getCookies(req);
    const tokenDecoded = decodeToken(cookies["token"]);

    res.status(200).json(tokenDecoded);
}

module.exports = {
    createUser,
    getUsers,
    login,
};
