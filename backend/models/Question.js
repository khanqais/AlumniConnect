const mongoose = require('mongoose');

const questionSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        askedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        askedByName: String,
        tags: [String],
        category: {
            type: String,
            enum: ['career', 'technical', 'academic', 'interview', 'general'],
            required: true,
        },
        answers: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            userName: String,
            answer: String,
            isAccepted: {
                type: Boolean,
                default: false,
            },
            upvotes: {
                type: Number,
                default: 0,
            },
            upvotedBy: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            }],
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }],
        views: {
            type: Number,
            default: 0,
        },
        isSolved: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
