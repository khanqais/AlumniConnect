const express = require('express');
const router = express.Router();

const {
    getCareerPathRecommendations,
    getTargetSkillRecommendations
} = require('../controllers/recommendationController');

// Career path (current skills)
router.get('/career-path/:id', getCareerPathRecommendations);

// Target skills
router.get('/target-skills/:id', getTargetSkillRecommendations);

module.exports = router;
