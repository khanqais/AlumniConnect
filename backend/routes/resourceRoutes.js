const express = require('express');
const router = express.Router();
const {
    uploadResource,
    getResources,
    getResourceById,
    downloadResource,
    likeResource,
    dislikeResource,
    addComment,
    deleteComment,
    getMyResources,
} = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Specific routes first (before generic :id route)
router.get('/', getResources);
router.post('/upload', protect, upload.single('file'), uploadResource);
router.get('/my-resources', protect, getMyResources);
router.get('/download/:id', protect, downloadResource);
router.post('/like/:id', protect, likeResource);
router.post('/dislike/:id', protect, dislikeResource);
router.post('/comment/:id', protect, addComment);
router.delete('/comment/:id/:commentId', protect, deleteComment);
// Generic :id route last
router.get('/:id', getResourceById);

module.exports = router;
