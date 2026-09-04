const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateOTP, storeOTP, verifyOTP, getOTPData, storeResetOTP, verifyResetOTP } = require("../utils/otpStore");
const { sendOTPEmail, sendPasswordResetOTPEmail } = require("../utils/emailService");


// SIGNIN
exports.signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      `SELECT u.*, ut.User_Type_name 
       FROM User_Table u 
       JOIN User_Type_Table ut ON u.User_Type_ID = ut.User_Type_ID 
       WHERE u.Email_ID = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = rows[0];

    const validPassword = await bcrypt.compare(password, user.Password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if user is verified by Admin
    if (!user.Is_Verified) {
      return res.status(403).json({
        error: "Your account is pending verification by an administrator. Please try again after approval.",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const payload = { id: user.User_ID, email: user.Email_ID, role: user.User_Type_ID };

    // Short-lived access token (15 minutes)
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });

    // Long-lived refresh token (7 days) — stored in httpOnly cookie
    const refreshSecret = process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET + "_refresh");
    const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: "7d" });

    const { Password, ...userWithoutPassword } = user;

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    res.json({
      message: "Signin successful",
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


//SIGNUP
const ROLES = {
  ALUMNI: 1,
  STUDENT: 2
};

exports.signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      gender,
      primaryPhone,
      secondaryPhone,
      email,
      password,
      address,
      currentYear,
      endYear,
      jobTitle,
      companyName,
      city,
      country,
      sector,
      skills,
      scholarId,
      department,
      branch
    } = req.body;

    // Check if email already exists
    const [existing] = await pool.query(
      "SELECT User_ID FROM User_Table WHERE Email_ID = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Enforce password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: "Password must be at least 8 characters with uppercase, lowercase, digit, and special character.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userData = { ...req.body, hashedPassword };

    // Generate and send OTP
    const otp = generateOTP();
    await storeOTP(email, otp, userData);
    await sendOTPEmail(email, otp);

    res.status(201).json({
      message: "Registration started! Please check your email for the verification code.",
      email,
      needsVerification: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// VERIFY EMAIL
exports.verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  try {
    const result = await verifyOTP(email, otp);
    if (!result.valid) {
      return res.status(400).json({ error: result.reason });
    }

    const userData = result.userData;
    
    // If there is no pending user data, check if it's an old flow or just fallback
    if (!userData) {
      const [rows] = await pool.query("SELECT User_ID FROM User_Table WHERE Email_ID = ?", [email]);
      if (rows.length > 0) {
        await pool.query("UPDATE User_Table SET Is_Verified = 1 WHERE Email_ID = ?", [email]);
        return res.json({ message: "Email verified successfully! You can now sign in." });
      }
      return res.status(400).json({ error: "Registration data expired. Please sign up again." });
    }

    let userTypeId = parseInt(userData.role);
    if (![ROLES.ALUMNI, ROLES.STUDENT].includes(userTypeId)) {
      const currentCalendarYear = new Date().getFullYear();
      userTypeId = (userData.endYear && parseInt(userData.endYear) < currentCalendarYear) ? ROLES.ALUMNI : ROLES.STUDENT;
    }

    const [insertResult] = await pool.query(
      `INSERT INTO User_Table 
        (User_Type_ID, User_Fname, User_Lname, Gender, Phone_no, Phone_no_2, Email_ID, Password, Address, Is_Verified) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [userTypeId, userData.firstName, userData.lastName, userData.gender, userData.primaryPhone, userData.secondaryPhone, userData.email, userData.hashedPassword, userData.address]
    );

    const userId = insertResult.insertId;

    if (userTypeId === ROLES.STUDENT) {
      const currentYearVal = parseInt(userData.currentYear) || 1;
      await pool.query(
        `INSERT INTO Student_Table (Scholar_No, User_ID, Department, Course, Current_Year, Graduation_Year) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userData.scholarId, userId, userData.department, userData.branch, currentYearVal, userData.endYear]
      );
    } else if (userTypeId === ROLES.ALUMNI) {
      let alumniId;
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 10) {
        alumniId = Math.floor(100000 + Math.random() * 900000);
        const [existingAlumni] = await pool.query("SELECT Alumni_ID FROM Alumni_Table WHERE Alumni_ID = ?", [alumniId]);
        if (existingAlumni.length === 0) {
          isUnique = true;
        }
        attempts++;
      }
      if (!isUnique) {
        throw new Error("Failed to generate a unique Alumni ID");
      }

      await pool.query(
        `INSERT INTO Alumni_Table (
    Alumni_ID, User_ID, Enrollment_No, Department, Course, Graduation_Year,
    Job_Title, Company_Name, Current_City, Current_Country, Sector, Skills
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [alumniId, userId, userData.scholarId, userData.department, userData.branch, userData.endYear, userData.jobTitle, userData.companyName, userData.city, userData.country, userData.sector, userData.skills]
      );
    }

    res.json({ message: "Email verified successfully! You can now sign in." });
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


// RESEND OTP
exports.resendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    let pendingUserData = null;
    const pendingData = await getOTPData(email);
    
    if (pendingData && pendingData.userData) {
      pendingUserData = pendingData.userData;
    } else {
      // Check if user exists in DB and is not already verified
      const [rows] = await pool.query(
        "SELECT User_ID, Is_Verified FROM User_Table WHERE Email_ID = ?",
        [email]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "No pending registration found. Please sign up again." });
      }

      if (rows[0].Is_Verified) {
        return res.status(400).json({ error: "Email is already verified" });
      }
    }

    const otp = generateOTP();
    await storeOTP(email, otp, pendingUserData);
    await sendOTPEmail(email, otp);

    res.json({
      message: "A new verification code has been sent to your email.",
      email,
    });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// SEND OTP (for forgot password)
exports.sendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT User_ID FROM User_Table WHERE Email_ID = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const otp = generateOTP();
    await storeResetOTP(email, otp);
    await sendPasswordResetOTPEmail(email, otp);

    res.json({
      message: "OTP sent to your email.",
    });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// VERIFY OTP (for forgot password - validates before password reset step)
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  try {
    const result = await verifyResetOTP(email, otp, false);
    if (!result.valid) {
      return res.status(400).json({ error: result.reason });
    }

    res.json({ message: "OTP verified. Please set your new password." });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// RESET PASSWORD (forgot password flow)
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: "Email, OTP, and new password are required" });
  }

  try {
    const result = await verifyResetOTP(email, otp, true);
    if (!result.valid) {
      return res.status(400).json({ error: result.reason });
    }

    // Enforce password strength on reset
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        error: "Password must be at least 8 characters with uppercase, lowercase, digit, and special character.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const [result2] = await pool.query(
      "UPDATE User_Table SET Password = ? WHERE Email_ID = ?",
      [hashedPassword, email]
    );

    if (result2.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Password reset successfully!" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


// REFRESH ACCESS TOKEN
exports.refreshToken = async (req, res) => {
  const rt = req.cookies?.refreshToken;
  if (!rt) {
    return res.status(401).json({ error: "No refresh token provided" });
  }

  try {
    const refreshSecret = process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET + "_refresh");
    const decoded = jwt.verify(rt, refreshSecret);

    // Issue a fresh access token
    const newAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ token: newAccessToken });
  } catch (err) {
    console.error("Refresh token error:", err.message);
    res.clearCookie("refreshToken");
    return res.status(401).json({ error: "Invalid or expired refresh token. Please sign in again." });
  }
};


// LOGOUT
exports.logout = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
  res.json({ message: "Logged out successfully" });
};
