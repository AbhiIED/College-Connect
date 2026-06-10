const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./config/db");
require("dotenv").config();

const app = express();

// ── Middleware ───────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(express.json());
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

// ── Start Server & Configure Socket.io ───────────────────
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
  }
});

// Map of User_ID -> Socket_ID for active connections
const activeUsers = new Map();

io.on("connection", (socket) => {
  console.log(`🔌 Client connected to WebSocket: ${socket.id}`);

  // Register user with their active socket ID
  socket.on("register_user", (userId) => {
    if (userId) {
      activeUsers.set(String(userId), socket.id);
      console.log(`👤 User ${userId} registered with socket ${socket.id}`);
    }
  });

  // Relay message directly in memory to target online user
  socket.on("send_message", ({ senderId, receiverId, text }) => {
    if (!receiverId || !text || !text.trim()) return;

    const receiverSocketId = activeUsers.get(String(receiverId));
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive_message", {
        Sender_ID: senderId,
        Receiver_ID: receiverId,
        Message: text,
        Sent_At: new Date()
      });
      console.log(`📨 Message relayed from User ${senderId} to User ${receiverId} (socket: ${receiverSocketId})`);
    } else {
      console.log(`📨 Message to offline User ${receiverId} discarded (no DB persistence)`);
    }
  });

  // Unregister user on disconnect
  socket.on("disconnect", () => {
    for (let [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        console.log(`👤 User ${userId} disconnected.`);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
