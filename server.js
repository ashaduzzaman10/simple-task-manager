// essential setup

const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const TodoHandler = require("./routeHandler/todoHandler");
const userHandler = require("./routeHandler/userHandler");
const checkLogIn = require("./middlewares/checkLogin");

const app = express();
dotenv.config();
// middleware
app.use([
  express.json(),
  cors(),
  morgan("dev"),
  express.urlencoded({ extended: true }),

]);

// db connection

const databaseConnection = async () => {
  try {
    await mongoose.connect("mongodb://localhost/todos");
    console.log("connection successful");
  } catch (error) {
    console.log(error);
  }
};

databaseConnection();

// Standard route
app.get("/health", (_req, res) => {
  res.status(200).json({
    message: "success",
  });
});

//application routes
app.use("/todo", TodoHandler);
app.use("/user", userHandler);

// default error handling

app.use((_req, _res, next) => {
  const error = new Error("resources not found!!!");
  error.status = 404;
  next(error);
});

app.use((error, _req, res, _next) => {
  if (error.status) {
    return res.status(error.status).json({
      message: error.message,
    });
  }
  res.status(500).json({
    message: "server errors occurs",
  });
});

// server running checker
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`server is running on port : ${PORT}`);
});
