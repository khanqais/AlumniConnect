const User = require('../models/User');

// Follow a user
const followUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (userId === req.user._id.toString()) {
            return res.status(400).json({ 
                message: 'You cannot follow yourself' 
            });
        }

        const userToFollow = await User.findById(userId);
        if (!userToFollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        const currentUser = await User.findById(req.user._id);

        // Check if already following
        const isFollowing = currentUser.following.includes(userId);

        if (isFollowing) {
            // Unfollow
            currentUser.following = currentUser.following.filter(
                (id) => id.toString() !== userId
            );
            userToFollow.followers = userToFollow.followers.filter(
                (id) => id.toString() !== req.user._id.toString()
            );

            await currentUser.save();
            await userToFollow.save();

            return res.json({
                success: true,
                message: 'Unfollowed successfully',
                isFollowing: false,
                followersCount: userToFollow.followers.length,
                followingCount: currentUser.following.length,
            });
        }

        // Follow
        currentUser.following.push(userId);
        userToFollow.followers.push(req.user._id);

        await currentUser.save();
        await userToFollow.save();

        res.json({
            success: true,
            message: 'Followed successfully',
            isFollowing: true,
            followersCount: userToFollow.followers.length,
            followingCount: currentUser.following.length,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get followers
const getFollowers = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).populate(
            'followers',
            'name email avatar role company jobTitle'
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.followers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get following
const getFollowing = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).populate(
            'following',
            'name email avatar role company jobTitle'
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.following);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Check if following
const checkFollowing = async (req, res) => {
    try {
        const { userId } = req.params;

        const currentUser = await User.findById(req.user._id);
        const isFollowing = currentUser.following.includes(userId);

        const targetUser = await User.findById(userId);

        res.json({
            isFollowing,
            followersCount: targetUser.followers.length,
            followingCount: targetUser.following.length,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    followUser,
    getFollowers,
    getFollowing,
    checkFollowing,
};
