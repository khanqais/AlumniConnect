const mongoose = require('mongoose');

const verificationQueueSchema = mongoose.Schema(
    {
        // Claimed identity info
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['alumni'],
            default: 'alumni',
        },
        collegeName: {
            type: String,
            required: true,
        },
        graduationYear: {
            type: Number,
            required: true,
        },
        branch: {
            type: String,
            default: '',
        },
        enrollmentNumber: {
            type: String,
            default: '',
        },
        dateOfBirth: {
            type: String,
            default: '',
        },
        experience: {
            type: String,
            required: true,
        },
        skills: {
            type: [String],
            default: [],
        },
        linkedin: {
            type: String,
            default: '',
        },

        // Uploaded proof document
        alumniProofDocument: {
            type: String,
            default: '',
        },
        alumniProofOriginalName: {
            type: String,
            default: '',
        },

        // Alternate contact info
        alternateEmail: {
            type: String,
            required: true,
        },
        contactNumber: {
            type: String,
            default: '',
        },

        // Verification status
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'auto-rejected'],
            default: 'pending',
        },
        rejectionReason: {
            type: String,
            default: '',
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        processedAt: {
            type: Date,
            default: null,
        },

        // Confidence score from alternate lookup
        confidenceScore: {
            type: Number,
            default: 0,
        },
        matchedRecords: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },

        // Risk scoring fields
        riskScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        riskSignals: {
            type: [String],
            default: []
        },
        riskLevel: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'low'
        },
        deviceFingerprint: {
            type: String,
            default: ''
        },
        ipAddress: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true,
    }
);

// Add indexes for risk-based queries
verificationQueueSchema.index({ riskScore: -1, status: 1 });
verificationQueueSchema.index({ riskLevel: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('VerificationQueue', verificationQueueSchema);