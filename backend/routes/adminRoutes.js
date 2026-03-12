const express = require('express');
const router = express.Router();
const {
    adminLogin,
    getPendingUsers,
    getApprovedUsers,
    getUserById,
    updateUserStatus,
    getAdminStats,
    getPendingResources,
    getApprovedResources,
    updateResourceStatus,
    deleteResourceAdmin,
    getPendingBlogs,
    getPublishedBlogs,
    updateBlogStatus,
    deleteBlogAdmin,
    searchAlumni,
} = require('../controllers/adminController');

// Admin login route (no authentication needed)
router.post('/login', adminLogin);

// All other routes - remove auth middleware temporarily for testing
router.get('/pending', getPendingUsers);
router.get('/approved', getApprovedUsers);
router.get('/user/:id', getUserById);
router.put('/status/:id', updateUserStatus);
router.get('/stats', getAdminStats);

router.get('/resources/pending', getPendingResources);
router.get('/resources/approved', getApprovedResources);
router.put('/resources/status/:id', updateResourceStatus);
router.delete('/resources/:id', deleteResourceAdmin);

router.get('/blogs/pending', getPendingBlogs);
router.get('/blogs/published', getPublishedBlogs);
router.put('/blogs/status/:id', updateBlogStatus);
router.delete('/blogs/:id', deleteBlogAdmin);

router.get('/alumni/search', searchAlumni);

module.exports = router;
