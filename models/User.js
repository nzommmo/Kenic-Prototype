const mongoose = require("mongoose");


const UserSchema = new mongoose.Schema({

email:{
 type:String,
 unique:true,
 required:true
},

password:String,

name:String,

org:String,

orgType:String,

industry:String,

phone:String,

interest:String


},{
timestamps:true
});



module.exports =
mongoose.model(
"User",
UserSchema
);