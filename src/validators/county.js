const { NameInvalidError } = require("../errors/county.js");
const { checkString } = require("../utils/validators.js");

function validateCountyData({ name }) {
    const errors = [];
    if (!checkString(name)) errors.push(new nameinvaliderror());
    return errors;
}

module.exports = {
    validateCountyData,
};
