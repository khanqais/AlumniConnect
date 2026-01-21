const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserStats, verifyEmail, getAllAlumni } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/stats', protect, getUserStats);
router.get('/verify-email/:token', verifyEmail);
router.get('/alumni', getAllAlumni);

module.exports = router;
