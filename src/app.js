import express from "express";
import prismaClient from "@prisma/client";

const { PrismaClient } = prismaClient;
const app = express();
const prisma = new PrismaClient();
const port = 3000;
import users from './routes/user.js';

app.use(express.json())
app.use('/users', users);

app.get("/status", (req, res) => {
    res.sendStatus(200);
});


app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
