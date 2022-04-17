const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { InvalidJWT } = require("../errors/jwt.js");
const { InsufficientPermissionsError } = require("../errors/permissions.js");
const { InvalidUserError } = require("../errors/user.js");
const { InvalidIntegerError } = require("../errors/general.js");

const { decodeToken } = require("../utils/jwt.js");
const { checkInt } = require("../utils/validators.js");

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
            return next([
                new InvalidUserError({ statusCode: 401, title: "permission" }),
            ]);
        }

        req.currentUser = currentUser;
        return next();
    } catch (err) {
        return next([err]);
    }
}

function isAdmin(req, res, next) {
    const currentUser = req.currentUser;
    if (currentUser.admin) {
        return next();
    } else {
        return next([new InsufficientPermissionsError()]);
    }
}

function isAdminOrSelf(req, res, next) {
    const currentUser = req.currentUser;
    let { userId } = req.params;

    userId = parseInt(userId, 10);
    if (!checkInt(userId)) {
        return next([
            new InvalidIntegerError({
                title: "userId",
                details: "Id-ul utilizatorului",
            }),
        ]);
    }

    if (currentUser.admin || currentUser.id === userId) {
        return next();
    } else {
        return next([new InsufficientPermissionsError()]);
    }
}

module.exports = {
    identifyUser,
    isAdmin,
    isAdminOrSelf,
};
