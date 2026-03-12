const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    getMyProfile,
    updateMyProfile,
    uploadAvatar,
    changePassword
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Protected routes - manage own profile (must be before /:userId wildcard)
router.get('/me/profile', protect, getMyProfile);
router.put('/me/profile', protect, updateMyProfile);
router.post('/me/avatar', protect, upload.single('avatar'), uploadAvatar);
router.put('/me/password', protect, changePassword);

// Public route - get any user's profile (wildcard must come last)
router.get('/:userId', getUserProfile);

module.exports = router;
