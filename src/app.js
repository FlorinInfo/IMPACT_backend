const express = require('express');
const app = express();
const port = 3000;

const prismaClient = require('@prisma/client');
const { PrismaClient } = prismaClient;
const prisma = new PrismaClient();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const morgan = require('morgan');
app.use(morgan("dev"));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use("/images", express.static("./images"));

const users = require('./routes/user.js');
app.use("/users", users);

const media = require('./routes/media.js');
app.use("/", media);

app.get("/status", (req, res) => {
    res.sendStatus(200);
});

const errorHandler = require('./middlewares/errors.js').errorHandler;
app.use(errorHandler);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
