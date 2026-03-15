const express = require('express');
const router = express.Router();
const {
    createGroup,
    sendGroupInvites,
    getMyInvites,
    respondToInvite,
    getMyGroups,
} = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createGroup);
router.get('/my', protect, getMyGroups);
router.post('/:groupId/invites', protect, sendGroupInvites);
router.get('/invites', protect, getMyInvites);
router.patch('/invites/:inviteId/respond', protect, respondToInvite);

module.exports = router;