const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();

const User = require("../models/User");



// login page

router.get("/login",(req,res)=>{
 res.render("login");
});



// signup

router.get("/signup",(req,res)=>{
 res.render("signup");
});



router.post("/signup",async(req,res)=>{


const {
workEmail,
password,
confirmPassword,
contactName,
orgName,
orgType,
industry,
phone,
interest
}=req.body;



if(password !== confirmPassword){

return res.render("signup",{
 error:"Passwords do not match"
});

}



const exists = await User.findOne({
 email:workEmail
});


if(exists){

return res.render("signup",{
 error:"Account exists"
});

}



const hashed =
await bcrypt.hash(password,10);



await User.create({

email:workEmail,

password:hashed,

name:contactName,

org:orgName,

orgType,

industry,

phone,

interest

});



res.redirect("/login");


});





// login

router.post("/login",async(req,res)=>{


const {
email,
password
}=req.body;



const user =
await User.findOne({email});



if(!user){

return res.render("login",{
 error:"Invalid email or password"
});

}



const valid =
await bcrypt.compare(
password,
user.password
);



if(!valid){

return res.render("login",{
 error:"Invalid email or password"
});

}




req.session.user = user.email;
req.session.userName = user.name;
req.session.userOrg = user.org;
req.session.userOrgType = user.orgType;
req.session.userIndustry = user.industry;



req.session.save(()=>{

res.redirect("/dashboard");

});


});





router.get("/logout",(req,res)=>{


req.session.destroy(()=>{

res.redirect("/login");

});


});


module.exports = router;