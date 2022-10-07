require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();
const path = require("path");
const errorHandler = require("./middleware/errorHandler");
const { logger, logEvents } = require("./middleware/logger");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const mongoose = require("mongoose");
const connectDB = require("./config/dbConn");

const PORT = process.env.PORT || 3500;

connectDB();

const corsOptions = require("./config/corsOptions");

const rootRoute = require("./routes/root");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const noteRoutes = require("./routes/noteRoutes");

// Custom middleware - logger
app.use(logger);

// built in middle ware to parse data from body
app.use(express.json());

// thirdparty middleware
app.use(cors(corsOptions));
app.use(cookieParser());

// serve static files in the public folder, when root route is requested "/"...
// example of a built in middleware
// do the express.static, when "/" root route is accessed.
// telling express where to find static files like css file or images
app.use("/", express.static(path.join(__dirname, "public")));
// app.use(express.static("public")); // same as above but not explicit. can use either one

// APPLICATION ROUTES
app.use("/", rootRoute);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/notes", noteRoutes);

// catch all route that do not match or not routed properly / 404 page
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found!" });
  } else {
    res.type("txt").send("404 Not Found!");
  }
});

// handling errors in express - custom middleware
app.use(errorHandler);

const db = mongoose.connection;

db.once("open", () => {
  console.log(process.env.NODE_ENV);
  console.log("DB connection Established");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

db.on("error", (err) => {
  console.log("connection error");
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoError.log"
  );
});
