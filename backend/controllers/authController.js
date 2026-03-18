const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const User = require('../models/User');
const Resource = require('../models/Resource');
const Blog = require('../models/Blog');
const { uploadToCloudinary } = require('../services/uploadService');
const { generateVerificationToken, sendVerificationEmail, sendWelcomeEmail, convertToOutlookEmail } = require('../utils/emailService');

const ALUMNI_RECORDS_PATH = path.join(__dirname, '..', 'config', 'alumniRecords.json');

const getAllowedAlumniEmails = async () => {
    try {
        const recordsRaw = await fs.readFile(ALUMNI_RECORDS_PATH, 'utf-8');
        const recordsJson = JSON.parse(recordsRaw);

        if (!Array.isArray(recordsJson.allowedAlumniEmails)) {
            return [];
        }

        return recordsJson.allowedAlumniEmails
            .filter((recordEmail) => typeof recordEmail === 'string')
            .map((recordEmail) => recordEmail.trim().toLowerCase());
    } catch (error) {
        console.error('Failed to load alumni records:', error.message);
        return [];
    }
};

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
        const { name, email, password, role, collegeName, graduationYear, skills, experience, branch, cgpa, linkedin } = req.body;
        const alumniProofFile = req.file;
        const normalizedEmail = String(email || '').trim().toLowerCase();

        // Validation
        if (!name || !email || !password || !collegeName) {
            return res.status(400).json({ message: 'Please fill all required fields' });
        }

        const emailDomain = normalizedEmail.split('@')[1];

        // Role-based email validation
        if (role === 'alumni') {
            if (!emailDomain || emailDomain !== 'gmail.com') {
                return res.status(400).json({
                    message: 'Alumni must register using a Gmail address (e.g., yourname@gmail.com)'
                });
            }

            const allowedAlumniEmails = await getAllowedAlumniEmails();
            if (!allowedAlumniEmails.includes(normalizedEmail)) {
                return res.status(400).json({
                    message: 'This alumni email is not in the official alumni record.'
                });
            }
        } else {
            if (!emailDomain || emailDomain !== 'tsecedu.org') {
                return res.status(400).json({
                    message: 'Please use your institute email (e.g., yourname@tsecedu.org)'
                });
            }
        }

        // Check if user exists
        const userExists = await User.findOne({ email: normalizedEmail });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Alumni-specific validation
        if (role === 'alumni') {
            if (!graduationYear || !experience || !linkedin) {
                return res.status(400).json({ 
                    message: 'Alumni must provide graduation year, experience, and LinkedIn profile' 
                });
            }

            if (!alumniProofFile) {
                return res.status(400).json({
                    message: 'Alumni must upload marksheet or graduation certificate'
                });
            }
        }

        // Student-specific validation
        if (role === 'student') {
            if (cgpa === undefined || cgpa === null || cgpa === '') {
                return res.status(400).json({ message: 'CGPA is required for student registration' });
            }

            const cgpaNumber = Number(cgpa);
            if (Number.isNaN(cgpaNumber) || cgpaNumber < 0 || cgpaNumber > 10) {
                return res.status(400).json({ message: 'CGPA must be between 0 and 10' });
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

        // Upload alumni proof to Cloudinary if provided
        let alumniProofDocument = '';
        let alumniProofOriginalName = '';
        
        if (role === 'alumni' && alumniProofFile?.buffer) {
            try {
                const timestamp = Date.now();
                const safeFilename = `alumni-proof-${timestamp}`;
                
                const uploadResult = await uploadToCloudinary(
                    alumniProofFile.buffer,
                    'alumniconnect/alumni-proofs',
                    safeFilename,
                    'raw'
                );
                alumniProofDocument = uploadResult.secure_url;
                alumniProofOriginalName = alumniProofFile.originalname;
            } catch (uploadError) {
                console.error('Error uploading alumni proof:', uploadError);
                // Continue without failing - log error but don't block registration
            }
        }

        // Create user
        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role,
            collegeName,
            graduationYear: role === 'alumni' ? graduationYear : undefined,
            experience: role === 'alumni' ? experience : undefined,
            linkedin: role === 'alumni' ? linkedin : '',
            alumniProofDocument: alumniProofDocument,
            alumniProofOriginalName: alumniProofOriginalName,
            branch: role === 'alumni' ? (branch || '') : undefined,
            cgpa: role === 'student' ? Number(cgpa) : null,
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

    // Edge case: validate input existence
    if (!email || !password) {
        console.warn('Login attempt with missing credentials:', { 
            hasEmail: !!email, 
            hasPassword: !!password,
            emailType: typeof email,
            passwordType: typeof password
        });
        return res.status(400).json({ 
            message: email ? 'Password is required' : 'Email is required'
        });
    }

    // Log environment info for debugging
    console.log('🔍 Login debug info:', {
        env: process.env.NODE_ENV || 'development',
        jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
        email: email,
        mongoConnected: mongoose.connection.readyState === 1
    });

    try {
        // Find user by email (case-sensitive as stored in DB)
        const user = await User.findOne({ email });

        if (!user) {
            console.warn('❌ Login failed - User not found:', { email });
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            console.warn('❌ Login failed - Invalid password:', { 
                email: user.email,
                userId: user._id,
                role: user.role
            });
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Block admin from logging in here
        if (user.role === 'admin') {
            console.warn('❌ Admin login attempt on user endpoint:', { email: user.email });
            return res.status(403).json({ 
                message: 'Admin users must login at /admin' 
            });
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            console.warn('❌ Login blocked - Email not verified:', { 
                email: user.email,
                userId: user._id,
                createdAt: user.createdAt
            });
            return res.status(403).json({ 
                message: 'Please verify your email before logging in. Check your inbox for the verification link.' 
            });
        }

        // Check if user is approved
        if (!user.isApproved) {
            console.warn('❌ Login blocked - Account not approved:', { 
                email: user.email,
                userId: user._id,
                role: user.role
            });
            return res.status(403).json({ 
                message: 'Your account is pending approval by admin. Please check back later.' 
            });
        }

        // Generate token and return success
        console.log('✅ Login successful:', { 
            email: user.email,
            userId: user._id,
            role: user.role
        });

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            isApproved: user.isApproved,
            skills: user.skills,
            target_skills: user.target_skills,
            token: generateToken(user.id),
        });
            
    } catch (error) {
        console.error('🔥 Login error (critical):', {
            message: error.message,
            stack: error.stack,
            email: email,
            mongoError: error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError'
        });
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
                }).select('name email company jobTitle graduationYear skills avatar experience')
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
