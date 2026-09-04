const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/authController");
const { verifyAdmin } = require("../middleware/authMiddleware");

// ── Rate Limiters ───────────────────────────────────────
// Signin: 10 attempts per 15-minute window per IP
const signinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many sign-in attempts. Please try again after 15 minutes." },
});

// OTP / signup: 5 attempts per 15-minute window per IP
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again after 15 minutes." },
});

// ── Auth Routes ─────────────────────────────────────────
router.post("/signin",         signinLimiter, authController.signin);
router.post("/signup",         otpLimiter,    authController.signup);
router.post("/verify-email",   otpLimiter,    authController.verifyEmail);
router.post("/resend-otp",     otpLimiter,    authController.resendOTP);
router.post("/send-otp",       otpLimiter,    authController.sendOTP);
router.post("/verify-otp",     otpLimiter,    authController.verifyOTP);
router.post("/reset-password", otpLimiter,    authController.resetPassword);

// ── Token Lifecycle ─────────────────────────────────────
router.post("/refresh",        signinLimiter, authController.refreshToken);
router.post("/logout",                       authController.logout);

router.get("/admin-dashboard", verifyAdmin, (req, res) => {
  res.json({ message: "Welcome Admin!", user: req.user });
});

module.exports = router;

