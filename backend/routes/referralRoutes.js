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


router.get('/my-applications', protect, studentOnly, getMyApplications);


router.get('/my-listings', protect, alumniOnly, getMyListings);


router.put('/applications/:appId/status', protect, alumniOnly, updateApplicationStatus);
router.get('/applications/:appId/resume/download', protect, downloadApplicationResume);


router.get('/', protect, getAllReferrals);
router.post('/', protect, alumniOnly, createReferral);

router.get('/:id', protect, getReferralById);
router.put('/:id', protect, alumniOnly, updateReferral);
router.delete('/:id', protect, alumniOnly, deleteReferral);


router.post('/:id/apply', protect, studentOnly, referralUpload.single('resume'), applyToReferral);


router.get('/:id/applications', protect, alumniOnly, getApplications);

module.exports = router;
