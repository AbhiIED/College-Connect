const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const jobController = require("../controllers/jobController");

router.get("/", jobController.getAllJobs);
router.post("/", verifyToken, jobController.createJob);
router.put("/:id", verifyToken, jobController.updateJob);
router.delete("/:id", verifyToken, jobController.deleteJob);

module.exports = router;
