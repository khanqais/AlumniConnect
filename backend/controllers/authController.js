const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc Register new user
// @route POST /api/auth/register
// @access Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, university, graduationYear, skills } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Parse skills (comma-separated string to array)
        const skillsArray = skills ? skills.split(',').map(skill => skill.trim()) : [];

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            university,
            graduationYear: role === 'alumni' ? graduationYear : undefined,
            skills: skillsArray,
            document: req.file ? req.file.path : '',
            isApproved: false,
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                message: 'Registration successful! Please wait for admin approval.',
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Authenticate a user
// @route POST /api/auth/login
// @access Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            
            // Block admin from logging in here
            if (user.role === 'admin') {
                return res.status(403).json({ 
                    message: 'Admin users must login at /admin' 
                });
            }

            // Check if user is approved
            if (!user.isApproved) {
                return res.status(403).json({ 
                    message: 'Your account is pending approval by admin. Please check back later.' 
                });
            }

            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved,
                token: generateToken(user.id),
            });
            
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
};
