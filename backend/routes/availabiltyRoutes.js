
const express = require("express");
const router = express.Router();
const Availability = require("../models/Availability");

const { protect } = require("../middleware/authMiddleware");
const createCalendarEvent = require("../utils/googleCalendar");
const { notifyAllStudents } = require("../utils/notifications");


router.post("/create", protect, async (req, res) => {
  const { startTime, endTime } = req.body;

  await createCalendarEvent({
     mentorId: req.user._id,
  startTime,
  endTime,
   roomId: `room-${Date.now()}`
});


  const slot = await Availability.create({
    mentorId: req.user._id,
    startTime,
    endTime,
    roomId: `room-${Date.now()}`
  });


  await notifyAllStudents(slot);

  res.status(201).json(slot);
});


router.post("/book/:slotId", protect, async (req, res) => {
    const slot = await Availability.findById(req.params.slotId);

    if (!slot) {
        return res.status(404).json({ message: "Slot not found" });
    }

    if (slot.isBooked) {
        return res.status(400).json({ message: "Slot already booked" });
    }

    slot.isBooked = true;
    slot.bookedBy = req.user._id;

    await slot.save();

    res.json({
        message: "Slot booked successfully",
        roomId: slot.roomId,   // 🔑 VERY IMPORTANT
        startTime: slot.startTime,
        endTime: slot.endTime
    });
});

module.exports = router;
