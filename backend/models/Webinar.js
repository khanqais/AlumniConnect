// // const mongoose = require("mongoose");

// // const webinarSchema = new mongoose.Schema({
// //   alumniId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
// //   webinarName: { type: String, required: true },
// //   scheduledAt: { type: Date, required: true }, // combined date + time
// //   duration: { type: Number, default: 60 }, // in minutes
// //   description: { type: String },
// //   platform: { type: String, enum: ["google-meet", "zoom", "teams", "custom"], default: "google-meet" },
// //   maxParticipants: { type: Number, default: 100 },
// //   skillsCovered: [String],
// //   recordingAllowed: { type: Boolean, default: true },
// //   prerequisites: { type: String },
// //   attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
// //   createdAt: { type: Date, default: Date.now },
// // });

// // module.exports = mongoose.model("Webinar", webinarSchema);
// const mongoose = require("mongoose");

// const webinarSchema = new mongoose.Schema(
//   {
//     webinarName: { type: String, required: true },
//     scheduledAt: { type: Date, required: true },
//     duration: { type: String, required: true },
//     description: { type: String, required: true },
//     maxParticipants: { type: Number, default: 100 },
//     skillsCovered: [String],
//     recordingAllowed: { type: Boolean, default: true },
//     prerequisites: { type: String },

//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true
//     },
//     roomId: {
//   type: String,
//   required: true,
//   unique: true,
// },
//     attendees: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User"
//       }
//     ]
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Webinar", webinarSchema);

// models/Webinar.js
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
