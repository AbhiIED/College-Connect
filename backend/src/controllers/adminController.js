const db = require("../config/db");
const bcrypt = require("bcryptjs");

// ==================== DASHBOARD STATS ====================

exports.getDashboardStats = async (req, res) => {
  try {
    const [[alumni]] = await db.query("SELECT COUNT(*) AS totalAlumni FROM alumni_table");
    const [[students]] = await db.query("SELECT COUNT(*) AS activeStudents FROM student_table");
    const [[events]] = await db.query("SELECT COUNT(*) AS upcomingEvents FROM event_table WHERE Event_Date >= CURDATE()");
    const [[jobs]] = await db.query("SELECT COUNT(*) AS jobPostings FROM job_postings");
    const [[totalAmount]] = await db.query("SELECT SUM(Amount) AS totalDonationAmount FROM donation");
    const [[donationCount]] = await db.query("SELECT COUNT(*) AS totalDonationCount FROM donation");

    // Fetch monthly donation trend (past 6 months)
    const [donationTrend] = await db.query(`
      SELECT 
        DATE_FORMAT(Donation_Date, '%b') AS month,
        SUM(Amount) AS value
      FROM donation
      GROUP BY DATE_FORMAT(Donation_Date, '%b'), YEAR(Donation_Date)
      ORDER BY MIN(Donation_Date) ASC
      LIMIT 6
    `);

    // Fetch recent activity
    const [recentDonations] = await db.query(`
      SELECT 'donation' AS type, CONCAT(u.User_Fname, ' donated ₹', d.Amount) AS label, d.Donation_Date AS timestamp 
      FROM donation d
      LEFT JOIN user_table u ON d.Donor_ID = u.User_ID
      ORDER BY d.Donation_Date DESC LIMIT 3
    `);

    const [recentPosts] = await db.query(`
      SELECT 'post' AS type, CONCAT(u.User_Fname, ' posted: "', LEFT(p.Content, 20), '..."') AS label, p.Created_At AS timestamp 
      FROM post p
      LEFT JOIN user_table u ON p.User_ID = u.User_ID
      ORDER BY p.Created_At DESC LIMIT 3
    `);

    const [recentJobs] = await db.query(`
      SELECT 'job' AS type, CONCAT('Job posted: ', Job_Title, ' at ', Company_Name) AS label, Created_At AS timestamp 
      FROM job_postings ORDER BY Created_At DESC LIMIT 3
    `);

    const [recentEvents] = await db.query(`
      SELECT 'event' AS type, CONCAT('New Event: ', Event_Name) AS label, Creation_Date AS timestamp 
      FROM event_table ORDER BY Event_ID DESC LIMIT 3
    `);

    // Combine and sort recent activity by timestamp
    const recentActivity = [
      ...recentDonations.map(d => ({ ...d, label: d.label || "Anonymous donation" })),
      ...recentPosts,
      ...recentJobs,
      ...recentEvents
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 8);

    // Simulated user registration growth (since no registration date exists in DB)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthIdx = new Date().getMonth();
    
    const userGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const monthIdx = (currentMonthIdx - i + 12) % 12;
      const factor = (6 - i) / 6;
      userGrowth.push({
        month: months[monthIdx],
        alumni: Math.round((alumni.totalAlumni || 0) * (0.7 + factor * 0.3)),
        students: Math.round((students.activeStudents || 0) * (0.6 + factor * 0.4)),
      });
    }

    res.json({
      totalAlumni: alumni.totalAlumni || 0,
      activeStudents: students.activeStudents || 0,
      upcomingEvents: events.upcomingEvents || 0,
      jobPostings: jobs.jobPostings || 0,
      totalDonationAmount: totalAmount.totalDonationAmount || 0,
      totalDonationCount: donationCount.totalDonationCount || 0,
      donationTrend: donationTrend.length ? donationTrend : [
        { month: "Oct", value: 0 },
        { month: "Nov", value: totalAmount.totalDonationAmount || 0 }
      ],
      userGrowth,
      recentActivity: recentActivity.length ? recentActivity : [
        { type: "system", label: "System initialized and running", timestamp: new Date() }
      ]
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Failed to load dashboard statistics" });
  }
};

// ==================== PROJECT MANAGEMENT ====================

exports.getProjects = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.Project_ID AS id, p.Project_title AS title, p.Project_Description AS description,
        p.Funds_Required AS target, p.Fund_Raised AS raised, p.Category AS category,
        p.Project_Status AS status, p.Image AS image, p.Start_Date AS startDate,
        p.End_Date AS endDate, p.Created_At
      FROM project p ORDER BY p.Project_ID ASC;
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching projects:", err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

exports.createProject = async (req, res) => {
  try {
    const AdminUserID = req.user.id;
    const { Project_title, Project_Description, Funds_Required, Fund_Raised, Category, Image, Start_Date, End_Date } = req.body;

    if (!Project_title || !Funds_Required || !Category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [result] = await db.query(
      `INSERT INTO project (User_ID, Project_title, Project_Description, Funds_Required, Fund_Raised, Category, Image, Project_Status, Created_At, Start_Date, End_Date)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Ongoing', NOW(), ?, ?)`,
      [AdminUserID, Project_title, Project_Description || "", Funds_Required, Fund_Raised || 0, Category, Image || null, Start_Date || null, End_Date || null]
    );

    res.status(201).json({ success: true, message: "Project created successfully", projectId: result.insertId });
  } catch (err) {
    console.error("❌ Error adding project:", err);
    res.status(500).json({ error: "Failed to create project" });
  }
};

exports.updateProject = async (req, res) => {
  const { id } = req.params;
  const { Project_title, Project_Description, Funds_Required, Fund_Raised, Category, Image, Project_Status, Start_Date, End_Date } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE project SET Project_title=?, Project_Description=?, Funds_Required=?, Fund_Raised=?, Category=?, Image=?, Project_Status=?, Start_Date=?, End_Date=? WHERE Project_ID=?`,
      [Project_title, Project_Description, Funds_Required, Fund_Raised, Category, Image, Project_Status, Start_Date || null, End_Date || null, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: "Project not found" });
    res.json({ success: true, message: "Project updated successfully" });
  } catch (err) {
    console.error("❌ Error updating project:", err);
    res.status(500).json({ error: "Failed to update project" });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const [result] = await db.query(`DELETE FROM project WHERE Project_ID = ?`, [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Project not found" });
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting project:", err);
    res.status(500).json({ error: "Failed to delete project" });
  }
};

// ==================== DONATION RECORDS ====================

exports.getDonations = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.Donation_ID AS donationId, d.Donor_ID AS donorId, d.Amount AS amount,
        d.Message AS message, d.Donation_Date AS donationDate, t.transaction_id AS transactionId,
        t.Payment_Mode AS paymentMode, t.Payment_Status AS paymentStatus, t.Payment_Time AS paymentTime,
        p.Project_ID AS projectId, p.Project_title AS projectTitle, p.Category AS category,
        u.User_Fname AS donorFirstName, u.User_Lname AS donorLastName
      FROM donation d
      JOIN project p ON d.Project_ID = p.Project_ID
      JOIN transactions t ON d.transaction_id = t.transaction_id
      LEFT JOIN user_table u ON d.Donor_ID = u.User_ID
      ORDER BY d.Donation_Date DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching donations:", err);
    res.status(500).json({ error: "Failed to fetch donations" });
  }
};

exports.getProjectTransactions = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.Donation_ID, d.Amount, d.Donation_Date, d.Message,
        t.transaction_id, t.Payment_Mode, t.Payment_Status, t.Payment_Time,
        d.Donor_ID, u.User_Fname AS Donor_Name, u.User_Lname AS Donor_LName,
        u.Email_ID AS Donor_Email, u.Phone_no AS Donor_Phone
      FROM donation d
      JOIN transactions t ON d.transaction_id = t.transaction_id
      JOIN user_table u ON d.Donor_ID = u.User_ID
      WHERE d.Project_ID = ?
      ORDER BY d.Donation_Date ASC;
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching project transactions:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

// ==================== USER MANAGEMENT ====================

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT u.User_ID, u.User_Fname, u.User_Lname, u.Email_ID, u.Gender, u.Phone_no, u.Address, u.Is_Verified,
        ut.User_Type_name AS User_Type
      FROM User_Table u
      JOIN User_Type_Table ut ON u.User_Type_ID = ut.User_Type_ID
      ORDER BY u.User_ID ASC
    `);
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

exports.addAdmin = async (req, res) => {
  try {
    const { fname, lname, gender, phone, email, password, address, role } = req.body;

    if (!fname || !lname || !gender || !phone || !email || !password || !address)
      return res.status(400).json({ error: "All fields are required" });

    const hashed = await bcrypt.hash(password, 10);

    const [userResult] = await db.query(
      `INSERT INTO User_Table (User_Type_ID, User_Fname, User_Lname, Gender, Phone_no, Email_ID, Password, Address, Is_Verified)
       VALUES (3, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [fname, lname, gender, phone, email, hashed, address]
    );

    await db.query(
      `INSERT INTO Admin_Table (Admin_ID, User_ID, Role) VALUES (?, ?, ?)`,
      [userResult.insertId, userResult.insertId, role || "Administrator"]
    );

    res.status(201).json({ message: "Admin added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error adding admin" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const [user] = await db.query(
      `SELECT u.User_ID, u.User_Fname, u.User_Lname, u.Email_ID, u.Phone_no, u.Gender, u.Address, u.Is_Verified,
        ut.User_Type_name AS User_Type,
        -- Student fields
        s.Scholar_No, s.Department AS Student_Department, s.Course AS Student_Course,
        s.Current_Year, s.Graduation_Year AS Student_Graduation_Year,
        -- Alumni fields
        a.Enrollment_No, a.Department AS Alumni_Department, a.Course AS Alumni_Course,
        a.Graduation_Year AS Alumni_Graduation_Year, a.Job_Title, a.Company_Name,
        a.Current_City, a.Current_Country, a.Sector, a.Skills, a.About
      FROM User_Table u
      JOIN User_Type_Table ut ON u.User_Type_ID = ut.User_Type_ID
      LEFT JOIN Student_Table s ON u.User_ID = s.User_ID
      LEFT JOIN Alumni_Table a ON u.User_ID = a.User_ID
      WHERE u.User_ID = ?`,
      [req.params.id]
    );

    if (!user.length) return res.status(404).json({ error: "User not found" });
    res.json(user[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching user details" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    await db.query("DELETE FROM Admin_Table WHERE User_ID = ?", [id]);
    await db.query("DELETE FROM Student_Table WHERE User_ID = ?", [id]);
    await db.query("DELETE FROM Alumni_Table WHERE User_ID = ?", [id]);
    await db.query("DELETE FROM User_Table WHERE User_ID = ?", [id]);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting user" });
  }
};

// Raise a verification query for a user (Admin only)
exports.raiseVerificationQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ error: "Query message cannot be empty" });
    }
    const [result] = await db.query(
      `UPDATE User_Table SET Is_Verified = 0, Verification_Query = ? WHERE User_ID = ?`,
      [query, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, message: "Verification query raised successfully" });
  } catch (err) {
    console.error("❌ Error raising verification query:", err);
    res.status(500).json({ error: "Failed to raise verification query" });
  }
};

// Toggle user verification status (Admin only)
exports.toggleUserVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const [result] = await db.query(
      `UPDATE User_Table SET Is_Verified = ? WHERE User_ID = ?`,
      [isVerified ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, message: `User verification status updated to ${isVerified ? "verified" : "unverified"}` });
  } catch (err) {
    console.error("❌ Error toggling verification:", err);
    res.status(500).json({ error: "Failed to update verification status" });
  }
};

// Get all posts with user metadata (Admin Content Moderation)
exports.getAllPosts = async (req, res) => {
  try {
    const [posts] = await db.query(`
      SELECT p.Post_ID, p.Content, p.Image_URL, p.Created_At, p.Likes_Count, p.Comment_Count,
             u.User_Fname, u.User_Lname, u.Email_ID, ut.User_Type_name AS User_Type
      FROM post p
      LEFT JOIN user_table u ON p.User_ID = u.User_ID
      LEFT JOIN user_type_table ut ON u.User_Type_ID = ut.User_Type_ID
      ORDER BY p.Created_At DESC
    `);
    res.json(posts);
  } catch (err) {
    console.error("❌ Error fetching admin posts:", err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};

// Delete a comment (Admin Content Moderation)
exports.deletePostComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    
    const [result] = await db.query(
      `DELETE FROM post_comment WHERE Comment_ID = ? AND Post_ID = ?`,
      [commentId, postId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Comment not found" });
    }

    await db.query(
      `UPDATE post SET Comment_Count = GREATEST(0, Comment_Count - 1) WHERE Post_ID = ?`,
      [postId]
    );

    res.json({ success: true, message: "Comment deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting comment:", err);
    res.status(500).json({ error: "Failed to delete comment" });
  }
};

// Get registrations for a specific event (Admin Events Management)
exports.getEventRegistrations = async (req, res) => {
  try {
    const { id } = req.params;
    const [registrations] = await db.query(
      `SELECT Registration_ID, Full_Name, Email, Phone, Graduation_Year, Course, Registered_At
       FROM event_registration
       WHERE Event_ID = ?
       ORDER BY Registered_At DESC`,
      [id]
    );
    res.json(registrations);
  } catch (err) {
    console.error("❌ Error fetching event registrations:", err);
    res.status(500).json({ error: "Failed to fetch event registrations" });
  }
};

// Get all connection logs (Admin Network Monitoring)
exports.getAllConnections = async (req, res) => {
  try {
    const [connections] = await db.query(`
      SELECT 
        c.Connection_ID, c.Status, c.Created_At, c.Updated_At,
        s.User_ID AS Sender_ID, s.User_Fname AS Sender_Fname, s.User_Lname AS Sender_Lname,
        st.User_Type_name AS Sender_Type,
        r.User_ID AS Receiver_ID, r.User_Fname AS Receiver_Fname, r.User_Lname AS Receiver_Lname,
        rt.User_Type_name AS Receiver_Type
      FROM user_connection c
      JOIN user_table s ON c.Sender_ID = s.User_ID
      JOIN user_type_table st ON s.User_Type_ID = st.User_Type_ID
      JOIN user_table r ON c.Receiver_ID = r.User_ID
      JOIN user_type_table rt ON r.User_Type_ID = rt.User_Type_ID
      ORDER BY c.Created_At DESC
    `);
    res.json(connections);
  } catch (err) {
    console.error("❌ Error fetching connections:", err);
    res.status(500).json({ error: "Failed to fetch connections" });
  }
};

// Get recent OTP codes for auth logging
exports.getOtpLogs = async (req, res) => {
  try {
    const [logs] = await db.query(`
      SELECT OTP_ID, Email, OTP_Code, Purpose, Created_At, Expires_At, Is_Used
      FROM otp_verification
      ORDER BY Created_At DESC
      LIMIT 100
    `);
    res.json(logs);
  } catch (err) {
    console.error("❌ Error fetching OTP logs:", err);
    res.status(500).json({ error: "Failed to fetch OTP logs" });
  }
};
