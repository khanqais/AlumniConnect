const express = require("express");
const router = express.Router();
const Webinar = require("../models/Webinar");
const User = require("../models/User");
const { sendWebinarNotificationEmail } = require("../utils/emailService");
const { protect } = require("../middleware/authMiddleware");
const { v4: uuidv4 } = require("uuid");


// Schedule a webinar
// router.post("/schedule", protect, async (req, res) => {
//   try {
//     const {
//       webinarName,
//       date,
//       time,
//       duration,
//       description,
//       platform,
//       maxParticipants,
//       skillsCovered,
//       recordingAllowed,
//       prerequisites,
//     } = req.body;

//     // 🔐 Role check
//     if (req.user.role !== "alumni") {
//       return res.status(403).json({ error: "Only alumni can schedule webinars" });
//     }

//     // 🕒 Combine date + time
//     const scheduledAt = new Date(`${date}T${time}`);

//     const webinar = await Webinar.create({
//       webinarName,
//       scheduledAt,
//       duration,
//       description,
//       platform,
//       maxParticipants,
//       skillsCovered,
//       recordingAllowed,
//       prerequisites,
//       createdBy: req.user._id, // ✅ FIXED
//     });

//     // 📧 Notify students
//     const students = await User.find({ role: "student" });

//     const transporter = nodemailer.createTransport({
//       service: "Gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     await Promise.all(
//       students.map(student => {
//         return transporter.sendMail({
//           from: process.env.EMAIL_USER,
//           to: student.email,
//           subject: `New Webinar Scheduled: ${webinarName}`,
//           html: `
//             <h3>Hello ${student.name}</h3>
//             <p>A new webinar has been scheduled:</p>
//             <ul>
//               <li><strong>Webinar:</strong> ${webinarName}</li>
//               <li><strong>Speaker:</strong> ${req.user.name}</li>
//               <li><strong>Date:</strong> ${date}</li>
//               <li><strong>Time:</strong> ${time}</li>
//               <li><strong>Platform:</strong> ${platform}</li>
//             </ul>
//           `,
//         });
//       })
//     );

//     res.status(201).json({ success: true, webinar });
//   } catch (err) {
//     console.error("❌ Webinar schedule error:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// router.post("/schedule", protect, async (req, res) => {
//   try {
//     const {
//       alumniId,
//       webinarName,
//       date,
//       time,
//       duration,
//       description,
//       platform,
//       maxParticipants,
//       skillsCovered,
//       recordingAllowed,
//       prerequisites,
//     } = req.body;

//     // Combine date + time into scheduledAt
//     const scheduledAt = new Date(`${date}T${time}`);

//     const webinar = await Webinar.create({
//       alumniId,
//       webinarName,
//       scheduledAt,
//       duration,
//       description,
//       platform,
//       maxParticipants,
//       skillsCovered,
//       recordingAllowed,
//       prerequisites,
//     });

//     // Send notifications to all students
//     const students = await User.find({ role: "student" });

//     const transporter = nodemailer.createTransport({
//       service: "Gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     await Promise.all(
//       students.map(student => {
//         const mailOptions = {
//           from: process.env.EMAIL_USER,
//           to: student.email,
//           subject: `New Webinar Scheduled: ${webinarName}`,
//           html: `
//             <h3>Hello ${student.name}</h3>
//             <p>A new webinar has been scheduled:</p>
//             <ul>
//               <li><strong>Webinar:</strong> ${webinarName}</li>
//               <li><strong>Speaker:</strong> ${req.user.name}</li>
//               <li><strong>Date:</strong> ${date}</li>
//               <li><strong>Time:</strong> ${time}</li>
//               <li><strong>Platform:</strong> ${platform}</li>
//             </ul>
//             <p>Please mark your calendar!</p>
//           `,
//         };
//         return transporter.sendMail(mailOptions);
//       })
//     );

//     res.status(201).json({ success: true, webinar });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server Error" });
//   }
// });

// Get all webinars
// router.get("/", protect, async (req, res) => {
//   try {
//     const webinars = await Webinar.find().populate("alumniId", "name email");
//     res.json(webinars);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server Error" });
//   }
// });

router.post("/schedule", protect, async (req, res) => {
  const roomId = `webinar-${uuidv4()}`;
  try {
    const {
      webinarName,
      date,
      time,
      duration,
      description,
      maxParticipants,
      skillsCovered,
      recordingAllowed,
      prerequisites,
    } = req.body;

    // 🔐 Role check
    if (req.user.role !== "alumni") {
      return res
        .status(403)
        .json({ error: "Only alumni can schedule webinars" });
    }

    // 🕒 Combine date + time
    const scheduledAt = new Date(`${date}T${time}`);

    // 📝 Create webinar
    const webinar = await Webinar.create({
      webinarName,
      scheduledAt,
      duration,
      description,

      maxParticipants,
      skillsCovered,
      recordingAllowed,
      prerequisites,
      createdBy: req.user._id, // ✅ alumni id
      roomId:roomId
    });
    // console.log("ROOM ID:", webinar.roomId);


    // 📧 Notify all students
    const students = await User.find({ role: "student" });

    await Promise.all(
      students.map((student) =>
        sendWebinarNotificationEmail({
          toEmail: student.email,
          studentName: student.name,
          webinarName,
          speakerName: req.user.name,
          date,
          time,
          roomId
        })
      )
    );

    res.status(201).json({
      success: true,
      message: "Webinar scheduled successfully",
      webinar,
    });
  } catch (err) {
    console.error("❌ Webinar schedule error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});
router.get("/", protect, async (req, res) => {
  const webinars = await Webinar.find()
    .populate("createdBy", "name email role");
  res.json(webinars);
});

// Register for a webinar
router.post("/register/:id", protect, async (req, res) => {
  try {
    const webinar = await Webinar.findById(req.params.id);
    if (!webinar) return res.status(404).json({ error: "Webinar not found" });

    if (webinar.attendees.includes(req.user._id))
      return res.status(400).json({ error: "Already registered" });

    webinar.attendees.push(req.user._id);
    await webinar.save();

    res.json({ success: true, webinar });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;