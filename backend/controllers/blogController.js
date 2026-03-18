const Blog = require('../models/Blog');
const cloudinary = require('../config/cloudinary');
const { uploadToCloudinary } = require('../services/uploadService');
const { notifyAllUsers } = require('../utils/notifications');


const createBlog = async (req, res) => {
    try {
        const { title, content, excerpt, category, tags } = req.body;

        const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
        

        const wordCount = content.split(' ').length;
        const readTime = Math.ceil(wordCount / 200);


        const isPublished = true;

        let coverImageUrl = null;
        if (req.file?.buffer) {

            const timestamp = Date.now();
            const safeFilename = `blog-cover-${timestamp}`;
            
            const uploadResult = await uploadToCloudinary(
                req.file.buffer,
                'alumniconnect/blog-covers',
                safeFilename,
                'image'
            );
            coverImageUrl = uploadResult.secure_url;
        }

        const blog = await Blog.create({
            title,
            content,
            excerpt,
            category,
            tags: tagsArray,
            author: req.user._id,
            authorName: req.user.name,
            coverImage: coverImageUrl,
            readTime,
            isPublished,
        });


        notifyAllUsers({
            sender: req.user._id,
            type: 'blog',
            title: 'New Blog Published',
            message: `${req.user.name} published "${title}"`,
            link: '/blogs',
            relatedId: blog._id,
            excludeUserId: req.user._id,
        }).catch(() => {});

        res.status(201).json({
            success: true,
            message: 'Blog published successfully!',
            blog,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const getBlogs = async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = { isPublished: true };

        if (category && category !== 'all') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } },
            ];
        }

        const blogs = await Blog.find(query)
            .populate('author', 'name email role collegeName avatar bio company jobTitle linkedin github twitter website')
            .sort({ createdAt: -1 });

        res.json(blogs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate('author', 'name email role collegeName graduationYear avatar bio company jobTitle linkedin github twitter website')
            .populate('comments.user', 'name role avatar');

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }


        blog.views += 1;
        await blog.save();

        res.json(blog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const likeBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const alreadyLiked = blog.likedBy.includes(req.user._id);

        if (alreadyLiked) {
            blog.likes -= 1;
            blog.likedBy = blog.likedBy.filter(
                (userId) => userId.toString() !== req.user._id.toString()
            );
        } else {
            blog.likes += 1;
            blog.likedBy.push(req.user._id);
        }

        await blog.save();

        res.json({
            success: true,
            likes: blog.likes,
            isLiked: !alreadyLiked,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const addComment = async (req, res) => {
    try {
        const { comment } = req.body;
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        blog.comments.push({
            user: req.user._id,
            userName: req.user.name,
            comment,
        });

        await blog.save();

        res.json({
            success: true,
            message: 'Comment added successfully',
            comments: blog.comments,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const getMyBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ author: req.user._id })
            .sort({ createdAt: -1 });

        res.json(blogs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }


        if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this blog' });
        }


        if (blog.coverImage) {
            try {
                const publicId = blog.coverImage.match(/\/([^/]+)\.\w+$/)?.[1];
                if (publicId) {
                    await cloudinary.uploader.destroy(`alumniconnect/blog-covers/${publicId}`);
                }
            } catch (error) {
                console.error('Error deleting cover image from Cloudinary:', error);
            }
        }

        await Blog.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'Blog deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createBlog,
    getBlogs,
    getBlogById,
    likeBlog,
    addComment,
    getMyBlogs,
    deleteBlog,
};
