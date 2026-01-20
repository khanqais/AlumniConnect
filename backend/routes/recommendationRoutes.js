const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { careerPath, mentorship } = require("../controllers/recommendationController");

// Career Path → current skills match
router.get("/career-path/:studentId", protect, careerPath);

// Mentorship → target skills match
router.get("/mentorship/:studentId", protect, mentorship);

module.exports = router;
