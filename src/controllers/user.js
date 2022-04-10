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
    VillageInvalidError,
    CountyInvalidError,
    LocalityInvalidError,
} = require("../errors/user.js");
const { decodeToken, generateToken } = require("../utils/jwt.js");
const { checkInt } = require("../utils/validators.js");

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
        if (err.length) {
            return next(err);
        }

        const {
            password,
            address,
            lastName,
            firstName,
            photoUrl,
            email,
            countyId,
            villageId,
            localityId,
        } = req.body;

        const userAlreadyExists = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (userAlreadyExists) {
            errors.push(new EmailAlreadyExistsError());
        }

        const county = await prisma.county.findUnique({
            where: {
                id: countyId,
            },
        });
        if (!county) {
            errors.push(new CountyInvalidError());
        }

        const village = await prisma.village.findUnique({
            where: {
                id: villageId,
            },
        });
        if (!village || village.countyId !== county.id) {
            errors.push(new VillageInvalidError());
        }

        if (!village.city) {
            if (!checkInt(localityId)) {
                errors.push(new LocalityInvalidError());
            } else {
                const locality = await prisma.locality.findUnique({
                    where: {
                        id: localityId,
                    },
                });
                if (!locality || locality.villageId !== village.id)
                    errors.push(new LocalityInvalidError());
            }
        }

        if (errors.length) {
            next(errors);
            return;
        }

        const passwordHashed = await argon2.hash(password);
        const data = {
            password: passwordHashed,
            address,
            lastName,
            firstName,
            photoUrl,
            email,
            countyId,
            villageId,
        };
        if (localityId && !village.city) data["localityId"] = localityId;
        if (village.city) data["zoneRoleOn"] = "VILLAGE";

        const user = await prisma.user.create({
            data,
        });

        res.status(201).json({
            token: generateToken(user.id),
        });
    } catch (err) {
        next([err]);
    }
}

function getUsers(req, res) {
    res.send("In lucru...");
}

function modifyUser(req, res) {
    res.send("nimic de vazut");
}

module.exports = {
    createUser,
    getUsers,
    login,
    modifyUser,
};
