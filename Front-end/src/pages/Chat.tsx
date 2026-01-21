import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Send, Search, ArrowLeft, MoreVertical } from 'lucide-react';

interface User {
    _id: string;
    name: string;
    avatar?: string;
    role: string;
    company?: string;
    jobTitle?: string;
}

interface Message {
    _id: string;
    sender: User;
    receiver: User;
    content: string;
    read: boolean;
    createdAt: string;
}

interface Conversation {
    user: User;
    lastMessage: Message;
    unreadCount: number;
}

const Chat = () => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const { userId } = useParams<{ userId?: string }>();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchConversations();
        
        // If userId is in URL, load that conversation
        if (userId) {
            loadConversationFromUserId(userId);
        }
    }, [userId]);

    useEffect(() => {
        if (selectedUser) {
            const interval = setInterval(() => {
                fetchMessages(selectedUser._id);
            }, 3000); // Poll every 3 seconds

            return () => clearInterval(interval);
        }
    }, [selectedUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/messages/conversations', {
                headers: {
                    Authorization: `Bearer ${currentUser?.token}`,
                },
            });
            setConversations(res.data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadConversationFromUserId = async (userId: string) => {
        try {
            // Fetch user details
            const userRes = await axios.get(`http://localhost:5000/api/profile/${userId}`, {
                headers: {
                    Authorization: `Bearer ${currentUser?.token}`,
                },
            });
            setSelectedUser(userRes.data.user);
            fetchMessages(userId);
        } catch (error) {
            console.error('Error loading user:', error);
        }
    };

    const fetchMessages = async (userId: string) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/messages/conversation/${userId}`, {
                headers: {
                    Authorization: `Bearer ${currentUser?.token}`,
                },
            });
            setMessages(res.data);
            
            // Refresh conversations to update unread count
            fetchConversations();
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSelectUser = (user: User) => {
        setSelectedUser(user);
        fetchMessages(user._id);
        navigate(`/chat/${user._id}`);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!messageInput.trim() || !selectedUser) return;

        setSending(true);
        try {
            const res = await axios.post(
                'http://localhost:5000/api/messages/send',
                {
                    receiverId: selectedUser._id,
                    content: messageInput.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${currentUser?.token}`,
                    },
                }
            );

            setMessages([...messages, res.data.message]);
            setMessageInput('');
            fetchConversations(); // Refresh conversations
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    const filteredConversations = conversations.filter((conv) =>
        conv.user.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar - Conversations List */}
            <div className={`w-full md:w-96 bg-white border-r border-gray-200 flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                {/* Header */}
                <div className="border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p className="mt-4">No conversations yet</p>
                            <p className="mt-2 text-sm">Start chatting with alumni or students!</p>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => (
                            <button
                                key={conv.user._id}
                                onClick={() => handleSelectUser(conv.user)}
                                className={`w-full border-b border-gray-100 p-4 text-left transition-colors hover:bg-gray-50 ${
                                    selectedUser?._id === conv.user._id ? 'bg-blue-50' : ''
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    {conv.user.avatar ? (
                                        <img
                                            src={`http://localhost:5000/${conv.user.avatar}`}
                                            alt={conv.user.name}
                                            className="h-12 w-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold">
                                            {conv.user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-900 truncate">{conv.user.name}</h3>
                                            {conv.lastMessage && (
                                                <span className="text-xs text-gray-500">
                                                    {formatTime(conv.lastMessage.createdAt)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600 truncate">
                                            {conv.user.company && conv.user.jobTitle
                                                ? `${conv.user.jobTitle} at ${conv.user.company}`
                                                : conv.user.role === 'alumni' ? 'Alumni' : 'Student'
                                            }
                                        </p>
                                        {conv.lastMessage && (
                                            <p className="text-sm text-gray-600 truncate mt-1">
                                                {conv.lastMessage.content}
                                            </p>
                                        )}
                                    </div>
                                    {conv.unreadCount > 0 && (
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${selectedUser ? 'flex' : 'hidden md:flex'}`}>
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="border-b border-gray-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => {
                                            setSelectedUser(null);
                                            navigate('/chat');
                                        }}
                                        className="md:hidden text-gray-600"
                                    >
                                        <ArrowLeft className="h-6 w-6" />
                                    </button>
                                    {selectedUser.avatar ? (
                                        <img
                                            src={`http://localhost:5000/${selectedUser.avatar}`}
                                            alt={selectedUser.name}
                                            className="h-10 w-10 rounded-full object-cover cursor-pointer"
                                            onClick={() => navigate(`/profile/${selectedUser._id}`)}
                                        />
                                    ) : (
                                        <div 
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold cursor-pointer"
                                            onClick={() => navigate(`/profile/${selectedUser._id}`)}
                                        >
                                            {selectedUser.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="cursor-pointer" onClick={() => navigate(`/profile/${selectedUser._id}`)}>
                                        <h2 className="font-semibold text-gray-900">{selectedUser.name}</h2>
                                        <p className="text-xs text-gray-600">
                                            {selectedUser.company && selectedUser.jobTitle
                                                ? `${selectedUser.jobTitle} at ${selectedUser.company}`
                                                : selectedUser.role === 'alumni' ? 'Alumni' : 'Student'
                                            }
                                        </p>
                                    </div>
                                </div>
                                <button className="text-gray-600 hover:text-gray-900">
                                    <MoreVertical className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
                            {messages.length === 0 ? (
                                <div className="flex h-full items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <p className="mt-4">No messages yet</p>
                                        <p className="mt-2 text-sm">Send a message to start the conversation!</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((message, index) => {
                                        const isOwn = message.sender._id === currentUser?._id;
                                        const showAvatar = index === 0 || messages[index - 1].sender._id !== message.sender._id;

                                        return (
                                            <div
                                                key={message._id}
                                                className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                                            >
                                                {showAvatar ? (
                                                    message.sender.avatar ? (
                                                        <img
                                                            src={`http://localhost:5000/${message.sender.avatar}`}
                                                            alt={message.sender.name}
                                                            className="h-8 w-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-xs font-bold">
                                                            {message.sender.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )
                                                ) : (
                                                    <div className="h-8 w-8"></div>
                                                )}
                                                <div className={`max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'}`}>
                                                    <div
                                                        className={`rounded-2xl px-4 py-2 ${
                                                            isOwn
                                                                ? 'bg-blue-600 text-white'
                                                                : 'bg-white text-gray-900 border border-gray-200'
                                                        }`}
                                                    >
                                                        <p className="text-sm break-words">{message.content}</p>
                                                    </div>
                                                    <p className={`mt-1 text-xs text-gray-500 ${isOwn ? 'text-right' : 'text-left'}`}>
                                                        {formatTime(message.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Message Input */}
                        <div className="border-t border-gray-200 bg-white p-4">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    disabled={sending}
                                />
                                <button
                                    type="submit"
                                    disabled={!messageInput.trim() || sending}
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="h-5 w-5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex h-full items-center justify-center bg-gray-50 text-gray-500">
                        <div className="text-center">
                            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p className="mt-4 text-lg font-medium">Select a conversation</p>
                            <p className="mt-2 text-sm">Choose a conversation from the list to start messaging</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
