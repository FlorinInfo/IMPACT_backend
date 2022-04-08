const {
    validateUserData,
    validateUserDataLogin,
} = require("../validators/user.js");
const argon2 = require("argon2");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
    EmailNotExistsError,
    WrongPasswordError,
    EmailAlreadyExistsError,
} = require("../errors/user.js");
const { decodeToken, generateToken } = require("../utils/jwt.js");

async function login(req, res, next) {
    try {
        let err;

        err = validateUserDataLogin(req.body); // the result of this function is an array
        if (err.length) {
            next(err);
            return;
        }

        const { password, email } = req.body;
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (!user) {
            next([new EmailNotExistsError()]);
            return;
        }

        if (await argon2.verify(user.password, password)) {
            res.status(200).json({
                token: generateToken(user.id),
            });
        } else {
            next([new WrongPasswordError()]);
            return;
        }
    } catch (err) {
        next([err]);
    }
}

async function createUser(req, res, next) {
    try {
        const errors = [];
        let err;

        err = validateUserData(req.body); // the result of this function is an array
        errors.push(...err);

        const { password, address, lastName, firstName, photoUrl, email } =
            req.body;
        const userAlreadyExists = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (userAlreadyExists) {
            errors.push(new EmailAlreadyExistsError());
        }

        if (errors.length) {
            next(errors);
            return;
        }

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

        res.status(201).json({
            token: generateToken(user.id),
        });
    } catch (err) {
        next([err]);
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
