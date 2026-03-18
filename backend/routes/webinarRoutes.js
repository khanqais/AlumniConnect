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


router.post("/schedule", protect, scheduleWebinar);


router.get("/", protect, getAllWebinars);


router.get("/my/events", protect, getMyWebinars);


router.post("/register/:id", protect, registerWebinar);


router.delete("/:id", protect, deleteWebinar);

module.exports = router;
