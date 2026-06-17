require("dotenv").config();

const express    = require("express");
const session    = require("express-session");
const MongoStore = require("connect-mongo");
const path       = require("path");

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      dbName: "kenic",
      ttl: 60 * 60 * 8,
    }),
    secret: process.env.SESSION_SECRET || "fallback-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
);

app.use(express.static(path.join(__dirname, "public")));

// ── View Engine ───────────────────────────────────────────────────────────────
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/", require("./routes/auth"));
app.use("/", require("./routes/portal"));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).send("Page not found");
});

// ── Local dev server ──────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  // Add DNS override only for local dev
  const dns = require("dns");
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
  dns.setDefaultResultOrder("ipv4first");

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;