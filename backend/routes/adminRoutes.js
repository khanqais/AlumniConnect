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
    updateStudentCGPA,
    toggleUserBan,
    getReferralStats,
    createAnnouncement,
    getAnnouncements,
    getAnnouncementsByCategory,
    deleteAnnouncement,
    updateAnnouncement,
    getVerificationQueue,
    validateAlumniDocumentMatch,
    bulkRejectHighRiskRequests,
} = require('../controllers/adminController');


router.post('/login', adminLogin);


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


router.put('/user/:id/cgpa', updateStudentCGPA);
router.put('/user/:id/ban', toggleUserBan);


router.get('/referral-stats', getReferralStats);


router.post('/announcements', createAnnouncement);
router.get('/announcements', getAnnouncements);
router.get('/announcements/:category', getAnnouncementsByCategory);
router.put('/announcements/:id', updateAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

// Verification queue routes
router.get('/verification-queue', getVerificationQueue);
router.post('/verify-alumni/:requestId', validateAlumniDocumentMatch);
router.post('/bulk-reject-high-risk', bulkRejectHighRiskRequests);

module.exports = router;
