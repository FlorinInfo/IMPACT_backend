const { InsufficientPermissionsError } = require("../errors/permissions.js");

function checkPermissionsHierarchically(user, countyId, villageId, localityId) {
    if (user.zoneRoleOn === "LOCALITY") {
        if (
            countyId !== user.countyId ||
            villageId !== user.villageId ||
            localityId !== user.localityId
        )
            return new InsufficientPermissionsError();
    }

    if (user.zoneRoleOn === "VILLAGE") {
        if (countyId !== user.countyId || villageId !== user.villageId)
            return new InsufficientPermissionsError();
    }

    if (user.zoneRoleOn === "COUNTY") {
        if (countyId !== user.countyId)
            return new InsufficientPermissionsError();
    }
}

module.exports = { checkPermissionsHierarchically };
