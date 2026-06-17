const express = require("express");
const bcrypt  = require("bcryptjs");
const fs      = require("fs");

const router = express.Router();

const USERS_FILE = "./users.json";

function getUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(USERS_FILE));
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

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

  const users = getUsers();

  const exists = users.find((u) => u.email === workEmail);
  if (exists) {
    return res.render("signup", { error: "An account with this email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  users.push({
    email:    workEmail,
    password: hashedPassword,
    name:     contactName,
    org:      orgName,
    orgType,
    industry,
    phone,
    interest,
  });

  saveUsers(users);

  res.redirect("/login");
});

// ── Login ─────────────────────────────────────────────────────────────────────
router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const users = getUsers();
  const user  = users.find((u) => u.email === email);

  if (!user) {
    return res.render("login", { error: "Invalid email or password" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.render("login", { error: "Invalid email or password" });
  }

  // Store everything the portal needs — no file reads required per request
  req.session.user        = user.email;
  req.session.userName    = user.name     || "";
  req.session.userOrg     = user.org      || "";   // ← added
  req.session.userOrgType = user.orgType  || "";   // ← added
  req.session.userIndustry = user.industry || "";  // ← added

  res.redirect("/dashboard");
});

// ── Logout ────────────────────────────────────────────────────────────────────
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;