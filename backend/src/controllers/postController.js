const db = require("../config/db");

// Get all posts
exports.getAllPosts = async (req, res) => {
  const userId = req.user.id;
  try {
    const [posts] = await db.query(`
      SELECT 
        p.Post_ID,
        p.Content,
        p.Image_URL,
        p.Created_At,
        p.Likes_Count,
        p.Comment_Count,
        u.User_ID,
        u.User_Fname,
        u.User_Lname,
        u.Profile_Pic AS User_Image,
        COALESCE(a.Graduation_Year, s.Graduation_Year) AS Graduation_Year,
        COALESCE(a.Course, s.Course) AS Course,
        COALESCE(a.Department, s.Department) AS Department,
        EXISTS(SELECT 1 FROM Post_Like pl WHERE pl.Post_ID = p.Post_ID AND pl.User_ID = ?) AS HasLiked
      FROM Post p
      JOIN User_Table u ON p.User_ID = u.User_ID
      LEFT JOIN Alumni_Table a ON u.User_ID = a.User_ID
      LEFT JOIN Student_Table s ON u.User_ID = s.User_ID
      ORDER BY p.Created_At DESC
    `, [userId]);

    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get comments for a post
exports.getComments = async (req, res) => {
  const { postId } = req.params;

  try {
    const [comments] = await db.query(
      `
      SELECT 
        c.Comment_ID,
        c.User_ID,
        c.Comment,
        c.Comment_Date,
        u.User_Fname,
        u.User_Lname,
        u.Profile_Pic AS User_Image
      FROM Post_Comment c
      JOIN User_Table u ON c.User_ID = u.User_ID
      WHERE c.Post_ID = ?
      ORDER BY c.Comment_Date ASC
      `,
      [postId]
    );

    res.json(comments);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Add a comment to a post
exports.addComment = async (req, res) => {
  const { postId } = req.params;
  const { commentText } = req.body;
  const userId = req.user.id;

  if (!commentText || !commentText.trim()) {
    return res.status(400).json({ success: false, message: "Comment cannot be empty" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO Post_Comment (Post_ID, User_ID, Comment, Comment_Date)
       VALUES (?, ?, ?, NOW())`,
      [postId, userId, commentText]
    );

    await db.query(
      `UPDATE Post SET Comment_Count = Comment_Count + 1 WHERE Post_ID = ?`,
      [postId]
    );

    const [userRows] = await db.query(
      `SELECT User_Fname, User_Lname, Profile_Pic FROM User_Table WHERE User_ID = ?`,
      [userId]
    );

    const user = userRows[0];

    res.json({
      success: true,
      comment: {
        Comment_ID: result.insertId,
        Post_ID: postId,
        User_ID: userId,
        Comment: commentText,
        Comment_Date: new Date(),
        User_Fname: user.User_Fname,
        User_Lname: user.User_Lname,
        User_Image: user.Profile_Pic || null,
      },
    });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Like / Unlike a post (toggle)
exports.toggleLike = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const [existing] = await db.query(
      `SELECT Like_ID FROM Post_Like WHERE Post_ID = ? AND User_ID = ?`,
      [postId, userId]
    );

    if (existing.length > 0) {
      await db.query(`DELETE FROM Post_Like WHERE Post_ID = ? AND User_ID = ?`, [postId, userId]);
      await db.query(`UPDATE Post SET Likes_Count = GREATEST(Likes_Count - 1, 0) WHERE Post_ID = ?`, [postId]);
      res.json({ success: true, liked: false });
    } else {
      await db.query(`INSERT INTO Post_Like (Post_ID, User_ID) VALUES (?, ?)`, [postId, userId]);
      await db.query(`UPDATE Post SET Likes_Count = Likes_Count + 1 WHERE Post_ID = ?`, [postId]);
      res.json({ success: true, liked: true });
    }
  } catch (err) {
    console.error("Error liking post:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  const { postId } = req.params;
  const userId = Number(req.user.id);
  const userRole = Number(req.user.role); // 3 is Admin

  try {
    // Check if post exists and get its author
    const [posts] = await db.query("SELECT User_ID, Image_URL FROM Post WHERE Post_ID = ?", [postId]);
    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const post = posts[0];
    const postAuthorId = Number(post.User_ID);

    // Check if requester is the author or an admin
    if (postAuthorId !== userId && userRole !== 3) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this post" });
    }

    // Delete image file from disk if it exists
    if (post.Image_URL) {
      try {
        const fs = require("fs");
        const path = require("path");
        let filename = null;
        if (post.Image_URL.includes("/uploads/post_images/")) {
          const parts = post.Image_URL.split("/uploads/post_images/");
          filename = parts[parts.length - 1];
        }
        if (filename) {
          const imagePath = path.join(__dirname, "../uploads/post_images", filename);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
      } catch (fileErr) {
        console.error("Error deleting post image file from disk:", fileErr);
      }
    }

    // Delete comments and likes first (in case CASCADE is not fully configured, though it is)
    await db.query("DELETE FROM Post_Comment WHERE Post_ID = ?", [postId]);
    await db.query("DELETE FROM Post_Like WHERE Post_ID = ?", [postId]);

    const [result] = await db.query("DELETE FROM Post WHERE Post_ID = ?", [postId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    res.json({ success: true, message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ success: false, message: "Failed to delete post" });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const userId = Number(req.user.id);
  const userRole = Number(req.user.role);

  try {
    // Check if comment exists and get its author
    const [commentRows] = await db.query(
      "SELECT User_ID FROM Post_Comment WHERE Comment_ID = ? AND Post_ID = ?",
      [commentId, postId]
    );
    if (commentRows.length === 0) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const commentAuthorId = Number(commentRows[0].User_ID);

    // Also check if the user is the post author (post authors can delete any comment on their post)
    const [postRows] = await db.query("SELECT User_ID FROM Post WHERE Post_ID = ?", [postId]);
    const postAuthorId = postRows.length > 0 ? Number(postRows[0].User_ID) : null;

    // Allow: comment author, post author, or admin
    if (commentAuthorId !== userId && postAuthorId !== userId && userRole !== 3) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this comment" });
    }

    await db.query("DELETE FROM Post_Comment WHERE Comment_ID = ?", [commentId]);
    await db.query(
      "UPDATE Post SET Comment_Count = GREATEST(Comment_Count - 1, 0) WHERE Post_ID = ?",
      [postId]
    );

    res.json({ success: true, message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ success: false, message: "Failed to delete comment" });
  }
};

// Edit a post (author only)
exports.editPost = async (req, res) => {
  const { postId } = req.params;
  const userId = Number(req.user.id);
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, message: "Content cannot be empty" });
  }

  try {
    const [postRows] = await db.query("SELECT User_ID FROM Post WHERE Post_ID = ?", [postId]);
    if (postRows.length === 0) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    if (Number(postRows[0].User_ID) !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await db.query("UPDATE Post SET Content = ? WHERE Post_ID = ?", [content.trim(), postId]);
    res.json({ success: true, message: "Post updated", content: content.trim() });
  } catch (err) {
    console.error("Error editing post:", err);
    res.status(500).json({ success: false, message: "Failed to edit post" });
  }
};

// Create a post (from feed route)
exports.createPost = async (req, res) => {
  const { content } = req.body;
  const userId = req.user.id;

  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, error: "Content cannot be empty" });
  }

  try {
    const [userRows] = await db.query(
      "SELECT User_Fname, User_Lname, Profile_Pic FROM User_Table WHERE User_ID = ?",
      [userId]
    );

    if (!userRows.length)
      return res.status(404).json({ success: false, error: "User not found" });

    const user = userRows[0];
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const profilePic = user.Profile_Pic ? `${baseUrl}${user.Profile_Pic}` : null;

    let imageUrl = null;
    if (req.file) imageUrl = `/uploads/post_images/${req.file.filename}`;

    const [result] = await db.query(
      `INSERT INTO Post (User_ID, Content, Image_URL, Created_At, Likes_Count, Comment_Count)
       VALUES (?, ?, ?, NOW(), 0, 0)`,
      [userId, content, imageUrl]
    );

    res.json({
      success: true,
      post: {
        Post_ID: result.insertId,
        Content: content,
        Image_URL: imageUrl ? `${baseUrl}${imageUrl}` : null,
        Likes_Count: 0,
        Comment_Count: 0,
        Created_At: new Date(),
        User: {
          User_Fname: user.User_Fname,
          User_Lname: user.User_Lname,
          Profile_Pic: profilePic,
        },
      },
    });
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
