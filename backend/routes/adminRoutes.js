const express = require('express');
const router = express.Router();
const {
    adminLogin,  // Add this
    getPendingUsers,
    getApprovedUsers,
    getUserById,
    updateUserStatus,
    getAdminStats,
    getPendingResources,      // Add
    getApprovedResources,     // Add
    updateResourceStatus,     // Add
    deleteResourceAdmin,      // Add
    getPendingBlogs,          // Add
    getPublishedBlogs,        // Add
    updateBlogStatus,         // Add
    deleteBlogAdmin,          // Add

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


module.exports = router;
