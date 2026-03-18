const express = require('express');
const router = express.Router();
const {
    followUser,
    getFollowers,
    getFollowing,
    checkFollowing,
} = require('../controllers/followController');
const { protect } = require('../middleware/authMiddleware');


router.post('/:userId', protect, followUser);
router.get('/:userId/followers', protect, getFollowers);
router.get('/:userId/following', protect, getFollowing);
router.get('/:userId/check', protect, checkFollowing);

module.exports = router;
