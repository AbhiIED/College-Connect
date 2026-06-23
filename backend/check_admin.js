const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config();

async function run() {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;
  const ssl = process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined;

  console.log(`Connecting to database "${database}" at ${host}:${port}...`);
  try {
    const connection = await mysql.createConnection({ host, user, password, database, port, ssl });
    console.log("✅ Connected successfully.");

    console.log("Checking User_Table for admin user...");
    const [rows] = await connection.query("SELECT User_ID, Email_ID, Password, Is_Verified, User_Type_ID FROM User_Table");
    console.log(`Found ${rows.length} users:`);
    console.log(JSON.stringify(rows, null, 2));

    await connection.end();
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

run();
