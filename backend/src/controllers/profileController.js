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
