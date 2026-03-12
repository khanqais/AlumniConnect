const express = require('express');
const router = express.Router();

const {
    getCareerPathRecommendations,
    getTargetSkillRecommendations
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

// Career path (current skills)
router.get('/career-path/:id', protect, getCareerPathRecommendations);

// Target skills
router.get('/target-skills/:id', protect, getTargetSkillRecommendations);

module.exports = router;
