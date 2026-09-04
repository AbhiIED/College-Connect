const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const donationController = require("../controllers/donationController");

router.get("/",               donationController.getAllProjects);
router.get("/get-key",        verifyToken, donationController.getRazorpayKey); // protect key exposure
router.get("/:id",            donationController.getProjectById);
router.post("/create-order",  verifyToken, donationController.createOrder);
router.post("/verify-payment", verifyToken, donationController.verifyPayment);

module.exports = router;