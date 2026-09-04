const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const profileController = require("../controllers/profileController");
const { verifyToken } = require("../middleware/authMiddleware"); // ✅ FIXED

const uploadDir = path.join(__dirname, "../uploads/profile_pics");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only images (jpeg, jpg, png, gif, webp) are allowed"));
  }
});


router.get("/profile", verifyToken, profileController.getUserProfile);
router.get("/notifications", verifyToken, profileController.getUserNotifications);
router.get("/settings", verifyToken, profileController.getUserSettings);
router.put("/update-profile", verifyToken, profileController.updateProfile);
router.put("/update-settings", verifyToken, profileController.updateUserSettings);
router.put("/change-password", verifyToken, profileController.changePassword);
router.post(
  "/upload-pic",
  verifyToken,
  upload.single("profilePic"),
  profileController.uploadProfilePic
);

module.exports = router;
