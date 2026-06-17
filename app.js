
const connectDB=require("./database");

connectDB();
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");
require("dotenv").config();

const app = express();

// middleware
app.use(express.urlencoded({ extended:true }));
app.use(express.json());


// sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET,

    resave:false,
    saveUninitialized:false,

    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),

    cookie:{
      secure:true,
      httpOnly:true,
      sameSite:"none",
      maxAge:1000 * 60 * 60 * 24
    }
  })
);


// static
app.use(
  express.static(
    path.join(__dirname,"public")
  )
);


// views
app.set(
  "view engine",
  "ejs"
);

app.set(
  "views",
  path.join(__dirname,"views")
);


// routes

app.use("/", require("./routes/auth"));

app.use("/", require("./routes/portal"));


// error handler

app.use((err,req,res,next)=>{
 console.error(err);
 res.status(500).send("Internal Server Error");
});


module.exports = app;