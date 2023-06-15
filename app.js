const bodyParser = require("body-parser");
const express = require("express");
const port = "3000";
const path = require("path");
require("dotenv").config();
<<<<<<< HEAD
=======

>>>>>>> main
const app = express();
const port = "3000";
app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const publicRoutes = require("./routes/public");

app.use(publicRoutes);

<<<<<<< HEAD
app.listen(process.env.PORT || port, () => {
=======
app.listen(process.env.POST || port, () => {
>>>>>>> main
  console.log(`listning to the port ${port}`);
});
