const argon2 = require("argon2");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const {
    validateUserData,
    validateUserDataLogin,
    validateRole,
    validateStatus,
} = require("../validators/user.js");

const {
    EmailNotExistsError,
    WrongPasswordError,
    EmailAlreadyExistsError,
    VillageInvalidError,
    CountyInvalidError,
    LocalityInvalidError,
} = require("../errors/user.js");
const { InsufficientPermissionsError } = require("../errors/permissions.js");
const { InvalidIntegerError } = require("../errors/general.js");

const { decodeToken, generateToken } = require("../utils/jwt.js");
const { checkInt } = require("../utils/validators.js");
const { checkPermissionsHierarchically } = require("../utils/permissions.js");

async function login(req, res, next) {
    try {
        let err;

        err = validateUserDataLogin(req.body); // the result of this function is an array
        if (err.length) {
            return next(err);
        }

        const { password, email } = req.body;
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (!user) {
            return next([new EmailNotExistsError()]);
        }

        if (await argon2.verify(user.password, password)) {
            res.status(200).json({
                token: generateToken(user.id),
            });
        } else {
            return next([new WrongPasswordError()]);
        }
    } catch (err) {
        return next([err]);
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
            return next(errors);
        }

        const passwordHashed = await argon2.hash(password);
        const data = {
            password: passwordHashed,
            address: "",
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
        return next([err]);
    }
}

async function getUsers(req, res, next) {
    try {
        let err;
        let errors = [];
        let name1, name2;

        const currentUser = req.currentUser;
        let { offset, limit } = req.query;
        let { countyId, villageId, localityId } = req.query;

        let { search } = req.query;
        let { role } = req.query;
        let { status } = req.query;

        if (search) {
            if (search.indexOf(" ") === -1) {
                name1 = search;
                name2 = "";
            } else {
                [name1, name2] = [
                    search.substring(0, search.indexOf(" ")),
                    search.substring(search.indexOf(" ") + 1),
                ];
            }
        } else search = "";

        if (role === "") role = undefined;
        if (role !== undefined) {
            if (
                currentUser.zoneRole !== "ADMINISTRATOR" &&
                !currentUser.admin
            ) {
                return next([new InsufficientPermissionsError()]);
            }
            err = validateRole(role);
            if (err) errors.push(err);
        }

        if (status === "") status = undefined;
        if (status !== undefined) {
            err = validateStatus(status);
            if (err) errors.push(err);
        }

        [offset, limit, countyId, villageId, localityId] = [
            { value: offset, title: "offset", details: "Offset-ul" },
            { value: limit, title: "limit", details: "Limita" },
            { value: countyId, title: "countyId", details: "Id-ul judetului" },
            {
                value: villageId,
                title: "villageId",
                details: "Id-ul comunei/orasului",
            },
            {
                value: localityId,
                title: "localityId",
                details: "Id-ul localitatii",
            },
        ].map(({ value, title, details }) => {
            let v;
            if (value) {
                // Try to parse value to integer
                v = parseInt(value, 10);
                if (!checkInt(v)) {
                    errors.push(new InvalidIntegerError({ title, details }));
                }
            }
            return v;
        });
        if (errors.length) return next(errors);

        if (!currentUser.admin) {
            if (
                currentUser.zoneRole !== "MODERATOR" &&
                currentUser.zoneRole !== "ADMINISTRATOR"
            )
                return next([new InsufficientPermissionsError()]);

            err = checkPermissionsHierarchically(
                currentUser,
                countyId,
                villageId,
                localityId
            );
            if (err) return next([err]);
        }

        const users = await prisma.user.findMany({
            orderBy: {
                createTime: "desc",
            },
            skip: offset,
            take: limit,
            where: {
                countyId: countyId,
                villageId: villageId,
                localityId: localityId,
                zoneRole: role,
                status: status,
                OR: [
                    {
                        email: {
                            startsWith: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        firstName: {
                            startsWith: name1,
                            mode: "insensitive",
                        },
                        lastName: {
                            startsWith: name2,
                            mode: "insensitive",
                        },
                    },
                    {
                        lastName: {
                            startsWith: name1,
                            mode: "insensitive",
                        },
                        firstName: {
                            startsWith: name2,
                            mode: "insensitive",
                        },
                    },
                ],
            },
            select: {
                id: true,
                lastName: true,
                firstName: true,
                email: true,
                photoUrl: true,
                createTime: true,
                Locality: {
                    select: {
                        name: true,
                    },
                },
                Village: {
                    select: {
                        name: true,
                    },
                },
                County: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        res.status(200).json(users);
    } catch (err) {
        return next([err]);
    }
}

async function modifyUser(req, res, next) {
    res.send("nimic de vazut");
}

module.exports = {
    createUser,
    getUsers,
    login,
    modifyUser,
};
