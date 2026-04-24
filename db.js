const mysql = require("mysql2");

/* ================= CREATE POOL ================= */
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "test",
  port: process.env.DB_PORT || 3306,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  // SSL only if enabled in production
  ssl: process.env.DB_SSL === "true"
    ? { rejectUnauthorized: false }
    : false
});

/* ================= TEST CONNECTION ================= */
db.query("SELECT 1", (err) => {
  if (err) {
    console.log("❌ Database Connection Failed:", err.message);
  } else {
    console.log("✅ MySQL Connected Successfully");
  }
});

/* ================= ERROR HANDLER ================= */
db.on("error", (err) => {
  console.log("❌ MySQL Pool Error:", err.message);
});

/* ================= EXPORT ================= */
module.exports = db;
