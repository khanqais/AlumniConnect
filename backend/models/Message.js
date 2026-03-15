const mongoose = require('mongoose');

const messageSchema = mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            default: '',
            trim: true,
        },
        mediaUrl: {
            type: String,
        },
        mediaType: {
            type: String,
            enum: ['image', 'video', 'audio', 'file'],
        },
        mediaPublicId: {
            type: String,
        },
        mediaOriginalName: {
            type: String,
        },
        mediaMimeType: {
            type: String,
        },
        read: {
            type: Boolean,
            default: false,
        },
        readAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
