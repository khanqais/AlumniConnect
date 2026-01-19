const User = require('../models/User');
const Resource = require('../models/Resource');
const Blog = require('../models/Blog');

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
            // Approve the user
            user.isApproved = true;
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

};
