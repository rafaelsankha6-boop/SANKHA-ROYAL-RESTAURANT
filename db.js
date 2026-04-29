const mysql = require("mysql2/promise");
require("dotenv").config();

/* ================= CREATE CONNECTION POOL ================= */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  ssl:
    process.env.DB_SSL === "true"
      ? { rejectUnauthorized: false }
      : undefined
});

/* ================= TEST CONNECTION ================= */
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ MySQL Connected Successfully");
    conn.release();
  } catch (err) {
    console.error("❌ Database Connection Failed:", err.message);
    process.exit(1);
  }
})();

/* ================= QUERY HELPER ================= */
async function query(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (err) {
    console.error("❌ SQL Error:", err.message);
    throw err;
  }
}

/* ================= EXPORT ================= */
module.exports = {
  query,
  pool
};
