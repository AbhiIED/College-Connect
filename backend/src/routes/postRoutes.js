const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const postController = require("../controllers/postController");

router.get("/", verifyToken, postController.getAllPosts);
router.get("/:postId/comments", verifyToken, postController.getComments);
router.post("/:postId/comments", verifyToken, postController.addComment);
router.post("/:postId/like", verifyToken, postController.toggleLike);
router.put("/:postId", verifyToken, postController.editPost);
router.delete("/:postId", verifyToken, postController.deletePost);
router.delete("/:postId/comments/:commentId", verifyToken, postController.deleteComment);

module.exports = router;
