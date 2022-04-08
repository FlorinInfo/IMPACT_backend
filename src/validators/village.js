const {
    NameInvalidError,
    CountyInvalidError,
    CityInvalidError,
} = require("../errors/village.js");
const {
    checkString,
    checkInt,
    checkBoolean,
} = require("../utils/validators.js");

function validateVillageData({ name, countyId, city }) {
    const errors = [];
    let err;

    if (!checkString(name)) errors.push(new NameInvalidError());

    err = validateCountyId(countyId);
    if (err) errors.push(err);

    if (!checkBoolean(city)) errors.push(new CityInvalidError());
    return errors;
}

function validateCountyId(id) {
    if (!checkInt(id)) return new CountyInvalidError();
}

module.exports = {
    validateVillageData,
    validateCountyId,
};
