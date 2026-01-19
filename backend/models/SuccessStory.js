const mongoose = require('mongoose');

const successStorySchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        story: {
            type: String,
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        authorName: String,
        company: String,
        position: String,
        graduationYear: Number,
        image: String,
        achievements: [String],
        advice: String,
        likes: {
            type: Number,
            default: 0,
        },
        likedBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
        isApproved: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('SuccessStory', successStorySchema);
