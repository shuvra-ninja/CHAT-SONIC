const bodyParser = require("body-parser");
const express = require("express");
const mongoos = require("mongoose");
const session = require("express-session");
const SessionStore = require("connect-mongodb-session")(session);
const User = require("./model/user");
const requestIp = require("request-ip")
const port = "3000";
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

app.use(requestIp.mw())

app.use((req, res, next) => {
  if (req.user) {
    next();
  }
  User.find({ipAddress : req.clientIp}).then(user=>{
    if(user.length === 0){
      const newUser = new User({
        ipAddress : req.clientIp,
        apikeyindex : 0,
        maxApiKey : 12
      })
      newUser.save()
      User.find({ipAddress : req.clientIp}).then(user=>{
        console.log(user)
        req.user = user
      })
      
    }
    else
    {
      req.user = user
    }
    next();
  }).catch(err=>{
    console.log(err)
  })
});

const publicRoutes = require("./routes/public");
const authRoutes = require("./routes/auth");

app.use(authRoutes);
app.use(publicRoutes);

mongoos
  .connect(MONGO_CONNECT)
  .then((result) => {
    app.listen(process.env.POST || port, () => {
      console.log(`listning to the port ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
