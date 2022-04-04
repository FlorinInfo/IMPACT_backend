const {
    validateUserData,
    validateUserDataLogin,
} = require("../validators/user.js");
const argon2 = require("argon2");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { ValidationError, InvalidUser } = require("../utils/errors.js");
const { decodeToken, generateToken } = require("../utils/jwt.js");
const { getCookies } = require("../utils/cookies.js");

async function login(req, res) {
    try {
        validateUserDataLogin(req.body);
        const { password, email } = req.body;
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (await argon2.verify(user.password, password)) {
            res.status(200).json({
                token: generateToken(user.id),
            });
        } else {
            throw new InvalidUser();
        }
    } catch (err) {
        if (err instanceof InvalidUser) {
            res.status(err.statusCode).json({
                description: err.description,
            });
        } else {
            console.error(err);
            res.status(500).json({
                description: "Server Error",
            });
        }
    }
}

async function createUser(req, res) {
    try {
        validateUserData(req.body);
        const { password, address, lastName, firstName, photoUrl, email } =
            req.body;

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
        if (err instanceof ValidationError) {
            res.status(err.statusCode).json({
                description: err.description,
            });
        } else {
            console.error(err);
            res.status(500).json({
                description: "Server Error",
            });
        }
    }
}

function getUsers(req, res) {
    const cookies = getCookies(req);
    const tokenDecoded = decodeToken(cookies['token']);

    res.status(200).json(tokenDecoded);
}

module.exports = {
    createUser,
    getUsers,
    login,
};
