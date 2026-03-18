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


        fitScore: {
            type: fitScoreSchema,
            default: () => ({}),
        },
        totalScore: {
            type: Number,
            default: 0,
        },


        isEligible: {
            type: Boolean,
            default: true,
        },
        ineligibilityReason: {
            type: String,
            default: '',
        },


        fraudFlags: {
            type: [String],
            default: [],
        },


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


referralApplicationSchema.index({ referral: 1, student: 1 }, { unique: true });


referralApplicationSchema.index({ student: 1, status: 1 });


referralApplicationSchema.index({ resumeHash: 1 });


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
