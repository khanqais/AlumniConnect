const Resource = require('../models/Resource');
const cloudinary = require('../config/cloudinary');
const { uploadToCloudinary } = require('../services/uploadService');
const { notifyAllUsers } = require('../utils/notifications');


const uploadResource = async (req, res) => {
    try {

        if (req.user.role !== 'alumni') {
            return res.status(403).json({ 
                message: 'Only alumni can upload resources' 
            });
        }

        const { title, description, category, tags } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];


        const isApproved = true;


        let fileUrl = '';
        let filePublicId = '';
        
        try {
            const timestamp = Date.now();
            const safeFilename = `resource-${timestamp}`;
            
            const uploadResult = await uploadToCloudinary(
                req.file.buffer,
                'alumniconnect/resources',
                safeFilename,
                'raw'
            );
            fileUrl = uploadResult.secure_url;
            filePublicId = uploadResult.public_id;
        } catch (uploadError) {
            console.error('Error uploading resource:', uploadError);
            return res.status(500).json({ message: 'Failed to upload file. Please try again.' });
        }

        const resource = await Resource.create({
            title,
            description,
            category,
            file: fileUrl,
            filePublicId: filePublicId,
            uploadedBy: req.user._id,
            uploaderName: req.user.name,
            uploaderRole: req.user.role,
            tags: tagsArray,
            isApproved: isApproved,
        });


        notifyAllUsers({
            sender: req.user._id,
            type: 'resource',
            title: 'New Resource Shared',
            message: `${req.user.name} shared "${title}"`,
            link: '/resources',
            relatedId: resource._id,
            excludeUserId: req.user._id,
        }).catch(() => {});

        res.status(201).json({
            success: true,
            message: 'Resource uploaded and published successfully!',
            resource,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const getResources = async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = { isApproved: true };

        if (category && category !== 'all') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const resources = await Resource.find(query)
            .populate('uploadedBy', 'name email role collegeName avatar bio company jobTitle')
            .sort({ createdAt: -1 });

        res.json(resources);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const getResourceById = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id)
            .populate('uploadedBy', 'name email role collegeName graduationYear avatar bio company jobTitle')
            .populate('comments.user', 'name avatar');

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        res.json(resource);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const downloadResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        if (!resource.file) {
            return res.status(404).json({ 
                'message': 'File not available.' 
            });
        }

        resource.downloads += 1;
        await resource.save();

        res.json({
            success: true,
            filePath: resource.file,
            downloads: resource.downloads,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const likeResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        const alreadyLiked = resource.likedBy.includes(req.user._id);
        const alreadyDisliked = resource.dislikedBy.includes(req.user._id);


        if (alreadyDisliked) {
            resource.dislikes -= 1;
            resource.dislikedBy = resource.dislikedBy.filter(
                (userId) => userId.toString() !== req.user._id.toString()
            );
        }

        if (alreadyLiked) {
            resource.likes -= 1;
            resource.likedBy = resource.likedBy.filter(
                (userId) => userId.toString() !== req.user._id.toString()
            );
        } else {
            resource.likes += 1;
            resource.likedBy.push(req.user._id);
        }

        await resource.save();

        res.json({
            success: true,
            likes: resource.likes,
            dislikes: resource.dislikes,
            isLiked: !alreadyLiked,
            isDisliked: false,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const dislikeResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        const alreadyDisliked = resource.dislikedBy.includes(req.user._id);
        const alreadyLiked = resource.likedBy.includes(req.user._id);


        if (alreadyLiked) {
            resource.likes -= 1;
            resource.likedBy = resource.likedBy.filter(
                (userId) => userId.toString() !== req.user._id.toString()
            );
        }

        if (alreadyDisliked) {
            resource.dislikes -= 1;
            resource.dislikedBy = resource.dislikedBy.filter(
                (userId) => userId.toString() !== req.user._id.toString()
            );
        } else {
            resource.dislikes += 1;
            resource.dislikedBy.push(req.user._id);
        }

        await resource.save();

        res.json({
            success: true,
            likes: resource.likes,
            dislikes: resource.dislikes,
            isLiked: false,
            isDisliked: !alreadyDisliked,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const addComment = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || text.trim() === '') {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        const comment = {
            user: req.user._id,
            userName: req.user.name,
            userAvatar: req.user.avatar || '',
            text: text.trim(),
            createdAt: new Date(),
        };

        resource.comments.push(comment);
        await resource.save();


        await resource.populate('comments.user', 'name avatar');

        res.json({
            success: true,
            message: 'Comment added successfully',
            comments: resource.comments,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        const comment = resource.comments.id(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }


        if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        resource.comments.pull(commentId);
        await resource.save();

        res.json({
            success: true,
            message: 'Comment deleted successfully',
            comments: resource.comments,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const getMyResources = async (req, res) => {
    try {
        const resources = await Resource.find({ uploadedBy: req.user._id })
            .sort({ createdAt: -1 });

        res.json(resources);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }


        if (resource.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this resource' });
        }


        if (resource.filePublicId) {
            try {
                await cloudinary.uploader.destroy(resource.filePublicId, { resource_type: 'raw' });
            } catch (error) {
                console.error('Error deleting file from Cloudinary:', error);
            }
        }

        await Resource.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'Resource deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    uploadResource,
    getResources,
    getResourceById,
    downloadResource,
    likeResource,
    dislikeResource,
    addComment,
    deleteComment,
    getMyResources,
    deleteResource,
};
