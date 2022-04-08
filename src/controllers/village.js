const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
    validateVillageData,
    validateCountyId,
} = require("../validators/village.js");
const { CountyInvalidError } = require("../errors/village.js");

async function getVillages(req, res, next) {
    try {
        let err;
        const countyId = parseInt(req.query.countyId, 10) || "";
        err = validateCountyId(countyId);
        if (err) {
            return next([err]);
        }

        const county = await prisma.county.findUnique({
            where: {
                id: countyId,
            },
        });
        if (!county) {
            return next([new CountyInvalidError()]);
        }

        const villages = await prisma.village.findMany({
            where: {
                countyId: countyId,
            },
            select: {
                id: true,
                name: true,
                city: true,
            },
        });

        res.status(200).json(villages);
    } catch (err) {
        return next([err]);
    }
}

async function createVillage(req, res, next) {
    try {
        err = validateVillageData(req.body); // the result of this function is an array
        if (err.length) {
            return next(err);
        }

        const { name, countyId, city } = req.body;

        const county = await prisma.county.findUnique({
            where: {
                id: countyId,
            },
        });
        if (!county) {
            return next([new CityInvalidError()]);
        }

        const village = await prisma.village.create({
            data: {
                name,
                city,
                countyId,
            },
        });

        res.sendStatus(201);
    } catch (err) {
        next([err]);
    }
}

module.exports = {
    getVillages,
    createVillage,
};
