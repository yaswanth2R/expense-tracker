const express = require("express");
const db = require("../db");
const { v4: uuidv4 } = require("uuid");
const { authMiddleware } = require("../auth");

const router = express.Router();

router.get("/", authMiddleware, (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const offset = (page - 1) * limit;

  db.get(
    "SELECT COUNT(*) as total FROM expenses WHERE user_id = ?",
    [req.user.id],
    (countErr, countRow) => {
      if (countErr) return res.status(500).json(countErr);
      const total = countRow.total || 0;
      const totalPages = Math.max(1, Math.ceil(total / limit));

      db.all(
        "SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC LIMIT ? OFFSET ?",
        [req.user.id, limit, offset],
        (err, rows) => {
          if (err) return res.status(500).json(err);
          res.json({ data: rows, page, limit, total, totalPages });
        }
      );
    }
  );
});

router.get("/trends", authMiddleware, (req, res) => {
  db.all(
    "SELECT substr(date, 1, 7) as month, SUM(amount) as total FROM expenses WHERE user_id = ? GROUP BY substr(date, 1, 7) ORDER BY month",
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

router.get("/monthly", authMiddleware, (req, res) => {
  const { month } = req.query;

  db.get(
    "SELECT IFNULL(SUM(amount), 0) as total FROM expenses WHERE substr(date, 1, 7) = ? AND user_id = ?",
    [month, req.user.id],
    (totalErr, totalRow) => {
      if (totalErr) return res.status(500).json(totalErr);

      db.all(
        "SELECT category, SUM(amount) as total FROM expenses WHERE substr(date, 1, 7) = ? AND user_id = ? GROUP BY category",
        [month, req.user.id],
        (catErr, catRows) => {
          if (catErr) return res.status(500).json(catErr);

          db.all(
            "SELECT * FROM expenses WHERE substr(date, 1, 7) = ? AND user_id = ? ORDER BY date DESC",
            [month, req.user.id],
            (err, rows) => {
              if (err) return res.status(500).json(err);

              const byCategory = {};
              catRows.forEach((r) => {
                byCategory[r.category] = Number(r.total);
              });

              res.json({
                month,
                total: Number(totalRow.total) || 0,
                byCategory,
                expenses: rows
              });
            }
          );
        }
      );
    }
  );
});

router.post("/", authMiddleware, (req, res) => {
  const { title, amount, category, date } = req.body;
  const id = uuidv4();

  db.run(
    `INSERT INTO expenses (id, title, amount, category, date, user_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, title, amount, category, date, req.user.id],
    () => res.status(201).json({ id, title, amount, category, date })
  );
});

router.put("/:id", authMiddleware, (req, res) => {
  const { title, amount, category, date } = req.body;

  db.run(
    `UPDATE expenses SET title=?, amount=?, category=?, date=? WHERE id=? AND user_id=?`,
    [title, amount, category, date, req.params.id, req.user.id],
    () => res.json({ message: "Expense updated" })
  );
});

router.delete("/:id", authMiddleware, (req, res) => {
  db.run(
    "DELETE FROM expenses WHERE id=? AND user_id=?",
    [req.params.id, req.user.id],
    () => res.json({ message: "Expense deleted" })
  );
});

module.exports = router;