const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc Get user profile
// @route GET /api/profile/:userId
// @access Public
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password -emailVerificationToken -emailVerificationExpires');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                collegeName: user.collegeName,
                graduationYear: user.graduationYear,
                experience: user.experience,
                skills: user.skills,
                bio: user.bio,
                avatar: user.avatar,
                linkedin: user.linkedin,
                github: user.github,
                twitter: user.twitter,
                website: user.website,
                company: user.company,
                jobTitle: user.jobTitle,
                createdAt: user.createdAt,
            }
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Get current user's own profile
// @route GET /api/profile/me
// @access Private
const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password -emailVerificationToken -emailVerificationExpires');
        
        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Update user profile
// @route PUT /api/profile/me
// @access Private
const updateMyProfile = async (req, res) => {
    try {
        const {
            name,
            bio,
            skills,
            linkedin,
            github,
            twitter,
            website,
            company,
            jobTitle,
            graduationYear,
            experience
        } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (skills) user.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
        if (linkedin !== undefined) user.linkedin = linkedin;
        if (github !== undefined) user.github = github;
        if (twitter !== undefined) user.twitter = twitter;
        if (website !== undefined) user.website = website;
        if (company !== undefined) user.company = company;
        if (jobTitle !== undefined) user.jobTitle = jobTitle;
        
        // Alumni-specific fields
        if (user.role === 'alumni') {
            if (graduationYear) user.graduationYear = graduationYear;
            if (experience !== undefined) user.experience = experience;
        }

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                bio: user.bio,
                skills: user.skills,
                linkedin: user.linkedin,
                github: user.github,
                twitter: user.twitter,
                website: user.website,
                company: user.company,
                jobTitle: user.jobTitle,
                graduationYear: user.graduationYear,
                experience: user.experience,
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Upload profile avatar
// @route POST /api/profile/avatar
// @access Private
const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.avatar = req.file.path;
        await user.save();

        res.json({
            success: true,
            message: 'Avatar uploaded successfully',
            avatar: user.avatar
        });
    } catch (error) {
        console.error('Error uploading avatar:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Change password
// @route PUT /api/profile/password
// @access Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide current and new password' });
        }

        const user = await User.findById(req.user._id);

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getUserProfile,
    getMyProfile,
    updateMyProfile,
    uploadAvatar,
    changePassword,
};
