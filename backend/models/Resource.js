const mongoose = require('mongoose');

const resourceSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ['resume', 'interview-experience', 'study-material', 'project', 'other'],
            required: true,
        },
        file: {
            type: String,
            required: true,
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        uploaderName: String,
        uploaderRole: String,
        tags: [String],
        downloads: {
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
        isApproved: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);
