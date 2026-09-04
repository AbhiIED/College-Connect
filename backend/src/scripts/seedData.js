const mysql = require("mysql2/promise");
require("dotenv").config();

async function runSeed() {
  console.log("Connecting to TiDB Cloud database CollegeConnect...");
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
    multipleStatements: true,
  });

  console.log("✅ Connected. Beginning seed execution...");

  try {
    await connection.query("SET FOREIGN_KEY_CHECKS = 0;");

    // 1. User_Type_Table
    console.log("Seeding User_Type_Table...");
    await connection.query("DELETE FROM User_Type_Table;");
    await connection.query(`
      INSERT INTO User_Type_Table (User_Type_ID, User_Type_Name) VALUES
      (1, 'Alumni'),
      (2, 'Student'),
      (3, 'Admin');
    `);

    // 2. User_Table
    console.log("Seeding User_Table...");
    await connection.query("DELETE FROM User_Table;");
    await connection.query(`
      INSERT INTO User_Table (User_ID, User_Type_ID, User_Fname, User_Lname, Gender, Phone_no, Phone_no_2, Email_ID, Password, Address, Profile_Pic, Is_Verified) VALUES
      -- Admins (User_Type_ID = 3)
      (1, 3, 'Suresh', 'Pandey', 'Male', '9876543210', NULL, 'admin@manit.ac.in', '$2b$10$N.pycszXqJaAL/YVIrnIgeWky9ntp2kYlQnrJpND4xKdHPtnT7Imi', 'MANIT Campus, Link Road No. 3, Bhopal, Madhya Pradesh 462003', 'profiles/suresh_pandey.jpg', 1),
      (2, 3, 'Meena', 'Verma', 'Female', '9865432109', NULL, 'meena.verma@manit.ac.in', '$2b$10$N.pycszXqJaAL/YVIrnIgeWky9ntp2kYlQnrJpND4xKdHPtnT7Imi', 'Arera Colony, Bhopal, Madhya Pradesh 462016', 'profiles/meena_verma.jpg', 1),
      (3, 3, 'Rajesh', 'Sinha', 'Male', '9854321098', NULL, 'rajesh.sinha@manit.ac.in', '$2b$10$N.pycszXqJaAL/YVIrnIgeWky9ntp2kYlQnrJpND4xKdHPtnT7Imi', 'TT Nagar, Bhopal, Madhya Pradesh 462003', 'profiles/rajesh_sinha.jpg', 1),
      -- Alumni (User_Type_ID = 1)
      (4, 1, 'Rahul', 'Sharma', 'Male', '9843210987', '9812345678', 'rahul.sharma@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWVyIHe2', '42, Rajendra Nagar, Bengaluru, Karnataka 560010', 'profiles/rahul_sharma.jpg', 1),
      (5, 1, 'Priya', 'Mehta', 'Female', '9832109876', NULL, 'priya.mehta@yahoo.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWVyIHe2', 'HSR Layout, Bengaluru, Karnataka 560102', 'profiles/priya_mehta.jpg', 1),
      (6, 1, 'Arjun', 'Patel', 'Male', '9821098765', NULL, 'arjun.patel@hotmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWVyIHe2', 'Kothrud, Pune, Maharashtra 411029', 'profiles/arjun_patel.jpg', 1),
      (7, 1, 'Sneha', 'Gupta', 'Female', '9810987654', NULL, 'sneha.gupta@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWVyIHe2', 'Sector 62, Noida, Uttar Pradesh 201309', 'profiles/sneha_gupta.jpg', 1),
      (8, 1, 'Vikram', 'Singh', 'Male', '9809876543', '9867543210', 'vikram.singh@outlook.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWVyIHe2', 'Sector 18, Cyber City, Gurgaon, Haryana 122002', 'profiles/vikram_singh.jpg', 1),
      (9, 1, 'Ananya', 'Reddy', 'Female', '9798765432', NULL, 'ananya.reddy@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWVyIHe2', 'Gachibowli, Hyderabad, Telangana 500032', 'profiles/ananya_reddy.jpg', 1),
      (10, 1, 'Rohit', 'Kumar', 'Male', '9787654321', NULL, 'rohit.kumar.manit@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWVyIHe2', 'HAL 2nd Stage, Bengaluru, Karnataka 560038', 'profiles/rohit_kumar.jpg', 1),
      -- Students (User_Type_ID = 2)
      (11, 2, 'Aisha', 'Khan', 'Female', '9776543210', NULL, 'aisha.khan@student.manit.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWVyIHe2', 'Indrapuri, Bhopal, Madhya Pradesh 462022', 'profiles/aisha_khan.jpg', 1),
      (12, 2, 'Nikhil', 'Sharma', 'Male', '9765432109', NULL, 'nikhil.sharma@student.manit.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWVyIHe2', 'Saket Nagar, Bhopal, Madhya Pradesh 462024', 'profiles/nikhil_sharma.jpg', 1),
      (13, 2, 'Kavya', 'Nair', 'Female', '9754321098', NULL, 'kavya.nair@student.manit.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWVyIHe2', 'Kolar Road, Bhopal, Madhya Pradesh 462042', 'profiles/kavya_nair.jpg', 1),
      (14, 2, 'Ravi', 'Tiwari', 'Male', '9743210987', NULL, 'ravi.tiwari@student.manit.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWVyIHe2', 'Ayodhya Bypass, Bhopal, Madhya Pradesh 462041', 'profiles/ravi_tiwari.jpg', 1),
      (15, 2, 'Pooja', 'Yadav', 'Female', '9732109876', NULL, 'pooja.yadav@student.manit.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWVyIHe2', 'Minal Residency, Bhopal, Madhya Pradesh 462023', 'profiles/pooja_yadav.jpg', 1),
      (16, 2, 'Amit', 'Singh', 'Male', '9721098765', NULL, 'amit.singh@student.manit.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWVyIHe2', 'MP Nagar, Bhopal, Madhya Pradesh 462011', 'profiles/amit_singh.jpg', 1),
      (17, 2, 'Divya', 'Joshi', 'Female', '9710987654', NULL, 'divya.joshi@student.manit.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWVyIHe2', 'Chhabra Colony, Bhopal, Madhya Pradesh 462001', 'profiles/divya_joshi.jpg', 0),
      (18, 2, 'Siddharth', 'Roy', 'Male', '9709876543', NULL, 'siddharth.roy@student.manit.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWVyIHe2', 'Shahpura, Bhopal, Madhya Pradesh 462039', 'profiles/siddharth_roy.jpg', 1),
      (19, 2, 'Priyanka', 'Das', 'Female', '9698765432', NULL, 'priyanka.das@student.manit.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWVyIHe2', 'Kotra Sultanabad, Bhopal, Madhya Pradesh 462003', 'profiles/priyanka_das.jpg', 1),
      (20, 2, 'Tanmay', 'Mishra', 'Male', '9687654321', NULL, 'tanmay.mishra@student.manit.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWVyIHe2', 'Habibganj, Bhopal, Madhya Pradesh 462024', 'profiles/tanmay_mishra.jpg', 1),
      -- Common default accounts for testing:
      (21, 3, 'Super', 'Admin', 'Male', '9999999999', NULL, 'admin@college.com', '$2b$10$N.pycszXqJaAL/YVIrnIgeWky9ntp2kYlQnrJpND4xKdHPtnT7Imi', 'Admin Campus', NULL, 1),
      (22, 1, 'Abhishek', 'Sharma', 'Male', '9876543211', NULL, 'alumni@college.com', '$2b$10$BPV2ZCxp2DYpCf2ir2NVeemm2yN6HLpZfBY1nrEdI2IaPn4XEOe.q', 'Bangalore, India', NULL, 1);
    `);

    // 3. Admin_Table
    console.log("Seeding Admin_Table...");
    await connection.query("DELETE FROM Admin_Table;");
    await connection.query(`
      INSERT INTO Admin_Table (Admin_ID, User_ID, Role) VALUES
      (1, 1, 'Super Administrator'),
      (2, 2, 'Academic Administrator'),
      (3, 3, 'Events & Communications Administrator'),
      (4, 21, 'Super Administrator');
    `);

    // 4. Student_Table
    console.log("Seeding Student_Table...");
    await connection.query("DELETE FROM Student_Table;");
    await connection.query(`
      INSERT INTO Student_Table (Student_ID, Scholar_No, User_ID, Department, Course, Current_Year, Graduation_Year) VALUES
      (1, 'MANIT/2023/CS/101', 11, 'Computer Science & Engineering', 'B.Tech', 3, 2027),
      (2, 'MANIT/2024/ME/212', 12, 'Mechanical Engineering', 'B.Tech', 2, 2028),
      (3, 'MANIT/2022/EC/087', 13, 'Electronics & Communication Engg.', 'B.Tech', 4, 2026),
      (4, 'MANIT/2025/CS/156', 14, 'Computer Science & Engineering', 'B.Tech', 1, 2029),
      (5, 'MANIT/2023/IT/234', 15, 'Information Technology', 'B.Tech', 3, 2027),
      (6, 'MANIT/2022/ME/098', 16, 'Mechanical Engineering', 'B.Tech', 4, 2026),
      (7, 'MANIT/2024/CS/178', 17, 'Computer Science & Engineering', 'B.Tech', 2, 2028),
      (8, 'MANIT/2025/IT/067', 18, 'Information Technology', 'B.Tech', 1, 2029),
      (9, 'MANIT/2023/EC/189', 19, 'Electronics & Communication Engg.', 'B.Tech', 3, 2027),
      (10, 'MANIT/2022/CS/045', 20, 'Computer Science & Engineering', 'B.Tech', 4, 2026);
    `);

    // 5. Alumni_Table
    console.log("Seeding Alumni_Table...");
    await connection.query("DELETE FROM Alumni_Table;");
    await connection.query(`
      INSERT INTO Alumni_Table (Alumni_ID, User_ID, Enrollment_No, Department, Course, Graduation_Year, Job_Title, Company_Name, Current_City, Current_Country, Sector, Skills, About) VALUES
      (1, 4, 'MANIT/2014/CS/042', 'Computer Science & Engineering', 'B.Tech', 2018, 'Senior Software Engineer', 'Google', 'Bengaluru', 'India', 'Technology', 'Java, Python, Distributed Systems, Kubernetes, System Design', 'MANIT CS 2018 alumnus passionate about distributed systems and cloud architecture. Currently at Google Bengaluru. Open to mentoring juniors on engineering roadmaps.'),
      (2, 5, 'MANIT/2015/EC/034', 'Electronics & Communication Engg.', 'B.Tech', 2019, 'Associate Product Manager', 'Flipkart', 'Bengaluru', 'India', 'E-Commerce', 'Product Strategy, User Research, Agile, SQL, Stakeholder Management', 'ECE graduate who transitioned to Product Management. At Flipkart building localized merchant loops. Passionate about user-centric product designs.'),
      (3, 6, 'MANIT/2013/ME/056', 'Mechanical Engineering', 'B.Tech', 2017, 'Senior Design Engineer', 'Tata Motors', 'Pune', 'India', 'Automotive', 'SolidWorks, CATIA, Finite Element Analysis, GD&T, Manufacturing Processes', 'Mechanical grad focused on electric mobility structures. Leading EV structural assemblies at Tata Motors. Marathoner and mountain runner.'),
      (4, 7, 'MANIT/2016/CS/078', 'Computer Science & Engineering', 'B.Tech', 2020, 'Data Scientist II', 'Microsoft', 'Noida', 'India', 'Technology', 'Python, TensorFlow, PyTorch, NLP, Machine Learning, Azure ML', 'CS grad building specialized transformers and neural indexing setups at Microsoft. Published in IEEE. Regional mentor at tech inclusivity networks.'),
      (5, 8, 'MANIT/2012/IT/090', 'Information Technology', 'B.Tech', 2016, 'Vice President – Engineering', 'Infosys', 'Gurgaon', 'India', 'IT Consulting', 'Leadership, Cloud Architecture, AWS, Azure, Team Management, System Design', 'Pivoted from terminal engineering into executive operational loops. Leading an 80-person team focused on multi-tenant hybrid data systems.'),
      (6, 9, 'MANIT/2017/CS/045', 'Computer Science & Engineering', 'B.Tech', 2021, 'Software Development Engineer I', 'Amazon', 'Hyderabad', 'India', 'Technology', 'Java, Spring Boot, AWS, Microservices, Docker, React', 'Proud MANIT graduate working across high-throughput transactional checkouts at Amazon. Algorithmic solver and open-source enthusiast.'),
      (7, 10, 'MANIT/2014/EC/023', 'Electronics & Communication Engg.', 'B.Tech', 2018, 'Systems Engineer – Embedded', 'ISRO', 'Bengaluru', 'India', 'Space & Defence', 'Embedded C, RTOS, FPGA, Signal Processing, RF Communications, VHDL', 'Living the dream at ISRO building telemetry hardware and onboard system controllers for planetary missions. Proud to serve the nation through engineering.'),
      (8, 22, 'ENR2024001', 'Computer Science', 'B.Tech', 2024, 'Software Engineer', 'Google', 'Bangalore', 'India', 'Technology', 'React, Node.js, Cloud', 'Alumni member.');
    `);

    // 6. User_Settings
    console.log("Seeding User_Settings...");
    await connection.query("DELETE FROM User_Settings;");
    await connection.query(`
      INSERT INTO User_Settings (User_ID, Profile_Visibility, Show_Branch, Show_Batch, Show_Location, Show_Workplace, Show_Experience, Notifications, Connect_Requests, Info_Protection) VALUES
      (1, 'public', 1, 1, 1, 1, 1, 1, 1, 1),
      (2, 'public', 1, 1, 1, 1, 1, 1, 1, 1),
      (3, 'public', 1, 1, 1, 1, 1, 1, 1, 1),
      (4, 'public', 1, 1, 1, 1, 1, 1, 1, 0),
      (5, 'public', 1, 1, 1, 1, 1, 1, 1, 1),
      (6, 'public', 1, 1, 0, 1, 1, 1, 1, 1),
      (7, 'public', 1, 1, 1, 1, 1, 1, 1, 1),
      (8, 'private', 1, 1, 1, 1, 0, 1, 0, 1),
      (9, 'public', 1, 1, 1, 1, 1, 1, 1, 1),
      (10, 'public', 1, 0, 1, 1, 1, 1, 1, 1),
      (11, 'public', 1, 1, 1, 0, 1, 1, 1, 1),
      (12, 'public', 1, 1, 1, 1, 1, 1, 1, 1),
      (13, 'public', 1, 1, 1, 1, 1, 1, 1, 0),
      (14, 'public', 1, 1, 1, 1, 1, 1, 1, 1),
      (15, 'public', 1, 1, 1, 1, 1, 1, 1, 1),
      (16, 'public', 1, 1, 0, 1, 1, 1, 1, 1),
      (17, 'private', 1, 1, 1, 1, 1, 0, 1, 1),
      (18, 'public', 1, 1, 1, 1, 1, 1, 1, 1),
      (19, 'public', 0, 1, 1, 1, 1, 1, 1, 1),
      (20, 'public', 1, 1, 1, 1, 1, 1, 1, 0),
      (21, 'public', 1, 1, 1, 1, 1, 1, 1, 1),
      (22, 'public', 1, 1, 1, 1, 1, 1, 1, 1);
    `);

    // 7. User_Connection
    console.log("Seeding User_Connection...");
    await connection.query("DELETE FROM User_Connection;");
    await connection.query(`
      INSERT INTO User_Connection (Sender_ID, Receiver_ID, Status, Created_At, Updated_At) VALUES
      (11, 4, 'Accepted', '2026-01-15 10:23:00', '2026-01-15 14:45:00'),
      (12, 6, 'Accepted', '2026-01-18 09:15:00', '2026-01-19 11:20:00'),
      (13, 5, 'Accepted', '2026-02-03 16:30:00', '2026-02-04 09:10:00'),
      (20, 4, 'Accepted', '2026-02-10 11:00:00', '2026-02-10 18:30:00'),
      (15, 7, 'Accepted', '2026-02-20 08:45:00', '2026-02-21 10:00:00'),
      (16, 8, 'Accepted', '2026-03-05 14:20:00', '2026-03-06 09:50:00'),
      (11, 7, 'Accepted', '2026-03-12 10:10:00', '2026-03-13 08:00:00'),
      (19, 5, 'Accepted', '2026-04-01 12:00:00', '2026-04-02 15:30:00'),
      (17, 9, 'Pending', '2026-04-15 09:30:00', '2026-04-15 09:30:00'),
      (14, 10, 'Pending', '2026-04-22 17:00:00', '2026-04-22 17:00:00'),
      (18, 7, 'Pending', '2026-05-01 11:15:00', '2026-05-01 11:15:00'),
      (20, 15, 'Pending', '2026-05-10 08:30:00', '2026-05-10 08:30:00'),
      (4, 8, 'Accepted', '2025-11-20 10:00:00', '2025-11-21 08:30:00'),
      (5, 9, 'Accepted', '2025-12-05 14:00:00', '2025-12-06 09:00:00'),
      (10, 6, 'Rejected', '2026-01-08 09:00:00', '2026-01-09 10:45:00');
    `);

    // 8. Chat_Message
    console.log("Seeding Chat_Message...");
    await connection.query("DELETE FROM Chat_Message;");
    await connection.query(`
      INSERT INTO Chat_Message (Sender_ID, Receiver_ID, Message, Is_Read, Sent_At) VALUES
      (11, 4, 'Hi Rahul sir, I am a 3rd-year CS student at MANIT. Could you guide me on preparing for Google placements?', 1, '2026-01-16 10:05:00'),
      (4, 11, 'Hi Aisha! Focus completely on DSA, System Design, and aim for 200+ LeetCode problems. Communication skills matter too.', 1, '2026-01-16 12:30:00'),
      (11, 4, 'Thank you! Any specific online resources or mock tests you recommend for System Design?', 1, '2026-01-16 13:00:00'),
      (4, 11, 'Grokking the System Design Interview is a great start. Also follow Alex Xu\\'s content closely.', 1, '2026-01-16 14:15:00'),
      (13, 5, 'Hello Priya ma\\'am, I am graduating this year and want to transition into Product Management. Any advice?', 1, '2026-02-05 09:20:00'),
      (5, 13, 'Hi Kavya! PM roles need strong analytical and communication skills. Try APM tracks at top tech firms.', 1, '2026-02-05 11:00:00'),
      (13, 5, 'Do companies hire freshers directly as APMs or is it better to start as an engineer first?', 1, '2026-02-05 11:30:00'),
      (5, 13, 'Most consumer tech firms have special APM tracks for fresh grads. Target Flipkart, Google, and Microsoft.', 0, '2026-02-05 12:00:00'),
      (20, 7, 'Hi Sneha di, I want to build a rock-solid career in Data Science after graduation. Where should I begin?', 1, '2026-02-12 08:45:00'),
      (7, 20, 'Start with Python, Advanced Statistics, and ML fundamentals. Kaggle competitions are amazing for hands-on practice.', 1, '2026-02-12 10:00:00'),
      (20, 7, 'Should I go for higher studies (M.Tech) or try to break into the industry directly?', 1, '2026-02-12 10:30:00'),
      (7, 20, 'For industry roles, a strong GitHub portfolio beats a degree. Go for research only if you love deep theory.', 0, '2026-02-12 11:00:00'),
      (4, 9, 'Hey Ananya! Great seeing you at the alumni meet. Let\\'s catch up when I\\'m in Hyderabad next month.', 1, '2026-01-27 18:00:00'),
      (9, 4, 'Sure Rahul! I\\'ll be free around the 15th. We should also discuss that SaaS startup idea we talked about.', 0, '2026-01-27 19:45:00'),
      (4, 9, 'Sounds perfect. I\\'ll DM you my flight schedule closer to the date. Looking forward to it!', 0, '2026-01-28 09:10:00');
    `);

    // 9. Event_Table
    console.log("Seeding Event_Table...");
    await connection.query("DELETE FROM Event_Table;");
    await connection.query(`
      INSERT INTO Event_Table (Event_ID, Organizer_ID, Event_Name, Event_Description, Event_Date, Creation_Date, Event_Type, Event_Link, Event_Location, Event_Image) VALUES
      (1, 1, 'Annual Alumni Meet 2026', 'Grand annual gathering of MANIT alumni across all batches. Includes networking dinner, awards ceremony, and cultural events.', '2026-01-25', '2025-12-10', 'Alumni Meet', 'https://events.manit.ac.in/alumni-meet-2026', 'MANIT Main Auditorium, Bhopal', 'events/alumni_meet_2026.jpg'),
      (2, 3, 'National Hackathon - CodeStorm 2026', '36-hour hackathon open to all students. Build innovative solutions for smart cities, healthcare, and green energy.', '2026-02-14', '2026-01-15', 'Hackathon', 'https://events.manit.ac.in/codestorm-2026', 'MANIT Innovation Lab, Computer Center', 'events/codestorm_2026.jpg'),
      (3, 2, 'Tech Career Fair 2026', 'Annual placement-linked career fair featuring 30+ companies across IT, Core Engineering, and Startups.', '2026-03-05', '2026-01-20', 'Career Fair', 'https://events.manit.ac.in/career-fair-2026', 'MANIT Sports Complex, Bhopal', 'events/career_fair_2026.jpg'),
      (4, 1, 'Leadership & Entrepreneurship Seminar', 'Panel discussion with successful MANIT alumni founders. Topics include venture scaling and fundraising models.', '2026-03-20', '2026-02-01', 'Seminar', 'https://events.manit.ac.in/leadership-seminar-2026', 'MANIT Seminar Hall 1, Admin Block', 'events/leadership_seminar.jpg'),
      (5, 3, 'Campus Innovation Summit 2026', 'Students present groundbreaking research and business pitches to tech venture capitalists and alumni angels.', '2026-04-10', '2026-02-15', 'Summit', 'https://events.manit.ac.in/innovation-summit-2026', 'MANIT Central Library Atrium', 'events/innovation_summit.jpg'),
      (6, 2, 'MANIT Sports Week 2026', 'Annual inter-department sports tournament covering Cricket, Football, Basketball, and Chess.', '2026-04-22', '2026-03-10', 'Sports', 'https://events.manit.ac.in/sports-week-2026', 'MANIT Sports Ground & Indoor Stadium', 'events/sports_week_2026.jpg'),
      (7, 1, 'Alumni Talk: Life at Big Tech', 'Rahul Sharma (Google) and Ananya Reddy (Amazon) share strategies on cracking top tech positions.', '2026-05-03', '2026-03-25', 'Alumni Talk', 'https://events.manit.ac.in/alumni-talk-bigtech', 'MANIT Electronics Block Hall B', 'events/alumni_talk_bigtech.jpg'),
      (8, 2, 'Women in Technology Workshop', 'Full-day workshop for female developers covering resume building, system design drills, and mock interviews.', '2026-05-15', '2026-04-01', 'Workshop', 'https://events.manit.ac.in/women-in-tech-2026', 'MANIT CSE Block Seminar Room', 'events/women_in_tech.jpg'),
      (9, 2, 'Convocation Ceremony 2026', 'Grand graduation ceremony for the outgoing batch. Gold medal distribution and alumni card issuance.', '2026-06-15', '2026-05-01', 'Ceremony', 'https://events.manit.ac.in/convocation-2026', 'MANIT Main Campus Grounds', 'events/convocation_2026.jpg'),
      (10, 3, 'Summer Internship Drive 2026', 'Campus internship drive for pre-final year students looking for industry exposure during vacation.', '2026-06-20', '2026-05-10', 'Placement Drive', 'https://events.manit.ac.in/internship-drive-2026', 'MANIT Placement Cell, Training Block', 'events/internship_drive.jpg'),
      (11, 1, 'Deep Tech Bootcamp', '3-day intensive boot camp covering Generative AI application deployment, Cloud Native setups, and API structures.', '2026-07-08', '2026-05-20', 'Bootcamp', 'https://events.manit.ac.in/deeptech-bootcamp', 'MANIT Incubation Center, VIP Campus Wing', 'events/bootcamp_2026.jpg'),
      (12, 3, 'National Competitive Coding League', 'High-speed algorithmic coding battle across 5 critical data structure modules.', '2026-08-05', '2026-06-01', 'Competition', 'https://events.manit.ac.in/coding-league', 'MANIT Central Computer Lab', 'events/coding_league.jpg'),
      (13, 2, 'Freshers Orientation & Welcome Meet', 'Ice breaking sessions, technical club registrations, and institutional orientation for the incoming batch.', '2026-08-20', '2026-06-15', 'Cultural', 'https://events.manit.ac.in/freshers-2026', 'MANIT Main Auditorium', 'events/freshers_2026.jpg'),
      (14, 1, 'MANIT Annual Technical Fest - TechVantage 2026', 'Flagship 3-day technical festival of MANIT featuring robo-wars, drone racing, and paper presentations.', '2026-09-10', '2026-07-01', 'Technical Fest', 'https://events.manit.ac.in/techvantage-2026', 'MANIT Campus Ground', 'events/techvantage.jpg'),
      (15, 2, 'Sustainable Engineering Global Symposium', 'International researchers present whitepapers on renewable frameworks and eco-friendly structures.', '2026-10-15', '2026-07-15', 'Symposium', 'https://events.manit.ac.in/sustain-symposium', 'MANIT Conference Hall, Block 3', 'events/symposium.jpg');
    `);

    // 10. Event_Registration
    console.log("Seeding Event_Registration...");
    await connection.query("DELETE FROM Event_Registration;");
    await connection.query(`
      INSERT INTO Event_Registration (Event_ID, User_ID, Full_Name, Email, Phone, Graduation_Year, Course, Registered_At) VALUES
      (1, 4, 'Rahul Sharma', 'rahul.sharma@gmail.com', '9843210987', 2018, 'B.Tech CSE', '2025-12-18 10:00:00'),
      (1, 5, 'Priya Mehta', 'priya.mehta@yahoo.com', '9832109876', 2019, 'B.Tech ECE', '2025-12-20 14:30:00'),
      (1, 6, 'Arjun Patel', 'arjun.patel@hotmail.com', '9821098765', 2017, 'B.Tech ME', '2025-12-22 11:00:00'),
      (1, 7, 'Sneha Gupta', 'sneha.gupta@gmail.com', '9810987654', 2020, 'B.Tech CSE', '2026-01-02 09:15:00'),
      (2, 11, 'Aisha Khan', 'aisha.khan@student.manit.ac.in', '9776543210', 2027, 'B.Tech CSE', '2026-01-20 10:30:00'),
      (2, 13, 'Kavya Nair', 'kavya.nair@student.manit.ac.in', '9754321098', 2026, 'B.Tech ECE', '2026-01-22 15:00:00'),
      (2, 20, 'Tanmay Mishra', 'tanmay.mishra@student.manit.ac.in', '9687654321', 2026, 'B.Tech CSE', '2026-01-25 08:45:00'),
      (3, 13, 'Kavya Nair', 'kavya.nair@student.manit.ac.in', '9754321098', 2026, 'B.Tech ECE', '2026-02-08 11:00:00'),
      (3, 16, 'Amit Singh', 'amit.singh@student.manit.ac.in', '9721098765', 2026, 'B.Tech ME', '2026-02-10 09:30:00'),
      (3, 20, 'Tanmay Mishra', 'tanmay.mishra@student.manit.ac.in', '9687654321', 2026, 'B.Tech CSE', '2026-02-11 14:00:00'),
      (7, 11, 'Aisha Khan', 'aisha.khan@student.manit.ac.in', '9776543210', 2027, 'B.Tech CSE', '2026-04-05 10:00:00'),
      (7, 14, 'Ravi Tiwari', 'ravi.tiwari@student.manit.ac.in', '9743210987', 2029, 'B.Tech CSE', '2026-04-06 12:30:00'),
      (7, 17, 'Divya Joshi', 'divya.joshi@student.manit.ac.in', '9710987654', 2028, 'B.Tech CSE', '2026-04-07 09:00:00'),
      (9, 13, 'Kavya Nair', 'kavya.nair@student.manit.ac.in', '9754321098', 2026, 'B.Tech ECE', '2026-05-10 11:00:00'),
      (9, 16, 'Amit Singh', 'amit.singh@student.manit.ac.in', '9721098765', 2026, 'B.Tech ME', '2026-05-10 11:30:00');
    `);

    // 11. News
    console.log("Seeding News...");
    await connection.query("DELETE FROM News;");
    await connection.query(`
      INSERT INTO News (News_ID, Admin_ID, Title, Description, Details, Image_URL, Category, Published_At, Is_Published) VALUES
      (1, 1, 'MANIT Achieves Record 95% Placement in 2026 Season', 'Maulana Azad National Institute of Technology celebrates its best-ever placement season with a massive surge in average packages.', '487 students received stellar offers this year. Average package stands at Rs 7.2 LPA, up 18% from last year. Top recruiters included Google, Amazon, Infosys, and Tata Technologies.', 'news/placement_2026.jpg', 'Placements', '2026-05-15 09:00:00', 1),
      (2, 1, 'Alumni Vikram Singh Appointed VP of Engineering at Infosys', 'Proud moment for MANIT as alumnus Vikram Singh (IT Batch 2016) takes up a premium executive leadership role.', 'Vikram joined Infosys as a fresher in 2016 and has risen through the ranks over the past decade, now leading a massive 80-person engineering team focused entirely on cloud-native multi-tenant ecosystems.', 'news/vikram_vp.jpg', 'Alumni Achievement', '2026-04-28 10:30:00', 1),
      (3, 3, 'Team MANIT Wins Gold at Smart India Hackathon 2025', 'MANIT student team bagged first place at the national level with an AI-powered river water quality monitoring ecosystem.', 'The team built an operational IoT mesh network that continuously updates water toxicity indexes directly to an Azure DB dashboard. Judges commended the low unit cost.', 'news/sih_win_2025.jpg', 'Achievement', '2025-12-20 11:00:00', 1),
      (4, 2, 'New AI & Robotics Lab Inaugurated at Campus', 'MANIT inaugurated an advanced high-performance computational facility backed by extensive corporate sponsorships.', 'The Rs 1.2 crore lab, funded partly through generous alumni donations, supports advanced research in neural machine translations, computer vision, and autonomous rover simulations.', 'news/ai_lab.jpg', 'Infrastructure', '2026-03-12 12:00:00', 1),
      (5, 1, 'MANIT Signs Strategic MoU with IBM for Cloud Architect Tracks', 'Institutional tie-up grants access to proprietary materials, digital vouchers, and continuous industry alignment.', 'Under this partnership, 200 select students per year will clear specialized IBM Cloud Solutions certifications completely free of cost, paired with dedicated project review cycles.', 'news/ibm_mou.jpg', 'Partnerships', '2026-02-18 14:00:00', 1),
      (6, 1, 'Alumni Endowment Fund Crosses Landmark Rs 50 Lakh Target', 'The annual alumni contribution loop hits an all-time record, allowing expanded student safety grants.', 'Contributions from 340+ global alumni will directly bankroll complete tuition exemptions for 120 students coming from lower economic groups during the academic block 2026-27.', 'news/donation_drive.jpg', 'Alumni Activities', '2026-04-10 10:00:00', 1),
      (7, 2, 'NBA Certification Renewed for Core Engineering Frameworks', 'The National Board of Accreditation inspects and grants maximum status duration to core programs.', 'The visiting review committee lauded the departmental updates, high ratio of Scopus indexed journal entries, and modern digital evaluation frameworks implemented at MANIT.', 'news/nba_accreditation.jpg', 'Accreditation', '2026-01-30 09:00:00', 1),
      (8, 3, 'MANIT Ranks Among Top 15 in National Engineering Indices', 'A major milestone as Maulana Azad National Institute of Technology accelerates rankings across infrastructural indexes.', 'The update reflects deep academic shifts, increased research grants, and high-quality industrial consulting assignments captured by the engineering departments.', 'news/nirf_2026.jpg', 'Rankings', '2026-06-01 11:00:00', 1),
      (9, 2, 'MANIT Women Basketball Crew Claims State Trophy', 'A glorious sports performance as MANIT defeats long-term rivals in an intense, fast-paced final match.', 'MANIT cruised to a 68-54 win under the masterful guidance of senior student captain Priyanka Das, who also secured the Most Valuable Player award.', 'news/basketball_win.jpg', 'Sports', '2026-03-28 15:00:00', 1),
      (10, 2, 'Foundation Laid for Modern 500-Bed Women Hostel Block', 'Civil construction begins on the eco-friendly residential block featuring contemporary student utilities.', 'The project uses advanced structural designs and incorporates complete solar integration and advanced water recycling units. Expected handover is scheduled for late 2027.', 'news/hostel_construction.jpg', 'Infrastructure', '2026-04-05 10:30:00', 1),
      (11, 1, 'Dr. Rajesh Sinha Honored with National Best Faculty Citation', 'A prestigious educational recognition highlighting innovative pedagogies and extensive patent work.', 'Dr. Sinha was recognized for his continuous contribution to embedded system books and open-source microcontroller toolchains utilized globally by engineering students.', 'news/best_teacher_award.jpg', 'Faculty Achievement', '2026-05-05 09:30:00', 1),
      (12, 3, 'International Semester Exchange Agreement Inked with TU Delft', 'A game-changing international corridor opening research options for computer science students.', 'Up to 4 exceptional pre-final students will receive full institutional tuition waivers to pursue their final thesis projects within Netherlands research groups annually.', 'news/tu_delft_exchange.jpg', 'International', '2026-02-25 12:00:00', 1),
      (13, 1, 'Alumna Ananya Reddy Appears in Forbes 30 Under 30 List', 'MANIT celebrates the national recognition of our young tech innovator breaking barriers in EdTech.', 'Ananya (CS Batch 2021) was spotlighted for building highly resilient, low-bandwidth data ingestion setups for providing AI assistance to rural schooling apps.', 'news/ananya_forbes.jpg', 'Alumni Achievement', '2026-05-20 11:00:00', 1),
      (14, 3, 'Campus Incubation Wing Secures Rs 1.5 Crore Seed Fund', 'The Ministry of Innovation channels crucial institutional capital to back student deep tech setups.', 'The central grant is set to extend financial support to 10 active student startups building solutions for agritech automation and early healthcare screening devices.', 'news/incubator_grant.jpg', 'Entrepreneurship', '2026-03-18 10:00:00', 1),
      (15, 2, 'Digital Resource Library Catalog Quadrupled via INFLIBNET Accord', 'Instant access enabled to prestigious reference materials and premium global research indexes.', 'The integration introduces institutional proxies for seamless off-campus access to standard technical journals, case materials, and advanced mathematical manuals.', 'news/library_ebooks.jpg', 'Academic Resources', '2026-01-10 08:00:00', 1);
    `);

    // 12. project
    console.log("Seeding project...");
    await connection.query("DELETE FROM project;");
    await connection.query(`
      INSERT INTO project (Project_ID, User_ID, Project_title, Project_Description, Funds_Required, Fund_Raised, Category, Image, Project_Status, Created_At, Start_Date, End_Date) VALUES
      (1, 1, 'Smart Classroom Infrastructure Fund', 'Upgrade all 24 classrooms with interactive smart boards, high-speed projectors, and IoT-enabled systems.', 500000.00, 75000.00, 'Infrastructure', 'projects/smart_classroom.jpg', 'Ongoing', '2025-11-01 10:00:00', '2025-11-01', '2026-08-31'),
      (2, 1, 'Merit Scholarship Endowment 2026', 'Provide annual merit-cum-need scholarships to economically weaker but bright students across all lines.', 1000000.00, 175000.00, 'Scholarship', 'projects/scholarship.jpg', 'Ongoing', '2025-10-15 09:00:00', '2025-10-15', '2026-09-30'),
      (3, 2, 'Central Library Digital Expansion', 'Expand the digital library with corporate e-book licenses and research journal subscriptions.', 300000.00, 90000.00, 'Academic', 'projects/library_digital.jpg', 'Ongoing', '2025-12-01 11:00:00', '2025-12-01', '2026-06-30'),
      (4, 2, 'Sports Complex Renovation', 'Renovate the existing sports facility with new synthetic turf, high-output LED floodlights, and new gear.', 750000.00, 55000.00, 'Sports', 'projects/sports_complex.jpg', 'Ongoing', '2026-01-10 09:00:00', '2026-01-10', '2026-12-31'),
      (5, 3, 'Advanced Research Lab Equipment', 'Procure gas spectrometers, rapid 3D metal printers, and high-compute AI workstations.', 400000.00, 105000.00, 'Research', 'projects/research_lab.jpg', 'Ongoing', '2025-09-20 10:00:00', '2025-09-20', '2026-09-19'),
      (6, 1, 'Women Hostels Construction Support', 'Contribute towards accelerating the build cycle of the contemporary 500-bed female residency hall.', 5000000.00, 200000.00, 'Infrastructure', 'projects/womens_hostel.jpg', 'Ongoing', '2026-02-01 09:00:00', '2026-02-01', '2027-07-31'),
      (7, 1, 'Solar Grid Green Campus Buildout', 'Install 200 kW solar arrays across structural terraces to cut institute dependency on carbon grids.', 250000.00, 30000.00, 'Sustainability', 'projects/solar_panel.jpg', 'Ongoing', '2026-01-15 10:30:00', '2026-01-15', '2026-07-15'),
      (8, 3, 'Startup Incubation Center Prototype Wing', 'Build a rapid fabrication lab containing electronic debug kits and CNC gear for student creators.', 200000.00, 50000.00, 'Entrepreneurship', 'projects/incubation_centre.jpg', 'Ongoing', '2026-02-20 11:00:00', '2026-02-20', '2026-10-31'),
      (9, 2, 'Campus Wide Wi-Fi 6 Architecture Link', 'Deploy industrial routers to ensure consistent data delivery for high student densities.', 150000.00, 20000.00, 'Infrastructure', 'projects/campus_wifi.jpg', 'Ongoing', '2026-03-01 09:00:00', '2026-03-01', '2026-09-30'),
      (10, 2, 'Low Income Student Medical Cover Setup', 'A dedicated emergency health pool backing immediate clinical attention or urgent surgical events.', 100000.00, 15000.00, 'Student Welfare', 'projects/medical_aid.jpg', 'Ongoing', '2026-01-01 10:00:00', '2026-01-01', '2026-12-31'),
      (11, 1, 'Alumni Hall of Fame Interactive Wall', 'An immersive multi-touch tracking display preserving history and notable milestones of global graduates.', 300000.00, 0.00, 'Alumni Relations', 'projects/hall_of_fame.jpg', 'Ongoing', '2026-04-01 09:00:00', '2026-04-01', '2026-12-31'),
      (12, 3, 'Global Engineering Summit Sponsorship', 'Funding international keynotes and organizing research publication review portals for upcoming events.', 200000.00, 0.00, 'Academic', 'projects/conference_fund.jpg', 'Ongoing', '2026-03-15 11:00:00', '2026-03-15', '2027-03-14'),
      (13, 2, 'Rural Technology Camp Outreach Initiative', 'Fuels weekend student excursions into rural centers to train high school kids in primary Python syntax.', 50000.00, 0.00, 'CSR', 'projects/rural_outreach.jpg', 'Ongoing', '2026-02-10 10:00:00', '2026-02-10', '2026-12-31'),
      (14, 3, 'Next-Gen Streaming Studio for Distance Learning', 'High fidelity audio rigs and automated production setups to capture clean digital training courses.', 500000.00, 0.00, 'Academic Technology', 'projects/elearning.jpg', 'Ongoing', '2026-05-01 09:00:00', '2026-05-01', '2027-04-30'),
      (15, 1, 'Golden Jubilee Convocation Operational Pool', 'Covers logistical setups, premium certificate printing, and staging setups for historical batch events.', 100000.00, 0.00, 'Events', 'projects/convocation_fund.jpg', 'Completed', '2025-12-20 10:00:00', '2025-12-20', '2026-06-15');
    `);

    // 13. transactions
    console.log("Seeding transactions...");
    await connection.query("DELETE FROM transactions;");
    await connection.query(`
      INSERT INTO transactions (transaction_id, Payment_Mode, Payment_Status, Payment_Time) VALUES
      (1, 'UPI', 'Completed', '2025-11-10 11:15:00'),
      (2, 'Net Banking', 'Completed', '2025-11-15 14:30:00'),
      (3, 'UPI', 'Completed', '2025-10-20 10:00:00'),
      (4, 'Credit Card', 'Completed', '2025-11-02 09:45:00'),
      (5, 'Net Banking', 'Completed', '2025-12-05 16:00:00'),
      (6, 'UPI', 'Completed', '2025-12-10 11:30:00'),
      (7, 'Debit Card', 'Completed', '2026-01-12 10:00:00'),
      (8, 'UPI', 'Completed', '2026-01-18 15:00:00'),
      (9, 'Credit Card', 'Completed', '2026-01-25 09:00:00'),
      (10, 'Net Banking', 'Completed', '2026-02-02 14:00:00'),
      (11, 'Net Banking', 'Completed', '2026-02-08 10:30:00'),
      (12, 'UPI', 'Completed', '2026-02-15 12:00:00'),
      (13, 'Debit Card', 'Completed', '2026-02-22 11:00:00'),
      (14, 'UPI', 'Completed', '2026-03-01 10:00:00'),
      (15, 'Credit Card', 'Completed', '2026-03-08 09:30:00');
    `);

    // 14. Donation
    console.log("Seeding Donation...");
    await connection.query("DELETE FROM Donation;");
    await connection.query(`
      INSERT INTO Donation (Donation_ID, Donor_ID, Project_ID, transaction_id, Amount, Message, Donation_Date) VALUES
      (1, 4, 1, 1, 25000.00, 'Happy to give back to MANIT. Smart classrooms for smart juniors!', '2025-11-10 11:16:00'),
      (2, 5, 1, 2, 50000.00, 'Modern infrastructure makes better engineers. Keep building, MANIT!', '2025-11-15 14:31:00'),
      (3, 6, 2, 3, 75000.00, 'Wishing this helps deserving students reach their full potential.', '2025-10-20 10:01:00'),
      (4, 8, 2, 4, 100000.00, 'Investing in engineering talent is the highest ROI. Best wishes!', '2025-11-02 09:46:00'),
      (5, 8, 3, 5, 50000.00, 'Knowledge is power. Every student deserves top tier research access.', '2025-12-05 16:01:00'),
      (6, 9, 3, 6, 40000.00, 'Library hours molded my career. Happy to help expand digital catalogs.', '2025-12-10 11:31:00'),
      (7, 10, 4, 7, 20000.00, 'A healthy campus drives sharp innovations. Go MANIT!', '2026-01-12 10:01:00'),
      (8, 4, 4, 8, 35000.00, 'Sports infrastructure builds exceptional teamwork. Proud to back this.', '2026-01-18 15:01:00'),
      (9, 5, 5, 9, 60000.00, 'Research today, market innovation tomorrow. Accelerate deep tech.', '2026-01-25 09:01:00'),
      (10, 8, 5, 10, 45000.00, 'MANIT research capabilities are growing rapidly. Happy to contribute.', '2026-02-02 14:01:00'),
      (11, 1, 6, 11, 200000.00, 'Institutional support to ensure modern safety for female students.', '2026-02-08 10:31:00'),
      (12, 10, 7, 12, 30000.00, 'Transitioning our campus to zero-emission infrastructure.', '2026-02-15 12:01:00'),
      (13, 7, 8, 13, 50000.00, 'Hoping to see the next big tech startup emerge from MANIT grounds.', '2026-02-22 11:01:00'),
      (14, 6, 9, 14, 20000.00, 'High speed networks across labs are mission critical.', '2026-03-01 10:01:00'),
      (15, 9, 10, 15, 15000.00, 'Ensuring sudden healthcare medical shocks do not halt a student journey.', '2026-03-08 09:31:00');
    `);

    // 15. Post
    console.log("Seeding Post...");
    await connection.query("DELETE FROM Post;");
    await connection.query(`
      INSERT INTO Post (Post_ID, User_ID, Content, Image_URL, Created_At, Likes_Count, Comment_Count) VALUES
      (1, 4, 'Excited to share that I have been promoted to Senior Software Engineer at Google! It has been an incredible journey since graduating from MANIT in 2018. Grateful for every professor who pushed me to think harder. Keep grinding, juniors!', 'posts/rahul_promotion.jpg', '2026-04-20 10:30:00', 87, 3),
      (2, 5, 'Just wrapped up a successful product launch at Flipkart. Great products are born from deeply understanding your users, not from following trends. Proud of my cross-functional team for shipping this on schedule.', NULL, '2026-03-15 14:00:00', 63, 2),
      (3, 6, 'Thrilled to share that I am now leading the EV chassis design project at Tata Motors. The future of mobility is electric and I am building it! #EVRevolution #TataMotors', 'posts/arjun_ev.jpg', '2026-02-28 09:00:00', 112, 2),
      (4, 7, 'My research paper on Transformer-based models for medical image segmentation has been accepted at IEEE EMBC 2026! Hard work and late nights finally paid off. Thank you MANIT professors for the research foundation.', 'posts/sneha_paper.jpg', '2026-03-10 11:00:00', 145, 2),
      (5, 8, 'Looking for talented SDE II and SDE III engineers to join our Infosys cloud team in Gurgaon. Competitive packages. DM me or check the job postings section on CollegeConnect.', NULL, '2026-04-05 09:30:00', 54, 2),
      (6, 9, 'Completed my first full year at Amazon! Tip for freshers: be comfortable with ambiguity, ask good questions, and never stop shipping. The learning curve is steep but absolutely worth every bit.', 'posts/ananya_amazon.jpg', '2026-05-01 10:00:00', 98, 1),
      (7, 10, 'There are no words to describe watching our launch vehicle lift off from Sriharikota carrying the satellite our telemetry team helped build. Proud to be part of ISRO.', 'posts/rohit_isro.jpg', '2026-01-05 18:00:00', 234, 1),
      (8, 11, 'Just cleared all three rounds of the Amazon SDE internship online assessment! Moving to the HR interview next week. MANIT placement coaching has been an absolute game changer.', NULL, '2026-04-18 20:00:00', 72, 1),
      (9, 20, 'Final-year student looking for referrals to SDE roles starting July 2026. CGPA 8.9, strong DSA, MERN stack, one internship. Happy to share my resume with anyone who can help. Thank you!', 'posts/tanmay_resume.jpg', '2026-04-22 11:00:00', 45, 1),
      (10, 13, 'Our MANIT team placed 2nd at the National Hackathon 2026! We built an AI crop disease detection app using computer vision and deployed it on an IoT device. Huge thanks to our faculty!', 'posts/kavya_hackathon.jpg', '2026-02-16 22:00:00', 189, 0),
      (11, 15, 'GATE 2026 result: 98.7 percentile! Applying for M.Tech at IIT Bombay and IIT Delhi. If you are preparing for GATE, consistency is the absolute key.', 'posts/pooja_gate.jpg', '2026-03-18 12:00:00', 210, 0),
      (12, 17, 'Just earned my AWS Cloud Practitioner certification! Cloud is the future and I am ready for it. Next target: AWS Solutions Architect Associate.', 'posts/divya_aws.jpg', '2026-04-12 09:00:00', 56, 0),
      (13, 12, 'Wrapped up my summer internship at Mahindra in Pune. Worked on real automotive manufacturing workflows, not just simulator files. Incredible experience.', 'posts/nikhil_intern.jpg', '2026-05-30 14:00:00', 43, 0),
      (14, 14, 'Semester 1 done - SGPA: 9.2! MANIT is everything I hoped for. Brilliant professors and incredibly helpful seniors. Looking forward to the next modules!', NULL, '2026-01-02 16:45:00', 38, 0),
      (15, 2, 'Attention Students: The registration portal for the upcoming Tech Career Fair 2026 closes tonight. Ensure your updated resumes are uploaded into the database profiles.', 'posts/admin_fair.jpg', '2026-03-04 09:00:00', 49, 1);
    `);

    // 16. Post_Comment
    console.log("Seeding Post_Comment...");
    await connection.query("DELETE FROM Post_Comment;");
    await connection.query(`
      INSERT INTO Post_Comment (Comment_ID, Post_ID, User_ID, Comment, Comment_Date) VALUES
      (1, 1, 11, 'Heartiest congratulations Rahul sir! Truly an inspiration for all of us in the CSE wing.', '2026-04-20 11:15:00'),
      (2, 1, 7, 'Great going Rahul! Well deserved promotion, let\\'s catch up soon.', '2026-04-20 12:00:00'),
      (3, 1, 1, 'Proud moment for Maulana Azad National Institute of Technology. Congratulations Rahul!', '2026-04-20 14:30:00'),
      (4, 2, 13, 'Fascinating perspective Priya ma\\'am. How do you balance user insight metrics with technical limitations?', '2026-03-15 15:20:00'),
      (5, 2, 9, 'Completely agree Priya! Empathy maps are much more powerful than simple dashboard tracking metrics.', '2026-03-15 16:40:00'),
      (6, 3, 12, 'Amazing work Arjun sir! Can you share what core testing matrices are run for sub-assembly configurations?', '2026-02-28 10:10:00'),
      (7, 3, 6, 'We focus on rigorous vibration isolation tests and high cycle fatigue distributions.', '2026-02-28 11:30:00'),
      (8, 4, 11, 'This is highly innovative work Sneha di! Is the codebase public on GitHub yet?', '2026-03-10 12:15:00'),
      (9, 4, 2, 'Excellent research output Sneha. This sets a strong standard for departmental projects.', '2026-03-10 14:00:00'),
      (10, 5, 20, 'Interested in SDE II Cloud tracks sir. Sent you my detailed resume via direct messages.', '2026-04-05 10:15:00'),
      (11, 5, 15, 'Do you have matching internship positions open for immediate 2026 grads?', '2026-04-05 11:00:00'),
      (12, 6, 11, 'Stellar tips Ananya di. Navigating corporate environments looks very exciting.', '2026-05-01 11:45:00'),
      (13, 7, 13, 'Watching an ISRO launch window execute is a pure dream. Huge respect for your work Rohit sir!', '2026-01-05 19:30:00'),
      (14, 8, 4, 'Excellent milestones Aisha. Keep pushing hard through the system design concepts!', '2026-04-18 21:05:00'),
      (15, 15, 20, 'Is it mandatory to wear academic codes or formal suits for the morning alignment?', '2026-03-04 10:12:00');
    `);

    // 17. Post_Like
    console.log("Seeding Post_Like...");
    await connection.query("DELETE FROM Post_Like;");
    await connection.query(`
      INSERT INTO Post_Like (Post_ID, User_ID, Liked_At) VALUES
      (1, 11, '2026-04-20 10:35:00'),
      (1, 7, '2026-04-20 10:42:00'),
      (1, 15, '2026-04-20 11:10:00'),
      (2, 13, '2026-03-15 14:15:00'),
      (2, 9, '2026-03-15 14:50:00'),
      (3, 12, '2026-02-28 09:12:00'),
      (3, 4, '2026-02-28 09:45:00'),
      (4, 11, '2026-03-10 11:05:00'),
      (4, 2, '2026-03-10 11:30:00'),
      (5, 20, '2026-04-05 09:45:00'),
      (6, 11, '2026-05-01 10:12:00'),
      (7, 13, '2026-01-05 18:20:00'),
      (8, 4, '2026-04-18 20:15:00'),
      (9, 7, '2026-04-22 11:30:00'),
      (15, 16, '2026-03-04 09:15:00');
    `);

    // 18. Job_Postings
    console.log("Seeding Job_Postings...");
    await connection.query("DELETE FROM Job_Postings;");
    await connection.query(`
      INSERT INTO Job_Postings (Job_ID, Posted_By, Job_Title, Company_Name, Location, Description, Application_Link, Apply_From, Apply_To, Created_At) VALUES
      (1, 4, 'Software Development Engineer II', 'Google', 'Bengaluru, India', 'Join the Core Infrastructure group building highly resilient storage engines handling petabyte workloads.', 'https://careers.google.com/jobs/sde2-core', '2026-05-10', '2026-07-31', '2026-05-10 10:00:00'),
      (2, 5, 'Associate Product Manager', 'Flipkart', 'Bengaluru, India', 'Own search filters and checkout enhancements to increase cart conversions across tier-2 cities.', 'https://careers.flipkart.com/apm-checkout', '2026-05-12', '2026-07-15', '2026-05-12 11:30:00'),
      (3, 6, 'EV Powertrain Design Engineer', 'Tata Motors', 'Pune, India', 'Lead cell structural configuration and design battery thermal housing systems.', 'https://tatamotors.com/careers/ev-powertrain', '2026-05-14', '2026-06-30', '2026-05-14 09:00:00'),
      (4, 7, 'Junior Data Scientist', 'Microsoft', 'Noida, India', 'Train and fine-tune localized language translation LLMs tailored for conversational customer service bots.', 'https://careers.microsoft.com/nlp-data-science', '2026-05-18', '2026-08-15', '2026-05-18 14:00:00'),
      (5, 8, 'Cloud Infrastructure Architect', 'Infosys', 'Gurgaon, India', 'Design large multi-tenant cluster migrations moving from legacy metal configurations to hybrid AWS infrastructure.', 'https://infosys.com/careers/cloud-architect', '2026-05-20', '2026-07-20', '2026-05-20 10:30:00'),
      (6, 9, 'Software Development Engineer I', 'Amazon', 'Hyderabad, India', 'Maintain regional payment checkout gateways and optimize transaction latency performance curves.', 'https://amazon.jobs/sde1-checkout-hyd', '2026-05-22', '2026-06-25', '2026-05-22 09:00:00'),
      (7, 4, 'Site Reliability Engineer', 'Google', 'Bengaluru, India', 'Maintain continuous service availability metrics across transactional payment systems.', 'https://careers.google.com/sre-systems', '2026-04-01', '2026-05-30', '2026-04-01 10:00:00'),
      (8, 5, 'Business Data Analyst', 'Flipkart', 'Bengaluru, India', 'Build complex automated dashboards to monitor fulfillment warehouse latency across states.', 'https://careers.flipkart.com/analyst-ops', '2026-03-10', '2026-05-15', '2026-03-10 11:00:00'),
      (9, 1, 'Graduate Engineer Trainee (Core)', 'L&T Construction', 'Bhopal, India', 'Supervise infrastructure assembly lines, bridge reinforcement concrete mixes, and site schedules.', 'https://larsentoubro.com/get-recruitment-2026', '2026-05-25', '2026-07-10', '2026-05-25 09:30:00'),
      (10, 2, 'Research Associate - Data Engineering', 'MANIT Research Cell', 'Bhopal, India', 'Clean, structure, and model geospatial water toxicity feeds gathered from IoT installations.', 'https://manit.ac.in/research-recruitment', '2026-05-28', '2026-08-01', '2026-05-28 11:00:00'),
      (11, 7, 'Machine Learning Engineer', 'Swiggy', 'Bengaluru, India', 'Optimize route recommendation systems using sequential spatial neural layers.', 'https://careers.swiggy.com/mle-delivery', '2026-06-01', '2026-07-25', '2026-06-01 09:00:00'),
      (12, 6, 'QA Engineer - Assembly Validation', 'Mahindra Electric', 'Pune, India', 'Draft and execute environmental tolerances protocols across custom battery packaging lines.', 'https://mahindra.com/careers/qa-ev', '2026-06-02', '2026-07-18', '2026-06-02 10:00:00'),
      (13, 10, 'Firmware Developer', 'BoAt Lifestyle', 'Noida, India', 'Write clean audio codec driver code for next-gen Bluetooth acoustic wearables.', 'https://boat.lifestyle/careers/firmware-dev', '2026-06-03', '2026-07-22', '2026-06-03 14:30:00'),
      (14, 8, 'Full Stack Engineer (MERN)', 'Zomato', 'Gurgaon, India', 'Refactor restaurant owner dashboards to reduce render cycles on weak cellular connections.', 'https://careers.zomato.com/fullstack-merchant', '2026-06-04', '2026-07-28', '2026-06-04 09:00:00'),
      (15, 9, 'Backend Developer (Spring Boot)', 'Oracle', 'Hyderabad, India', 'Construct cloud security compliance loggers processing thousands of access keys hourly.', 'https://oracle.com/careers/java-backend-security', '2026-06-04', '2026-07-30', '2026-06-04 11:00:00');
    `);

    // 19. OTP_Verification
    console.log("Seeding OTP_Verification...");
    await connection.query("DELETE FROM OTP_Verification;");
    await connection.query(`
      INSERT INTO OTP_Verification (OTP_ID, Email, OTP_Code, Purpose, Created_At, Expires_At, Is_Used) VALUES
      (1, 'aisha.khan@student.manit.ac.in', '482910', 'signup', '2026-06-04 12:00:00', '2026-06-04 12:15:00', 1),
      (2, 'nikhil.sharma@student.manit.ac.in', '903184', 'signup', '2026-06-04 12:50:00', '2026-06-04 13:05:00', 1),
      (3, 'kavya.nair@student.manit.ac.in', '274910', 'signup', '2026-06-04 14:07:00', '2026-06-04 14:22:00', 1),
      (4, 'rahul.sharma@gmail.com', '109384', 'reset_password', '2026-06-04 15:25:00', '2026-06-04 15:40:00', 1),
      (5, 'priya.mehta@yahoo.com', '883921', 'reset_password', '2026-06-04 15:57:00', '2026-06-04 16:12:00', 1),
      (6, 'ravi.tiwari@student.manit.ac.in', '665109', 'signup', '2026-06-04 16:46:00', '2026-06-04 17:01:00', 1),
      (7, 'pooja.yadav@student.manit.ac.in', '451298', 'signup', '2026-06-04 18:15:00', '2026-06-04 18:30:00', 1),
      (8, 'arjun.patel@hotmail.com', '392014', 'reset_password', '2026-06-04 19:00:00', '2026-06-04 19:15:00', 1),
      (9, 'sneha.gupta@gmail.com', '785123', 'signup', '2026-06-04 19:45:00', '2026-06-04 20:00:00', 1),
      (10, 'amit.singh@student.manit.ac.in', '124987', 'signup', '2026-06-04 20:30:00', '2026-06-04 20:45:00', 1),
      (11, 'divya.joshi@student.manit.ac.in', '983421', 'signup', '2026-06-04 20:55:00', '2026-06-04 21:10:00', 0),
      (12, 'siddharth.roy@student.manit.ac.in', '551204', 'signup', '2026-06-04 21:15:00', '2026-06-04 21:30:00', 1),
      (13, 'vikram.singh@outlook.com', '432109', 'reset_password', '2026-06-04 21:45:00', '2026-06-04 22:00:00', 1),
      (14, 'priyanka.das@student.manit.ac.in', '881204', 'signup', '2026-06-04 22:00:00', '2026-06-04 22:15:00', 1),
      (15, 'tanmay.mishra@student.manit.ac.in', '310948', 'signup', '2026-06-04 22:15:00', '2026-06-04 22:30:00', 1);
    `);

    await connection.query("SET FOREIGN_KEY_CHECKS = 1;");
    console.log("\n🎉 ALL TABLES SEEDED SUCCESSFULLY INTO TIDB CLOUD!");

    // Verification Summary
    const tables = [
      "User_Type_Table", "User_Table", "Admin_Table", "Student_Table",
      "Alumni_Table", "User_Settings", "User_Connection", "Chat_Message",
      "Event_Table", "Event_Registration", "News", "project",
      "transactions", "Donation", "Post", "Post_Comment",
      "Post_Like", "Job_Postings", "OTP_Verification"
    ];

    console.log("\n--- Verification Summary ---");
    for (const tbl of tables) {
      const [rows] = await connection.query(`SELECT COUNT(*) as cnt FROM ${tbl}`);
      console.log(`Table ${tbl.padEnd(20)}: ${rows[0].cnt} rows`);
    }

  } catch (err) {
    console.error("❌ Seed failed:", err);
  } finally {
    await connection.end();
  }
}

runSeed();
