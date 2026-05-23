const pool = require("../config/db");

// Get all published news (or all news if query param all=true)
exports.getAllNews = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    const showAll = req.query.all === "true";
    
    let query = `SELECT * FROM News`;
    if (!showAll) {
      query += ` WHERE Is_Published = 1`;
    }
    query += ` ORDER BY Published_At DESC`;
    
    if (limit) query += ` LIMIT ${limit}`;

    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching news:", err);
    res.status(500).json({ error: "Failed to fetch news" });
  }
};

// Get single news by ID
exports.getNewsById = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM News WHERE News_ID = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "News not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Error fetching news:", err);
    res.status(500).json({ error: "Failed to fetch news" });
  }
};

// Create news (admin only)
exports.createNews = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { Title, Description, Details, Image_URL, Category } = req.body;

    if (!Title || !Description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    const [result] = await pool.query(
      `INSERT INTO News (Admin_ID, Title, Description, Details, Image_URL, Category)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [adminId, Title, Description, Details || null, Image_URL || null, Category || null]
    );

    res.status(201).json({ message: "✅ News created successfully", newsId: result.insertId });
  } catch (err) {
    console.error("❌ Error creating news:", err);
    res.status(500).json({ error: "Failed to create news" });
  }
};

// Update news (admin only)
exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { Title, Description, Details, Image_URL, Category, Is_Published } = req.body;

    const [result] = await pool.query(
      `UPDATE News SET Title=?, Description=?, Details=?, Image_URL=?, Category=?, Is_Published=? WHERE News_ID=?`,
      [Title, Description, Details, Image_URL, Category, Is_Published ?? 1, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: "News not found" });
    res.json({ message: "✅ News updated successfully" });
  } catch (err) {
    console.error("❌ Error updating news:", err);
    res.status(500).json({ error: "Failed to update news" });
  }
};

// Delete news (admin only)
exports.deleteNews = async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM News WHERE News_ID = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "News not found" });
    res.json({ message: "🗑️ News deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting news:", err);
    res.status(500).json({ error: "Failed to delete news" });
  }
};
