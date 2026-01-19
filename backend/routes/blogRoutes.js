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
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getBlogs);
router.post('/create', protect, upload.single('coverImage'), createBlog);
router.get('/my-blogs', protect, getMyBlogs);
router.get('/:id', getBlogById);
router.post('/like/:id', protect, likeBlog);
router.post('/comment/:id', protect, addComment);

module.exports = router;
