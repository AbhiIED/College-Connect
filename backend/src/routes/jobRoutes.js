const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const jobController = require("../controllers/jobController");

router.get("/",      jobController.getAllJobs);
router.post("/",     verifyToken, requireRole(1, 3), jobController.createJob);   // Alumni or Admin
router.put("/:id",   verifyToken, requireRole(1, 3), jobController.updateJob);   // Alumni or Admin (+ ownership check in controller)
router.delete("/:id", verifyToken, requireRole(1, 3), jobController.deleteJob); // Alumni or Admin (+ ownership check in controller)

module.exports = router;

