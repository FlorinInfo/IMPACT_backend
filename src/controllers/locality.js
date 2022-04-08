const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
    validateLocalityData,
    validateVillageId,
} = require("../validators/locality.js");
const { VillageInvalidError } = require("../errors/locality.js");

async function getLocalities(req, res, next) {
    try {
        let err;
        const villageId = parseInt(req.query.villageId, 10) || "";
        err = validateVillageId(villageId);
        if (err) {
            return next([err]);
        }

        const village = await prisma.village.findUnique({
            where: {
                id: villageId,
            },
        });
        if (!village || village.city) {
            return next([new VillageInvalidError()]);
        }

        const localities = await prisma.locality.findMany({
            where: {
                villageId: villageId,
            },
            select: {
                id: true,
                name: true,
            },
        });

        res.status(200).json(localities);
    } catch (err) {
        return next([err]);
    }
}

async function createLocality(req, res, next) {
    try {
        err = validateLocalityData(req.body); // the result of this function is an array
        if (err.length) {
            return next(err);
        }

        const { name, villageId, city } = req.body;

        const village = await prisma.village.findUnique({
            where: {
                id: villageId,
            },
        });
        if (!village) {
            return next([new VillageInvalidError()]);
        }

        const locality = await prisma.locality.create({
            data: {
                name,
                villageId,
            },
        });

        res.sendStatus(201);
    } catch (err) {
        next([err]);
    }
}

module.exports = {
    getLocalities,
    createLocality,
};
