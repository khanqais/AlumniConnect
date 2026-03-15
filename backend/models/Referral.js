const mongoose = require('mongoose');

const referralSchema = mongoose.Schema(
    {
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        company: {
            type: String,
            required: [true, 'Please add company name'],
        },
        jobTitle: {
            type: String,
            required: [true, 'Please add job title'],
        },
        jobDescription: {
            type: String,
            required: [true, 'Please add job description'],
        },
        jobLink: {
            type: String,
            default: '',
        },
        requiredSkills: {
            type: [String],
            default: [],
        },
        eligibleBranches: {
            type: [String],
            default: [], // empty = all branches eligible
        },
        minCGPA: {
            type: Number,
            default: 0,
            min: 0,
            max: 10,
        },
        eligibleYears: {
            type: [Number],
            default: [], // empty = all graduation years eligible
        },
        maxApplications: {
            type: Number,
            default: 50,
        },
        deadline: {
            type: Date,
            required: [true, 'Please add application deadline'],
        },
        status: {
            type: String,
            enum: ['open', 'closed', 'filled'],
            default: 'open',
        },
        applicationsCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Referral', referralSchema);
