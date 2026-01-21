const Message = require('../models/Message');
const User = require('../models/User');

// Send a message
const sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;

        if (!receiverId || !content) {
            return res.status(400).json({ 
                message: 'Receiver ID and content are required' 
            });
        }

        // Check if receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        const message = await Message.create({
            sender: req.user._id,
            receiver: receiverId,
            content: content.trim(),
        });

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'name avatar role')
            .populate('receiver', 'name avatar role');

        res.status(201).json({
            success: true,
            message: populatedMessage,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get conversation between two users
const getConversation = async (req, res) => {
    try {
        const { userId } = req.params;

        const messages = await Message.find({
            $or: [
                { sender: req.user._id, receiver: userId },
                { sender: userId, receiver: req.user._id },
            ],
        })
            .populate('sender', 'name avatar role')
            .populate('receiver', 'name avatar role')
            .sort({ createdAt: 1 });

        // Mark messages as read
        await Message.updateMany(
            {
                sender: userId,
                receiver: req.user._id,
                read: false,
            },
            {
                read: true,
                readAt: new Date(),
            }
        );

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all conversations (list of users you've chatted with)
const getConversations = async (req, res) => {
    try {
        // Get all unique users the current user has messaged with
        const sentMessages = await Message.find({ sender: req.user._id })
            .select('receiver')
            .distinct('receiver');
        
        const receivedMessages = await Message.find({ receiver: req.user._id })
            .select('sender')
            .distinct('sender');

        // Combine and get unique user IDs
        const userIds = [...new Set([...sentMessages, ...receivedMessages])];

        // Get user details and last message for each conversation
        const conversations = await Promise.all(
            userIds.map(async (userId) => {
                const user = await User.findById(userId).select('name avatar role company jobTitle');
                
                // Get last message
                const lastMessage = await Message.findOne({
                    $or: [
                        { sender: req.user._id, receiver: userId },
                        { sender: userId, receiver: req.user._id },
                    ],
                })
                    .sort({ createdAt: -1 })
                    .limit(1);

                // Count unread messages
                const unreadCount = await Message.countDocuments({
                    sender: userId,
                    receiver: req.user._id,
                    read: false,
                });

                return {
                    user,
                    lastMessage,
                    unreadCount,
                };
            })
        );

        // Sort by last message time
        conversations.sort((a, b) => {
            const timeA = a.lastMessage?.createdAt || 0;
            const timeB = b.lastMessage?.createdAt || 0;
            return new Date(timeB) - new Date(timeA);
        });

        res.json(conversations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a message
const deleteMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check if user is the sender
        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                message: 'Not authorized to delete this message' 
            });
        }

        await Message.findByIdAndDelete(req.params.id);

        res.json({ 
            success: true, 
            message: 'Message deleted successfully' 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
    try {
        const count = await Message.countDocuments({
            receiver: req.user._id,
            read: false,
        });

        res.json({ count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    sendMessage,
    getConversation,
    getConversations,
    deleteMessage,
    getUnreadCount,
};
