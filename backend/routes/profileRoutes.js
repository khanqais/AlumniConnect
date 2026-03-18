const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    getMyProfile,
    updateMyProfile,
    uploadAvatar,
    uploadBanner,
    changePassword
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');

const avatarUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        if (file.mimetype && file.mimetype.startsWith('image/')) {
            return cb(null, true);
        }
        cb('Error: Images only!');
    }
});


router.get('/me/profile', protect, getMyProfile);
router.put('/me/profile', protect, updateMyProfile);
router.post('/me/avatar', protect, avatarUpload.single('avatar'), uploadAvatar);
router.post('/me/banner', protect, avatarUpload.single('banner'), uploadBanner);
router.put('/me/password', protect, changePassword);


router.get('/:userId', getUserProfile);

module.exports = router;
