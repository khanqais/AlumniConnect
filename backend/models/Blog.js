const mongoose = require('mongoose');

const blogSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        excerpt: {
            type: String,
            required: true,
        },
        coverImage: String,
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        authorName: String,
        tags: [String],
        category: {
            type: String,
            enum: ['career-advice', 'interview-tips', 'industry-insights', 'personal-journey', 'technical', 'other'],
            required: true,
        },
        readTime: Number, // in minutes
        views: {
            type: Number,
            default: 0,
        },
        likes: {
            type: Number,
            default: 0,
        },
        likedBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
        comments: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            userName: String,
            comment: String,
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }],
        isPublished: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);
