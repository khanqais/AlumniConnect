const mongoose = require('mongoose');

const groupInviteSchema = mongoose.Schema(
    {
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AlumniGroup',
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending',
        },
        message: {
            type: String,
            default: '',
            trim: true,
            maxlength: 300,
        },
    },
    {
        timestamps: true,
    }
);

groupInviteSchema.index({ recipient: 1, status: 1, createdAt: -1 });
groupInviteSchema.index({ group: 1, recipient: 1 }, { unique: true });

module.exports = mongoose.model('GroupInvite', groupInviteSchema);
