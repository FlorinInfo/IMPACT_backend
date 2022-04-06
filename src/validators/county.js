const { NameInvalidError } = require("../errors/county.js");

function validateCountyData({ name }) {
    const errors = [];
    if (!name || !name.trim()) errors.push(new NameInvalidError());
    return errors;
}

module.exports = {
    validateCountyData,
};
