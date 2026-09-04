# 🎓 CollegeConnect

A modern, full-stack platform designed to bridge the gap between students, alumni, and administrators. Built with a robust Express backend and an interactive, premium React frontend.

---

## 🚀 Key Features

*   **🔒 Security First**: Robust JWT-based token authentication with automatic token refresh lifecycle and password strength enforcement.
*   **🧑‍🎓 Profile Management**: Unified profile settings and visibility configurations for Alumni, Students, and Admins.
*   **🤝 Networking & Connections**: Send connection requests, manage accepted connections, and search the directory.
*   **💬 Real-Time Chat**: Persistent WebSocket-backed real-time chat with online status syncing and message persistence.
*   **📅 Event Center**: Create events (Admin only) with event signups, participant registry exports, and direct registrations.
*   **💼 Job Portal**: Career opportunity feed allowing alumni and admins to post, edit, and moderate job postings.
*   **📰 Announcements**: Manage college news, dynamic newsletters, and announcements.
*   **💳 Crowdfunding & Donations**: Secure payment gateway integration with Razorpay (supporting a clean simulated sandbox mode for development).
*   **📊 Admin Dashboard**: Dedicated analytics, user moderation, query generation, content flagging, and system health status.

---

## 🛠️ Tech Stack & Architecture

### Backend
*   **Core**: Express.js (v5.x), Node.js
*   **Database**: MySQL (`mysql2` promise-based client)
*   **Auth**: JWT & `bcryptjs`
*   **Sockets**: `socket.io` for real-time networking
*   **Uploads**: `multer` with file size and type whitelists
*   **SMTP**: `nodemailer` with fallback console-logging for local development

### Frontend
*   **Core**: React 19, Vite 7
*   **Styling**: Tailwind CSS v4, Lucide Icons, Framer Motion
*   **Charts**: Recharts for dashboard analytics
*   **Routing**: React Router DOM (v7)

---

## 📦 Getting Started

### Prerequisites
*   Node.js (v20 or higher recommended)
*   MySQL (v8.x recommended) or a Cloud Database instance (e.g. TiDB Cloud)

### 1. Database Setup
Ensure your MySQL instance is running, and initialize the schema:
```bash
# 1. Create a MySQL database (e.g. named CollegeConnect)
# 2. Configure environment variables in backend/.env (see Configuration section below)
# 3. Navigate to backend and run the initialization script:
cd backend
npm run db:init
```

### 2. Run Backend API
```bash
cd backend
npm install
npm run dev     # Starts server with nodemon at http://localhost:5000
```

### 3. Run Frontend Dev Server
```bash
cd frontend
npm install
npm run dev     # Starts Vite development server at http://localhost:5173
```

### 🐳 Using Docker Compose
Alternatively, launch the entire application (MySQL database, Express Backend, and React Frontend) instantly using Docker:
```bash
docker-compose up --build
```

---

## ⚙️ Configuration (.env)

### Backend Configuration (`backend/.env`)
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
APP_NAME="CollegeConnect"

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=CollegeConnect
DB_SSL=false

# Authentication Secrets
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_REFRESH_SECRET=your_refresh_secret_key_change_in_production

# Razorpay Configuration (Donations)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# SMTP Email Configuration
SMTP_HOST=smtp.your-email-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM="CollegeConnect" <noreply@yourdomain.com>
```

### Frontend Configuration (`frontend/.env`)
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## 🛡️ Coding Guidelines

1.  **CommonJS Modules on Backend**: Keep using `require()` and `module.exports` in `backend/`.
2.  **ES Modules on Frontend**: Keep using `import`/`export` in `frontend/`.
3.  **Clean SQL Queries**: Always use parameterized queries `[query, [params]]` via the connection pool (`backend/src/config/db.js`) to prevent SQL Injection.
4.  **Tailwind CSS Version 4**: Follow v4 utility classes and configuration patterns when styling frontend layouts.
5.  **Preserve Context**: Always retain comments, error handling, and clean log formats when modifying existing files.