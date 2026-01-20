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
            required: true,
            trim: true,
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
