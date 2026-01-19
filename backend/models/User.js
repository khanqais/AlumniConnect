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
        university: {
            type: String,
        },
        graduationYear: {
            type: Number,
        },
        skills: {
            type: [String],
            default: [],
        },
        document: {
            type: String,
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
