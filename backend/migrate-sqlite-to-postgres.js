require("dotenv").config();
const sqlite3 = require("sqlite3").verbose();
const { Pool } = require("pg");
const path = require("path");

const sqlitePath = path.join(__dirname, "expense_tracker.db");
const sqliteDb = new sqlite3.Database(sqlitePath);

const pg = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const run = async () => {
  await pg.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('USER','ADMIN')) DEFAULT 'USER',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pg.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL
    )
  `);

  await pg.query(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
      category TEXT NOT NULL,
      date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      user_id TEXT REFERENCES users(id)
    )
  `);

  await pg.query("CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date)");
  await pg.query("CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category)");
  await pg.query("CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id)");

  const users = await new Promise((resolve, reject) => {
    sqliteDb.all("SELECT * FROM users", [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });

  for (const u of users) {
    await pg.query(
      "INSERT INTO users (id, email, password, role, created_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING",
      [u.id, u.email, u.password, u.role, u.created_at]
    );
  }

  const categories = await new Promise((resolve, reject) => {
    sqliteDb.all("SELECT name FROM categories", [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });

  for (const c of categories) {
    await pg.query(
      "INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
      [c.name]
    );
  }

  const expenses = await new Promise((resolve, reject) => {
    sqliteDb.all("SELECT * FROM expenses", [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });

  for (const e of expenses) {
    await pg.query(
      "INSERT INTO expenses (id, title, amount, category, date, created_at, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING",
      [e.id, e.title, e.amount, e.category, e.date, e.created_at, e.user_id]
    );
  }

  console.log("Migration to Postgres complete");
  sqliteDb.close();
  await pg.end();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});