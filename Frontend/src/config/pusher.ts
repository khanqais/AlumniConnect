import Pusher from 'pusher-js';

// Get Pusher config from environment
const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY || 'your-pusher-key';
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER || 'ap2';

// Initialize Pusher client
const pusher = new Pusher(PUSHER_KEY, {
    cluster: PUSHER_CLUSTER,
});

/**
 * Subscribe to a user's private channel for notifications
 * @param {string} userId - The user's ID
 * @param {function} callback - Function to call when notification received
 * @returns {function} - Unsubscribe function
 */
export const subscribeToNotifications = (userId: string, callback: (notification: unknown) => void) => {
    const channelName = `user-${userId}`;
    const channel = pusher.subscribe(channelName);

    channel.bind('notification', (data: unknown) => {
        console.log('🔔 Pusher notification received:', data);
        callback(data);
    });

    // Return unsubscribe function
    return () => {
        channel.unbind_all();
        pusher.unsubscribe(channelName);
    };
};

/**
 * Subscribe to a chat channel for real-time messages
 * @param {string} roomId - The room/conversation ID
 * @param {function} callback - Function to call when message received
 * @returns {function} - Unsubscribe function
 */
export const subscribeToChat = (roomId: string, callback: (message: unknown) => void) => {
    const channelName = `chat-${roomId}`;
    const channel = pusher.subscribe(channelName);

    channel.bind('new-message', (data: unknown) => {
        console.log('💬 Pusher chat message received:', data);
        callback(data);
    });

    // Return unsubscribe function
    return () => {
        channel.unbind_all();
        pusher.unsubscribe(channelName);
    };
};

export default pusher;
