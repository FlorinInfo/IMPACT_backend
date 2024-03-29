const express = require("express");
const app = express();
const port = 3000;

const prismaClient = require("@prisma/client");
const { PrismaClient } = prismaClient;
const prisma = new PrismaClient();
const fs = require("fs");
const thumbsupply = require("thumbsupply");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const morgan = require("morgan");
app.use(morgan("dev"));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    return next();
});

// Clear cookies =((
app.use(function (req, res, next) {
    res.clearCookie("token");
    res.clearCookie("zoneRole");
    res.clearCookie("zoneRoleOn");
    res.clearCookie("countyId");
    res.clearCookie("villageId");
    res.clearCookie("localityId");
    res.clearCookie("admin");
    res.clearCookie("referralId");
    return next();
});

// Generate thumbnails for videos
app.get(
    "/assets/videosArticles/:video/poster",
    function getThumbnail(req, res) {
        thumbsupply
            .generateThumbnail(`assets/videosArticles/${req.params.video}`)
            .then((thumb) => res.sendFile(thumb));
    }
);
app.use("/assets/imagesIC", express.static("./assets/imagesIC"));
app.use("/assets/imagesArticles", express.static("./assets/imagesArticles"));
app.use("/assets/videosArticles/:video", function getVideo(req, res) {
    const path = `./assets/videosArticles/${req.params.video}`;
    const stat = fs.statSync(path);
    const fileSize = stat.size;
    const range = req.headers.range;
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;
        const file = fs.createReadStream(path, { start, end });
        const head = {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunksize,
            "Content-Type": "video/mp4",
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            "Content-Length": fileSize,
            "Content-Type": "video/mp4",
        };
        res.writeHead(200, head);
        fs.createReadStream(path).pipe(res);
    }
});

const users = require("./routes/user.js");
app.use("/users", users);

const media = require("./routes/media.js");
app.use("/", media);

const localities = require("./routes/locality.js");
app.use("/localities", localities);

const villages = require("./routes/village.js");
app.use("/villages", villages);

const counties = require("./routes/county.js");
app.use("/counties", counties);

const articles = require("./routes/article.js");
app.use("/articles", articles);

const { login } = require("./controllers/user.js");
app.post("/login", login);

const { forgotPassword } = require("./controllers/user.js");
app.post("/forgotPassword", forgotPassword);

app.get("/status", (req, res) => {
    res.sendStatus(200);
});

const errorHandler = require("./middlewares/errors.js").errorHandler;
app.use(errorHandler);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
