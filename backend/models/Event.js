const mongoose = require('mongoose');

const eventSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['webinar', 'workshop', 'networking', 'career-fair', 'other'],
            required: true,
        },
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        organizerName: String,
        date: {
            type: Date,
            required: true,
        },
        duration: Number, // in minutes
        mode: {
            type: String,
            enum: ['online', 'offline', 'hybrid'],
            required: true,
        },
        meetingLink: String,
        location: String,
        maxParticipants: Number,
        registeredUsers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
        coverImage: String,
        tags: [String],
        status: {
            type: String,
            enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
            default: 'upcoming',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
