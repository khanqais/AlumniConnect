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

// Public route - get any user's profile
router.get('/:userId', getUserProfile);

// Protected routes - manage own profile
router.get('/me/profile', protect, getMyProfile);
router.put('/me/profile', protect, updateMyProfile);
router.post('/me/avatar', protect, upload.single('avatar'), uploadAvatar);
router.put('/me/password', protect, changePassword);

module.exports = router;
