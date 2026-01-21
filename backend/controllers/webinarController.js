const Webinar = require("../models/Webinar");
const { v4: uuidv4 } = require("uuid");

// Schedule a webinar (alumni only)
const scheduleWebinar = async (req, res) => {
  try {
    const { webinarName, date, time, duration, description, maxParticipants, skillsCovered, recordingAllowed, prerequisites } = req.body;

    if (req.user.role !== "alumni") {
      return res.status(403).json({ message: "Only alumni can schedule webinars" });
    }

    // Combine date + time into scheduledAt
    const scheduledAt = new Date(`${date}T${time}`);

    const newWebinar = await Webinar.create({
      webinarName,
      scheduledAt,
      duration,
      description,
      maxParticipants,
      skillsCovered,
      recordingAllowed,
      prerequisites,
      createdBy: req.user._id,
      roomId: uuidv4(),
    });

    res.status(201).json({ webinar: newWebinar });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to schedule webinar" });
  }
};

// Get all webinars (with optional search & status filter)
const getAllWebinars = async (req, res) => {
  try {
    const { search = "", status } = req.query;

    let filter = {};
    if (search) {
      filter.webinarName = { $regex: search, $options: "i" };
    }

    if (status) {
      const now = new Date();
      if (status === "upcoming") filter.scheduledAt = { $gt: now };
      if (status === "ongoing") filter.scheduledAt = { $lte: now, $gte: new Date(now.getTime() - 1000 * 60 * 60) }; // last 1 hr
      if (status === "completed") filter.scheduledAt = { $lt: now };
    }

    const webinars = await Webinar.find(filter)
      .populate("createdBy", "name email role")
      .sort({ scheduledAt: 1 });

    // Map to match frontend "status" field
    const mapped = webinars.map((w) => {
      let webinarStatus = "upcoming";
      const now = new Date();
      if (now > w.scheduledAt) webinarStatus = "completed";
      else if (now >= w.scheduledAt && now <= new Date(w.scheduledAt.getTime() + parseInt(w.duration) * 60000)) webinarStatus = "ongoing";

      return {
        _id: w._id,
        title: w.webinarName,
        description: w.description,
        date: w.scheduledAt.toISOString(),
        time: w.scheduledAt.toTimeString().split(" ")[0].slice(0,5),
        duration: w.duration,
        platform: "google-meet", // default for now
        meetingLink: `https://meet.google.com/${w.roomId}`,
        organizer: {
          _id: w.createdBy._id,
          name: w.createdBy.name,
          email: w.createdBy.email,
          role: w.createdBy.role,
        },
        registeredUsers: w.registeredUsers,
        maxParticipants: w.maxParticipants,
        status: webinarStatus,
        category: "General",
        tags: [],
        skillsCovered: w.skillsCovered,
        recordingAllowed: w.recordingAllowed,
        prerequisites: w.prerequisites,
        createdAt: w.createdAt,
      };
    });

    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch webinars" });
  }
};

// Get webinars created by logged-in alumni
const getMyWebinars = async (req, res) => {
  try {
    if (req.user.role !== "alumni") return res.status(403).json({ message: "Only alumni can view their webinars" });

    const webinars = await Webinar.find({ createdBy: req.user._id })
      .populate("createdBy", "name email role")
      .sort({ scheduledAt: -1 });

    res.json(webinars);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch your webinars" });
  }
};

// Register/unregister a webinar
const registerWebinar = async (req, res) => {
  try {
    const webinar = await Webinar.findById(req.params.id);
    if (!webinar) return res.status(404).json({ message: "Webinar not found" });

    const userId = req.user._id;
    const isRegistered = webinar.registeredUsers.includes(userId);

    if (isRegistered) {
      // unregister
      webinar.registeredUsers = webinar.registeredUsers.filter((id) => id.toString() !== userId.toString());
    } else {
      if (webinar.registeredUsers.length >= webinar.maxParticipants) {
        return res.status(400).json({ message: "Webinar is full" });
      }
      webinar.registeredUsers.push(userId);
    }

    await webinar.save();
    res.json({ message: isRegistered ? "Unregistered" : "Registered" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update registration" });
  }
};

// Delete webinar
const deleteWebinar = async (req, res) => {
  try {
    const webinar = await Webinar.findById(req.params.id);
    if (!webinar) return res.status(404).json({ message: "Webinar not found" });

    if (req.user._id.toString() !== webinar.createdBy.toString())
      return res.status(403).json({ message: "You are not authorized to delete this webinar" });

    await webinar.remove();
    res.json({ message: "Webinar deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete webinar" });
  }
};

module.exports = {
  scheduleWebinar,
  getAllWebinars,
  getMyWebinars,
  registerWebinar,
  deleteWebinar,
};
