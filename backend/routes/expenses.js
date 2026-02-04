const express = require("express");
const db = require("../db");
const { v4: uuidv4 } = require("uuid");
const { authMiddleware } = require("../auth");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const offset = (page - 1) * limit;

  try {
    const countResult = await db.query(
      "SELECT COUNT(*)::int AS total FROM expenses WHERE user_id = $1",
      [req.user.id]
    );
    const total = countResult.rows[0]?.total || 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const { rows } = await db.query(
      "SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC LIMIT $2 OFFSET $3",
      [req.user.id, limit, offset]
    );

    res.json({ data: rows, page, limit, total, totalPages });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

router.get("/trends", authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT to_char(date, 'YYYY-MM') as month, SUM(amount)::float as total FROM expenses WHERE user_id = $1 GROUP BY to_char(date, 'YYYY-MM') ORDER BY month",
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch trends" });
  }
});

router.get("/monthly", authMiddleware, async (req, res) => {
  const { month } = req.query;

  try {
    const totalResult = await db.query(
      "SELECT COALESCE(SUM(amount), 0)::float as total FROM expenses WHERE to_char(date, 'YYYY-MM') = $1 AND user_id = $2",
      [month, req.user.id]
    );

    const categoryResult = await db.query(
      "SELECT category, SUM(amount)::float as total FROM expenses WHERE to_char(date, 'YYYY-MM') = $1 AND user_id = $2 GROUP BY category",
      [month, req.user.id]
    );

    const expensesResult = await db.query(
      "SELECT * FROM expenses WHERE to_char(date, 'YYYY-MM') = $1 AND user_id = $2 ORDER BY date DESC",
      [month, req.user.id]
    );

    const byCategory = {};
    categoryResult.rows.forEach((r) => {
      byCategory[r.category] = Number(r.total);
    });

    res.json({
      month,
      total: Number(totalResult.rows[0]?.total) || 0,
      byCategory,
      expenses: expensesResult.rows
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch monthly summary" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  const { title, amount, category, date } = req.body;
  const id = uuidv4();

  try {
    await db.query(
      "INSERT INTO expenses (id, title, amount, category, date, user_id) VALUES ($1, $2, $3, $4, $5, $6)",
      [id, title, amount, category, date, req.user.id]
    );
    res.status(201).json({ id, title, amount, category, date });
  } catch (err) {
    res.status(500).json({ error: "Failed to add expense" });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  const { title, amount, category, date } = req.body;

  try {
    await db.query(
      "UPDATE expenses SET title=$1, amount=$2, category=$3, date=$4 WHERE id=$5 AND user_id=$6",
      [title, amount, category, date, req.params.id, req.user.id]
    );
    res.json({ message: "Expense updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update expense" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await db.query(
      "DELETE FROM expenses WHERE id=$1 AND user_id=$2",
      [req.params.id, req.user.id]
    );
    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

module.exports = router;