const User = require('../models/User');
const axios = require('axios');

const ML_SERVICE_BASE_URL = (process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001').replace(/\/$/, '');


exports.getCareerPathRecommendations = async (req, res) => {
    try {
        const studentId = req.params.id;


        const student = await User.findById(studentId).lean();
        if (!student || student.role === 'admin') {
            return res.status(400).json({ message: 'Invalid user ID' });
        }


        const alumni = await User.find({ role: 'alumni' }).lean();

        if (alumni.length === 0) {
            return res.json([]);
        }


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


exports.getTargetSkillRecommendations = async (req, res) => {
    try {
        const studentId = req.params.id;


        const student = await User.findById(studentId).lean();
        if (!student || student.role === 'admin') {
            return res.status(400).json({ message: 'Invalid user ID' });
        }


        const alumni = await User.find({ role: 'alumni' }).lean();

        if (alumni.length === 0) {
            return res.json([]);
        }


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
