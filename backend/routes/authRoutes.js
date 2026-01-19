const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserStats } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', upload.single('document'), registerUser);
router.post('/login', loginUser);
router.get('/stats', protect, getUserStats);

module.exports = router;
