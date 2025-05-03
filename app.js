const express = require("express");
const bodyParser = require("body-parser");
const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
const multer = require("multer");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const helmet = require("helmet");
const compression = require("compression");
require("dotenv").config();
// app.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images"); // lưu vào folder images/
  },
  filename: (req, file, cb) => {
    cb(null, String(uuidv4()) + ".jpg");
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

app.use(upload.single("image"));

app.use(bodyParser.json()); // application/json header type
// Dùng path để đơn giản là đường dẫn tuyệt đối từ project đến images
app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTION"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

app.use(helmet());
app.use(compression());
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  return res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    `mongodb+srv://maithang18122003:Thang18122003@cluster0.6lqg4.mongodb.net/messages?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then((result) => {
    const server = app.listen(process.env.PORT || 5000);
    const io = require("./socket").init(server);
    io.on("connection", (socket) => {
      console.log("Client connected!");
    });
  })
  .catch((err) => console.log(err));
