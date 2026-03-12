const express = require('express');
const router = express.Router();
const { getFeed } = require('../controllers/feedController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/feed?filter=all&page=1&limit=20
router.get('/', protect, getFeed);

module.exports = router;
