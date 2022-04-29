const { ZoneInvalidError } = require("../errors/general.js");

function validateZone(zone) {
    if (zone !== "LOCALITY" && zone !== "VILLAGE" && zone !== "COUNTY") {
        return new ZoneInvalidError();
    }
}

function checkString(s) {
    return !!s && typeof s === "string" && s.trim();
}

function checkInt(i) {
    return typeof i === "number" && Number.isInteger(i);
}

function checkBoolean(b) {
    return b !== undefined && typeof b === "boolean";
}

module.exports = {
    validateZone,
    checkString,
    checkInt,
    checkBoolean,
};
