// models/Availability.js
const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema({
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startTime: Date,
  endTime: Date,
  isBooked: {
    type: Boolean,
    default: false,
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  roomId: String, // 🔑 used for video call
});

module.exports = mongoose.model("Availability", availabilitySchema);
