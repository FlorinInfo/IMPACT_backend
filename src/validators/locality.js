const {
    NameInvalidError,
    VillageInvalidError,
} = require("../errors/locality.js");
const { checkString, checkInt } = require("../utils/validators.js");

function validateLocalityData({ name, villageId, city }) {
    const errors = [];
    let err;

    if (!checkString(name)) errors.push(new NameInvalidError());

    err = validateVillageId(villageId);
    if (err) errors.push(err);

    return errors;
}

function validateVillageId(id) {
    if (!checkInt(id)) return new VillageInvalidError();
}

module.exports = {
    validateLocalityData,
    validateVillageId,
};
