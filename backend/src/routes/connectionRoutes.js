const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const connectionController = require("../controllers/connectionController");

router.post("/request", verifyToken, connectionController.sendRequest);
router.get("/pending", verifyToken, connectionController.getPendingRequests);
router.get("/", verifyToken, connectionController.getConnections);
router.put("/:connectionId", verifyToken, connectionController.respondToRequest);
router.delete("/:connectionId", verifyToken, connectionController.removeConnection);
router.get("/status/:targetId", verifyToken, connectionController.getConnectionStatus);

module.exports = router;
