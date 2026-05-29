const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");

// Apply verifyAdmin middleware globally to all admin routes
router.use(verifyAdmin);

// Dashboard
router.get("/stats", adminController.getDashboardStats);

// Project management
router.get("/projects", adminController.getProjects);
router.post("/projects", adminController.createProject);
router.put("/projects/:id", adminController.updateProject);
router.delete("/projects/:id", adminController.deleteProject);

// Donation records
router.get("/donations", adminController.getDonations);
router.get("/donations/:id/transactions", adminController.getProjectTransactions);

// User management
router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserById);
router.post("/users/add-admin", adminController.addAdmin);
router.post("/users/:id/raise-query", adminController.raiseVerificationQuery);
router.patch("/users/:id/verify", adminController.toggleUserVerification);
router.delete("/users/:id", adminController.deleteUser);

// Content moderation (Posts & Comments)
router.get("/posts", adminController.getAllPosts);
router.delete("/posts/:postId/comments/:commentId", adminController.deletePostComment);

// Event registrations
router.get("/events/:id/registrations", adminController.getEventRegistrations);

// Connections tracking
router.get("/connections", adminController.getAllConnections);

// OTP Auth Logs
router.get("/otp-logs", adminController.getOtpLogs);

module.exports = router;
