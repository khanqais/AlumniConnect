import Pusher from 'pusher-js';


const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY || 'your-pusher-key';
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER || 'ap2';


const pusher = new Pusher(PUSHER_KEY, {
    cluster: PUSHER_CLUSTER,
});


export const subscribeToNotifications = (userId: string, callback: (notification: unknown) => void) => {
    const channelName = `user-${userId}`;
    const channel = pusher.subscribe(channelName);

    channel.bind('notification', (data: unknown) => {
        console.log('🔔 Pusher notification received:', data);
        callback(data);
    });


    return () => {
        channel.unbind_all();
        pusher.unsubscribe(channelName);
    };
};


export const subscribeToChat = (roomId: string, callback: (message: unknown) => void) => {
    const channelName = `chat-${roomId}`;
    const channel = pusher.subscribe(channelName);

    channel.bind('new-message', (data: unknown) => {
        console.log('💬 Pusher chat message received:', data);
        callback(data);
    });


    return () => {
        channel.unbind_all();
        pusher.unsubscribe(channelName);
    };
};

export default pusher;
