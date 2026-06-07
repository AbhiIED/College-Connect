const pool = require("../config/db");

// Get all alumni (exclude current user)
exports.getAllAlumni = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const [rows] = await pool.query(
      `SELECT 
        a.Alumni_ID,
        u.User_ID,
        u.User_Fname,
        u.User_Lname,
        u.Email_ID,
        a.Graduation_Year,
        a.Course,
        a.Department,
        a.Job_Title,
        a.Company_Name,
        a.Current_City AS currentCity,
        a.Skills AS skills,
        c.Status AS connectionStatus,
        c.Sender_ID AS connectionSenderID,
        c.Connection_ID AS connectionId
      FROM Alumni_Table a
      JOIN User_Table u ON a.User_ID = u.User_ID
      LEFT JOIN User_Connection c ON 
        (c.Sender_ID = ? AND c.Receiver_ID = u.User_ID) OR 
        (c.Sender_ID = u.User_ID AND c.Receiver_ID = ?)
      WHERE u.User_ID != ?;`,
      [currentUserId, currentUserId, currentUserId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching alumni:", err);
    res.status(500).json({ error: "Failed to fetch alumni" });
  }
};

// Get alumni for hero section (top 20)
exports.getHeroAlumni = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const [rows] = await pool.query(
      `SELECT 
        u.User_ID,
        u.User_Fname,
        u.User_Lname,
        a.Graduation_Year,
        a.Course,
        IFNULL(u.Profile_Pic, '/uploads/profile_pics/default_male.png') AS Profile_Pic,
        c.Status AS connectionStatus,
        c.Sender_ID AS connectionSenderID,
        c.Connection_ID AS connectionId
      FROM Alumni_Table a
      JOIN User_Table u ON a.User_ID = u.User_ID
      LEFT JOIN User_Connection c ON 
        (c.Sender_ID = ? AND c.Receiver_ID = u.User_ID) OR 
        (c.Sender_ID = u.User_ID AND c.Receiver_ID = ?)
      WHERE u.User_ID != ?
      ORDER BY a.Graduation_Year DESC
      LIMIT 20;`,
      [currentUserId, currentUserId, currentUserId]
    );

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const alumni = rows.map((row) => ({
      id: row.User_ID,
      name: `${row.User_Fname} ${row.User_Lname}`,
      course: `${row.Course} ${row.Graduation_Year}`,
      img: row.Profile_Pic.startsWith("http")
        ? row.Profile_Pic
        : `${baseUrl}${row.Profile_Pic}`,
      connectionStatus: row.connectionStatus,
      connectionSenderID: row.connectionSenderID,
      connectionId: row.connectionId
    }));

    res.json(alumni);
  } catch (err) {
    console.error("Error fetching alumni for HeroSection:", err);
    res.status(500).json({ error: "Failed to fetch alumni" });
  }
};

// Get single alumni by ID (supports unified lookup by User_ID for both alumni and students)
exports.getAlumniById = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { id } = req.params; // this parameter is target User_ID

    const [rows] = await pool.query(
      `SELECT 
        u.User_ID,
        u.User_Type_ID,
        u.User_Fname,
        u.User_Lname,
        u.Email_ID,
        u.Profile_Pic,
        u.Gender,
        u.Phone_no,
        u.Address,
        -- Alumni fields
        a.Alumni_ID,
        a.Enrollment_No,
        a.Job_Title,
        a.Company_Name,
        a.Current_City AS currentCity,
        a.Current_Country AS currentCountry,
        a.Sector,
        a.Skills AS skills,
        a.About,
        -- Student fields
        s.Student_ID,
        s.Scholar_No,
        s.Current_Year,
        -- Unified fields (present in both)
        COALESCE(a.Department, s.Department) AS Department,
        COALESCE(a.Course, s.Course) AS Course,
        COALESCE(a.Graduation_Year, s.Graduation_Year) AS Graduation_Year,
        -- Connection info
        c.Status AS connectionStatus,
        c.Sender_ID AS connectionSenderID,
        c.Connection_ID AS connectionId
      FROM User_Table u
      LEFT JOIN Alumni_Table a ON u.User_ID = a.User_ID
      LEFT JOIN Student_Table s ON u.User_ID = s.User_ID
      LEFT JOIN User_Connection c ON 
        (c.Sender_ID = ? AND c.Receiver_ID = u.User_ID) OR 
        (c.Sender_ID = u.User_ID AND c.Receiver_ID = ?)
      WHERE u.User_ID = ?`,
      [currentUserId, currentUserId, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching profile by ID:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// Get platform stats for homepage (accessible by any logged in user)
exports.getPublicStats = async (req, res) => {
  try {
    const [[alumni]] = await pool.query("SELECT COUNT(*) AS totalAlumni FROM alumni_table");
    const [[students]] = await pool.query("SELECT COUNT(*) AS totalStudents FROM student_table");
    const [[events]] = await pool.query("SELECT COUNT(*) AS totalEvents FROM event_table");
    const [[jobs]] = await pool.query("SELECT COUNT(*) AS totalJobs FROM job_postings");

    res.json({
      totalAlumni: alumni.totalAlumni || 0,
      totalStudents: students.totalStudents || 0,
      totalEvents: events.totalEvents || 0,
      totalJobs: jobs.totalJobs || 0,
    });
  } catch (err) {
    console.error("❌ Error fetching public stats:", err);
    res.status(500).json({ error: "Failed to load statistics" });
  }
};
