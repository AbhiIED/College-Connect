const mysql = require("mysql2/promise");
require("dotenv").config(); // Load .env variables

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

// Test the connection once on boot
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Database connected successfully.");

    // Ensure User_Data column exists in OTP_Verification
    try {
      const [columns] = await conn.query("SHOW COLUMNS FROM OTP_Verification LIKE 'User_Data'");
      if (columns.length === 0) {
        await conn.query("ALTER TABLE OTP_Verification ADD COLUMN User_Data TEXT DEFAULT NULL");
        console.log("✅ Added User_Data column to OTP_Verification table.");
      }
    } catch (dbErr) {
      console.warn("⚠️ Warning during structure adjustment:", dbErr.message);
    }

    conn.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
})();

module.exports = pool;
