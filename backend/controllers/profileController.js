const User = require('../models/User');
const bcrypt = require('bcryptjs');
const cloudinary = require('../config/cloudinary');


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
                banner: user.banner,
                linkedin: user.linkedin,
                github: user.github,
                twitter: user.twitter,
                website: user.website,
                company: user.company,
                jobTitle: user.jobTitle,
                workExperience: user.workExperience,
                cgpa: user.cgpa,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password -emailVerificationToken -emailVerificationExpires');

        res.json({
            success: true,
            user,
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


const updateMyProfile = async (req, res) => {
    try {
        const {
            name,
            bio,
            skills,
            target_skills,
            cgpa,
            linkedin,
            github,
            twitter,
            website,
            company,
            jobTitle,
            graduationYear,
            experience,
            workExperience,
        } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (cgpa !== undefined) {
            return res.status(400).json({
                message: 'CGPA can only be set during registration and cannot be modified from profile.',
            });
        }

        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (skills) user.skills = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim());
        if (linkedin !== undefined) user.linkedin = linkedin;
        if (github !== undefined) user.github = github;
        if (twitter !== undefined) user.twitter = twitter;
        if (website !== undefined) user.website = website;
        if (company !== undefined) user.company = company;
        if (jobTitle !== undefined) user.jobTitle = jobTitle;

        if (workExperience !== undefined) {
            if (!Array.isArray(workExperience)) {
                return res.status(400).json({ message: 'workExperience must be an array' });
            }

            user.workExperience = workExperience.map((entry) => ({
                id: String(entry?.id || Date.now()),
                company: String(entry?.company || '').trim(),
                jobTitle: String(entry?.jobTitle || '').trim(),
                startDate: String(entry?.startDate || '').trim(),
                endDate: String(entry?.endDate || '').trim(),
                currentlyWorking: Boolean(entry?.currentlyWorking),
                description: String(entry?.description || '').trim(),
            }));
        }

        if (user.role === 'student') {
            if (target_skills !== undefined) {
                user.target_skills = Array.isArray(target_skills)
                    ? target_skills
                    : target_skills.split(',').map((s) => s.trim()).filter((s) => s);
            }
        }

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
                target_skills: user.target_skills,
                linkedin: user.linkedin,
                github: user.github,
                twitter: user.twitter,
                website: user.website,
                company: user.company,
                jobTitle: user.jobTitle,
                graduationYear: user.graduationYear,
                experience: user.experience,
                workExperience: user.workExperience,
                banner: user.banner,
                cgpa: user.cgpa,
            },
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'alumniconnect/avatars',
                    resource_type: 'image',
                },
                (error, result) => {
                    if (error) return reject(error);
                    return resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        if (user.avatarPublicId) {
            try {
                await cloudinary.uploader.destroy(user.avatarPublicId);
            } catch (error) {
                console.error('Error removing old avatar:', error);
            }
        }

        user.avatar = uploadResult.secure_url;
        user.avatarPublicId = uploadResult.public_id;
        await user.save();

        res.json({
            success: true,
            message: 'Avatar uploaded successfully',
            avatar: user.avatar,
        });
    } catch (error) {
        console.error('Error uploading avatar:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


const uploadBanner = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'alumniconnect/banners',
                    resource_type: 'image',
                },
                (error, result) => {
                    if (error) return reject(error);
                    return resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        if (user.bannerPublicId) {
            try {
                await cloudinary.uploader.destroy(user.bannerPublicId);
            } catch (error) {
                console.error('Error removing old banner:', error);
            }
        }

        user.banner = uploadResult.secure_url;
        user.bannerPublicId = uploadResult.public_id;
        await user.save();

        res.json({
            success: true,
            message: 'Banner uploaded successfully',
            banner: user.banner,
        });
    } catch (error) {
        console.error('Error uploading banner:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide current and new password' });
        }

        const user = await User.findById(req.user._id);

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully',
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
    uploadBanner,
    changePassword,
};
