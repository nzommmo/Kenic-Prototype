const express = require("express");
const bcrypt  = require("bcryptjs");
const { getDb } = require("../lib/db");

const router = express.Router();

// ── Redirect root to login ────────────────────────────────────────────────────
router.get("/", (req, res) => {
  res.redirect("/login");
});

// ── Signup ────────────────────────────────────────────────────────────────────
router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signup", async (req, res) => {
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
    return res.render("signup", { error: "Passwords do not match" });
  }

  if (password.length < 8) {
    return res.render("signup", { error: "Password must be at least 8 characters" });
  }

  try {
    const db    = await getDb();
    const users = db.collection("users");

    const exists = await users.findOne({ email: workEmail });
    if (exists) {
      return res.render("signup", { error: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await users.insertOne({
      email:    workEmail,
      password: hashedPassword,
      name:     contactName,
      org:      orgName,
      orgType,
      industry,
      phone,
      interest,
      createdAt: new Date(),
    });

    res.redirect("/login");
  } catch (err) {
    console.error("Signup error:", err);
    res.render("signup", { error: "Something went wrong. Please try again." });
  }
});

// ── Login ─────────────────────────────────────────────────────────────────────
router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const db   = await getDb();
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return res.render("login", { error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.render("login", { error: "Invalid email or password" });
    }

    // Store everything the portal needs in the session
    req.session.user         = user.email;
    req.session.userName     = user.name     || "";
    req.session.userOrg      = user.org      || "";
    req.session.userOrgType  = user.orgType  || "";
    req.session.userIndustry = user.industry || "";
    req.session.userPhone    = user.phone    || "";

    res.redirect("/dashboard");
  } catch (err) {
    console.error("Login error:", err);
    res.render("login", { error: "Something went wrong. Please try again." });
  }
});

// ── Logout ────────────────────────────────────────────────────────────────────
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;