const express = require('express');
const router = express.Router();
const {
    sendMessage,
    getConversation,
    getConversations,
    deleteMessage,
    getUnreadCount,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.post('/send', protect, sendMessage);
router.get('/conversations', protect, getConversations);
router.get('/conversation/:userId', protect, getConversation);
router.get('/unread-count', protect, getUnreadCount);
router.delete('/:id', protect, deleteMessage);

module.exports = router;
