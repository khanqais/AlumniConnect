const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs').promises;
const User = require('../models/User');
const VerificationQueue = require('../models/VerificationQueue');
const Resource = require('../models/Resource');
const mongoose = require('mongoose'); 
const Blog = require('../models/Blog');
const { uploadToCloudinary } = require('../services/uploadService');
const { generateVerificationToken, sendVerificationEmail, sendWelcomeEmail, convertToOutlookEmail } = require('../utils/emailService');
const { calculateRiskScore, getRiskLevel } = require('../utils/riskScoring');

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


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};


const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, collegeName, graduationYear, skills, experience, branch, cgpa, linkedin } = req.body;
        const alumniProofFile = req.file;
        const normalizedEmail = String(email || '').trim().toLowerCase();


        if (!name || !email || !password || !collegeName) {
            return res.status(400).json({ message: 'Please fill all required fields' });
        }

        const emailDomain = normalizedEmail.split('@')[1];


        if (role === 'alumni') {
            if (!emailDomain || emailDomain !== 'gmail.com') {
                return res.status(400).json({
                    message: 'Alumni must register using a Gmail address (e.g., yourname@gmail.com)'
                });
            }

            const allowedAlumniEmails = await getAllowedAlumniEmails();
            if (!allowedAlumniEmails.includes(normalizedEmail)) {
                // Email not in official records - create manual verification request instead of rejecting
                console.log(`📧 Alumni email ${normalizedEmail} not in official records. Creating manual verification request...`);
                
                const manualVerificationResult = await createManualVerificationRequest({
                    name,
                    email: normalizedEmail,
                    collegeName,
                    graduationYear,
                    branch,
                    experience,
                    skills: skillsArray,
                    linkedin,
                    alternateEmail: normalizedEmail, // Use the same email as alternate contact
                    contactNumber: '' // Will be empty, but that's okay
                }, alumniProofFile, req.deviceFingerprint, req.ip);

                if (manualVerificationResult.success) {
                    return res.status(200).json({
                        success: true,
                        message: 'Your alumni verification request has been submitted for manual review. An admin will review your documents and contact you via email within 24-48 hours.',
                        requestId: manualVerificationResult.requestId
                    });
                } else if (manualVerificationResult.autoRejected) {
                    return res.status(400).json({
                        message: manualVerificationResult.error,
                        riskScore: manualVerificationResult.riskScore
                    });
                } else {
                    return res.status(500).json({
                        message: 'Failed to create manual verification request. Please try again or contact support.'
                    });
                }
            }
        } else {
            if (!emailDomain || emailDomain !== 'tsecedu.org') {
                return res.status(400).json({
                    message: 'Please use your institute email (e.g., yourname@tsecedu.org)'
                });
            }
        }


        // Check if user already exists
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Role-specific validations
        if (role === 'alumni') {
            // For manual verification requests, we'll be more flexible with requirements
            // since admin will review everything manually
            const allowedAlumniEmails = await getAllowedAlumniEmails();
            const isStandardRegistration = allowedAlumniEmails.includes(normalizedEmail);

            if (isStandardRegistration) {
                // Standard registration - strict validation
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
            // For manual verification (fallback), we'll be more lenient
            // The createManualVerificationRequest function handles missing fields gracefully
        } else if (role === 'student') {
            if (cgpa === undefined || cgpa === null || cgpa === '') {
                return res.status(400).json({ message: 'CGPA is required for student registration' });
            }

            const cgpaNumber = Number(cgpa);
            if (Number.isNaN(cgpaNumber) || cgpaNumber < 0 || cgpaNumber > 10) {
                return res.status(400).json({ message: 'CGPA must be between 0 and 10' });
            }
        }


        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        const skillsArray = skills ? skills.split(',').map(skill => skill.trim()) : [];


        const verificationToken = generateVerificationToken();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours


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

            }
        }


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


const loginUser = async (req, res) => {
    const { email, password } = req.body;


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


    console.log('🔍 Login debug info:', {
        env: process.env.NODE_ENV || 'development',
        jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
        email: email,
        mongoConnected: mongoose.connection.readyState === 1
    });

    try {

        const user = await User.findOne({ email });

        if (!user) {
            console.warn('❌ Login failed - User not found:', { email });
            return res.status(400).json({ message: 'Invalid credentials' });
        }


        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            console.warn('❌ Login failed - Invalid password:', { 
                email: user.email,
                userId: user._id,
                role: user.role
            });
            return res.status(400).json({ message: 'Invalid credentials' });
        }


        if (user.role === 'admin') {
            console.warn('❌ Admin login attempt on user endpoint:', { email: user.email });
            return res.status(403).json({ 
                message: 'Admin users must login at /admin' 
            });
        }


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


const getUserStats = async (req, res) => {
    try {

        const resourcesApproved = await Resource.countDocuments({ 
            uploadedBy: req.user._id,
            isApproved: true 
        });


        const resourcesPending = await Resource.countDocuments({ 
            uploadedBy: req.user._id,
            isApproved: false 
        });


        const blogsPublished = await Blog.countDocuments({ 
            author: req.user._id,
            isPublished: true 
        });


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


const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;


        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ 
                message: 'Invalid or expired verification link. Please register again or contact support.' 
            });
        }


        user.isEmailVerified = true;
        user.isApproved = true; // Auto-approve after email verification
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        console.log(`✅ Email verified for user: ${user.email}`);


        try {
            await sendWelcomeEmail(user);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);

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


const createManualVerificationRequest = async (alumniData, alumniProofFile, deviceFingerprint = '', ipAddress = '') => {
    try {
        const { 
            name, email, collegeName, graduationYear, branch, enrollmentNumber, 
            dateOfBirth, experience, skills, linkedin, alternateEmail, contactNumber 
        } = alumniData;

        // Validate required fields
        if (!name || !email || !collegeName || !graduationYear || !experience || !alternateEmail) {
            return {
                success: false,
                error: 'Missing required fields for manual verification request'
            };
        }

        // Handle file upload if provided
        let alumniProofDocument = '';
        let alumniProofOriginalName = '';

        if (alumniProofFile) {
            try {
                const uploadResult = await uploadToCloudinary(alumniProofFile, 'alumni_verification');
                alumniProofDocument = uploadResult.url;
                alumniProofOriginalName = alumniProofFile.originalname;
            } catch (uploadError) {
                console.error('Failed to upload alumni proof document:', uploadError);
                // Continue without document if upload fails
            }
        }

        // Calculate risk score
        const riskAssessment = await calculateRiskScore({
            name,
            email,
            enrollmentNumber,
            alumniProofDocument,
            alumniProof: alumniProofFile
        }, deviceFingerprint, ipAddress);

        // Auto-reject if risk score > 70
        if (riskAssessment.score > 70) {
            console.log(`🚨 Auto-rejected high-risk verification request for: ${email} (Score: ${riskAssessment.score})`);
            return {
                success: false,
                error: 'Your request has been automatically rejected due to security concerns. Please contact support if you believe this is an error.',
                autoRejected: true,
                riskScore: riskAssessment.score
            };
        }

        // Create verification request
        const verificationRequest = new VerificationQueue({
            name,
            email,
            role: 'alumni',
            collegeName,
            graduationYear: parseInt(graduationYear),
            branch: branch || '',
            enrollmentNumber: enrollmentNumber || '',
            dateOfBirth: dateOfBirth || '',
            experience,
            skills: Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : []),
            linkedin: linkedin || '',
            alumniProofDocument,
            alumniProofOriginalName,
            alternateEmail,
            contactNumber: contactNumber || '',
            status: riskAssessment.score >= 40 ? 'pending' : 'pending', // All go to pending, but admin can filter
            confidenceScore: 0,
            matchedRecords: [],
            riskScore: riskAssessment.score,
            riskSignals: riskAssessment.signals,
            riskLevel: riskAssessment.riskLevel,
            deviceFingerprint: deviceFingerprint || '',
            ipAddress: ipAddress || ''
        });

        await verificationRequest.save();

        console.log(`✅ Created manual verification request for: ${email} (Risk Score: ${riskAssessment.score})`);

        return {
            success: true,
            requestId: verificationRequest._id,
            message: 'Manual verification request created successfully',
            riskScore: riskAssessment.score,
            riskLevel: riskAssessment.riskLevel
        };

    } catch (error) {
        console.error('Error creating manual verification request:', error);
        return {
            success: false,
            error: 'Failed to create manual verification request'
        };
    }
};


const generateVerifiedAccessToken = async (alumniId, alternateEmail) => {
    try {
        // Generate a one-time secure token (UUID with expiry)
        const crypto = require('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Store the token in the verification queue record
        const verificationRequest = await VerificationQueue.findOneAndUpdate(
            { _id: alumniId, status: 'approved' },
            { 
                $set: { 
                    verifiedAccessToken: token,
                    verifiedAccessTokenExpires: expiresAt
                }
            },
            { new: true }
        );

        if (!verificationRequest) {
            return {
                success: false,
                error: 'Approved verification request not found'
            };
        }

        // Send email with the token
        const verificationLink = `${process.env.FRONTEND_URL}/verify-alumni-token?token=${token}&id=${alumniId}`;
        
        const emailSubject = 'AlumniConnect - Your Account Verification Token';
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">Alumni Account Verified!</h2>
                <p>Hello,</p>
                <p>Your alumni verification request has been approved by our admin team. You can now complete your account setup by clicking the link below:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationLink}" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        Complete Account Setup
                    </a>
                </div>
                <p>This link will expire in 24 hours for security reasons.</p>
                <p>If you didn't request this verification, please ignore this email.</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 12px;">
                    AlumniConnect Team<br>
                    Connecting students with alumni for mentorship and career guidance.
                </p>
            </div>
        `;

        // Use the existing email service to send the email
        try {
            // Assuming we have access to nodemailer or similar
            const nodemailer = require('nodemailer');
            
            const transporter = nodemailer.createTransporter({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            await transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: alternateEmail,
                subject: emailSubject,
                html: emailHtml
            });

            console.log(`✅ Sent verified access token email to: ${alternateEmail}`);

        } catch (emailError) {
            console.error('Failed to send verified access token email:', emailError);
            // Don't fail the entire process if email fails
        }

        return {
            success: true,
            message: 'Verified access token generated and email sent',
            token: token,
            expiresAt: expiresAt
        };

    } catch (error) {
        console.error('Error generating verified access token:', error);
        return {
            success: false,
            error: 'Failed to generate verified access token'
        };
    }
};


const updateAlumniRecord = async (alumniId, newEmail) => {
    try {
        // Find the verification request to get the original alumni data
        const verificationRequest = await VerificationQueue.findById(alumniId);
        
        if (!verificationRequest) {
            return {
                success: false,
                error: 'Verification request not found'
            };
        }
        
        if (verificationRequest.status !== 'approved') {
            return {
                success: false,
                error: 'Verification request is not approved'
            };
        }
        
        // Check if user already exists with the new email
        const existingUser = await User.findOne({ email: newEmail });
        if (existingUser) {
            return {
                success: false,
                error: 'User with this email already exists'
            };
        }
        
        // Create or update the alumni record in the User collection
        let user;
        
        // Check if user already exists with the original email
        const existingUserByEmail = await User.findOne({ email: verificationRequest.email });
        
        if (existingUserByEmail) {
            // Update existing user record
            existingUserByEmail.email = newEmail;
            existingUserByEmail.isEmailVerified = true;
            existingUserByEmail.isApproved = true;
            user = await existingUserByEmail.save();
        } else {
            // Create new user record
            user = new User({
                name: verificationRequest.name,
                email: newEmail,
                role: 'alumni',
                collegeName: verificationRequest.collegeName,
                graduationYear: verificationRequest.graduationYear,
                branch: verificationRequest.branch,
                experience: verificationRequest.experience,
                skills: verificationRequest.skills,
                linkedin: verificationRequest.linkedin,
                alumniProofDocument: verificationRequest.alumniProofDocument,
                alumniProofOriginalName: verificationRequest.alumniProofOriginalName,
                isEmailVerified: true,
                isApproved: true
            });
            
            // Set password to a temporary one (user will set their own on first login)
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash('temp_password_' + Date.now(), salt);
            
            await user.save();
        }
        
        console.log(`✅ Updated alumni record for: ${newEmail}`);
        
        return {
            success: true,
            message: 'Alumni record updated successfully',
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            }
        };
        
    } catch (error) {
        console.error('Error updating alumni record:', error);
        return {
            success: false,
            error: 'Failed to update alumni record'
        };
    }
};


const notifyAlumniOnDecision = async (requestId, status, reasonNote) => {
    try {
        // Find the verification request
        const verificationRequest = await VerificationQueue.findById(requestId);
        
        if (!verificationRequest) {
            return {
                success: false,
                error: 'Verification request not found'
            };
        }
        
        const { alternateEmail, name, email } = verificationRequest;
        
        // Prepare email content based on status
        let emailSubject, emailHtml;
        
        if (status === 'approved') {
            emailSubject = 'AlumniConnect - Your Verification Request Has Been Approved!';
            emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333;">Congratulations, ${name}!</h2>
                    <p>Your alumni verification request has been <strong>approved</strong> by our admin team.</p>
                    <p>You can now complete your account setup and start connecting with students for mentorship opportunities.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL}/login" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            Login to Your Account
                        </a>
                    </div>
                    <p>If you have any questions, feel free to contact our support team.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 12px;">
                        AlumniConnect Team<br>
                        Connecting students with alumni for mentorship and career guidance.
                    </p>
                </div>
            `;
        } else {
            // Rejected
            emailSubject = 'AlumniConnect - Your Verification Request Status';
            emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333;">Verification Request Update</h2>
                    <p>Hello ${name},</p>
                    <p>We regret to inform you that your alumni verification request has been <strong>rejected</strong>.</p>
                    ${reasonNote ? `
                    <p><strong>Reason:</strong> ${reasonNote}</p>
                    ` : ''}
                    <p>Please ensure you provide all the required documentation and accurate information when submitting your request.</p>
                    <p>You can resubmit your verification request with the correct information at any time.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL}/register" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            Resubmit Verification Request
                        </a>
                    </div>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 12px;">
                        AlumniConnect Team<br>
                        Connecting students with alumni for mentorship and career guidance.
                    </p>
                </div>
            `;
        }
        
        // Send email using nodemailer
        try {
            const nodemailer = require('nodemailer');
            
            const transporter = nodemailer.createTransporter({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            await transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: alternateEmail,
                subject: emailSubject,
                html: emailHtml
            });

            console.log(`✅ Sent decision notification email to: ${alternateEmail} (Status: ${status})`);

        } catch (emailError) {
            console.error('Failed to send decision notification email:', emailError);
            // Don't fail the entire process if email fails
        }

        return {
            success: true,
            message: `Decision notification sent to ${alternateEmail}`,
            status: status
        };

    } catch (error) {
        console.error('Error sending decision notification:', error);
        return {
            success: false,
            error: 'Failed to send decision notification'
        };
    }
};


const findAlumniByAlternateIdentifiers = async (searchData) => {
    try {
        const { name, graduationYear, branch, enrollmentNumber, dateOfBirth } = searchData;
        let matches = [];
        let confidenceScore = 0;

        // Build query conditions
        const query = {
            role: 'alumni',
            isApproved: true,
            isEmailVerified: true
        };

        // Add name condition (case-insensitive partial match)
        if (name) {
            query.name = { $regex: new RegExp(name.trim(), 'i') };
        }

        // Add graduation year condition
        if (graduationYear) {
            query.graduationYear = parseInt(graduationYear);
        }

        // Add branch condition
        if (branch) {
            query.branch = { $regex: new RegExp(branch.trim(), 'i') };
        }

        // First, try to find by enrollment number (most reliable)
        if (enrollmentNumber) {
            // For now, we don't have enrollmentNumber field in User model
            // So we'll rely on other fields
            console.log('Enrollment number search not implemented - no enrollmentNumber field in User model');
        }

        // Find matching alumni records
        const candidateAlumni = await User.find(query).select('name email graduationYear branch enrollmentNumber dateOfBirth');

        // Calculate confidence score for each match
        candidateAlumni.forEach(alumni => {
            let score = 0;
            let matchedFields = [];

            // Name match (partial match gives some points, exact match gives more)
            if (name) {
                const nameMatch = alumni.name.toLowerCase().includes(name.trim().toLowerCase());
                if (nameMatch) {
                    score += 40;
                    matchedFields.push('name');
                }
            }

            // Graduation year exact match
            if (graduationYear && alumni.graduationYear === parseInt(graduationYear)) {
                score += 30;
                matchedFields.push('graduationYear');
            }

            // Branch match
            if (branch && alumni.branch && alumni.branch.toLowerCase().includes(branch.trim().toLowerCase())) {
                score += 20;
                matchedFields.push('branch');
            }

            // Date of birth match (if available in both)
            if (dateOfBirth && alumni.dateOfBirth && alumni.dateOfBirth === dateOfBirth) {
                score += 10;
                matchedFields.push('dateOfBirth');
            }

            // Enrollment number would be highest priority if we had it
            if (enrollmentNumber) {
                // Placeholder for future implementation
                console.log('Enrollment number matching not implemented');
            }

            if (score > 0) {
                matches.push({
                    ...alumni.toObject(),
                    confidenceScore: score,
                    matchedFields: matchedFields
                });
            }
        });

        // Sort by confidence score (highest first)
        matches.sort((a, b) => b.confidenceScore - a.confidenceScore);

        return {
            success: true,
            matches: matches,
            totalMatches: matches.length,
            highestConfidence: matches.length > 0 ? matches[0].confidenceScore : 0
        };

    } catch (error) {
        console.error('Error in findAlumniByAlternateIdentifiers:', error);
        return {
            success: false,
            matches: [],
            error: 'Failed to search alumni records'
        };
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserStats,
    verifyEmail,
    getAllAlumni,
    findAlumniByAlternateIdentifiers,
    createManualVerificationRequest,
    generateVerifiedAccessToken,
    updateAlumniRecord,
    notifyAlumniOnDecision,
};
