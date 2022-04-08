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
    checkString,
    checkInt,
    checkBoolean,
};
