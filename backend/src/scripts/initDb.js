const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config();

async function run() {
  console.log("Reading environment variables...");
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;
  const ssl = process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined;

  if (!host || !user || !password || !database) {
    console.error("❌ Missing required database environment variables in .env.");
    console.log("Please make sure DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME are set in your backend/.env file.");
    process.exit(1);
  }

  console.log(`Connecting to database "${database}" at ${host}:${port} (SSL: ${process.env.DB_SSL === "true"})...`);
  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      user,
      password,
      database,
      port,
      ssl,
      multipleStatements: true // Allows running multiple queries from database.sql at once
    });
    console.log("✅ Connected successfully to the cloud database.");
  } catch (err) {
    console.error("❌ Failed to connect to the database:", err.message);
    process.exit(1);
  }

  try {
    const sqlPath = path.join(__dirname, "../../database.sql");
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`database.sql file not found at ${sqlPath}`);
    }
    
    let sql = fs.readFileSync(sqlPath, "utf8");

    // Remove database creation/drop commands that might fail on cloud databases (like Aiven's preset defaultdb)
    sql = sql.replace(/DROP DATABASE IF EXISTS[^;]+;/gi, "");
    sql = sql.replace(/CREATE DATABASE IF NOT EXISTS[^;]+;/gi, "");
    sql = sql.replace(/CREATE DATABASE[^;]+;/gi, "");
    sql = sql.replace(/USE [^;]+;/gi, "");

    console.log("Executing schema queries from database.sql...");
    await connection.query(sql);
    console.log("✅ Schema initialized successfully on the database!");
    
    // Add default admin user
    console.log("Checking for default admin user...");
    const [rows] = await connection.query("SELECT * FROM User_Table WHERE Email_ID = 'admin@college.com'");
    if (rows.length === 0) {
      console.log("Creating default admin user...");
      
      // Ensure the lookup roles exist
      await connection.query(`
        INSERT IGNORE INTO User_Type_Table (User_Type_ID, User_Type_name) VALUES
        (1, 'Alumni'),
        (2, 'Student'),
        (3, 'Admin');
      `);
      
      // Create user
      const [insertResult] = await connection.query(`
        INSERT INTO User_Table (User_Type_ID, User_Fname, User_Lname, Gender, Phone_no, Email_ID, Password, Is_Verified)
        VALUES (
            3, 'Super', 'Admin', 'Male', '9999999999',
            'admin@college.com',
            '$2b$10$N.pycszXqJaAL/YVIrnIgeWky9ntp2kYlQnrJpND4xKdHPtnT7Imi',
            1
        );
      `);
      
      const userId = insertResult.insertId;
      
      // Link to Admin_Table
      await connection.query(`
        INSERT INTO Admin_Table (Admin_ID, User_ID, Role)
        VALUES (1, ${userId}, 'Administrator');
      `);
      
      console.log("✅ Default admin user created successfully (Email: admin@college.com | Password: Admin@123).");
    } else {
      console.log("ℹ️ Admin user already exists. Skipping creation.");
    }
  } catch (err) {
    console.error("❌ Failed to initialize schema:", err.message);
  } finally {
    await connection.end();
  }
}

run();
