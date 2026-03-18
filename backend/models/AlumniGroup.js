const mongoose = require('mongoose');

const alumniGroupSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120,
        },
        description: {
            type: String,
            default: '',
            trim: true,
            maxlength: 500,
        },
        batchYear: {
            type: Number,
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        timestamps: true,
    }
);

alumniGroupSchema.index({ batchYear: 1, createdAt: -1 });
alumniGroupSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model('AlumniGroup', alumniGroupSchema);
