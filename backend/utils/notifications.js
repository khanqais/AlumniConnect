const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Create a single notification for one user.
 */
async function createNotification({ recipient, sender, type, title, message, link, relatedId }) {
    try {
        // Don't notify yourself
        if (sender && recipient.toString() === sender.toString()) return null;

        const notification = await Notification.create({
            recipient,
            sender: sender || null,
            type,
            title,
            message: message || '',
            link: link || '',
            relatedId: relatedId || null,
        });
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
}

/**
 * Notify a specific user.
 */
async function notifyUser(recipientId, { sender, type, title, message, link, relatedId }) {
    return createNotification({ recipient: recipientId, sender, type, title, message, link, relatedId });
}

/**
 * Notify all users (broadcast). Optionally exclude a user (e.g. the sender).
 */
async function notifyAllUsers({ sender, type, title, message, link, relatedId, excludeUserId }) {
    try {
        const filter = {};
        if (excludeUserId) {
            filter._id = { $ne: excludeUserId };
        }
        const users = await User.find(filter).select('_id');

        const notifications = users.map((user) => ({
            recipient: user._id,
            sender: sender || null,
            type,
            title,
            message: message || '',
            link: link || '',
            relatedId: relatedId || null,
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        return notifications.length;
    } catch (error) {
        console.error('Error notifying all users:', error);
        return 0;
    }
}

/**
 * Notify users by role (e.g. all students).
 */
async function notifyUsersByRole(role, { sender, type, title, message, link, relatedId, excludeUserId }) {
    try {
        const filter = { role };
        if (excludeUserId) {
            filter._id = { $ne: excludeUserId };
        }
        const users = await User.find(filter).select('_id');

        const notifications = users.map((user) => ({
            recipient: user._id,
            sender: sender || null,
            type,
            title,
            message: message || '',
            link: link || '',
            relatedId: relatedId || null,
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        return notifications.length;
    } catch (error) {
        console.error('Error notifying users by role:', error);
        return 0;
    }
}

module.exports = { createNotification, notifyUser, notifyAllUsers, notifyUsersByRole };
