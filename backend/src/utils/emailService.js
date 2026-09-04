const nodemailer = require("nodemailer");
require("dotenv").config();

const appName = process.env.APP_NAME || "CollegeConnect";
const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
const smtpHost = process.env.SMTP_HOST || (smtpUser && smtpUser.endsWith("@gmail.com") ? "smtp.gmail.com" : "");
const smtpPort = Number(process.env.SMTP_PORT || (smtpHost === "smtp.gmail.com" ? 587 : 0));
const smtpSecure = process.env.SMTP_SECURE === "true" || smtpPort === 465;

const isSMTPConfigured = smtpUser && smtpPass && smtpHost;

let transporter = null;

if (isSMTPConfigured) {
  try {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
    console.log(`📨 Email service initialized with SMTP transport: ${smtpHost}:${smtpPort}`);
  } catch (err) {
    console.error("⚠️ Failed to create SMTP transporter:", err.message);
  }
} else {
  console.warn("⚠️ Email service: SMTP credentials are not fully configured. Falling back to Dev Console Log Mode.");
}

async function sendOTPEmail(to, otp) {
  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"${appName}" <${smtpUser}>`,
        to,
        subject: `${appName} Email Verification OTP`,
        text: `Your email verification OTP is ${otp}. It is valid for 10 minutes.`,
      });
      console.log(`📧 OTP Email sent successfully to ${to}`);
    } catch (err) {
      console.error(`❌ Failed to send OTP Email to ${to}:`, err.message);
      // Fallback to console log on delivery failure so development/testing isn't blocked
      logOTPMock(to, otp, "Signup Verification [SMTP FAIL FALLBACK]");
    }
  } else {
    logOTPMock(to, otp, "Signup Verification");
  }
}

async function sendPasswordResetOTPEmail(to, otp) {
  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"${appName}" <${smtpUser}>`,
        to,
        subject: `${appName} Password Reset OTP`,
        text: `Your password reset OTP is ${otp}. It is valid for 10 minutes.`,
      });
      console.log(`🔑 Password Reset Email sent successfully to ${to}`);
    } catch (err) {
      console.error(`❌ Failed to send Password Reset Email to ${to}:`, err.message);
      logOTPMock(to, otp, "Password Reset [SMTP FAIL FALLBACK]");
    }
  } else {
    logOTPMock(to, otp, "Password Reset");
  }
}

function logOTPMock(to, otp, purpose) {
  console.log(`\n========================================`);
  console.log(`📧 OTP EMAIL (${purpose}) - [DEV MODE]`);
  console.log(`   To:  ${to}`);
  console.log(`   OTP: ${otp}`);
  console.log(`========================================\n`);
}

module.exports = { sendOTPEmail, sendPasswordResetOTPEmail };
