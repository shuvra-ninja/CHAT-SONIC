const bodyParser = require("body-parser");
const express = require("express");
const mongoos = require("mongoose");
const session = require("express-session");
const SessionStore = require("connect-mongodb-session")(session);
const User = require("./model/user");
const Global = require("./model/global");
const requestIp = require("request-ip");
const port = "3000";
const UAParser = require("ua-parser-js");
const path = require("path");
require("dotenv").config();
const MONGO_CONNECT = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}mymongoinit.6md0cxy.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`;

const app = express();
const store = new SessionStore({
  uri: MONGO_CONNECT,
  collection: "session",
});

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      expires: 48 * 3600000,
    },
  })
);

app.use(requestIp.mw());

app.use((req, res, next) => {
  if (req.global) {
    next();
  }
  Global.findById("6492be0d06868ca1f8040e02")
    .then((global) => {
      req.global = global;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use((req, res, next) => {
  User.find({ ipAddress: req.clientIp })
    .then((user) => {
      if (user.length === 0) {
        console.log("new user");
        const useragent = req.headers["user-agent"];
        let parser = new UAParser(useragent);
        let parserResults = parser.getResult();
        const clientIp = req.clientIp;
        const newUser = new User({
          ipAddress: clientIp,
          userDetails: parserResults,
        });
        return newUser.save().then((response) => {
          User.find({ ipAddress: clientIp }).then((users) => {
            req.user = users;
            next();
          });
        });
      } else {
        req.user = user;
        next();
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

const publicRoutes = require("./routes/public");
const authRoutes = require("./routes/auth");

app.use(authRoutes);
app.use(publicRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  let statusCode = error.statusCode;
  let data = error.data;
  let message = error.message;

  res.status(statusCode || 500).json({
    error: "yes",
    data: data,
    message: message,
  });
});

mongoos
  .connect(MONGO_CONNECT)
  .then((result) => {
    app.listen(process.env.PORT || port, () => {
      console.log(`listning to the port ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
