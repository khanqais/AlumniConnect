const mongoose = require('mongoose');
const crypto = require('crypto');

const projectLinkSchema = mongoose.Schema(
    {
        title: { type: String, required: true },
        url: { type: String, required: true },
        type: {
            type: String,
            enum: ['github', 'deployed', 'other'],
            default: 'other',
        },
    },
    { _id: false }
);

const skillRatingSchema = mongoose.Schema(
    {
        skill: { type: String, required: true },
        level: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            required: true,
        },
    },
    { _id: false }
);

const fitScoreSchema = mongoose.Schema(
    {
        skillsMatch: { type: Number, default: 0 },
        projectDepth: { type: Number, default: 0 },
        educationMatch: { type: Number, default: 0 },
        resumeCompleteness: { type: Number, default: 0 },
        cgpaScore: { type: Number, default: 0 },
        fraudPenalty: { type: Number, default: 0 },
    },
    { _id: false }
);

const referralApplicationSchema = mongoose.Schema(
    {
        referral: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Referral',
            required: true,
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // Resume
        resumeUrl: {
            type: String,
            required: [true, 'Please upload your resume'],
        },
        resumePublicId: {
            type: String,
            default: '',
        },
        resumeText: {
            type: String,
            default: '',
        },
        resumeHash: {
            type: String,
            default: '',
        },

        // Application details
        coverNote: {
            type: String,
            maxlength: 500,
            default: '',
        },
        projectLinks: {
            type: [projectLinkSchema],
            default: [],
        },
        skillSelfRatings: {
            type: [skillRatingSchema],
            default: [],
        },
        cgpaConfirmed: {
            type: Boolean,
            default: false,
        },

        // Scoring
        fitScore: {
            type: fitScoreSchema,
            default: () => ({}),
        },
        totalScore: {
            type: Number,
            default: 0,
        },

        // Eligibility
        isEligible: {
            type: Boolean,
            default: true,
        },
        ineligibilityReason: {
            type: String,
            default: '',
        },

        // Fraud
        fraudFlags: {
            type: [String],
            default: [],
        },

        // Status
        status: {
            type: String,
            enum: ['pending', 'reviewed', 'referred', 'rejected'],
            default: 'pending',
        },
        reviewedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// One application per student per referral
referralApplicationSchema.index({ referral: 1, student: 1 }, { unique: true });

// Index for spam detection: same student, same company+jobTitle across referrals
referralApplicationSchema.index({ student: 1, status: 1 });

// Index for resume hash deduplication
referralApplicationSchema.index({ resumeHash: 1 });

// Pre-save: generate resume hash if resumeText is present
referralApplicationSchema.pre('save', function (next) {
    if (this.isModified('resumeText') && this.resumeText) {
        const normalized = this.resumeText
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .trim();
        this.resumeHash = crypto
            .createHash('md5')
            .update(normalized)
            .digest('hex');
    }
    next();
});

module.exports = mongoose.model('ReferralApplication', referralApplicationSchema);
