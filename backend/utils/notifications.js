const Notification = require('../models/Notification');
const User = require('../models/User');
const pusher = require('../config/pusher');


async function triggerPusherNotification(recipientId, notification) {
    if (!pusher) return;
    
    try {
        const channel = `user-${recipientId}`;
        pusher.trigger(channel, 'notification', notification);
    } catch (error) {
        console.error('Error triggering Pusher notification:', error);
    }
}


async function createNotification({ recipient, sender, type, title, message, link, relatedId }) {
    try {

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


        await triggerPusherNotification(recipient, notification);

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
}


async function notifyUser(recipientId, { sender, type, title, message, link, relatedId }) {
    return createNotification({ recipient: recipientId, sender, type, title, message, link, relatedId });
}


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
