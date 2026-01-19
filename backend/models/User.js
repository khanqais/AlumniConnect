const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
        },
        role: {
            type: String,
            enum: ['student', 'alumni', 'admin'],
            default: 'student',
        },
        collegeName: {
            type: String,
            required: [true, 'Please add college name'],
        },
        graduationYear: {
            type: Number,
            required: function() {
                return this.role === 'alumni';
            }
        },
        experience: {
            type: String,
            required: function() {
                return this.role === 'alumni';
            }
        },
        skills: {
            type: [String],
            default: [],
        },
        bio: {
            type: String,
            default: '',
            maxlength: 500,
        },
        avatar: {
            type: String,
            default: '',
        },
        linkedin: {
            type: String,
            default: '',
        },
        github: {
            type: String,
            default: '',
        },
        twitter: {
            type: String,
            default: '',
        },
        website: {
            type: String,
            default: '',
        },
        company: {
            type: String,
            default: '',
        },
        jobTitle: {
            type: String,
            default: '',
        },
        isApproved: {
            type: Boolean,
            default: false,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationToken: {
            type: String,
        },
        emailVerificationExpires: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('User', userSchema);
