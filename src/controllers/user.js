const { validateUserData } = require("../validators/user.js");
const argon2 = require("argon2");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { ValidationError } = require("../utils/errors.js");

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

        res.sendStatus(200);
    } catch (err) {
        if (err instanceof ValidationError) {
            res.status(err.statusCode).json({
                description: err.description,
            });
        } else {
            res.status(500).json({
                description: "Server Error",
            });
        }
    }
}

function getUsers(req, res) {
    res.sendStatus(200);
}

module.exports = {
    createUser,
    getUsers,
};
