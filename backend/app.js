const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");
const jwt = require("jsonwebtoken");
const http = require("http");


const User = require("./models/User");

dotenv.config();

connectDB();


if (!process.env.VERCEL) {
    const { Server } = require("socket.io");
    require("./corn/webinarReminder");
}

const app = express();

const defaultAllowedOrigins = [
  "http://localhost:5173", 
  "http://127.0.0.1:5173",
  "https://alumniconnect-alpha.vercel.app"
];
const envAllowedOrigins = (process.env.FRONTEND_URLS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...envAllowedOrigins])];

const corsOptions = {
  origin: (origin, callback) => {

    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "admin-id", "admin-email"],
};


app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


const server = http.createServer(app);


let io;
if (!process.env.VERCEL) {
    const { Server } = require("socket.io");
    io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });
    

}


if (!process.env.VERCEL) {
    const uploadsDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    app.use("/uploads", express.static(uploadsDir));
}


app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/resources", require("./routes/resourceRoutes"));
app.use("/api/blogs", require("./routes/blogRoutes"));
app.use("/api/questions", require("./routes/questionRoutes"));
app.use("/api/webinars", require("./routes/webinarRoute"));
app.use("/api/availability", require("./routes/availabiltyRoutes"));
app.use("/api/recommend", require("./routes/recommendationRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/feed", require("./routes/feedRoutes"));
app.use("/api/referrals", require("./routes/referralRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use('/api/groups', require('./routes/groupRoutes'));


app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});


if (io) {
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


  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.user.name);

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`${socket.user.name} joined room ${roomId}`);

      const clients = io.sockets.adapter.rooms.get(roomId);
      const count = clients ? clients.size : 0;

      console.log(`Room ${roomId} now has ${count} participant(s)`);

      if (count === 1) {
        socket.emit("initiator");
      } else if (count === 2) {
        socket.to(roomId).emit("ready");
        socket.emit("peer-in-room");
      } else {
        socket.emit("peer-in-room");
        socket.to(roomId).emit("user-joined", {
          userId: socket.user._id,
          name: socket.user.name,
        });
      }
    });

    socket.on("offer", ({ roomId, offer }) => {
      console.log(`Relaying offer to room ${roomId}`);
      socket.to(roomId).emit("offer", { offer });
    });

    socket.on("answer", ({ roomId, answer }) => {
      console.log(`Relaying answer to room ${roomId}`);
      socket.to(roomId).emit("answer", { answer });
    });

    socket.on("ice-candidate", ({ roomId, candidate }) => {
      socket.to(roomId).emit("ice-candidate", { candidate });
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.user.name);
      const rooms = Array.from(socket.rooms);
      rooms.forEach((roomId) => {
        if (roomId !== socket.id) {
          socket.to(roomId).emit("user-left", {
            userId: socket.user._id,
            name: socket.user.name,
          });
        }
      });
    });

    socket.on("chat-message", ({ roomId, message }) => {
      console.log(`Chat message in room ${roomId}:`, message);
      socket.to(roomId).emit("chat-message", message);
    });

  }); // ✅ closes io.on("connection", ...)

} // ✅ closes if (io)


app.get("/", (req, res) => {
  res.send("hii mom");
});


const PORT = process.env.PORT || 5000;


module.exports = app;

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}
