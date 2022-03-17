import { validateUserData } from '../validators/user.js';

export function createUser(req, res) {
    console.log(req.body);
    validateUserData(req.body);
    res.sendStatus(200);
}

export function getUsers(req, res) {
    res.sendStatus(200);
}
