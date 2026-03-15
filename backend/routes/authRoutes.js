const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserStats, verifyEmail, getAllAlumni } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', upload.single('alumniProof'), registerUser);
router.post('/login', loginUser);
router.get('/stats', protect, getUserStats);
router.get('/verify-email/:token', verifyEmail);
router.get('/alumni', getAllAlumni);

module.exports = router;
