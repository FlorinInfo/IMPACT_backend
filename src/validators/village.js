const {
    NameInvalidError,
    CountyInvalidError,
    CityInvalidError,
} = require("../errors/village.js");

function validateVillageData({ name, countyId, city }) {
    const errors = [];
    let err;

    if (!name || !name.trim()) errors.push(new NameInvalidError());

    err = validateCountyId(countyId);
    if (err) errors.push(err);

    if (city === undefined || !(typeof city === "boolean"))
        errors.push(new CityInvalidError());
    return errors;
}

function validateCountyId(id) {
    if (!(typeof id === "number") || !Number.isInteger(id))
        return new CountyInvalidError();
}

module.exports = {
    validateVillageData,
    validateCountyId
};
