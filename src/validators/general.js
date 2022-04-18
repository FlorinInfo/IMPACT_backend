const { ZoneInvalidError } = require("../errors/general.js");

function validateZone(zone) {
    if (zone !== "LOCALITY" && zone !== "VILLAGE" && zone !== "COUNTY") {
        return new ZoneInvalidError();
    }
}

module.exports = {
    validateZone,
};
