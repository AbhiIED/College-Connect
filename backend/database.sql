-- ============================================================
-- CollegeConnect - Complete Fresh Database Schema
-- ============================================================
-- This script DROPS all existing tables and recreates them
-- with 0 records. All data will be permanently deleted.
--
-- Usage:  mysql -u root -p < database.sql
-- ============================================================

DROP DATABASE IF EXISTS CollegeConnect;
CREATE DATABASE CollegeConnect;
USE CollegeConnect;

-- ============================================================
-- 1. User_Type_Table  (lookup / reference table)
-- ============================================================
CREATE TABLE IF NOT EXISTS User_Type_Table (
    User_Type_ID   INT            PRIMARY KEY AUTO_INCREMENT,
    User_Type_name VARCHAR(50)    NOT NULL UNIQUE
);

-- Seed the three roles used in the app
INSERT INTO User_Type_Table (User_Type_ID, User_Type_name) VALUES
    (1, 'Alumni'),
    (2, 'Student'),
    (3, 'Admin');

-- ============================================================
-- 2. User_Table
-- ============================================================
CREATE TABLE IF NOT EXISTS User_Table (
    User_ID      INT            PRIMARY KEY AUTO_INCREMENT,
    User_Type_ID INT            NOT NULL,
    User_Fname   VARCHAR(100)   NOT NULL,
    User_Lname   VARCHAR(100)   NOT NULL,
    Gender       VARCHAR(20),
    Phone_no     VARCHAR(20),
    Phone_no_2   VARCHAR(20),
    Email_ID     VARCHAR(150)   NOT NULL UNIQUE,
    Password     VARCHAR(255)   NOT NULL,
    Address      TEXT,
    Profile_Pic  VARCHAR(255)   DEFAULT NULL,
    Is_Verified  TINYINT(1)     DEFAULT 0,
    FOREIGN KEY (User_Type_ID) REFERENCES User_Type_Table(User_Type_ID)
);

-- ============================================================
-- 3. Admin_Table
-- ============================================================
CREATE TABLE IF NOT EXISTS Admin_Table (
    Admin_ID  INT            PRIMARY KEY,
    User_ID   INT            NOT NULL UNIQUE,
    Role      VARCHAR(100)   DEFAULT 'Administrator',
    FOREIGN KEY (User_ID) REFERENCES User_Table(User_ID) ON DELETE CASCADE
);

-- ============================================================
-- 4. Student_Table
-- ============================================================
CREATE TABLE IF NOT EXISTS Student_Table (
    Student_ID      INT            PRIMARY KEY AUTO_INCREMENT,
    Scholar_No      VARCHAR(50),
    User_ID         INT            NOT NULL UNIQUE,
    Department      VARCHAR(100),
    Course          VARCHAR(100),
    Current_Year    INT,
    Graduation_Year INT,
    FOREIGN KEY (User_ID) REFERENCES User_Table(User_ID) ON DELETE CASCADE
);

-- ============================================================
-- 5. Alumni_Table
-- ============================================================
CREATE TABLE IF NOT EXISTS Alumni_Table (
    Alumni_ID        INT            PRIMARY KEY,
    User_ID          INT            NOT NULL UNIQUE,
    Enrollment_No    VARCHAR(50),
    Department       VARCHAR(100),
    Course           VARCHAR(100),
    Graduation_Year  INT,
    Job_Title        VARCHAR(150),
    Company_Name     VARCHAR(150),
    Current_City     VARCHAR(100),
    Current_Country  VARCHAR(100),
    Sector           VARCHAR(100),
    Skills           TEXT,
    About            TEXT,
    FOREIGN KEY (User_ID) REFERENCES User_Table(User_ID) ON DELETE CASCADE
);

-- ============================================================
-- 6. User_Settings  (NEW - profile preferences & privacy)
-- ============================================================
CREATE TABLE IF NOT EXISTS User_Settings (
    Setting_ID         INT            PRIMARY KEY AUTO_INCREMENT,
    User_ID            INT            NOT NULL UNIQUE,
    Profile_Visibility ENUM('public', 'private') DEFAULT 'public',
    Show_Branch        TINYINT(1)     DEFAULT 1,
    Show_Batch         TINYINT(1)     DEFAULT 1,
    Show_Location      TINYINT(1)     DEFAULT 1,
    Show_Workplace     TINYINT(1)     DEFAULT 1,
    Show_Experience    TINYINT(1)     DEFAULT 1,
    Notifications      TINYINT(1)     DEFAULT 1,
    Connect_Requests   TINYINT(1)     DEFAULT 1,
    Info_Protection    TINYINT(1)     DEFAULT 1,
    Updated_At         DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (User_ID) REFERENCES User_Table(User_ID) ON DELETE CASCADE
);

-- ============================================================
-- 7. User_Connection  (NEW - alumni/student networking)
-- ============================================================
CREATE TABLE IF NOT EXISTS User_Connection (
    Connection_ID    INT            PRIMARY KEY AUTO_INCREMENT,
    Sender_ID        INT            NOT NULL,
    Receiver_ID      INT            NOT NULL,
    Status           ENUM('Pending', 'Accepted', 'Rejected') DEFAULT 'Pending',
    Created_At       DATETIME       DEFAULT CURRENT_TIMESTAMP,
    Updated_At       DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (Sender_ID)   REFERENCES User_Table(User_ID) ON DELETE CASCADE,
    FOREIGN KEY (Receiver_ID) REFERENCES User_Table(User_ID) ON DELETE CASCADE,
    UNIQUE KEY unique_connection (Sender_ID, Receiver_ID)
);

-- ============================================================
-- 8. Chat_Message  (NEW - persistent chat)
-- ============================================================
CREATE TABLE IF NOT EXISTS Chat_Message (
    Message_ID    INT            PRIMARY KEY AUTO_INCREMENT,
    Sender_ID     INT            NOT NULL,
    Receiver_ID   INT            NOT NULL,
    Message       TEXT           NOT NULL,
    Is_Read       TINYINT(1)     DEFAULT 0,
    Sent_At       DATETIME       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Sender_ID)   REFERENCES User_Table(User_ID) ON DELETE CASCADE,
    FOREIGN KEY (Receiver_ID) REFERENCES User_Table(User_ID) ON DELETE CASCADE
);

-- ============================================================
-- 9. Event_Table  (FIXED - Event_ID now AUTO_INCREMENT)
-- ============================================================
CREATE TABLE IF NOT EXISTS Event_Table (
    Event_ID          INT            PRIMARY KEY AUTO_INCREMENT,
    Organizer_ID      INT,
    Event_Name        VARCHAR(255)   NOT NULL,
    Event_Description TEXT,
    Event_Date        DATE           NOT NULL,
    Creation_Date     DATE           DEFAULT (CURDATE()),
    Event_Type        VARCHAR(100),
    Event_Link        VARCHAR(255),
    Event_Location    VARCHAR(255),
    Event_Image       VARCHAR(255),
    FOREIGN KEY (Organizer_ID) REFERENCES User_Table(User_ID) ON DELETE SET NULL
);

-- ============================================================
-- 10. Event_Registration  (NEW - event signups)
-- ============================================================
CREATE TABLE IF NOT EXISTS Event_Registration (
    Registration_ID   INT            PRIMARY KEY AUTO_INCREMENT,
    Event_ID          INT            NOT NULL,
    User_ID           INT,
    Full_Name         VARCHAR(200)   NOT NULL,
    Email             VARCHAR(150)   NOT NULL,
    Phone             VARCHAR(20),
    Graduation_Year   INT,
    Course            VARCHAR(100),
    Registered_At     DATETIME       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Event_ID) REFERENCES Event_Table(Event_ID) ON DELETE CASCADE,
    FOREIGN KEY (User_ID)  REFERENCES User_Table(User_ID)  ON DELETE SET NULL,
    UNIQUE KEY unique_registration (Event_ID, Email)
);

-- ============================================================
-- 11. News  (NEW - dynamic news management)
-- ============================================================
CREATE TABLE IF NOT EXISTS News (
    News_ID         INT            PRIMARY KEY AUTO_INCREMENT,
    Admin_ID        INT,
    Title           VARCHAR(255)   NOT NULL,
    Description     TEXT           NOT NULL,
    Details         TEXT,
    Image_URL       VARCHAR(500),
    Category        VARCHAR(100),
    Published_At    DATETIME       DEFAULT CURRENT_TIMESTAMP,
    Is_Published    TINYINT(1)     DEFAULT 1,
    FOREIGN KEY (Admin_ID) REFERENCES User_Table(User_ID) ON DELETE SET NULL
);

-- ============================================================
-- 12. project  (donation / fundraising projects)
-- ============================================================
CREATE TABLE IF NOT EXISTS project (
    Project_ID          INT            PRIMARY KEY AUTO_INCREMENT,
    User_ID             INT,
    Project_title       VARCHAR(255)   NOT NULL,
    Project_Description TEXT,
    Funds_Required      DECIMAL(12,2)  NOT NULL DEFAULT 0,
    Fund_Raised         DECIMAL(12,2)  DEFAULT 0,
    Category            VARCHAR(100)   NOT NULL,
    Image               VARCHAR(255),
    Project_Status      VARCHAR(50)    DEFAULT 'Ongoing',
    Created_At          DATETIME       DEFAULT CURRENT_TIMESTAMP,
    Start_Date          DATE,
    End_Date            DATE,
    FOREIGN KEY (User_ID) REFERENCES User_Table(User_ID) ON DELETE SET NULL
);

-- ============================================================
-- 13. transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id  INT            PRIMARY KEY AUTO_INCREMENT,
    Payment_Mode    VARCHAR(50),
    Payment_Status  VARCHAR(50)    DEFAULT 'Pending',
    Payment_Time    DATETIME       DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 14. Donation  (FIXED - Donor_ID now references User_Table)
-- ============================================================
CREATE TABLE IF NOT EXISTS Donation (
    Donation_ID     INT            PRIMARY KEY AUTO_INCREMENT,
    Donor_ID        INT,
    Project_ID      INT,
    transaction_id  INT,
    Amount          DECIMAL(12,2)  NOT NULL,
    Message         TEXT,
    Donation_Date   DATETIME       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Donor_ID)       REFERENCES User_Table(User_ID)              ON DELETE SET NULL,
    FOREIGN KEY (Project_ID)     REFERENCES project(Project_ID)              ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id)     ON DELETE SET NULL
);

-- ============================================================
-- 15. Post  (FIXED - User_ID instead of Alumni_ID)
-- ============================================================
CREATE TABLE IF NOT EXISTS Post (
    Post_ID        INT            PRIMARY KEY AUTO_INCREMENT,
    User_ID        INT,
    Content        TEXT           NOT NULL,
    Image_URL      VARCHAR(255),
    Created_At     DATETIME       DEFAULT CURRENT_TIMESTAMP,
    Likes_Count    INT            DEFAULT 0,
    Comment_Count  INT            DEFAULT 0,
    FOREIGN KEY (User_ID) REFERENCES User_Table(User_ID) ON DELETE CASCADE
);

-- ============================================================
-- 16. Post_Comment
-- ============================================================
CREATE TABLE IF NOT EXISTS Post_Comment (
    Comment_ID    INT            PRIMARY KEY AUTO_INCREMENT,
    Post_ID       INT            NOT NULL,
    User_ID       INT            NOT NULL,
    Comment       TEXT           NOT NULL,
    Comment_Date  DATETIME       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Post_ID) REFERENCES Post(Post_ID)       ON DELETE CASCADE,
    FOREIGN KEY (User_ID) REFERENCES User_Table(User_ID) ON DELETE CASCADE
);

-- ============================================================
-- 17. Post_Like  (NEW - track who liked which post)
-- ============================================================
CREATE TABLE IF NOT EXISTS Post_Like (
    Like_ID    INT            PRIMARY KEY AUTO_INCREMENT,
    Post_ID    INT            NOT NULL,
    User_ID    INT            NOT NULL,
    Liked_At   DATETIME       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Post_ID) REFERENCES Post(Post_ID)       ON DELETE CASCADE,
    FOREIGN KEY (User_ID) REFERENCES User_Table(User_ID) ON DELETE CASCADE,
    UNIQUE KEY unique_like (Post_ID, User_ID)
);

-- ============================================================
-- 18. Job_Postings  (FIXED - added Posted_By column)
-- ============================================================
CREATE TABLE IF NOT EXISTS Job_Postings (
    Job_ID            INT            PRIMARY KEY AUTO_INCREMENT,
    Posted_By         INT,
    Job_Title         VARCHAR(255)   NOT NULL,
    Company_Name      VARCHAR(255)   NOT NULL,
    Location          VARCHAR(255)   NOT NULL,
    Description       TEXT           NOT NULL,
    Application_Link  VARCHAR(500),
    Apply_From        DATE           NOT NULL,
    Apply_To          DATE           NOT NULL,
    Created_At        DATETIME       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Posted_By) REFERENCES User_Table(User_ID) ON DELETE SET NULL
);

-- ============================================================
-- 19. OTP_Verification  (NEW - persistent OTP storage)
-- ============================================================
CREATE TABLE IF NOT EXISTS OTP_Verification (
    OTP_ID       INT            PRIMARY KEY AUTO_INCREMENT,
    Email        VARCHAR(150)   NOT NULL,
    OTP_Code     VARCHAR(10)    NOT NULL,
    Purpose      ENUM('signup', 'reset_password') NOT NULL,
    Created_At   DATETIME       DEFAULT CURRENT_TIMESTAMP,
    Expires_At   DATETIME       NOT NULL,
    Is_Used      TINYINT(1)     DEFAULT 0
);

-- ============================================================
-- Indexes (for common query patterns)
-- ============================================================
CREATE INDEX idx_user_email          ON User_Table(Email_ID);
CREATE INDEX idx_alumni_user         ON Alumni_Table(User_ID);
CREATE INDEX idx_student_user        ON Student_Table(User_ID);
CREATE INDEX idx_event_date          ON Event_Table(Event_Date);
CREATE INDEX idx_post_created        ON Post(Created_At);
CREATE INDEX idx_post_comment_post   ON Post_Comment(Post_ID);
CREATE INDEX idx_donation_project    ON Donation(Project_ID);
CREATE INDEX idx_job_created         ON Job_Postings(Created_At);
CREATE INDEX idx_news_published      ON News(Published_At);
CREATE INDEX idx_event_reg_event     ON Event_Registration(Event_ID);
CREATE INDEX idx_conn_receiver       ON User_Connection(Receiver_ID, Status);
CREATE INDEX idx_conn_sender         ON User_Connection(Sender_ID, Status);
CREATE INDEX idx_chat_conversation   ON Chat_Message(Sender_ID, Receiver_ID, Sent_At);
CREATE INDEX idx_chat_unread         ON Chat_Message(Receiver_ID, Is_Read);
CREATE INDEX idx_otp_email_purpose   ON OTP_Verification(Email, Purpose);
CREATE INDEX idx_otp_expiry          ON OTP_Verification(Expires_At);
