const express = require("express");
const router = express.Router();
const Webinar = require("../models/Webinar");
const User = require("../models/User");
const { sendWebinarNotificationEmail } = require("../utils/emailService");
const { protect } = require("../middleware/authMiddleware");
const { v4: uuidv4 } = require("uuid");


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


    if (req.user.role !== "alumni") {
      return res
        .status(403)
        .json({ error: "Only alumni can schedule webinars" });
    }


    const scheduledAt = new Date(`${date}T${time}`);


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


router.get('/', protect, async (req, res) => {
  try {
    const { status, search } = req.query;


    let webinars = await Webinar.find()
      .populate('createdBy', 'name email role') // to show organizer info
      .lean();


    webinars = webinars.filter(w => w.createdBy);


    if (search) {
      const regex = new RegExp(search, 'i');
      webinars = webinars.filter(w => regex.test(w.webinarName));
    }


    const mapped = webinars.map(w => {
      const now = new Date();
      const start = new Date(w.scheduledAt);
      const end = new Date(start.getTime() + parseInt(w.duration) * 60000);
      
      let webinarStatus = 'upcoming';
      if (now > end) {
        webinarStatus = 'completed';
      } else if (now >= start && now <= end) {
        webinarStatus = 'ongoing';
      }

      return {
        _id: w._id,
        webinarName: w.webinarName,
        description: w.description,
        scheduledAt: w.scheduledAt,
        time: start.toTimeString().split(' ')[0].slice(0, 5),
        duration: w.duration,
        platform: 'google-meet',
        roomId: w.roomId,
        meetingLink: `https://meet.google.com/${w.roomId}`,
        organizer: {
          _id: w.createdBy._id,
          name: w.createdBy.name,
          email: w.createdBy.email,
          role: w.createdBy.role,
        },
        registeredUsers: w.registeredUsers || [],
        maxParticipants: w.maxParticipants,
        status: webinarStatus,
        skillsCovered: w.skillsCovered || [],
        recordingAllowed: w.recordingAllowed,
        prerequisites: w.prerequisites,
        createdAt: w.createdAt,
      };
    });


    let filtered = mapped;
    if (status) {
      filtered = mapped.filter(w => w.status === status);
    }

    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch webinars' });
  }
});


router.post("/register/:id", protect, async (req, res) => {
  try {
    const webinar = await Webinar.findById(req.params.id);
    if (!webinar) {
      return res.status(404).json({ error: "Webinar not found" });
    }


    if (req.user.role !== 'student') {
      return res.status(403).json({ error: "Only students can register for webinars" });
    }

    if (webinar.registeredUsers.includes(req.user._id)) {
      return res.status(400).json({ error: "Already registered" });
    }

    webinar.registeredUsers.push(req.user._id);
    await webinar.save();

    res.json({ success: true, message: "Registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/room/:roomId", protect, async (req, res) => {
  try {
    const webinar = await Webinar.findOne({ roomId: req.params.roomId })
      .populate("createdBy", "name email role");

    if (!webinar) {
      return res.status(404).json({ error: "Invalid webinar room" });
    }

    const now = new Date();
    const start = new Date(webinar.scheduledAt);
    const end = new Date(start.getTime() + parseInt(webinar.duration) * 60000);

    if (now < start) {
      return res.status(403).json({ error: "Webinar not started yet" });
    }

    if (now > end) {
      return res.status(403).json({ error: "Webinar has ended" });
    }

    res.json({
      success: true,
      webinar,
    });
  } catch (err) {
    console.error("❌ Webinar room validation error:", err);
    res.status(500).json({ error: "Failed to validate webinar room" });
  }
});


router.delete("/:id", protect, async (req, res) => {
  try {
    const webinar = await Webinar.findById(req.params.id);
    if (!webinar) {
      return res.status(404).json({ message: "Webinar not found" });
    }


    if (req.user._id.toString() !== webinar.createdBy.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this webinar" });
    }

    await Webinar.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Webinar deleted successfully" });
  } catch (err) {
    console.error("Delete webinar error:", err);
    res.status(500).json({ message: "Failed to delete webinar" });
  }
});

router.post("/attendance/join/:roomId", protect, async (req, res) => {
  try {
    const webinar = await Webinar.findOne({ roomId: req.params.roomId });
    if (!webinar) {
      return res.status(404).json({ error: "Webinar not found" });
    }

    const alreadyJoined = webinar.attendance.find(
      (a) => a.user.toString() === req.user._id.toString()
    );

    if (!alreadyJoined) {
      webinar.attendance.push({
        user: req.user._id,
        joinedAt: new Date(),
      });
      await webinar.save();
    }

    res.json({ success: true, message: "Attendance marked (join)" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
