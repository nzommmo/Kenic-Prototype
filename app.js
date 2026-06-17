const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      sameSite: "none"
    }
  })
);

app.use(express.static(path.join(__dirname, "public")));

// ── View Engine ───────────────────────────────────────────────────────────────
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ── Routes ────────────────────────────────────────────────────────────────────

// Auth routes: /login  /signup  /logout  (standalone pages, no shell)
app.use("/", require("./routes/auth"));

// Portal routes: /dashboard  /reports  /domains  /financials  /registrars  /settings
app.use("/", require("./routes/portal"));

// ── 404 Fallback ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).send("Page not found");
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});