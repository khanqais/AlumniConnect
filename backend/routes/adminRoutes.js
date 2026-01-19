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


module.exports = router;
