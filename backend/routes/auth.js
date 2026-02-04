const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { SECRET } = require("../auth");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = bcrypt.compareSync(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/register", async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const hashed = bcrypt.hashSync(password, 10);
  const id = uuidv4();
  const userRole = role === "ADMIN" ? "ADMIN" : "USER";

  try {
    await db.query(
      "INSERT INTO users (id, email, password, role) VALUES ($1, $2, $3, $4)",
      [id, email, hashed, userRole]
    );
    res.status(201).json({ id, email, role: userRole });
  } catch (err) {
    res.status(400).json({ error: "User already exists" });
  }
});

module.exports = router;