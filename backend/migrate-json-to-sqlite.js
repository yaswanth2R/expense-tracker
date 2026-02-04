const fs = require("fs");
const path = require("path");
const db = require("./db");

const dataDir = path.join(__dirname, "data");
const expensesPath = path.join(dataDir, "expenses.json");
const categoriesPath = path.join(dataDir, "categories.json");

const readJson = (p) => {
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, "utf8");
  return raw.trim() ? JSON.parse(raw) : null;
};

const categoriesFromFile = readJson(categoriesPath) || [];
const expenses = readJson(expensesPath) || [];

const categoriesFromExpenses = expenses
  .map((e) => e.category)
  .filter(Boolean);

const allCategories = Array.from(new Set([...categoriesFromFile, ...categoriesFromExpenses]));

const insertCategories = () => new Promise((resolve, reject) => {
  if (allCategories.length === 0) return resolve();
  const stmt = db.prepare("INSERT OR IGNORE INTO categories (name) VALUES (?)");
  allCategories.forEach((name) => stmt.run(name));
  stmt.finalize((err) => (err ? reject(err) : resolve()));
});

const insertExpenses = () => new Promise((resolve, reject) => {
  if (expenses.length === 0) return resolve();
  const stmt = db.prepare(
    "INSERT OR IGNORE INTO expenses (id, title, amount, category, date) VALUES (?, ?, ?, ?, ?)"
  );
  expenses.forEach((e) => {
    stmt.run(
      e.id,
      e.title,
      Number(e.amount),
      e.category,
      e.date
    );
  });
  stmt.finalize((err) => (err ? reject(err) : resolve()));
});

(async () => {
  try {
    await insertCategories();
    await insertExpenses();
    console.log("Migration complete");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exitCode = 1;
  } finally {
    db.close();
  }
})();