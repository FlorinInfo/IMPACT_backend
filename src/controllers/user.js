const {
    validateUserData
} = require('../validators/user.js');

function createUser(req, res) {
    console.log(req.body);
    validateUserData(req.body);
    res.sendStatus(200);
}

function getUsers(req, res) {
    res.sendStatus(200);
}

module.exports = {
    createUser,
    getUsers
}
