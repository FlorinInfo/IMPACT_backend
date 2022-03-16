export function createUser(req, res) {
    console.log(req.body);

    res.sendStatus(200);
}

export function getUsers(req, res) {
    res.sendStatus(200);
}
