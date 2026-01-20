const User = require('../models/User');
const axios = require('axios');

// ----------------------------------------
// 1️⃣ CAREER PATH (CURRENT SKILLS)
// ----------------------------------------
exports.getCareerPathRecommendations = async (req, res) => {
    try {
        const studentId = req.params.id;

        // Get student
        const student = await User.findById(studentId).lean();
        if (!student || student.role !== 'student') {
            return res.status(400).json({ message: 'Invalid student ID' });
        }

        // Get alumni
        const alumni = await User.find({ role: 'alumni' }).lean();

        // Call ML service
        const mlResponse = await axios.post(
            'http://127.0.0.1:5001/career-path',
            { student, alumni }
        );

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

        // Get student
        const student = await User.findById(studentId).lean();
        if (!student || student.role !== 'student') {
            return res.status(400).json({ message: 'Invalid student ID' });
        }

        // Get alumni
        const alumni = await User.find({ role: 'alumni' }).lean();

        // Call ML service
        const mlResponse = await axios.post(
            'http://127.0.0.1:5001/target-skills',
            { student, alumni }
        );

        res.json(mlResponse.data);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Target skill recommendation failed' });
    }
};
