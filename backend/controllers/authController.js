const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Resource = require('../models/Resource');
const Blog = require('../models/Blog');
const { generateVerificationToken, sendVerificationEmail, sendWelcomeEmail, convertToOutlookEmail } = require('../utils/emailService');

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
        const { name, email, password, role, collegeName, graduationYear, skills, experience } = req.body;

        // Validation
        if (!name || !email || !password || !collegeName) {
            return res.status(400).json({ message: 'Please fill all required fields' });
        }

        // Email domain validation - only allow institute email
        const emailDomain = email.split('@')[1];
        if (!emailDomain || emailDomain !== 'tsecedu.org') {
            return res.status(400).json({ 
                message: 'Please use your institute email (e.g., yourname@tsecedu.org)' 
            });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Alumni-specific validation
        if (role === 'alumni') {
            if (!graduationYear || !experience) {
                return res.status(400).json({ 
                    message: 'Alumni must provide graduation year and experience' 
                });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Parse skills (comma-separated string to array)
        const skillsArray = skills ? skills.split(',').map(skill => skill.trim()) : [];

        // Generate email verification token
        const verificationToken = generateVerificationToken();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            collegeName,
            graduationYear: role === 'alumni' ? graduationYear : undefined,
            experience: role === 'alumni' ? experience : undefined,
            skills: skillsArray,
            isApproved: false,
            isEmailVerified: false,
            emailVerificationToken: verificationToken,
            emailVerificationExpires: verificationExpires,
        });

        if (user) {
            // Send verification email
            try {
                console.log(`📧 Attempting to send verification email to: ${user.email}`);
                console.log(`📧 Verification token: ${verificationToken}`);
                
                const emailResult = await sendVerificationEmail(user, verificationToken);
                
                console.log(`✅ Verification email sent successfully!`);
                console.log(`📧 Sent to: ${emailResult.sentTo}`);
                console.log(`📧 Message ID: ${emailResult.messageId}`);
            } catch (emailError) {
                console.error('❌ Failed to send verification email:');
                console.error('Error name:', emailError.name);
                console.error('Error message:', emailError.message);
                console.error('Error code:', emailError.code);
                console.error('Full error:', emailError);
                // Don't fail registration if email fails - but log it thoroughly
            }

            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                message: 'Registration successful! Please check your email to verify your account.',
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration error:', error);
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

            // Check if email is verified
            if (!user.isEmailVerified) {
                return res.status(403).json({ 
                    message: 'Please verify your email before logging in. Check your inbox for the verification link.' 
                });
            }

            // Check if user is approved (auto-approved after email verification, but keeping this check)
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

// @desc Get user stats
// @route GET /api/auth/stats
// @access Private
const getUserStats = async (req, res) => {
    try {
        // Get approved resource count
        const resourcesApproved = await Resource.countDocuments({ 
            uploadedBy: req.user._id,
            isApproved: true 
        });

        // Get pending resource count
        const resourcesPending = await Resource.countDocuments({ 
            uploadedBy: req.user._id,
            isApproved: false 
        });

        // Get blog count (all blogs since they auto-publish for alumni)
        const blogsPublished = await Blog.countDocuments({ 
            author: req.user._id,
            isPublished: true 
        });

        // For now, questions count is 0 (will be implemented later)
        const questionsAsked = 0;

        res.json({
            success: true,
            stats: {
                resourcesShared: resourcesApproved,
                resourcesPending: resourcesPending,
                blogsPublished,
                questionsAsked,
            }
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Verify email
// @route GET /api/auth/verify-email/:token
// @access Public
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        // Find user with this token
        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ 
                message: 'Invalid or expired verification link. Please register again or contact support.' 
            });
        }

        // Update user - verify email and auto-approve
        user.isEmailVerified = true;
        user.isApproved = true; // Auto-approve after email verification
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        console.log(`✅ Email verified for user: ${user.email}`);

        // Send welcome email
        try {
            await sendWelcomeEmail(user);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail verification if welcome email fails
        }

        res.json({
            success: true,
            message: 'Email verified successfully! You can now login to your account.',
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ message: 'Server error during email verification' });
    }
};

// @desc Get all approved alumni
// @route GET /api/auth/alumni
// @access Public (or Protected)
const getAllAlumni = async (req, res) => {
    try {
        const alumni = await User.find({
            role: 'alumni',
            isApproved: true,
            isEmailVerified: true
        }).select('name email company jobTitle graduationYear skills')
          .sort({ name: 1 });

        res.json(alumni);
    } catch (error) {
        console.error('Error fetching alumni:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserStats,
    verifyEmail,
    getAllAlumni,
};
