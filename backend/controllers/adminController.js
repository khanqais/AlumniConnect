const User = require('../models/User');

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

module.exports = {
    adminLogin,
    getPendingUsers,
    getApprovedUsers,
    getUserById,
    updateUserStatus,
    getAdminStats,
};
