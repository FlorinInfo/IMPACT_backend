import express from "express";
import prismaClient from "@prisma/client";

const { PrismaClient } = prismaClient;
const app = express();
const prisma = new PrismaClient();
const port = 3000;
app.use(express.json());


import users from "./routes/user.js";
app.use("/users", users);

app.get("/status", (req, res) => {
    res.sendStatus(200);
});

import { errorHandler } from './middlewares/errors.js';
app.use(errorHandler);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
