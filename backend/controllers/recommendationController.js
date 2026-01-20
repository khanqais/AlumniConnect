const User = require("../models/User");
const careerPathRecommend = require("../services/careerPathRecommender.service");
const mentorshipRecommend = require("../services/mentorshipRecommender.service");

// Career Path endpoint
const careerPath = async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId);
    if (!student || student.role !== "student") {
      return res.status(400).json({ message: "Invalid student" });
    }

    const alumniList = await User.find({ role: "alumni", isApproved: true });

    res.json(careerPathRecommend(student, alumniList));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mentorship endpoint
const mentorship = async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId);
    if (!student || student.role !== "student") {
      return res.status(400).json({ message: "Invalid student" });
    }

    const alumniList = await User.find({ role: "alumni", isApproved: true });

    res.json(mentorshipRecommend(student, alumniList));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { careerPath, mentorship };
