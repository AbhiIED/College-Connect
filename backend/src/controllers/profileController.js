const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const path = require("path");

exports.getUserProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await pool.query(
      `SELECT 
          u.User_ID AS id, 
          u.User_Fname AS firstName, 
          u.User_Lname AS lastName,
          u.Email_ID AS email, 
          u.Profile_Pic AS profilePic,
          u.Gender AS gender,
          u.Phone_no AS phone,
          u.Phone_no_2 AS phone2,
          u.Address AS address,
          u.User_Type_ID AS userType,
          a.Alumni_ID AS alumniId,
          a.Enrollment_No AS enrollmentNo,
          a.Graduation_Year AS graduationYear,
          a.Department AS department,
          a.Course AS course,
          a.Job_Title AS jobTitle,
          a.Company_Name AS companyName,
          a.Current_City AS currentCity,
          a.Current_Country AS currentCountry,
          a.Sector AS sector,
          a.Skills AS skills,
          a.About AS about,
          s.Student_ID AS studentId,
          s.Scholar_No AS scholarNo,
          s.Department AS studentDepartment,
          s.Course AS studentCourse,
          s.Current_Year AS currentYear,
          s.Graduation_Year AS studentGraduationYear
       FROM User_Table u
       LEFT JOIN Alumni_Table a ON u.User_ID = a.User_ID
       LEFT JOIN Student_Table s ON u.User_ID = s.User_ID
       WHERE u.User_ID = ?`,
      [userId]
    );

    if (!rows.length) return res.status(404).json({ error: "User not found" });

    const row = rows[0];

    // Normalize: prefer alumni data, fall back to student data
    const user = {
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      profilePic: row.profilePic || "",
      gender: row.gender || "",
      phone: row.phone || "",
      phone2: row.phone2 || "",
      address: row.address || "",
      userType: row.userType,
      userRole: row.userType === 1 ? "Alumni" : row.userType === 2 ? "Student" : "Admin",
      enrollmentNo: row.enrollmentNo || row.scholarNo || "",
      department: row.department || row.studentDepartment || "",
      course: row.course || row.studentCourse || "",
      graduationYear: row.graduationYear || row.studentGraduationYear || "",
      currentYear: row.currentYear || null,
      jobTitle: row.jobTitle || "",
      companyName: row.companyName || "",
      currentCity: row.currentCity || "",
      currentCountry: row.currentCountry || "",
      sector: row.sector || "",
      skills: row.skills || "",
      about: row.about || "",
    };

    res.json(user);
  } catch (err) {
    console.error("❌ Error fetching profile:", err);
    res.status(500).json({ error: "Server error while fetching profile" });
  }
};

exports.updateUserSettings = async (req, res) => {
  const userId = req.user.id;
  const { profileType, profileSettings, notification, connectRequests, protection, about } = req.body;

  try {
    // Save about field to Alumni_Table (if alumni)
    await pool.query(
      `UPDATE Alumni_Table SET About = ? WHERE User_ID = ?`,
      [about, userId]
    );

    // Save all settings to User_Settings table (upsert)
    await pool.query(
      `INSERT INTO User_Settings 
        (User_ID, Profile_Visibility, Show_Branch, Show_Batch, Show_Location, 
         Show_Workplace, Show_Experience, Notifications, Connect_Requests, Info_Protection)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         Profile_Visibility = VALUES(Profile_Visibility),
         Show_Branch = VALUES(Show_Branch),
         Show_Batch = VALUES(Show_Batch),
         Show_Location = VALUES(Show_Location),
         Show_Workplace = VALUES(Show_Workplace),
         Show_Experience = VALUES(Show_Experience),
         Notifications = VALUES(Notifications),
         Connect_Requests = VALUES(Connect_Requests),
         Info_Protection = VALUES(Info_Protection)`,
      [
        userId,
        profileType || 'public',
        profileSettings?.showBranch ? 1 : 0,
        profileSettings?.showBatch ? 1 : 0,
        profileSettings?.showLocation ? 1 : 0,
        profileSettings?.showWorkplace ? 1 : 0,
        profileSettings?.showExperience ? 1 : 0,
        notification ? 1 : 0,
        connectRequests ? 1 : 0,
        protection ? 1 : 0,
      ]
    );

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("❌ Error updating settings:", err);
    res.status(500).json({ error: "Failed to update settings" });
  }
};

exports.changePassword = async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT Password FROM User_Table WHERE User_ID = ?",
      [userId]
    );

    if (!rows.length)
      return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(oldPassword, rows[0].Password);
    if (!valid)
      return res.status(400).json({ error: "Incorrect old password" });

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE User_Table SET Password = ? WHERE User_ID = ?", [
      newHash,
      userId,
    ]);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("❌ Error changing password:", err);
    res.status(500).json({ error: "Failed to change password" });
  }
};

exports.uploadProfilePic = async (req, res) => {
  const userId = req.user.id;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = `/uploads/profile_pics/${req.file.filename}`;

    await pool.query(
      "UPDATE User_Table SET Profile_Pic = ? WHERE User_ID = ?",
      [filePath, userId]
    );

    res.json({ imagePath: filePath });
  } catch (err) {
    console.error("❌ Error uploading profile picture:", err);
    res.status(500).json({ error: "Failed to upload profile picture" });
  }
};

exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const {
    firstName,
    lastName,
    gender,
    phone,
    phone2,
    address,
    enrollmentNo,
    department,
    course,
    graduationYear,
    currentYear,
    jobTitle,
    companyName,
    currentCity,
    currentCountry,
    sector,
    skills
  } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Update User_Table
    await conn.query(
      `UPDATE User_Table SET 
        User_Fname = ?, 
        User_Lname = ?, 
        Gender = ?, 
        Phone_no = ?, 
        Phone_no_2 = ?, 
        Address = ? 
       WHERE User_ID = ?`,
      [firstName, lastName, gender, phone, phone2, address, userId]
    );

    // Get the user's type to know which table to update
    const [userRows] = await conn.query(
      "SELECT User_Type_ID FROM User_Table WHERE User_ID = ?",
      [userId]
    );
    if (!userRows.length) {
      throw new Error("User not found");
    }
    const userType = userRows[0].User_Type_ID;

    if (userType === 1) { // Alumni
      await conn.query(
        `UPDATE Alumni_Table SET 
          Enrollment_No = ?, 
          Graduation_Year = ?, 
          Department = ?, 
          Course = ?, 
          Job_Title = ?, 
          Company_Name = ?, 
          Current_City = ?, 
          Current_Country = ?, 
          Sector = ?, 
          Skills = ? 
         WHERE User_ID = ?`,
        [
          enrollmentNo || null,
          graduationYear ? parseInt(graduationYear) : null,
          department || null,
          course || null,
          jobTitle || null,
          companyName || null,
          currentCity || null,
          currentCountry || null,
          sector || null,
          skills || null,
          userId
        ]
      );
    } else if (userType === 2) { // Student
      await conn.query(
        `UPDATE Student_Table SET 
          Scholar_No = ?, 
          Graduation_Year = ?, 
          Department = ?, 
          Course = ?, 
          Current_Year = ? 
         WHERE User_ID = ?`,
        [
          enrollmentNo || null,
          graduationYear ? parseInt(graduationYear) : null,
          department || null,
          course || null,
          currentYear ? parseInt(currentYear) : null,
          userId
        ]
      );
    }

    await conn.commit();

    // Fetch updated user to return in the response
    const [rows] = await pool.query(
      `SELECT 
          u.User_ID AS id, 
          u.User_Fname AS firstName, 
          u.User_Lname AS lastName,
          u.Email_ID AS email, 
          u.Profile_Pic AS profilePic,
          u.Gender AS gender,
          u.Phone_no AS phone,
          u.Phone_no_2 AS phone2,
          u.Address AS address,
          u.User_Type_ID AS userType,
          a.Alumni_ID AS alumniId,
          a.Enrollment_No AS enrollmentNo,
          a.Graduation_Year AS graduationYear,
          a.Department AS department,
          a.Course AS course,
          a.Job_Title AS jobTitle,
          a.Company_Name AS companyName,
          a.Current_City AS currentCity,
          a.Current_Country AS currentCountry,
          a.Sector AS sector,
          a.Skills AS skills,
          a.About AS about,
          s.Student_ID AS studentId,
          s.Scholar_No AS scholarNo,
          s.Department AS studentDepartment,
          s.Course AS studentCourse,
          s.Current_Year AS currentYear,
          s.Graduation_Year AS studentGraduationYear
       FROM User_Table u
       LEFT JOIN Alumni_Table a ON u.User_ID = a.User_ID
       LEFT JOIN Student_Table s ON u.User_ID = s.User_ID
       WHERE u.User_ID = ?`,
      [userId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const row = rows[0];
    const user = {
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      profilePic: row.profilePic || "",
      gender: row.gender || "",
      phone: row.phone || "",
      phone2: row.phone2 || "",
      address: row.address || "",
      userType: row.userType,
      userRole: row.userType === 1 ? "Alumni" : row.userType === 2 ? "Student" : "Admin",
      enrollmentNo: row.enrollmentNo || row.scholarNo || "",
      department: row.department || row.studentDepartment || "",
      course: row.course || row.studentCourse || "",
      graduationYear: row.graduationYear || row.studentGraduationYear || "",
      currentYear: row.currentYear || null,
      jobTitle: row.jobTitle || "",
      companyName: row.companyName || "",
      currentCity: row.currentCity || "",
      currentCountry: row.currentCountry || "",
      sector: row.sector || "",
      skills: row.skills || "",
      about: row.about || "",
    };

    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    await conn.rollback();
    console.error("❌ Error updating profile:", err);
    res.status(500).json({ error: "Failed to update profile" });
  } finally {
    conn.release();
  }
};

exports.getUserNotifications = async (req, res) => {
  const userId = req.user.id;

  try {
    const notifications = [];

    // 1. Pending connection requests sent to the user
    const [pendingRequests] = await pool.query(
      `SELECT 
        c.Connection_ID, 
        c.Created_At,
        u.User_Fname, 
        u.User_Lname
       FROM user_connection c
       JOIN user_table u ON c.Sender_ID = u.User_ID
       WHERE c.Receiver_ID = ? AND c.Status = 'Pending'
       ORDER BY c.Created_At DESC
       LIMIT 10`,
      [userId]
    );

    pendingRequests.forEach((request) => {
      notifications.push({
        id: `connection_${request.Connection_ID}`,
        text: `${request.User_Fname} ${request.User_Lname} sent you a connection request.`,
        icon: "👤",
        timestamp: request.Created_At,
        link: "/connections",
      });
    });

    // 2. Recent upcoming events (created recently or upcoming)
    const [recentEvents] = await pool.query(
      `SELECT 
        Event_ID, 
        Event_Name, 
        Event_Date,
        Creation_Date
       FROM event_table
       WHERE Event_Date >= CURDATE()
       ORDER BY Event_ID DESC
       LIMIT 5`
    );

    recentEvents.forEach((ev) => {
      notifications.push({
        id: `event_${ev.Event_ID}`,
        text: `New Event: "${ev.Event_Name}" scheduled on ${new Date(ev.Event_Date).toLocaleDateString()}.`,
        icon: "📅",
        timestamp: ev.Creation_Date,
        link: "/events",
      });
    });

    // 3. Recent job postings (last 5)
    const [recentJobs] = await pool.query(
      `SELECT 
        Job_ID, 
        Job_Title, 
        Company_Name,
        Created_At
       FROM job_postings
       ORDER BY Job_ID DESC
       LIMIT 5`
    );

    recentJobs.forEach((job) => {
      notifications.push({
        id: `job_${job.Job_ID}`,
        text: `New job opportunity: "${job.Job_Title}" at ${job.Company_Name}.`,
        icon: "💼",
        timestamp: job.Created_At,
        link: "/jobs",
      });
    });

    // 4. Recent news published
    const [recentNews] = await pool.query(
      `SELECT 
        News_ID, 
        Title, 
        Published_At
       FROM news
       WHERE Is_Published = 1
       ORDER BY News_ID DESC
       LIMIT 5`
    );

    recentNews.forEach((news) => {
      notifications.push({
        id: `news_${news.News_ID}`,
        text: `New announcement: "${news.Title}"`,
        icon: "📰",
        timestamp: news.Published_At,
        link: "/homepage",
      });
    });

    // Sort by timestamp desc
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(notifications);
  } catch (err) {
    console.error("❌ Error fetching user notifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

