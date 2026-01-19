const express = require('express');
const router = express.Router();
const {
    createBlog,
    getBlogs,
    getBlogById,
    likeBlog,
    addComment,
    getMyBlogs,
} = require('../controllers/blogController');
const { protect, alumniOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getBlogs);
router.post('/create', protect, alumniOnly, upload.single('coverImage'), createBlog);
router.get('/my-blogs', protect, getMyBlogs);
router.get('/:id', getBlogById);
router.post('/like/:id', protect, likeBlog);
router.post('/comment/:id', protect, addComment);

module.exports = router;
