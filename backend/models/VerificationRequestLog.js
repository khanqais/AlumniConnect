const mongoose = require('mongoose');

const verificationRequestLogSchema = mongoose.Schema(
    {
        // Request identification
        requestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'VerificationQueue',
            default: null
        },
        
        // Client identification
        ipAddress: {
            type: String,
            required: true
        },
        deviceFingerprint: {
            type: String,
            required: true
        },
        
        // Request data
        email: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        enrollmentNumber: {
            type: String,
            default: ''
        },
        
        // Timestamps
        timestamp: {
            type: Date,
            default: Date.now
        },
        
        // Rate limiting tracking
        requestCount: {
            type: Number,
            default: 1
        },
        lastRequestAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Compound index for efficient querying
verificationRequestLogSchema.index({ ipAddress: 1, deviceFingerprint: 1, timestamp: -1 });
verificationRequestLogSchema.index({ email: 1, timestamp: -1 });
verificationRequestLogSchema.index({ name: 1, enrollmentNumber: 1, timestamp: -1 });

module.exports = mongoose.model('VerificationRequestLog', verificationRequestLogSchema);