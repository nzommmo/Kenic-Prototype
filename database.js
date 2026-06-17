const mongoose = require("mongoose");


let connected=false;


async function connectDB(){

if(connected) return;


await mongoose.connect(
process.env.MONGO_URI
);


connected=true;

console.log("Mongo connected");

}


module.exports=connectDB;