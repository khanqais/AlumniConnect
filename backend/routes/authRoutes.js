const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserStats, verifyEmail, getAllAlumni, findAlumniByAlternateIdentifiers, createManualVerificationRequest } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const rateLimitMiddleware = require('../middleware/rateLimitMiddleware');

router.post('/register', upload.single('alumniProof'), registerUser);
router.post('/login', loginUser);
router.get('/stats', protect, getUserStats);
router.get('/verify-email/:token', verifyEmail);
router.get('/alumni', getAllAlumni);

// Fallback authentication routes
router.post('/find-alumni', findAlumniByAlternateIdentifiers);
router.post('/manual-verification', rateLimitMiddleware, upload.single('alumniProof'), createManualVerificationRequest);

module.exports = router;
