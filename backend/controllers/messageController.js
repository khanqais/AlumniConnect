const Message = require('../models/Message');
const User = require('../models/User');
const AlumniGroup = require('../models/AlumniGroup');
const GroupMessage = require('../models/GroupMessage');
const { notifyUser } = require('../utils/notifications');
const cloudinary = require('../config/cloudinary');

const getChatMediaType = (mimeType = '') => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'file';
};

const getCloudinaryResourceType = (mimeType = '') => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'video';
    return 'raw';
};

const sanitizeFileName = (fileName = 'attachment') =>
    fileName
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9._-]/g, '');

const extractFormatFromName = (fileName = '') => {
    const parts = fileName.split('.');
    if (parts.length < 2) return '';
    return parts[parts.length - 1].toLowerCase();
};

const splitPublicIdAndFormat = (mediaPublicId = '') => {
    const lastSlashIndex = mediaPublicId.lastIndexOf('/');
    const prefix = lastSlashIndex >= 0 ? mediaPublicId.slice(0, lastSlashIndex + 1) : '';
    const fileName = lastSlashIndex >= 0 ? mediaPublicId.slice(lastSlashIndex + 1) : mediaPublicId;
    const dotIndex = fileName.lastIndexOf('.');

    if (dotIndex <= 0) {
        return {
            publicId: mediaPublicId,
            format: '',
        };
    }

    return {
        publicId: `${prefix}${fileName.slice(0, dotIndex)}`,
        format: fileName.slice(dotIndex + 1).toLowerCase(),
    };
};

const buildSignedRawFileUrl = (mediaPublicId = '', format = '') => {
    if (!mediaPublicId || !format) return '';

    const candidates = [];

    candidates.push({ publicId: mediaPublicId, format });

    const { publicId: basePublicId, format: embeddedFormat } = splitPublicIdAndFormat(mediaPublicId);
    candidates.push({ publicId: basePublicId, format: embeddedFormat || format });

    if (basePublicId && !basePublicId.endsWith(`.${format}`)) {
        candidates.push({ publicId: `${basePublicId}.${format}`, format });
    }

    const deduped = [];
    const seen = new Set();
    for (const candidate of candidates) {
        const key = `${candidate.publicId}::${candidate.format}`;
        if (!candidate.publicId || !candidate.format || seen.has(key)) continue;
        seen.add(key);
        deduped.push(candidate);
    }

    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
    return deduped.map((candidate) =>
        cloudinary.utils.private_download_url(candidate.publicId, candidate.format, {
            resource_type: 'raw',
            type: 'upload',
            expires_at: expiresAt,
        })
    );
};

const buildAccessibleMediaUrl = (message) => {
    if (!message?.mediaUrl) return undefined;

    if (message.mediaType !== 'file') {
        return message.mediaUrl;
    }

    if (!message.mediaPublicId) {
        return message.mediaUrl;
    }

    try {
        const { format: publicIdFormat } = splitPublicIdAndFormat(message.mediaPublicId);
        const format =
            publicIdFormat ||
            extractFormatFromName(message.mediaOriginalName || '') ||
            extractFormatFromName(message.mediaMimeType || '');

        if (!format) {
            return message.mediaUrl;
        }

        const signedUrls = buildSignedRawFileUrl(message.mediaPublicId, format);
        return signedUrls[0] || message.mediaUrl;
    } catch (error) {
        return message.mediaUrl;
    }
};

const normalizeMessageForResponse = (messageDoc) => {
    const normalized =
        typeof messageDoc?.toObject === 'function' ? messageDoc.toObject() : { ...messageDoc };

    if (normalized?.mediaUrl) {
        normalized.mediaUrl = buildAccessibleMediaUrl(normalized);
    }

    return normalized;
};

// Send a message
const sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const trimmedContent = (content || '').trim();
        const file = req.file;

        if (!receiverId || (!trimmedContent && !file)) {
            return res.status(400).json({ 
                message: 'Receiver ID and either message content or media are required' 
            });
        }

        // Check if receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        let mediaData = {};
        if (file) {
            const resourceType = getCloudinaryResourceType(file.mimetype);
            const safeOriginalName = sanitizeFileName(file.originalname || 'attachment');

            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'alumniconnect/chat-media',
                        resource_type: resourceType,
                        access_mode: 'public',
                        use_filename: true,
                        unique_filename: true,
                        filename_override: safeOriginalName,
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        return resolve(result);
                    }
                );

                uploadStream.end(file.buffer);
            });

            mediaData = {
                mediaUrl: uploadResult.secure_url,
                mediaPublicId: uploadResult.public_id,
                mediaType: getChatMediaType(file.mimetype),
                mediaOriginalName: file.originalname,
                mediaMimeType: file.mimetype,
            };
        }

        const message = await Message.create({
            sender: req.user._id,
            receiver: receiverId,
            content: trimmedContent,
            ...mediaData,
        });

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'name avatar role')
            .populate('receiver', 'name avatar role');

        // Notify the receiver about the new message (fire-and-forget)
        notifyUser(receiverId, {
            sender: req.user._id,
            type: 'message',
            title: 'New Message',
            message: `${req.user.name} sent you a message`,
            link: '/chat',
            relatedId: message._id,
        }).catch(() => {});

        res.status(201).json({
            success: true,
            message: normalizeMessageForResponse(populatedMessage),
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

        res.json(messages.map(normalizeMessageForResponse));
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
                    lastMessage: lastMessage ? normalizeMessageForResponse(lastMessage) : null,
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

const getGroupConversation = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await AlumniGroup.findOne({ _id: groupId, members: req.user._id }).select('_id');
        if (!group) {
            return res.status(403).json({ message: 'You are not a member of this group' });
        }

        const messages = await GroupMessage.find({ group: groupId })
            .populate('sender', 'name avatar role')
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const sendGroupMessage = async (req, res) => {
    try {
        const { groupId } = req.params;
        const content = String(req.body.content || '').trim();

        if (!content) {
            return res.status(400).json({ message: 'Message content is required' });
        }

        const group = await AlumniGroup.findOne({ _id: groupId, members: req.user._id }).select('_id');
        if (!group) {
            return res.status(403).json({ message: 'You are not a member of this group' });
        }

        const message = await GroupMessage.create({
            group: groupId,
            sender: req.user._id,
            content,
        });

        const populated = await GroupMessage.findById(message._id).populate('sender', 'name avatar role');

        res.status(201).json({ success: true, message: populated });
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
    getGroupConversation,
    sendGroupMessage,
};
