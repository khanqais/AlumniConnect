const User = require('../models/User');
const Resource = require('../models/Resource');
const Blog = require('../models/Blog');
const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');

// @desc Admin login (check against .env)
// @route POST /api/admin/login
// @access Public
const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check against environment variables
        if (
            email === process.env.ADMIN_EMAIL && 
            password === process.env.ADMIN_PASSWORD
        ) {
            // Admin credentials are correct
            res.json({
                success: true,
                message: 'Admin login successful',
                admin: {
                    name: 'Admin',
                    email: email,
                    role: 'admin'
                }
            });
        } else {
            res.status(401).json({ 
                success: false,
                message: 'Invalid admin credentials' 
            });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Get all pending users (students/alumni)
// @route GET /api/admin/pending
// @access Private/Admin
const getPendingUsers = async (req, res) => {
    try {
        const users = await User.find({ 
            isApproved: false,
            role: { $ne: 'admin' } 
        })
        .select('-password')
        .sort({ createdAt: -1 });

        res.json(users);
    } catch (error) {
        console.error('Get pending users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Get all approved users
// @route GET /api/admin/approved
// @access Private/Admin
const getApprovedUsers = async (req, res) => {
    try {
        const users = await User.find({ 
            isApproved: true,
            role: { $ne: 'admin' } 
        })
        .select('-password')
        .sort({ createdAt: -1 });

        res.json(users);
    } catch (error) {
        console.error('Get approved users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Get user by ID with document details
// @route GET /api/admin/user/:id
// @access Private/Admin
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// @desc Update user approval status (approve/reject)
// @route PUT /api/admin/status/:id
// @access Private/Admin
const updateUserStatus = async (req, res) => {
    try {
        const { status, reason } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent modifying admin accounts
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot modify admin accounts' });
        }

        if (status === 'approved') {
            // Approve the user and mark email as verified so they can log in
            user.isApproved = true;
            user.isEmailVerified = true;
            await user.save();

            res.json({
                success: true,
                message: `${user.name} has been approved successfully`,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isApproved: user.isApproved,
                }
            });

        } else if (status === 'rejected') {
            // Store user info before deletion
            const rejectedUser = {
                name: user.name,
                email: user.email,
                role: user.role,
            };

            // Delete the rejected user
            await User.findByIdAndDelete(req.params.id);

            res.json({
                success: true,
                message: `${rejectedUser.name}'s application has been rejected and removed`,
                reason: reason || 'No reason provided'
            });

        } else {
            res.status(400).json({ 
                success: false,
                message: 'Invalid status. Use "approved" or "rejected"' 
            });
        }

    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Get admin dashboard statistics
// @route GET /api/admin/stats
// @access Private/Admin
const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ 
            role: { $ne: 'admin' } 
        });

        const pendingUsers = await User.countDocuments({ 
            isApproved: false,
            role: { $ne: 'admin' } 
        });

        const approvedUsers = await User.countDocuments({ 
            isApproved: true,
            role: { $ne: 'admin' } 
        });

        const totalStudents = await User.countDocuments({ 
            role: 'student' 
        });

        const totalAlumni = await User.countDocuments({ 
            role: 'alumni' 
        });

        // Calculate approval rate
        const approvalRate = totalUsers > 0 
            ? ((approvedUsers / totalUsers) * 100).toFixed(2) 
            : 0;

        res.json({
            totalUsers,
            pendingUsers,
            approvedUsers,
            totalStudents,
            totalAlumni,
            approvalRate,
        });

    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
const getPendingResources = async (req, res) => {
    try {
        const resources = await Resource.find({ isApproved: false })
            .populate('uploadedBy', 'name email role collegeName')
            .sort({ createdAt: -1 });

        res.json(resources);
    } catch (error) {
        console.error('Get pending resources error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Get all approved resources
// @route GET /api/admin/resources/approved
// @access Private/Admin
const getApprovedResources = async (req, res) => {
    try {
        const resources = await Resource.find({ isApproved: true })
            .populate('uploadedBy', 'name email role collegeName')
            .sort({ createdAt: -1 });

        res.json(resources);
    } catch (error) {
        console.error('Get approved resources error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Approve or reject resource
// @route PUT /api/admin/resources/status/:id
// @access Private/Admin
const updateResourceStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        if (status === 'approved') {
            resource.isApproved = true;
            await resource.save();

            res.json({
                success: true,
                message: 'Resource approved successfully',
                resource,
            });
        } else if (status === 'rejected') {
            await Resource.findByIdAndDelete(req.params.id);

            res.json({
                success: true,
                message: 'Resource rejected and deleted',
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid status. Use "approved" or "rejected"',
            });
        }
    } catch (error) {
        console.error('Update resource status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Delete any resource (admin)
// @route DELETE /api/admin/resources/:id
// @access Private/Admin
const deleteResourceAdmin = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        await Resource.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'Resource deleted successfully' });
    } catch (error) {
        console.error('Delete resource error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Get all pending blogs
// @route GET /api/admin/blogs/pending
// @access Private/Admin
const getPendingBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ isPublished: false })
            .populate('author', 'name email role collegeName')
            .sort({ createdAt: -1 });

        res.json(blogs);
    } catch (error) {
        console.error('Get pending blogs error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Get all published blogs
// @route GET /api/admin/blogs/published
// @access Private/Admin
const getPublishedBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ isPublished: true })
            .populate('author', 'name email role collegeName')
            .sort({ createdAt: -1 });

        res.json(blogs);
    } catch (error) {
        console.error('Get published blogs error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Approve or reject blog
// @route PUT /api/admin/blogs/status/:id
// @access Private/Admin
const updateBlogStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        if (status === 'approved') {
            blog.isPublished = true;
            await blog.save();

            res.json({
                success: true,
                message: 'Blog published successfully',
                blog,
            });
        } else if (status === 'rejected') {
            await Blog.findByIdAndDelete(req.params.id);

            res.json({
                success: true,
                message: 'Blog rejected and deleted',
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid status. Use "approved" or "rejected"',
            });
        }
    } catch (error) {
        console.error('Update blog status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Delete any blog (admin)
// @route DELETE /api/admin/blogs/:id
// @access Private/Admin
const deleteBlogAdmin = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        await Blog.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Delete blog error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// @desc Search & filter alumni database
// @route GET /api/admin/alumni/search
// @access Private/Admin
const searchAlumni = async (req, res) => {
    try {
        const { name, graduationYear, branch, company, skills, page = 1, limit = 20 } = req.query;

        const filter = { role: 'alumni', isApproved: true };

        if (name && name.trim()) {
            filter.$or = [
                { name: { $regex: name.trim(), $options: 'i' } },
                { email: { $regex: name.trim(), $options: 'i' } },
            ];
        }

        if (graduationYear) {
            const year = parseInt(graduationYear);
            if (!isNaN(year)) filter.graduationYear = year;
        }

        if (branch && branch.trim()) {
            filter.branch = { $regex: branch.trim(), $options: 'i' };
        }

        if (company && company.trim()) {
            filter.company = { $regex: company.trim(), $options: 'i' };
        }

        if (skills && skills.trim()) {
            const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean);
            if (skillList.length > 0) {
                filter.skills = { $in: skillList.map((s) => new RegExp(s, 'i')) };
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await User.countDocuments(filter);
        const alumni = await User.find(filter)
            .select('-password -emailVerificationToken -emailVerificationExpires')
            .sort({ graduationYear: -1, name: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            alumni,
        });
    } catch (error) {
        console.error('Search alumni error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Update student CGPA (admin-verified)
// @route PUT /api/admin/user/:id/cgpa
// @access Private/Admin
const updateStudentCGPA = async (req, res) => {
    try {
        const { cgpa } = req.body;

        if (cgpa === undefined || cgpa === null) {
            return res.status(400).json({ message: 'CGPA value is required' });
        }

        const cgpaNum = parseFloat(cgpa);
        if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
            return res.status(400).json({ message: 'CGPA must be between 0 and 10' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot modify admin accounts' });
        }

        user.cgpa = cgpaNum;
        await user.save();

        res.json({
            success: true,
            message: `CGPA updated to ${cgpaNum} for ${user.name}`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                cgpa: user.cgpa,
            },
        });
    } catch (error) {
        console.error('Update CGPA error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Ban or unban a user
// @route PUT /api/admin/user/:id/ban
// @access Private/Admin
const toggleUserBan = async (req, res) => {
    try {
        const { ban, reason } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot ban admin accounts' });
        }

        user.isBanned = !!ban;
        user.banReason = ban ? (reason || 'Violation of platform policies') : '';
        await user.save();

        res.json({
            success: true,
            message: ban
                ? `${user.name} has been banned: ${user.banReason}`
                : `${user.name} has been unbanned`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isBanned: user.isBanned,
                banReason: user.banReason,
            },
        });
    } catch (error) {
        console.error('Toggle ban error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Get referral system stats
// @route GET /api/admin/referral-stats
// @access Private/Admin
const getReferralStats = async (req, res) => {
    try {
        const Referral = require('../models/Referral');
        const ReferralApplication = require('../models/ReferralApplication');

        const totalReferrals = await Referral.countDocuments();
        const openReferrals = await Referral.countDocuments({ status: 'open' });
        const totalApplications = await ReferralApplication.countDocuments();
        const referredCount = await ReferralApplication.countDocuments({ status: 'referred' });
        const flaggedApplications = await ReferralApplication.countDocuments({
            'fraudFlags.0': { $exists: true },
        });

        res.json({
            success: true,
            stats: {
                totalReferrals,
                openReferrals,
                totalApplications,
                referredCount,
                flaggedApplications,
            },
        });
    } catch (error) {
        console.error('Referral stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Create college announcement
// @route POST /api/admin/announcements
// @access Private/Admin
const createAnnouncement = async (req, res) => {
    try {
        const { title, content, category } = req.body;
        const adminEmail = req.headers['admin-email'];
        const adminId = req.headers['admin-id'];

        if (!title || !content || !category) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Create announcement without postedBy reference for now
        const announcement = new Announcement({
            title,
            content,
            category,
            postedBy: null, // Will be fixed if needed with a system admin user
            adminName: 'Admin',
            adminEmail: adminEmail || 'admin@college.edu',
        });

        await announcement.save();

        // Create notifications for all approved users
        try {
            const allUsers = await User.find({ isApproved: true });
            const notifications = allUsers.map(user => ({
                recipient: user._id,
                sender: null,
                type: 'announcement',
                title: `New ${category} Announcement`,
                message: `New ${category} announcement: ${title}`,
                link: '/dashboard',
                relatedId: announcement._id,
                read: false,
            }));

            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
            }
        } catch (notifError) {
            // Log notification error but don't fail the announcement creation
            console.warn('Error creating notifications:', notifError);
        }

        res.json({
            success: true,
            message: 'Announcement created successfully',
            announcement,
        });
    } catch (error) {
        console.error('Create announcement error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc Get all announcements
// @route GET /api/admin/announcements
// @access Private
const getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .populate('postedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(announcements);
    } catch (error) {
        console.error('Get announcements error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Get announcements by category
// @route GET /api/admin/announcements/:category
// @access Private
const getAnnouncementsByCategory = async (req, res) => {
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
};

// @desc Delete announcement
// @route DELETE /api/admin/announcements/:id
// @access Private/Admin
const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;

        const announcement = await Announcement.findByIdAndDelete(id);

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        // Delete related notifications
        await Notification.deleteMany({ announcement: id });

        res.json({
            success: true,
            message: 'Announcement deleted successfully',
        });
    } catch (error) {
        console.error('Delete announcement error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Update announcement
// @route PUT /api/admin/announcements/:id
// @access Private/Admin
const updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, category, isPublished } = req.body;

        const announcement = await Announcement.findByIdAndUpdate(
            id,
            { title, content, category, isPublished, updatedAt: Date.now() },
            { new: true }
        );

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        res.json({
            success: true,
            message: 'Announcement updated successfully',
            announcement,
        });
    } catch (error) {
        console.error('Update announcement error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    adminLogin,
    getPendingUsers,
    getApprovedUsers,
    getUserById,
    updateUserStatus,
    getAdminStats,
    getPendingResources,
    getApprovedResources,
    updateResourceStatus,
    deleteResourceAdmin,
    getPendingBlogs,
    getPublishedBlogs,
    updateBlogStatus,
    deleteBlogAdmin,
    searchAlumni,
    updateStudentCGPA,
    toggleUserBan,
    getReferralStats,
    createAnnouncement,
    getAnnouncements,
    getAnnouncementsByCategory,
    deleteAnnouncement,
    updateAnnouncement,
};
