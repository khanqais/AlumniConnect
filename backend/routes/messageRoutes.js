const express = require('express');
const router = express.Router();
const {
    sendMessage,
    getConversation,
    getConversations,
    deleteMessage,
    getUnreadCount,
    getGroupConversation,
    sendGroupMessage,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');

const chatUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 },
});


router.post('/send', protect, chatUpload.single('media'), sendMessage);
router.get('/conversations', protect, getConversations);
router.get('/conversation/:userId', protect, getConversation);
router.get('/groups/:groupId', protect, getGroupConversation);
router.post('/groups/:groupId/send', protect, sendGroupMessage);
router.get('/unread-count', protect, getUnreadCount);
router.delete('/:id', protect, deleteMessage);

module.exports = router;
