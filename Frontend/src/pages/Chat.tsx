import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Send, Search, ArrowLeft, MoreVertical, Paperclip, X, Trash2 } from 'lucide-react';

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
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'audio' | 'file';
    mediaOriginalName?: string;
    read: boolean;
    createdAt: string;
}

interface Conversation {
    user: User;
    lastMessage: Message;
    unreadCount: number;
}

interface ChatGroup {
    _id: string;
    name: string;
    batchYear?: number;
    members?: Array<{ _id: string }>;
}

interface GroupMessage {
    _id: string;
    sender: User;
    content: string;
    createdAt: string;
}

const Chat = () => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const { userId } = useParams<{ userId?: string }>();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [myGroups, setMyGroups] = useState<ChatGroup[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchConversations();
        fetchMyGroups();
        
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
        if (selectedGroup) {
            const interval = setInterval(() => {
                fetchGroupMessages(selectedGroup._id);
            }, 3000);

            return () => clearInterval(interval);
        }
    }, [selectedUser, selectedGroup]);

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

    const fetchMyGroups = async () => {
        try {
            setLoadingGroups(true);
            const res = await axios.get('http://localhost:5000/api/groups/my', {
                headers: {
                    Authorization: `Bearer ${currentUser?.token}`,
                },
            });
            setMyGroups(Array.isArray(res.data?.groups) ? res.data.groups : []);
        } catch (error) {
            console.error('Error fetching groups:', error);
            setMyGroups([]);
        } finally {
            setLoadingGroups(false);
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

    const fetchGroupMessages = async (groupId: string) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/messages/groups/${groupId}`, {
                headers: {
                    Authorization: `Bearer ${currentUser?.token}`,
                },
            });
            setGroupMessages(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('Error fetching group messages:', error);
        }
    };

    const handleSelectUser = (user: User) => {
        setSelectedUser(user);
        setSelectedGroup(null);
        fetchMessages(user._id);
        navigate(`/chat/${user._id}`);
    };

    const handleSelectGroup = (group: ChatGroup) => {
        setSelectedGroup(group);
        setSelectedUser(null);
        fetchGroupMessages(group._id);
        navigate('/chat');
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const trimmedMessage = messageInput.trim();
        if (!selectedUser && !selectedGroup) return;
        if (!trimmedMessage && !selectedFile) return;

        if (selectedGroup && selectedFile) {
            alert('File attachments are not supported in group chat yet.');
            return;
        }

        setSending(true);
        try {
            if (selectedGroup) {
                const res = await axios.post(
                    `http://localhost:5000/api/messages/groups/${selectedGroup._id}/send`,
                    { content: trimmedMessage },
                    {
                        headers: {
                            Authorization: `Bearer ${currentUser?.token}`,
                        },
                    }
                );
                setGroupMessages((prev) => [...prev, res.data.message]);
            } else if (selectedUser) {
                const formData = new FormData();
                formData.append('receiverId', selectedUser._id);
                formData.append('content', trimmedMessage);
                if (selectedFile) {
                    formData.append('media', selectedFile);
                }

                const res = await axios.post(
                    'http://localhost:5000/api/messages/send',
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${currentUser?.token}`,
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );

                setMessages([...messages, res.data.message]);
                fetchConversations();
            }

            setMessageInput('');
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const renderMessageMedia = (message: Message) => {
        if (!message.mediaUrl) return null;

        if (message.mediaType === 'image') {
            return (
                <img
                    src={message.mediaUrl}
                    alt={message.mediaOriginalName || 'Shared image'}
                    className="mt-2 max-h-64 w-full rounded-lg object-cover"
                />
            );
        }

        if (message.mediaType === 'video') {
            return (
                <video controls className="mt-2 max-h-64 w-full rounded-lg">
                    <source src={message.mediaUrl} />
                    Your browser does not support video playback.
                </video>
            );
        }

        if (message.mediaType === 'audio') {
            return (
                <audio controls className="mt-2 w-full">
                    <source src={message.mediaUrl} />
                    Your browser does not support audio playback.
                </audio>
            );
        }

        return (
            <a
                href={message.mediaUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 block rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-sm text-blue-300 hover:text-blue-200"
            >
                {message.mediaOriginalName || 'Open attachment'}
            </a>
        );
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!window.confirm('Delete this message?')) return;

        setDeletingMessageId(messageId);
        try {
            await axios.delete(`http://localhost:5000/api/messages/${messageId}`, {
                headers: {
                    Authorization: `Bearer ${currentUser?.token}`,
                },
            });

            setMessages((prevMessages) => prevMessages.filter((message) => message._id !== messageId));
            fetchConversations();
        } catch (error) {
            console.error('Error deleting message:', error);
            alert('Failed to delete message');
        } finally {
            setDeletingMessageId(null);
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

    const resolveAvatarSrc = (avatar?: string) => {
        if (!avatar) return '';
        return avatar.startsWith('http') ? avatar : `http://localhost:5000/${avatar}`;
    };

    const filteredConversations = conversations.filter((conv) =>
        conv.user.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-[#0A0D14] text-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />
            </div>
            {/* Sidebar - Conversations List */}
            <div className={`relative z-10 w-full md:w-96 bg-[#121620]/90 border-r border-white/10 flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                {/* Header */}
                <div className="border-b border-white/10 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-white">Messages</h1>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="text-gray-300 hover:text-white"
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
                            className="w-full rounded-lg border border-white/20 bg-[#0E121B] py-2 pl-10 pr-4 text-sm text-gray-200 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                        />
                    </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                    <div className="border-b border-white/10 px-4 py-3">
                        <div className="mb-2 flex items-center justify-between">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">My Groups</h2>
                            <button
                                onClick={() => navigate('/groups/invites')}
                                className="text-[11px] text-amber-400 hover:text-amber-300"
                            >
                                View invites
                            </button>
                        </div>
                        {loadingGroups ? (
                            <p className="text-xs text-gray-500">Loading groups...</p>
                        ) : myGroups.length === 0 ? (
                            <p className="text-xs text-gray-500">No groups joined yet</p>
                        ) : (
                            <div className="space-y-1.5">
                                    {myGroups.slice(0, 6).map((group) => (
                                    <button
                                        key={group._id}
                                            onClick={() => handleSelectGroup(group)}
                                            className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                                                selectedGroup?._id === group._id
                                                    ? 'border-amber-400/60 bg-amber-500/10'
                                                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                                            }`}
                                    >
                                        <p className="text-sm font-medium text-gray-100 truncate">{group.name}</p>
                                        <p className="text-[11px] text-gray-400">
                                            Batch {group.batchYear || '-'} • Members {group.members?.length || 0}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

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
                                className={`w-full border-b border-white/5 p-4 text-left transition-colors hover:bg-white/5 ${
                                    selectedUser?._id === conv.user._id ? 'bg-white/10' : ''
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    {conv.user.avatar ? (
                                        <img
                                            src={resolveAvatarSrc(conv.user.avatar)}
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
                                            <h3 className="font-semibold text-white truncate">{conv.user.name}</h3>
                                            {conv.lastMessage && (
                                                <span className="text-xs text-gray-400">
                                                    {formatTime(conv.lastMessage.createdAt)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 truncate">
                                            {conv.user.company && conv.user.jobTitle
                                                ? `${conv.user.jobTitle} at ${conv.user.company}`
                                                : conv.user.role === 'alumni' ? 'Alumni' : 'Student'
                                            }
                                        </p>
                                        {conv.lastMessage && (
                                            <p className="text-sm text-gray-400 truncate mt-1">
                                                {conv.lastMessage.content ||
                                                    (conv.lastMessage.mediaType
                                                        ? `📎 ${conv.lastMessage.mediaOriginalName || `${conv.lastMessage.mediaType} attachment`}`
                                                        : '')}
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
            <div className={`relative z-10 flex-1 flex flex-col ${selectedUser || selectedGroup ? 'flex' : 'hidden md:flex'}`}>
                {selectedUser || selectedGroup ? (
                    <>
                        {/* Chat Header */}
                        <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => {
                                            setSelectedUser(null);
                                            setSelectedGroup(null);
                                            navigate('/chat');
                                        }}
                                        className="md:hidden text-gray-600"
                                    >
                                        <ArrowLeft className="h-6 w-6" />
                                    </button>
                                    {selectedUser?.avatar ? (
                                        <img
                                            src={resolveAvatarSrc(selectedUser.avatar)}
                                            alt={selectedUser.name}
                                            className="h-10 w-10 rounded-full object-cover cursor-pointer"
                                            onClick={() => navigate(`/profile/${selectedUser._id}`)}
                                        />
                                    ) : selectedUser ? (
                                        <div 
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold cursor-pointer"
                                            onClick={() => navigate(`/profile/${selectedUser._id}`)}
                                        >
                                            {selectedUser.name.charAt(0).toUpperCase()}
                                        </div>
                                    ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold">
                                            {selectedGroup?.name?.charAt(0).toUpperCase() || 'G'}
                                        </div>
                                    )}
                                    <div
                                        className={selectedUser ? 'cursor-pointer' : ''}
                                        onClick={() => {
                                            if (selectedUser) navigate(`/profile/${selectedUser._id}`);
                                        }}
                                    >
                                        <h2 className="font-semibold text-white">{selectedUser ? selectedUser.name : selectedGroup?.name}</h2>
                                        <p className="text-xs text-gray-400">
                                            {selectedUser && selectedUser.company && selectedUser.jobTitle
                                                ? `${selectedUser.jobTitle} at ${selectedUser.company}`
                                                : selectedUser
                                                    ? selectedUser.role === 'alumni' ? 'Alumni' : 'Student'
                                                    : `Group chat • Members ${selectedGroup?.members?.length || 0}`
                                            }
                                        </p>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-white">
                                    <MoreVertical className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto bg-[#0A0D14]/50 p-4">
                            {(selectedGroup ? groupMessages.length : messages.length) === 0 ? (
                                <div className="flex h-full items-center justify-center text-gray-400">
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
                                    {(selectedGroup ? groupMessages : messages).map((message, index) => {
                                        const isOwn = message.sender._id === currentUser?._id;
                                        const previousList = selectedGroup ? groupMessages : messages;
                                        const showAvatar = index === 0 || previousList[index - 1].sender._id !== message.sender._id;

                                        return (
                                            <div
                                                key={message._id}
                                                className={`group flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                                            >
                                                {showAvatar ? (
                                                    message.sender.avatar ? (
                                                        <img
                                                            src={resolveAvatarSrc(message.sender.avatar)}
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
                                                                : 'bg-white/10 text-gray-200 border border-white/20'
                                                        }`}
                                                    >
                                                        {message.content ? (
                                                            <p className="text-sm break-words">{message.content}</p>
                                                        ) : null}
                                                        {!selectedGroup && renderMessageMedia(message as Message)}
                                                    </div>
                                                    <div className={`mt-1 flex items-center gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                        <p className="text-xs text-gray-400">
                                                            {formatTime(message.createdAt)}
                                                        </p>
                                                        {isOwn && !selectedGroup ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteMessage(message._id)}
                                                                disabled={deletingMessageId === message._id}
                                                                className="text-gray-500 transition-colors hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                                                                title="Delete message"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Message Input */}
                        <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm p-4">
                            {selectedFile && (
                                <div className="mb-2 flex items-center justify-between rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-gray-300">
                                    <span className="truncate pr-3">Attached: {selectedFile.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedFile(null);
                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = '';
                                            }
                                        }}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        setSelectedFile(file);
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-gray-300 transition-all hover:text-white"
                                    disabled={sending || Boolean(selectedGroup)}
                                    title={selectedGroup ? 'Attachments are disabled in group chat' : 'Attach file'}
                                >
                                    <Paperclip className="h-5 w-5" />
                                </button>
                                <input
                                    type="text"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-white placeholder:text-gray-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                                    disabled={sending}
                                />
                                <button
                                    type="submit"
                                    disabled={(!messageInput.trim() && !selectedFile) || sending}
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="h-5 w-5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex h-full items-center justify-center bg-[#0A0D14]/50 text-gray-400">
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
