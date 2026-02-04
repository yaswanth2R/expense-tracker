const express = require("express");
const db = require("../db");
const { authMiddleware, adminOnly } = require("../auth");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query("SELECT name FROM categories ORDER BY name");
    res.json(rows.map((r) => r.name));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.post("/", authMiddleware, adminOnly, async (req, res) => {
  try {
    await db.query("INSERT INTO categories (name) VALUES ($1)", [req.body.name]);
    res.status(201).json({ message: "Category added" });
  } catch (err) {
    res.status(400).json({ error: "Category add failed" });
  }
});

router.delete("/:name", authMiddleware, adminOnly, async (req, res) => {
  try {
    await db.query("DELETE FROM categories WHERE name=$1", [req.params.name]);
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ error: "Category delete failed" });
  }
});

module.exports = router;