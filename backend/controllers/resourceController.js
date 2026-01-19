const Resource = require('../models/Resource');
const path = require('path');
const fs = require('fs');

// Upload resource
const uploadResource = async (req, res) => {
    try {
        const { title, description, category, tags } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];

        // Auto-approve all resources (no admin approval needed)
        const isApproved = true;

        const resource = await Resource.create({
            title,
            description,
            category,
            file: req.file.path,
            uploadedBy: req.user._id,
            uploaderName: req.user.name,
            uploaderRole: req.user.role,
            tags: tagsArray,
            isApproved: isApproved,
        });

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

// Get all approved resources
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

// Get single resource
const getResourceById = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id)
            .populate('uploadedBy', 'name email role collegeName graduationYear avatar bio company jobTitle');

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        res.json(resource);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Download resource
const downloadResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        // Check if file exists
        const filePath = path.join(__dirname, '../', resource.file);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ 
                message: 'File not found on server. It may have been deleted.' 
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

// Like resource
const likeResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        const alreadyLiked = resource.likedBy.includes(req.user._id);

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
            isLiked: !alreadyLiked,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user's uploaded resources
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

// Delete resource
const deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        // Check if user owns the resource
        if (resource.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this resource' });
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
    getMyResources,
    deleteResource,
};
