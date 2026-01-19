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
        document: {
            type: String,
            required: [true, 'Please upload a document'],
        },
        isApproved: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('User', userSchema);
