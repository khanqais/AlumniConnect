const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");
const jwt = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");

// ✅ IMPORT USER MODEL
const User = require("./models/User");

dotenv.config();
connectDB();

const app = express();

/* ============================
   MIDDLEWARE
============================ */
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* ============================
   HTTP + SOCKET SERVER
============================ */
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

/* ============================
   UPLOADS
============================ */
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

/* ============================
   ROUTES
============================ */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/resources", require("./routes/resourceRoutes"));
app.use("/api/blogs", require("./routes/blogRoutes"));
app.use("/api/questions", require("./routes/questionRoutes"));
//app.use("/api/webinars", require("./routes/webinarRoutes"));


/* ============================
   HEALTH CHECK
============================ */
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

/* ============================
   SOCKET AUTH MIDDLEWARE
============================ */
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = user;
    next();
  } catch (err) {
    console.error("❌ Socket auth error:", err.message);
    next(new Error("Authentication failed"));
  }
});


/* ============================
   SOCKET EVENTS
============================ */
io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.user.name);

  // socket.on("join-room", (roomId) => {
  //   socket.join(roomId);
  //   console.log(`${socket.user.name} joined room ${roomId}`);

  //   socket.to(roomId).emit("user-connected", {
  //     userId: socket.user._id,
  //     name: socket.user.name,
  //     role: socket.user.role,
  //   });
  // });
  socket.on("join-room", (roomId) => {
  socket.join(roomId);

  const clients = io.sockets.adapter.rooms.get(roomId);
  const count = clients ? clients.size : 0;

  if (count === 1) {
    socket.emit("initiator");
  } else if (count === 2) {
    socket.to(roomId).emit("ready");
  }
});


  // socket.on("offer", ({ room, offer }) => {
  //   socket.to(room).emit("offer", { offer });
  // });

  // socket.on("answer", ({ room, answer }) => {
  //   socket.to(room).emit("answer", { answer });
  // });

  // socket.on("ice-candidate", ({ room, candidate }) => {
  //   socket.to(room).emit("ice-candidate", { candidate });
  // });

  socket.on("offer", ({ roomId, offer }) => {
  socket.to(roomId).emit("offer", { offer });
});

socket.on("answer", ({ roomId, answer }) => {
  socket.to(roomId).emit("answer", { answer });
});

socket.on("ice-candidate", ({ roomId, candidate }) => {
  socket.to(roomId).emit("ice-candidate", { candidate });
});

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.user.name);
  });
  socket.on("chat-message", ({ roomId, message }) => {
  socket.to(roomId).emit("chat-message", message);
});

socket.on("call-started", ({ roomId }) => {
  socket.to(roomId).emit("call-started");
});

socket.on("call-ended", ({ roomId }) => {
  socket.to(roomId).emit("call-ended");
});

});

/* ============================
   START SERVER  (IMPORTANT)
============================ */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});