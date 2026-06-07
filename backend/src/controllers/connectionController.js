const pool = require("../config/db");

// Send connection request
exports.sendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    if (senderId === receiverId) {
      return res.status(400).json({ error: "Cannot connect with yourself" });
    }

    await pool.query(
      `INSERT INTO User_Connection (Sender_ID, Receiver_ID, Status) VALUES (?, ?, 'Pending')`,
      [senderId, receiverId]
    );

    res.status(201).json({ message: "Connection request sent" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Connection request already exists" });
    }
    console.error("❌ Error sending connection request:", err);
    res.status(500).json({ error: "Failed to send request" });
  }
};

// Get pending requests for current user
exports.getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT 
        c.Connection_ID, c.Sender_ID, c.Status, c.Created_At,
        u.User_Fname, u.User_Lname, u.Profile_Pic
      FROM User_Connection c
      JOIN User_Table u ON c.Sender_ID = u.User_ID
      WHERE c.Receiver_ID = ? AND c.Status = 'Pending'
      ORDER BY c.Created_At DESC`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching pending requests:", err);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
};

// Get all accepted connections for current user (supports both alumni and student connections)
exports.getConnections = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT 
        c.Connection_ID,
        CASE WHEN c.Sender_ID = ? THEN c.Receiver_ID ELSE c.Sender_ID END AS Connected_User_ID,
        u.User_Fname, u.User_Lname, u.Profile_Pic, u.User_Type_ID,
        a.Job_Title, a.Company_Name,
        COALESCE(a.Course, s.Course) AS Course,
        COALESCE(a.Graduation_Year, s.Graduation_Year) AS Graduation_Year,
        s.Current_Year
      FROM User_Connection c
      JOIN User_Table u ON (CASE WHEN c.Sender_ID = ? THEN c.Receiver_ID ELSE c.Sender_ID END) = u.User_ID
      LEFT JOIN Alumni_Table a ON u.User_ID = a.User_ID
      LEFT JOIN Student_Table s ON u.User_ID = s.User_ID
      WHERE (c.Sender_ID = ? OR c.Receiver_ID = ?) AND c.Status = 'Accepted'
      ORDER BY c.Updated_At DESC`,
      [userId, userId, userId, userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching connections:", err);
    res.status(500).json({ error: "Failed to fetch connections" });
  }
};

// Accept or reject a connection request
exports.respondToRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const { status } = req.body; // 'Accepted' or 'Rejected'
    const userId = req.user.id;

    if (!["Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Status must be 'Accepted' or 'Rejected'" });
    }

    const [result] = await pool.query(
      `UPDATE User_Connection SET Status = ? WHERE Connection_ID = ? AND Receiver_ID = ?`,
      [status, connectionId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Connection request not found" });
    }

    res.json({ message: `Connection ${status.toLowerCase()}` });
  } catch (err) {
    console.error("❌ Error responding to request:", err);
    res.status(500).json({ error: "Failed to update request" });
  }
};

// Get connection status between current user and another user
exports.getConnectionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetId } = req.params;

    const [rows] = await pool.query(
      `SELECT Connection_ID, Status, Sender_ID, Receiver_ID FROM User_Connection 
       WHERE (Sender_ID = ? AND Receiver_ID = ?) OR (Sender_ID = ? AND Receiver_ID = ?)`,
      [userId, targetId, targetId, userId]
    );

    if (rows.length === 0) {
      return res.json({ status: "none" });
    }

    res.json({ status: rows[0].Status, connectionId: rows[0].Connection_ID, sentBy: rows[0].Sender_ID });
  } catch (err) {
    console.error("❌ Error checking connection status:", err);
    res.status(500).json({ error: "Failed to check status" });
  }
};
