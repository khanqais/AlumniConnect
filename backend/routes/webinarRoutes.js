const express = require("express");
const router = express.Router();
const {
  scheduleWebinar,
  getAllWebinars,
  getMyWebinars,
  registerWebinar,
  deleteWebinar
} = require("../controllers/webinarController");
const { protect } = require("../middleware/authMiddleware");

// Schedule a webinar (alumni only)
router.post("/schedule", protect, scheduleWebinar);

// Get all webinars (with optional search & status filter)
router.get("/", protect, getAllWebinars);

// Get webinars created by logged-in alumni
router.get("/my/events", protect, getMyWebinars);

// Register/unregister a webinar
router.post("/register/:id", protect, registerWebinar);

// Delete a webinar (alumni only)
router.delete("/:id", protect, deleteWebinar);

module.exports = router;
