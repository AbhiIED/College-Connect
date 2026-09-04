// Database-backed OTP storage using OTP_Verification table
// Replaces the old in-memory Map-based store for production reliability
const pool = require("../config/db");

const OTP_EXPIRY_MINUTES = 5;

/**
 * Generate a random 6-digit OTP code.
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Store an OTP in the database for a given email and purpose.
 * Any existing OTP for the same email+purpose is replaced.
 * @param {string} email
 * @param {string} otp
 * @param {object|null} userData - Pending signup data (stored as JSON in the database)
 */
async function storeOTP(email, otp, userData = null) {
  const key = email.toLowerCase();
  const purpose = "signup"; // default purpose for email verification

  // Delete any previous OTP for this email+purpose
  await pool.query(
    `DELETE FROM OTP_Verification WHERE Email = ? AND Purpose = ?`,
    [key, purpose]
  );

  const userDataJson = userData ? JSON.stringify(userData) : null;

  // Insert the new OTP with expiration and serialized userData
  await pool.query(
    `INSERT INTO OTP_Verification (Email, OTP_Code, Purpose, Created_At, Expires_At, Is_Used, User_Data)
     VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? MINUTE), 0, ?)`,
    [key, otp, purpose, OTP_EXPIRY_MINUTES, userDataJson]
  );
}

/**
 * Verify an OTP for email verification (signup flow).
 * @returns {{ valid: boolean, reason?: string, userData?: object }}
 */
async function verifyOTP(email, otp) {
  const key = email.toLowerCase();

  const [rows] = await pool.query(
    `SELECT * FROM OTP_Verification
     WHERE Email = ? AND OTP_Code = ? AND Purpose = 'signup'
     AND Expires_At > NOW() AND Is_Used = 0
     ORDER BY Created_At DESC LIMIT 1`,
    [key, otp]
  );

  if (rows.length === 0) {
    return { valid: false, reason: "OTP expired or invalid" };
  }

  const dbUserData = rows[0].User_Data;
  let userData = null;
  if (dbUserData) {
    try {
      userData = JSON.parse(dbUserData);
    } catch (parseErr) {
      console.error("Error parsing user data from OTP_Verification:", parseErr.message);
    }
  }

  // Mark the OTP as used and delete it
  await pool.query(`DELETE FROM OTP_Verification WHERE OTP_ID = ?`, [rows[0].OTP_ID]);

  return { valid: true, userData };
}

/**
 * Get pending OTP data (for resend flow — checks if user has a pending signup).
 */
async function getOTPData(email) {
  const key = email.toLowerCase();
  try {
    const [rows] = await pool.query(
      `SELECT User_Data FROM OTP_Verification
       WHERE Email = ? AND Purpose = 'signup' AND Expires_At > NOW() AND Is_Used = 0
       ORDER BY Created_At DESC LIMIT 1`,
      [key]
    );
    if (rows.length > 0 && rows[0].User_Data) {
      return { userData: JSON.parse(rows[0].User_Data) };
    }
  } catch (err) {
    console.error("Error fetching pending OTP user data:", err.message);
  }
  return null;
}

/**
 * Store OTP for password reset flow.
 */
async function storeResetOTP(email, otp) {
  const key = email.toLowerCase();

  await pool.query(
    `DELETE FROM OTP_Verification WHERE Email = ? AND Purpose = 'reset_password'`,
    [key]
  );

  await pool.query(
    `INSERT INTO OTP_Verification (Email, OTP_Code, Purpose, Created_At, Expires_At, Is_Used)
     VALUES (?, ?, 'reset_password', NOW(), DATE_ADD(NOW(), INTERVAL ? MINUTE), 0)`,
    [key, otp, OTP_EXPIRY_MINUTES]
  );
}

/**
 * Verify OTP for password reset flow.
 * @param {boolean} deleteOnSuccess - If true, removes the OTP after successful verification.
 */
async function verifyResetOTP(email, otp, deleteOnSuccess = true) {
  const key = email.toLowerCase();

  const [rows] = await pool.query(
    `SELECT * FROM OTP_Verification
     WHERE Email = ? AND OTP_Code = ? AND Purpose = 'reset_password'
     AND Expires_At > NOW() AND Is_Used = 0
     ORDER BY Created_At DESC LIMIT 1`,
    [key, otp]
  );

  if (rows.length === 0) {
    return { valid: false, reason: "OTP expired or invalid" };
  }

  if (deleteOnSuccess) {
    await pool.query(`DELETE FROM OTP_Verification WHERE OTP_ID = ?`, [rows[0].OTP_ID]);
  }

  return { valid: true };
}

/**
 * Cleanup expired OTPs from the database (can be called periodically).
 */
async function cleanupExpiredOTPs() {
  try {
    const [result] = await pool.query(
      `DELETE FROM OTP_Verification WHERE Expires_At < NOW()`
    );
    if (result.affectedRows > 0) {
      console.log(`🧹 Cleaned up ${result.affectedRows} expired OTP(s)`);
    }
  } catch (err) {
    console.error("Error cleaning up expired OTPs:", err.message);
  }
}

module.exports = { generateOTP, storeOTP, verifyOTP, getOTPData, storeResetOTP, verifyResetOTP, cleanupExpiredOTPs };
