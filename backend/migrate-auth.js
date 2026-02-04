const db = require("./db");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const adminEmail = "yaswanthrssms@gmail.com";
const adminPassword = "welcome123";

const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function (err) {
    if (err) return reject(err);
    resolve(this);
  });
});

const get = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) return reject(err);
    resolve(row);
  });
});

(async () => {
  try {
    await run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('USER','ADMIN')) DEFAULT 'USER',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    await run(`ALTER TABLE expenses ADD COLUMN user_id TEXT`, []).catch(() => {});

    await run(`CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id)`);

    await run(`CREATE TRIGGER IF NOT EXISTS trg_amount_positive
      BEFORE INSERT ON expenses
      WHEN NEW.amount <= 0
      BEGIN
        SELECT RAISE(ABORT, 'amount must be positive');
      END;`);

    await run(`CREATE TRIGGER IF NOT EXISTS trg_amount_positive_update
      BEFORE UPDATE ON expenses
      WHEN NEW.amount <= 0
      BEGIN
        SELECT RAISE(ABORT, 'amount must be positive');
      END;`);

    let admin = await get("SELECT * FROM users WHERE email = ?", [adminEmail]);
    if (!admin) {
      const id = uuidv4();
      const hashed = bcrypt.hashSync(adminPassword, 10);
      await run(
        "INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, 'ADMIN')",
        [id, adminEmail, hashed]
      );
      admin = await get("SELECT * FROM users WHERE email = ?", [adminEmail]);
    }

    await run("UPDATE expenses SET user_id = ? WHERE user_id IS NULL OR user_id = ''", [admin.id]);

    console.log("Auth migration complete");
  } catch (err) {
    console.error("Migration error:", err);
    process.exitCode = 1;
  } finally {
    db.close();
  }
})();