const express = require("express");
const db = require("../db");
const { authMiddleware, adminOnly } = require("../auth");

const router = express.Router();

router.get("/", authMiddleware, (req, res) => {
  db.all("SELECT name FROM categories", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows.map((r) => r.name));
  });
});

router.post("/", authMiddleware, adminOnly, (req, res) => {
  db.run(
    "INSERT INTO categories (name) VALUES (?)",
    [req.body.name],
    () => res.status(201).json({ message: "Category added" })
  );
});

router.delete("/:name", authMiddleware, adminOnly, (req, res) => {
  db.run(
    "DELETE FROM categories WHERE name=?",
    [req.params.name],
    () => res.json({ message: "Category deleted" })
  );
});

module.exports = router;