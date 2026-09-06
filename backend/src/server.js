const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const path = require("path");
const pool = require("./config/db");
const { cleanupExpiredOTPs } = require("./utils/otpStore");
require("dotenv").config();

const app = express();

// ── Security Headers ────────────────────────────────────
app.use(helmet());

// Trust the first proxy (Nginx / Docker / cloud load-balancer)
// Required for express-rate-limit to see real client IPs
app.set("trust proxy", 1);

// ── Middleware ───────────────────────────────────────────
const allowedOrigins = [];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
} else {
  allowedOrigins.push("http://localhost:5173");
}

const isProduction = process.env.NODE_ENV === "production";

const checkOrigin = (origin, callback) => {
  if (!origin) return callback(null, true);
  const cleanOrigin = origin.replace(/\/$/, "");

  // Always allow configured FRONTEND_URL and Vercel previews
  if (allowedOrigins.includes(cleanOrigin) || cleanOrigin.endsWith(".vercel.app")) {
    return callback(null, true);
  }

  // In development, also allow any localhost origin
  if (!isProduction && cleanOrigin.startsWith("http://localhost:")) {
    return callback(null, true);
  }

  return callback(new Error("Not allowed by CORS"));
};

app.use(
  cors({
    origin: checkOrigin,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Health Check ────────────────────────────────────────
app.get("/", async (req, res) => {
  try {
    const [result] = await pool.query("SELECT NOW() AS time");
    res.send(`Backend API is running 👍 (DB time: ${result[0].time})`);
  } catch (err) {
    console.error("DB Connection Error:", err);
    res.status(500).send("Database connection failed ❌");
  }
});

// ── Import Routes ───────────────────────────────────────
const authRoutes       = require("./routes/authRoutes");
const alumniRoutes     = require("./routes/alumniRoutes");
const postRoutes       = require("./routes/postRoutes");
const feedRoutes       = require("./routes/feedRoutes");
const eventRoutes      = require("./routes/eventRoutes");
const jobRoutes        = require("./routes/jobRoutes");
const donationRoutes   = require("./routes/donationRoutes");
const profileRoutes    = require("./routes/profileRoutes");
const newsRoutes       = require("./routes/newsRoutes");
const connectionRoutes = require("./routes/connectionRoutes");
const chatRoutes       = require("./routes/chatRoutes");
const adminRoutes      = require("./routes/adminRoutes");

// ── Mount Routes ────────────────────────────────────────
app.use("/auth",        authRoutes);
app.use("/alumni",      alumniRoutes);       // GET /alumni, /alumni/hero, /alumni/:id
app.use("/posts",       postRoutes);         // GET/DELETE /posts, comments, likes
app.use("/feeds",       feedRoutes);         // POST /feeds (create post with image)
app.use("/events",      eventRoutes);        // CRUD + /events/:id/register
app.use("/jobs-api",    jobRoutes);          // GET/POST/DELETE jobs
app.use("/donations",   donationRoutes);     // GET projects, Razorpay flow
app.use("/api/user",    profileRoutes);      // Profile, settings, password, pic
app.use("/news",        newsRoutes);         // CRUD news
app.use("/connections", connectionRoutes);   // Send/accept/reject connections
app.use("/chat",        chatRoutes);         // Get/send messages
app.use("/admin",       adminRoutes);        // Dashboard stats, projects, users

// ── Error Handling ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

// ── Periodic OTP Cleanup (every 30 minutes) ─────────────
setInterval(cleanupExpiredOTPs, 30 * 60 * 1000);

// ── Start Server & Configure Socket.io ───────────────────
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: checkOrigin,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
  }
});

// Map of User_ID -> Socket_ID for active connections
const activeUsers = new Map();

io.on("connection", (socket) => {
  console.log(`🔌 Client connected to WebSocket: ${socket.id}`);

  // Register user with their active socket ID and join personal room
  socket.on("register_user", (userId) => {
    if (userId) {
      const uid = String(userId);
      socket.userId = uid;
      socket.join(uid);
      socket.join(`user_${uid}`);
      activeUsers.set(uid, socket.id);
      console.log(`👤 User ${userId} registered with socket ${socket.id} (rooms: ${uid}, user_${uid})`);
    }
  });

  // Persist message to DB and relay in real-time if receiver is online
  socket.on("send_message", async ({ senderId, receiverId, text }) => {
    if (!senderId || !receiverId || !text || !text.trim()) {
      console.warn("⚠️ Invalid send_message payload received:", { senderId, receiverId, text });
      return;
    }

    const cleanSenderId = Number(senderId);
    const cleanReceiverId = Number(receiverId);
    const cleanText = text.trim();
    const sentAt = new Date();

    let insertedId = null;
    // Always persist to database so messages are never lost
    try {
      const [insertResult] = await pool.query(
        `INSERT INTO Chat_Message (Sender_ID, Receiver_ID, Message, Sent_At) VALUES (?, ?, ?, ?)`,
        [cleanSenderId, cleanReceiverId, cleanText, sentAt]
      );
      insertedId = insertResult.insertId;
    } catch (dbErr) {
      console.error(`❌ Failed to persist chat message:`, dbErr.message);
    }

    const payload = {
      Message_ID: insertedId || Date.now(),
      Sender_ID: cleanSenderId,
      Receiver_ID: cleanReceiverId,
      Message: cleanText,
      Is_Read: 0,
      Sent_At: sentAt.toISOString()
    };

    // Relay in real-time to receiver via room and direct socket
    const receiverRoom = io.sockets.adapter.rooms.get(`user_${cleanReceiverId}`);
    const receiverCount = receiverRoom ? receiverRoom.size : 0;
    console.log(`📨 Relaying message from User ${cleanSenderId} to User ${cleanReceiverId} (Receiver active sockets: ${receiverCount})`);

    io.to(`user_${cleanReceiverId}`).to(String(cleanReceiverId)).emit("receive_message", payload);

    // Also sync to other open windows/tabs of the sender
    socket.to(`user_${cleanSenderId}`).to(String(cleanSenderId)).emit("receive_message", payload);
  });

  // Unregister user on disconnect
  socket.on("disconnect", () => {
    if (socket.userId && activeUsers.get(socket.userId) === socket.id) {
      activeUsers.delete(socket.userId);
      console.log(`👤 User ${socket.userId} disconnected.`);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
