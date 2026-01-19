const express = require('express');
const router = express.Router();
const {
    adminLogin,  // Add this
    getPendingUsers,
    getApprovedUsers,
    getUserById,
    updateUserStatus,
    getAdminStats
} = require('../controllers/adminController');

// Admin login route (no authentication needed)
router.post('/login', adminLogin);

// All other routes - remove auth middleware temporarily for testing
router.get('/pending', getPendingUsers);
router.get('/approved', getApprovedUsers);
router.get('/user/:id', getUserById);
router.put('/status/:id', updateUserStatus);
router.get('/stats', getAdminStats);

module.exports = router;
