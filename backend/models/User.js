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
        alumniProofDocument: {
            type: String,
            default: '',
        },
        alumniProofOriginalName: {
            type: String,
            default: '',
        },
        skills: {
            type: [String],
            default: [],
        },
        target_skills:{
            type: [String],
            default: [],
            required: function() {
                return this.role === 'student';
            }
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
        avatarPublicId: {
            type: String,
            default: '',
        },
        banner: {
            type: String,
            default: '',
        },
        bannerPublicId: {
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
        branch: {
            type: String,
            default: '',
        },
        cgpa: {
            type: Number,
            min: 0,
            max: 10,
            default: null,
            required: function() {
                return this.role === 'student';
            }
        },
        jobTitle: {
            type: String,
            default: '',
        },
        workExperience: {
            type: [
                {
                    id: {
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
                    startDate: {
                        type: String,
                        default: '',
                    },
                    endDate: {
                        type: String,
                        default: '',
                    },
                    currentlyWorking: {
                        type: Boolean,
                        default: false,
                    },
                    description: {
                        type: String,
                        default: '',
                    },
                },
            ],
            default: [],
        },
        isBanned: {
            type: Boolean,
            default: false,
        },
        banReason: {
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
