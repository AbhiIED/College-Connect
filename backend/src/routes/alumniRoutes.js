const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const alumniController = require("../controllers/alumniController");

router.get("/", verifyToken, alumniController.getAllAlumni);
router.get("/hero", verifyToken, alumniController.getHeroAlumni);
router.get("/stats", verifyToken, alumniController.getPublicStats);
router.get("/:id", verifyToken, alumniController.getAlumniById);

module.exports = router;
