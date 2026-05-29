const pool = require("../config/db");
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();

// Initialize Razorpay safely with a fallback placeholder if keys are missing
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || "";
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "";

let razorpay = null;
if (razorpayKeyId && razorpayKeyId !== "your_razorpay_key_id") {
  try {
    razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });
  } catch (err) {
    console.error("⚠️ Warning: Failed to initialize Razorpay:", err.message);
  }
} else {
  console.warn("⚠️ Warning: Razorpay credentials are not configured. Donation payments will be disabled.");
}


// Get all donation projects
exports.getAllProjects = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        Project_ID AS id,
        Project_title AS title,
        Project_Description AS description,
        Image AS image,
        Fund_Raised AS raised,
        Funds_Required AS target,
        Category AS category
      FROM project
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get Razorpay key
exports.getRazorpayKey = (req, res) => {
  try {
    res.json({ key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error("Error fetching Razorpay key:", err);
    res.status(500).json({ error: "Failed to get Razorpay key" });
  }
};

// Get single project by ID
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT 
        Project_ID AS id,
        Project_title AS title,
        Project_Description AS description,
        Image AS image,
        Fund_Raised AS raised,
        Funds_Required AS target,
        Category AS category
      FROM project
      WHERE Project_ID = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Donation not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching project by ID:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Create Razorpay order
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!razorpay) {
      return res.status(400).json({ error: "Razorpay is not configured on this server." });
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
};

// Verify Razorpay payment
exports.verifyPayment = async (req, res) => {
  try {
    const { order_id, payment_id, signature, projectId, amount, message } = req.body;
    const body = order_id + "|" + payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === signature) {
      // Record the transaction
      const [txResult] = await pool.query(
        `INSERT INTO transactions (Payment_Mode, Payment_Status, Payment_Time) VALUES ('Razorpay', 'Success', NOW())`
      );

      // Record the donation
      const donorId = req.user ? req.user.id : null;
      await pool.query(
        `INSERT INTO Donation (Donor_ID, Project_ID, transaction_id, Amount, Message) VALUES (?, ?, ?, ?, ?)`,
        [donorId, projectId, txResult.insertId, amount, message || null]
      );

      // Update project fund raised
      await pool.query(
        `UPDATE project SET Fund_Raised = Fund_Raised + ? WHERE Project_ID = ?`,
        [amount, projectId]
      );

      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (err) {
    console.error("Error verifying Razorpay payment:", err);
    res.status(500).json({ error: "Verification failed" });
  }
};
