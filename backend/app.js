// // const express = require('express');
// // const dotenv = require('dotenv');
// // const cors = require('cors');
// // const path = require('path');
// // const fs = require('fs');
// // const connectDB = require('./config/db');
// // const jwt = require("jsonwebtoken");
// // const http = require("http");
// // const { Server } = require("socket.io");

// // dotenv.config();

// // // Connect to database
// // connectDB();

// // const app = express();

// // // Middleware
// // app.use(cors());
// // app.use(express.json());
// // app.use(express.urlencoded({ extended: false }));

// // const server = http.createServer(app);
// //  const io = new Server(server, { cors: { origin: "*",  methods: ["GET", "POST"] } });

// // // Create uploads folder if it doesn't exist
// // const uploadsDir = path.join(__dirname, 'uploads');
// // if (!fs.existsSync(uploadsDir)) {
// //     fs.mkdirSync(uploadsDir, { recursive: true });
// //     console.log('✅ Uploads folder created');
// // }

// // // Static folder for uploads with error handling
// // app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // // Routes
// // app.use('/api/auth', require('./routes/authRoutes'));
// // app.use('/api/profile', require('./routes/profileRoutes'));
// // app.use('/api/admin', require('./routes/adminRoutes'));
// // app.use('/api/resources', require('./routes/resourceRoutes'));
// // app.use('/api/blogs', require('./routes/blogRoutes'));
// // app.use('/api/questions', require('./routes/questionRoutes'));

// // // Health check
// // app.get('/health', (req, res) => {
// //     res.json({ status: 'OK', message: 'Server is running' });
// // });

// // // Handle 404 for missing files
// // app.use((req, res, next) => {
// //     if (req.path.startsWith('/uploads/')) {
// //         return res.status(404).json({ message: 'File not found' });
// //     }
// //     next();
// // });

// // io.use(async (socket, next) => { try { const token = socket.handshake.auth.token;
// //      if (!token) return 
// //      next(new Error("No token provided")); 
// //      const decoded = jwt.verify(token, process.env.JWT_SECRET); 
// //      const user = await User.findById(decoded.id);
// //       if (!user) return next(new Error("User not found")); 
// //       socket.user = user; 
// //      } catch (err) { next(new Error("Authentication error")); } });

// // io.on("connection", (socket) => {
// //   console.log("User connected:", socket.user.name, socket.user._id);

// //   socket.on("join-room", (roomId) => {
// //     socket.join(roomId);

// //     socket.to(roomId).emit("user-connected", {
// //       userId: socket.user._id,
// //       name: socket.user.name,
// //       role: socket.user.role,
// //     });

// //     socket.on("disconnect", () => {
// //       socket.to(roomId).emit("user-disconnected", {
// //         userId: socket.user._id,
// //       });
// //     });
// //   });

// //   socket.on("offer", (data) => { socket.to(data.room).emit("offer", { from: socket.user._id, offer: data.offer, }); });

// // socket.on("answer", (data) => { socket.to(data.room).emit("answer", { from: socket.user._id, answer: data.answer, }); });

// // socket.on("ice-candidate", (data) => { socket.to(data.room).emit("ice-candidate", { from: socket.user._id, candidate: data.candidate, }); });
// // });



// // // Error handling middleware
// // app.use((err, req, res, next) => {
// //     console.error(err.stack);
// //     res.status(500).json({ message: 'Something went wrong!' });
// // });

// // const PORT = process.env.PORT || 5000;

// // app.listen(PORT, () => {
// //     console.log(`🚀 Server started on port ${PORT}`);
// // });
// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const path = require("path");
// const fs = require("fs");
// const connectDB = require("./config/db");
// const jwt = require("jsonwebtoken");
// const http = require("http");
// const { Server } = require("socket.io");

// // ✅ IMPORT USER MODEL (CRITICAL)
// const User = require("./models/User"); // adjust path if needed

// dotenv.config();
// connectDB();

// const app = express();

// // Middleware
// app.use(cors({ origin: "*" }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// // HTTP + SOCKET SERVER
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// // Uploads folder
// const uploadsDir = path.join(__dirname, "uploads");
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }
// app.use("/uploads", express.static(uploadsDir));

// // Routes
// app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/profile", require("./routes/profileRoutes"));
// app.use("/api/admin", require("./routes/adminRoutes"));
// app.use("/api/resources", require("./routes/resourceRoutes"));
// app.use("/api/blogs", require("./routes/blogRoutes"));
// app.use("/api/questions", require("./routes/questionRoutes"));

// // Health check
// app.get("/health", (req, res) => {
//   res.json({ status: "OK" });
// });

// /* ============================
//    SOCKET AUTH MIDDLEWARE
// ============================ */
// io.use(async (socket, next) => {
//   try {
//     const token = socket.handshake.auth.token;
//     if (!token) return next(new Error("No token"));

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id).select("-password");

//     if (!user) return next(new Error("User not found"));

//     socket.user = user;
//     next();
//   } catch (err) {
//     console.error("Socket auth error:", err.message);
//     next(new Error("Authentication failed"));
//   }
// });

// /* ============================
//    SOCKET EVENTS
// ============================ */
// io.on("connection", (socket) => {
//   console.log("✅ Socket connected:", socket.user.name);

//   socket.on("join-room", (roomId) => {
//     socket.join(roomId);
//     console.log(`${socket.user.name} joined room ${roomId}`);

//     socket.to(roomId).emit("user-connected", {
//       userId: socket.user._id,
//       name: socket.user.name,
//       role: socket.user.role,
//     });
//   });

//   socket.on("offer", ({ room, offer }) => {
//     socket.to(room).emit("offer", { offer });
//   });

//   socket.on("answer", ({ room, answer }) => {
//     socket.to(room).emit("answer", { answer });
//   });

//   socket.on("ice-candidate", ({ room, candidate }) => {
//     socket.to(room).emit("ice-candidate", { candidate });
//   });

//   socket.on("disconnect", () => {
//     console.log("❌ Socket disconnected:", socket.user.name);
//   });
// });

// // ❗ IMPORTANT: USE server.listen (NOT app.listen)
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });
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
app.use("/api/recommend", require("./routes/recommendationRoutes"));
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

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`${socket.user.name} joined room ${roomId}`);

    socket.to(roomId).emit("user-connected", {
      userId: socket.user._id,
      name: socket.user.name,
      role: socket.user.role,
    });
  });

  socket.on("offer", ({ room, offer }) => {
    socket.to(room).emit("offer", { offer });
  });

  socket.on("answer", ({ room, answer }) => {
    socket.to(room).emit("answer", { answer });
  });

  socket.on("ice-candidate", ({ room, candidate }) => {
    socket.to(room).emit("ice-candidate", { candidate });
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.user.name);
  });
  socket.on("chat-message", ({ room, message }) => {
  socket.to(room).emit("chat-message", message);
});

socket.on("call-started", ({ room }) => {
  socket.to(room).emit("call-started");
});

socket.on("call-ended", ({ room }) => {
  socket.to(room).emit("call-ended");
});

});

/* ============================
   START SERVER  (IMPORTANT)
============================ */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
