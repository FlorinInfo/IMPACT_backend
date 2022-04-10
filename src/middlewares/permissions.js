const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { InvalidJWT } = require("../errors/jwt.js");
const { InvalidUser } = require("../errors/permissions.js");
const { decodeToken } = require("../utils/jwt.js");

async function identifyUser(req, res, next) {
    try {
        let token = req.get("Authorization");
        if (!token) {
            return next([
                new InvalidJWT({
                    details: "Tokenul de autentificare lipseste.",
                }),
            ]);
        }
        token = token.split(" ")[1];
        if (!token) {
            return next([
                new InvalidJWT({
                    details: "Tokenul de autentificare este invalid.",
                }),
            ]);
        }

        let [tokenBody, err] = decodeToken(token);
        if (err) return next([err]);

        const userId = tokenBody.userId;
        const currentUser = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!currentUser) {
            return next([new InvalidUser()]);
        }

        req.currentUser = currentUser;
        return next();
    } catch (err) {
        return next([err]);
    }
}

module.exports = {
    identifyUser,
};
