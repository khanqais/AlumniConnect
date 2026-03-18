const User = require('../models/User');
const axios = require('axios');

const ML_SERVICE_BASE_URL = (process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001').replace(/\/$/, '');

// ----------------------------------------
// 1️⃣ CAREER PATH (CURRENT SKILLS)
// ----------------------------------------
exports.getCareerPathRecommendations = async (req, res) => {
    try {
        const studentId = req.params.id;

        // Get user (students and alumni can both use career path)
        const student = await User.findById(studentId).lean();
        if (!student || student.role === 'admin') {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        // Get all alumni (approved or not — approval governs platform access, not matching)
        const alumni = await User.find({ role: 'alumni' }).lean();

        if (alumni.length === 0) {
            return res.json([]);
        }

        // Call ML service
        let mlResponse;
        try {
            mlResponse = await axios.post(
                `${ML_SERVICE_BASE_URL}/career-path`,
                { student, alumni },
                { timeout: 10000 }
            );
        } catch (mlError) {
            console.error('ML service unreachable:', mlError.message);
            return res.status(503).json({ message: 'ML service is unreachable. Check ML_SERVICE_URL configuration.' });
        }

        res.json(mlResponse.data);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Career path recommendation failed' });
    }
};

// ----------------------------------------
// 2️⃣ TARGET SKILLS
// ----------------------------------------
exports.getTargetSkillRecommendations = async (req, res) => {
    try {
        const studentId = req.params.id;

        // Get user (students and alumni can both use target skills)
        const student = await User.findById(studentId).lean();
        if (!student || student.role === 'admin') {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        // Get all alumni
        const alumni = await User.find({ role: 'alumni' }).lean();

        if (alumni.length === 0) {
            return res.json([]);
        }

        // Call ML service
        let mlResponse;
        try {
            mlResponse = await axios.post(
                `${ML_SERVICE_BASE_URL}/target-skills`,
                { student, alumni },
                { timeout: 10000 }
            );
        } catch (mlError) {
            console.error('ML service unreachable:', mlError.message);
            return res.status(503).json({ message: 'ML service is unreachable. Check ML_SERVICE_URL configuration.' });
        }

        res.json(mlResponse.data);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Target skill recommendation failed' });
    }
};
