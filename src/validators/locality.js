const {
    NameInvalidError,
    VillageInvalidError,
} = require("../errors/locality.js");

function validateLocalityData({ name, villageId, city }) {
    const errors = [];
    let err;

    if (!name || !name.trim()) errors.push(new NameInvalidError());

    err = validateVillageId(villageId);
    if (err) errors.push(err);

    return errors;
}

function validateVillageId(id) {
    if (!(typeof id === "number") || !Number.isInteger(id))
        return new VillageInvalidError();
}

module.exports = {
    validateLocalityData,
    validateVillageId,
};
