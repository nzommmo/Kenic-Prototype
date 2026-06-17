const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const USERS_FILE = path.join(process.cwd(), "users.json");


// ─────────────────────────────────────────────
// User storage helpers
// ─────────────────────────────────────────────

function getUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      return [];
    }

    const data = fs.readFileSync(USERS_FILE, "utf8");

    return data ? JSON.parse(data) : [];

  } catch (error) {
    console.error("Failed reading users:", error);
    return [];
  }
}


function saveUsers(users) {

  // Vercel filesystem is not persistent
  if (process.env.VERCEL) {
    console.log("Skipping users.json write on Vercel");
    return;
  }

  try {
    fs.writeFileSync(
      USERS_FILE,
      JSON.stringify(users, null, 2)
    );

  } catch (error) {
    console.error("Failed saving users:", error);
  }
}



// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────


// Redirect root

router.get("/", (req, res) => {
  res.redirect("/login");
});




// Signup page

router.get("/signup", (req, res) => {
  res.render("signup");
});




// Signup action

router.post("/signup", async (req, res) => {

  try {

    const {
      workEmail,
      password,
      confirmPassword,
      contactName,
      orgName,
      orgType,
      industry,
      phone,
      interest,
    } = req.body;


    if (!password || password !== confirmPassword) {
      return res.render("signup", {
        error: "Passwords do not match"
      });
    }


    if (password.length < 8) {
      return res.render("signup", {
        error: "Password must be at least 8 characters"
      });
    }



    const users = getUsers();



    const exists = users.find(
      user => user.email === workEmail
    );


    if (exists) {
      return res.render("signup", {
        error: "An account with this email already exists"
      });
    }



    const hashedPassword = await bcrypt.hash(
      password,
      10
    );



    const newUser = {

      email: workEmail,

      password: hashedPassword,

      name: contactName,

      org: orgName,

      orgType,

      industry,

      phone,

      interest
    };



    users.push(newUser);


    saveUsers(users);



    res.redirect("/login");


  } catch(error) {

    console.error(error);

    res.status(500).send(
      "Something went wrong during signup"
    );
  }

});




// Login page

router.get("/login", (req,res)=>{
  res.render("login");
});




// Login action

router.post("/login", async (req,res)=>{


  try {


    const {
      email,
      password
    } = req.body;



    const users = getUsers();



    const user = users.find(
      u => u.email === email
    );



    if(!user){

      return res.render("login",{
        error:"Invalid email or password"
      });

    }



    const validPassword =
      await bcrypt.compare(
        password,
        user.password
      );



    if(!validPassword){

      return res.render("login",{
        error:"Invalid email or password"
      });

    }



    req.session.user = user.email;

    req.session.userName =
      user.name || "";

    req.session.userOrg =
      user.org || "";

    req.session.userOrgType =
      user.orgType || "";

    req.session.userIndustry =
      user.industry || "";



    res.redirect("/dashboard");


  } catch(error){

    console.error(
      "Login error:",
      error
    );


    res.status(500).send(
      "Internal Server Error"
    );

  }

});





// Logout

router.get("/logout",(req,res)=>{

  req.session.destroy(()=>{

    res.redirect("/login");

  });

});



module.exports = router;