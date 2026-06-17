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

// Test the connection once and run dynamic structural adjustments on boot
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Database connected successfully.");
    
    // Check if Verification_Query column exists in User_Table
    try {
      const [columns] = await conn.query("SHOW COLUMNS FROM User_Table LIKE 'Verification_Query'");
      if (columns.length === 0) {
        await conn.query("ALTER TABLE User_Table ADD COLUMN Verification_Query TEXT DEFAULT NULL");
        console.log("✅ Added Verification_Query column to User_Table.");
      } else {
        console.log("✅ Database structure checked: Verification_Query column exists.");
      }
    } catch (dbErr) {
      console.warn("⚠️ Warning during structure adjustment:", dbErr.message);
    }

    // Check if Is_Flagged column exists in Post table (for admin moderation alerts)
    try {
      const [flagCols] = await conn.query("SHOW COLUMNS FROM Post LIKE 'Is_Flagged'");
      if (flagCols.length === 0) {
        await conn.query("ALTER TABLE Post ADD COLUMN Is_Flagged TINYINT(1) DEFAULT 0");
        console.log("✅ Added Is_Flagged column to Post table.");
      } else {
        console.log("✅ Database structure checked: Is_Flagged column exists.");
      }
    } catch (dbErr) {
      console.warn("⚠️ Warning adding Is_Flagged column:", dbErr.message);
    }
    
    conn.release(); // release connection back to pool
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
})();

module.exports = pool;
