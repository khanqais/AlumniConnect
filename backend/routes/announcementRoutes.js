const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Announcement = require('../models/Announcement');


router.get('/', async (req, res) => {
    try {
        const announcements = await Announcement.find({ isPublished: true })
            .populate('postedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(announcements);
    } catch (error) {
        console.error('Get announcements error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const announcements = await Announcement.find({ category, isPublished: true })
            .populate('postedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(announcements);
    } catch (error) {
        console.error('Get announcements by category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const announcement = await Announcement.findByIdAndUpdate(
            id,
            { $inc: { views: 1 } },
            { new: true }
        ).populate('postedBy', 'name email');

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        res.json(announcement);
    } catch (error) {
        console.error('Get announcement error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
