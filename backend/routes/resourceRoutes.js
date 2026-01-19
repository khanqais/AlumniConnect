const express = require('express');
const router = express.Router();
const {
    uploadResource,
    getResources,
    downloadResource,
    likeResource,
    getMyResources,
} = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getResources);
router.post('/upload', protect, upload.single('file'), uploadResource);
router.get('/my-resources', protect, getMyResources);
router.get('/download/:id', protect, downloadResource);
router.post('/like/:id', protect, likeResource);

module.exports = router;
