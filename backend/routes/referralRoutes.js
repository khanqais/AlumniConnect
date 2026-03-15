const express = require('express');
const router = express.Router();
const {
    referralUpload,
    createReferral,
    getAllReferrals,
    getReferralById,
    getMyListings,
    updateReferral,
    deleteReferral,
    applyToReferral,
    getApplications,
    updateApplicationStatus,
    getMyApplications,
    downloadApplicationResume,
} = require('../controllers/referralController');
const { protect, alumniOnly, studentOnly } = require('../middleware/authMiddleware');

// ── Student routes (must come before :id wildcard) ──
router.get('/my-applications', protect, studentOnly, getMyApplications);

// ── Alumni routes (must come before :id wildcard) ──
router.get('/my-listings', protect, alumniOnly, getMyListings);

// ── Application status update ──
router.put('/applications/:appId/status', protect, alumniOnly, updateApplicationStatus);
router.get('/applications/:appId/resume/download', protect, downloadApplicationResume);

// ── Shared / CRUD ──
router.get('/', protect, getAllReferrals);
router.post('/', protect, alumniOnly, createReferral);

router.get('/:id', protect, getReferralById);
router.put('/:id', protect, alumniOnly, updateReferral);
router.delete('/:id', protect, alumniOnly, deleteReferral);

// ── Apply (student uploads resume via multipart) ──
router.post('/:id/apply', protect, studentOnly, referralUpload.single('resume'), applyToReferral);

// ── Alumni views applications for their referral ──
router.get('/:id/applications', protect, alumniOnly, getApplications);

module.exports = router;
