const argon2 = require("argon2");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const API_KEY_MAILGUN = process.env.API_KEY_MAILGUN;
const SENDER_MAILGUN = process.env.SENDER_MAILGUN;
const DOMAIN_MAILGUN = process.env.DOMAIN_MAILGUN;
const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);
const mailgunClient = mailgun.client({
    username: "api",
    key: API_KEY_MAILGUN,
    url: "https://api.eu.mailgun.net",
});

const {
    validateUserData,
    validateUserDataLogin,
    validateRole,
    validateStatus,
    validateEmail,
    validatePassword,
} = require("../validators/user.js");

const {
    validateZone,
    checkInt,
    checkBoolean,
} = require("../validators/general.js");

const {
    EmailNotExistsError,
    WrongPasswordError,
    EmailAlreadyExistsError,
    VillageInvalidError,
    CountyInvalidError,
    LocalityInvalidError,
    InvalidUserError,
    AdministratorConflictError,
} = require("../errors/user.js");
const { InsufficientPermissionsError } = require("../errors/permissions.js");
const { CustomHTTPError } = require("../errors/custom.js");
const {
    InvalidIntegerError,
    InvalidBooleanError,
} = require("../errors/general.js");
const { MailgunError } = require("../errors/mailgun.js");

const {
    decodeToken,
    generateToken,
    generatePasswordToken,
} = require("../utils/jwt.js");
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
                zoneRole: user.zoneRole,
                zoneRoleOn: user.zoneRoleOn,
                countyId: user.countyId,
                villageId: user.villageId,
                localityId: user.localityId,
                admin: user.admin,
                status: user.status,
            });
        } else {
            return next([new WrongPasswordError({ title: "password" })]);
        }
    } catch (err) {
        return next([err]);
    }
}

async function forgotPassword(req, res, next) {
    try {
        let err;
        const { email } = req.body;

        err = validateEmail(email);
        if (err) {
            return next([err]);
        }

        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (!user) {
            return next([new EmailNotExistsError()]);
        }

        const messageData = {
            from: "Impact no-reply@contact.imp-act.ml",
            to: user.email,
            subject: "Resetarea parolei pe Impact",
            template: "forgot-password",
            "h:X-Mailgun-Variables": JSON.stringify({
                firstName: user.firstName,
                passwordToken: generatePasswordToken(user.id, true),
            }),
        };
        try {
            const message = await mailgunClient.messages.create(
                DOMAIN_MAILGUN,
                messageData
            );
        } catch (err) {
            return next([new MailgunError()]);
        }

        res.sendStatus(204);
    } catch (err) {
        return next([err]);
    }
}

async function createUser(req, res, next) {
    try {
        const errors = [];
        let data = {};
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
            referralId,
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

        if (referralId) {
            const invitedBy = await prisma.user.findUnique({
                where: {
                    id: referralId,
                },
            });

            if (!invitedBy) errors.push(new ReferralInvalidError());
            else {
                data["invitedById"] = referralId;
            }
        }

        if (errors.length) {
            return next(errors);
        }

        const passwordHashed = await argon2.hash(password);
        data = {
            ...data,
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
            zoneRole: user.zoneRole,
            zoneRoleOn: user.zoneRoleOn,
            countyId: user.countyId,
            villageId: user.villageId,
            localityId: user.localityId,
            admin: user.admin,
            status: user.status,
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
        let { top } = req.query;

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

        if (top === "true") {
            if (!!countyId + !!villageId + !!localityId !== 1) {
                return next([
                    new CustomHTTPError({
                        type: "ActionInvalidError",
                        title: "search",
                        details:
                            "Trebuie sa folosesti doar un filtru de locatie.",
                        statusCode: 400,
                    }),
                ]);
            }

            const usersQuery = {};
            if (!currentUser.admin) {
                if (localityId) {
                    const locality = await prisma.locality.findUnique({
                        where: {
                            id: localityId,
                        },
                        select: {
                            id: true,
                            village: {
                                select: {
                                    id: true,
                                    countyId: true,
                                },
                            },
                        },
                    });
                    if (!locality) return next([new LocalityInvalidError()]);

                    err = checkPermissionsHierarchically(
                        currentUser,
                        locality.village.countyId,
                        locality.village.id,
                        locality.id
                    );
                    if (err) return next([err]);

                    usersQuery["localityId"] = localityId;
                } else if (villageId) {
                    if (
                        currentUser.zoneRole === "CETATEAN" &&
                        currentUser.villageId !== villageId
                    ) {
                        err = new InsufficientPermissionsError({});
                    } else if (currentUser.villageId !== villageId) {
                        const village = await prisma.village.findUnique({
                            where: {
                                id: villageId,
                            },
                            select: {
                                id: true,
                                countyId: true,
                            },
                        });

                        err = checkPermissionsHierarchically(
                            currentUser,
                            village.countyId,
                            village.id
                        );
                    }

                    if (err) return next([err]);
                    usersQuery["villageId"] = villageId;
                } else if (countyId) {
                    if (currentUser.countyId !== countyId) {
                        err = new InsufficientPermissionsError({});
                    }
                    if (err) return next([err]);
                    usersQuery["countyId"] = countyId;
                }
            } else {
                if (localityId) {
                    usersQuery["localityId"] = localityId;
                } else if (villageId) {
                    usersQuery["villageId"] = villageId;
                } else if (countyId) {
                    usersQuery["countyId"] = countyId;
                }
            }

            const users = await prisma.user.findMany({
                where: usersQuery,
                take: 5,
                orderBy: {
                    monthlyPoints: "desc",
                },
                select: {
                    id: true,
                    lastName: true,
                    firstName: true,
                    monthlyPoints: true,
                    zoneRole: true,
                    admin: true,
                },
            });

            return res.status(200).json(users);
        }

        if (!currentUser.admin) {
            if (
                currentUser.zoneRole !== "MODERATOR" &&
                currentUser.zoneRole !== "ADMINISTRATOR"
            )
                return next([new InsufficientPermissionsError({})]);

            err = checkPermissionsHierarchically(
                currentUser,
                countyId,
                villageId,
                localityId
            );
            if (err) return next([err]);
        }

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
                return next([new InsufficientPermissionsError({})]);
            }
            err = validateRole(role);
            if (err) errors.push(err);
        }

        if (status === "") status = undefined;
        if (status !== undefined) {
            err = validateStatus(status);
            if (err) errors.push(err);
        }

        const usersCount = await prisma.user.count({
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
        });

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
                status: true,
                zoneRole: true,
                zoneRoleOn: true,
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

        res.status(200).json({ users, limit: usersCount });
    } catch (err) {
        return next([err]);
    }
}

async function getUser(req, res, next) {
    try {
        const currentUser = req.currentUser;
        const user = req.user;
        const { stats } = req.query;

        if (stats === "true") {
            const [upvotes, downvotes, comments, favorites, articles] =
                await prisma.$transaction([
                    prisma.articleVote.count({
                        where: {
                            userId: user.id,
                            type: "UPVOTE",
                        },
                    }),
                    prisma.articleVote.count({
                        where: {
                            userId: user.id,
                            type: "DOWNVOTE",
                        },
                    }),
                    prisma.comment.count({
                        where: {
                            authorId: user.id,
                        },
                    }),
                    prisma.articleFavorite.count({
                        where: {
                            userId: user.id,
                        },
                    }),
                    prisma.article.count({
                        where: {
                            authorId: user.id,
                        },
                    }),
                ]);

            user["numberUpvotes"] = upvotes;
            user["numberDownvotes"] = downvotes;
            user["comments"] = comments;
            user["numberFavorites"] = favorites;
            user["numberArticles"] = articles;
        }

        res.status(200).json(user);
    } catch (err) {
        return next([err]);
    }
}

async function modifyUser(req, res, next) {
    try {
        let err;
        const errors = [];
        const newData = {};

        const currentUser = req.currentUser;
        let { userId } = req.params;

        let {
            status,
            zoneRole,
            zoneRoleOn,
            forceAdministrator,
            oldPassword,
            newPassword,
            passwordToken,
        } = req.body;

        if (forceAdministrator === undefined) forceAdministrator = false;
        if (!checkBoolean(forceAdministrator))
            return next([
                new InvalidBooleanError({
                    title: "forceAdministrator",
                    details: "Parametrul pentru fortare administrator",
                }),
            ]);

        userId = parseInt(userId, 10);
        if (!checkInt(userId)) {
            return next([
                new InvalidIntegerError({
                    title: "userId",
                    details: "Id-ul utilizatorului",
                }),
            ]);
        }

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user) {
            return next([
                new InvalidUserError({ title: "user", statusCode: 400 }),
            ]);
        }

        if (status !== undefined && status !== user.status) {
            if (!currentUser.admin) {
                if (
                    currentUser.zoneRole !== "MODERATOR" &&
                    currentUser.zoneRole !== "ADMINISTRATOR"
                )
                    return next([new InsufficientPermissionsError({})]);

                err = checkPermissionsHierarchically(
                    currentUser,
                    user.countyId,
                    user.villageId,
                    user.localityId
                );
                if (err) return next([err]);
            }

            err = validateStatus(status);
            if (err) errors.push(err);
            else {
                newData["status"] = status;

                if (user.status === "IN_ASTEPTARE" && status === "APROBAT") {
                    if (user.invitedById) {
                        const userReferral = await prisma.user.findUnique({
                            where: {
                                id: user.invitedById,
                            },
                        });

                        if (userReferral) {
                            await prisma.user.update({
                                where: { id: user.invitedById },
                                data: {
                                    monthlyPoints: {
                                        increment: 15,
                                    },
                                    points: {
                                        increment: 15,
                                    },
                                },
                            });
                        }
                    }

                    const messageData = {
                        from: "Impact no-reply@contact.imp-act.ml",
                        to: user.email,
                        subject: "Informatii cont",
                        template: "account-approved",
                        "h:X-Mailgun-Variables": JSON.stringify({
                            firstName: user.firstName,
                        }),
                    };
                    try {
                        const message = await mailgunClient.messages.create(
                            DOMAIN_MAILGUN,
                            messageData
                        );
                    } catch (err) {
                        return next([new MailgunError()]);
                    }
                }
            }
        }

        if (zoneRole !== undefined || zoneRoleOn !== undefined) {
            if (!currentUser.admin) {
                if (currentUser.zoneRole !== "ADMINISTRATOR")
                    return next([new InsufficientPermissionsError({})]);

                if (zoneRoleOn === "COUNTY" && zoneRole === "ADMINISTRATOR")
                    return next([new InsufficientPermissionsError({})]);

                err = checkPermissionsHierarchically(
                    currentUser,
                    user.countyId,
                    user.villageId,
                    user.localityId
                );
                if (err) return next([err]);
            }

            if (zoneRoleOn === "LOCALITY" && user.localityId === null) {
                return next([new LocalityInvalidError()]);
            }

            err = validateRole(zoneRole);
            if (err) errors.push(err);

            if (zoneRole === "CETATEAN") {
                if (errors.length === 0) {
                    if (user.localityId === null) {
                        newData["zoneRoleOn"] = "VILLAGE";
                    } else {
                        newData["zoneRoleOn"] = "LOCALITY";
                    }
                    newData["zoneRole"] = zoneRole;
                }
            } else {
                err = validateZone(zoneRoleOn);
                if (err) errors.push(err);

                if (errors.length === 0) {
                    newData["zoneRole"] = zoneRole;
                    newData["zoneRoleOn"] = zoneRoleOn;
                }
            }

            if (errors.length) return next(errors);

            if (zoneRole === "ADMINISTRATOR") {
                if (zoneRoleOn === "LOCALITY") {
                    const locality = await prisma.locality.findUnique({
                        where: {
                            id: user.localityId,
                        },
                    });

                    if (
                        locality.administratorId &&
                        locality.administratorId !== user.id &&
                        !forceAdministrator
                    )
                        return next([new AdministratorConflictError()]);

                    if (locality.administratorId && forceAdministrator) {
                        const oldAdministrator = await prisma.user.findUnique({
                            where: {
                                id: locality.administratorId,
                            },
                        });

                        let data = {
                            zoneRole: "CETATEAN",
                        };

                        if (oldAdministrator.localityId === null) {
                            data["zoneRoleOn"] = "VILLAGE";
                        } else {
                            data["zoneRoleOn"] = "LOCALITY";
                        }

                        await prisma.user.update({
                            where: {
                                id: locality.administratorId,
                            },
                            data,
                        });
                    }

                    newData["locality"] = {
                        connect: {
                            id: user.localityId,
                        },
                    };
                } else if (zoneRoleOn === "VILLAGE") {
                    const village = await prisma.village.findUnique({
                        where: {
                            id: user.villageId,
                        },
                    });

                    if (
                        village.administratorId &&
                        village.administratorId !== user.id &&
                        !forceAdministrator
                    )
                        return next([new AdministratorConflictError()]);

                    if (village.administratorId && forceAdministrator) {
                        const oldAdministrator = await prisma.user.findUnique({
                            where: {
                                id: village.administratorId,
                            },
                        });

                        let data = {
                            zoneRole: "CETATEAN",
                        };

                        if (oldAdministrator.localityId === null) {
                            data["zoneRoleOn"] = "VILLAGE";
                        } else {
                            data["zoneRoleOn"] = "LOCALITY";
                        }

                        await prisma.user.update({
                            where: {
                                id: village.administratorId,
                            },
                            data,
                        });
                    }

                    newData["village"] = {
                        connect: {
                            id: user.villageId,
                        },
                    };
                } else if (zoneRoleOn === "COUNTY") {
                    const county = await prisma.county.findUnique({
                        where: {
                            id: user.countyId,
                        },
                    });

                    if (
                        county.administratorId &&
                        county.administratorId !== user.id &&
                        !forceAdministrator
                    )
                        return next([new AdministratorConflictError()]);

                    if (county.administratorId && forceAdministrator) {
                        const oldAdministrator = await prisma.user.findUnique({
                            where: {
                                id: county.administratorId,
                            },
                        });

                        let data = {
                            zoneRole: "CETATEAN",
                        };

                        if (oldAdministrator.localityId === null) {
                            data["zoneRoleOn"] = "VILLAGE";
                        } else {
                            data["zoneRoleOn"] = "LOCALITY";
                        }

                        await prisma.user.update({
                            where: {
                                id: county.administratorId,
                            },
                            data,
                        });
                    }

                    newData["county"] = {
                        connect: {
                            id: user.countyId,
                        },
                    };
                }
            }

            if (
                zoneRole !== "CETATEAN" &&
                user.status === "IN_ASTEPTARE" &&
                status !== "APROBAT"
            ) {
                if (user.invitedById) {
                    const userReferral = await prisma.user.findUnique({
                        where: {
                            id: user.invitedById,
                        },
                    });

                    if (userReferral) {
                        await prisma.user.update({
                            where: { id: user.invitedById },
                            data: {
                                monthlyPoints: {
                                    increment: 15,
                                },
                                points: {
                                    increment: 15,
                                },
                            },
                        });
                    }
                }

                newData["status"] = "APROBAT";
                const messageData = {
                    from: "Impact no-reply@contact.imp-act.ml",
                    to: user.email,
                    subject: "Informatii cont",
                    template: "account-approved",
                    "h:X-Mailgun-Variables": JSON.stringify({
                        firstName: user.firstName,
                    }),
                };
                try {
                    const message = await mailgunClient.messages.create(
                        DOMAIN_MAILGUN,
                        messageData
                    );
                } catch (err) {
                    return next([new MailgunError()]);
                }
            }
        }

        if (newPassword || (typeof newPassword === 'string' && newPassword.trim() === "")) {
            err = validatePassword({
                password: newPassword,
                title: "newPassword",
            });
            if (err) errors.push(err);

            if (currentUser.id !== user.id) {
                return next([new InsufficientPermissionsError({})]);
            }

            if (!oldPassword && !passwordToken) {
                return next([
                    new CustomHTTPError({
                        type: "ActionInvalidError",
                        title: "verify",
                        details:
                            "Pentru schimbarea parolei este necesar să oferi parola veche sau token-ul din email.",
                        statusCode: 403,
                    }),
                ]);
            }

            if (oldPassword) {
                err = validatePassword({
                    password: oldPassword,
                    title: "oldPassword",
                });
                if (err) errors.push(err);

                if (!(await argon2.verify(user.password, oldPassword))) {
                    return next([
                        new WrongPasswordError({ title: "oldPassword" }),
                    ]);
                }
            } else if (passwordToken) {
                let [tokenBody, err] = decodeToken(passwordToken);
                if (err) return next([err]);

                const { userId, changePassword } = tokenBody;

                if (userId !== user.id || changePassword !== true) {
                    return next([
                        new CustomHTTPError({
                            type: "ActionNotAllowed",
                            title: "token",
                            details:
                                "Tokenul pentru schimbarea parolei nu este valid.",
                            statusCode: 403,
                        }),
                    ]);
                }
            }

            newData["password"] = await argon2.hash(newPassword);
        }

        if (errors.length) return next(errors);

        const updateUser = await prisma.user.update({
            where: {
                id: userId,
            },
            data: newData,
        });

        res.sendStatus(204);
    } catch (err) {
        return next([err]);
    }
}

async function deleteUser(req, res, next) {
    try {
        let err;
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

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user) {
            return next([
                new InvalidUserError({ title: "user", statusCode: 400 }),
            ]);
        }

        if (!currentUser.admin) {
            if (
                (currentUser.zoneRole !== "MODERATOR" &&
                    currentUser.zoneRole !== "ADMINISTRATOR") ||
                user.status === "APROBAT"
            )
                return next([new InsufficientPermissionsError({})]);

            err = checkPermissionsHierarchically(
                currentUser,
                user.countyId,
                user.villageId,
                user.localityId
            );
            if (err) return next([err]);
        }

        const messageData = {
            from: "Impact no-reply@contact.imp-act.ml",
            to: user.email,
            subject: "Informatii cont",
            template: "account-reject",
            "h:X-Mailgun-Variables": JSON.stringify({
                firstName: user.firstName,
            }),
        };
        try {
            const message = await mailgunClient.messages.create(
                DOMAIN_MAILGUN,
                messageData
            );
        } catch (err) {
            return next([new MailgunError()]);
        }

        const deleteUser = await prisma.user.delete({
            where: {
                id: userId,
            },
        });

        res.sendStatus(204);
    } catch (err) {
        return next([err]);
    }
}

module.exports = {
    createUser,
    getUsers,
    getUser,
    login,
    modifyUser,
    deleteUser,
    forgotPassword,
};
