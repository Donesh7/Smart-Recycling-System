const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const userroutes = require("./routes/user");

const app = express();
const MONGODB_URI =
  "mongodb+srv://duvvuruvarundonesh:cHinnu54321@varundonesh.3ys9c.mongodb.net/?retryWrites=true&w=majority&appName=VarunDonesh";
const port = 3000;
app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyparser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "style")));
app.use(express.static(path.join(__dirname, "images")));
app.use(express.static(path.join(__dirname, "js")));

app.use(userroutes);

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(port);
    console.log("Server started");
  })
  .catch((err) => console.log("err"));
