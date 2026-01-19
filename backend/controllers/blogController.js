const Blog = require('../models/Blog');

// Create blog post
const createBlog = async (req, res) => {
    try {
        const { title, content, excerpt, category, tags } = req.body;

        const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
        
        // Calculate read time (approx 200 words per minute)
        const wordCount = content.split(' ').length;
        const readTime = Math.ceil(wordCount / 200);

        // Auto-publish all blogs (no admin approval needed)
        const isPublished = true;

        const blog = await Blog.create({
            title,
            content,
            excerpt,
            category,
            tags: tagsArray,
            author: req.user._id,
            authorName: req.user.name,
            coverImage: req.file ? req.file.path : null,
            readTime,
            isPublished,
        });

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

// Get all blogs
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

// Get single blog
const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate('author', 'name email role collegeName graduationYear avatar bio company jobTitle linkedin github twitter website')
            .populate('comments.user', 'name role');

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Increment views
        blog.views += 1;
        await blog.save();

        res.json(blog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Like blog
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

// Add comment
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

// Get user's blogs
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

module.exports = {
    createBlog,
    getBlogs,
    getBlogById,
    likeBlog,
    addComment,
    getMyBlogs,
};
