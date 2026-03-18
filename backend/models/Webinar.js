

const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  joinedAt: Date,
  leftAt: Date
});

const webinarSchema = new mongoose.Schema({
  webinarName: String,
  scheduledAt: Date,
  duration: String,
  description: String,
  maxParticipants: Number,
  skillsCovered: [String],
  recordingAllowed: Boolean,
  prerequisites: String,

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  roomId: String,

  registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  attendance: [attendanceSchema]
});

module.exports = mongoose.model("Webinar", webinarSchema);
