const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const chatController = require("../controllers/chatController");

// Static routes MUST come before parameterized routes
router.get("/unread/count", verifyToken, chatController.getUnreadCount);
router.post("/send", verifyToken, chatController.sendMessage);
router.get("/:partnerId", verifyToken, chatController.getMessages);

module.exports = router;
