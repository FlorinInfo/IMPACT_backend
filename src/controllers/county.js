const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { validateCountyData } = require("../validators/county.js");

async function getCounties(req, res, next) {
    try {
        const counties = await prisma.county.findMany({
            select: {
                id: true,
                name: true,
            },
        });

        res.status(200).json(counties);
    } catch (err) {
        next([err]);
    }
}

async function createCounty(req, res, next) {
    try {
        err = validateCountyData(req.body); // the result of this function is an array
        if (err.length) {
            next(err);
            return;
        }

        const { name } = req.body;
        const county = await prisma.county.create({
            data: {
                name,
            },
        });

        res.sendStatus(200);
    } catch (err) {
        next([err]);
    }
}

module.exports = {
    getCounties,
    createCounty,
};
