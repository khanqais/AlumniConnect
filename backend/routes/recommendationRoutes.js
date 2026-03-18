const express = require('express');
const router = express.Router();

const {
    getCareerPathRecommendations,
    getTargetSkillRecommendations
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');


router.get('/career-path/:id', protect, getCareerPathRecommendations);


router.get('/target-skills/:id', protect, getTargetSkillRecommendations);

module.exports = router;
