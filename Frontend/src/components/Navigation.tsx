import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useRef, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Home,
    Map,
    FileText,
    MessageSquare,
    Calendar,
    LogOut,
    User,
    ChevronDown,
    Briefcase,
    Bell,
} from 'lucide-react';

const Navigation = ({ onToggleSidebar, sidebarOpen }: { onToggleSidebar?: () => void; sidebarOpen?: boolean } = {}) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Dropdown state
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    // Notification state (API-backed)
    const [notifications, setNotifications] = useState<Array<{
        _id: string;
        type: string;
        title: string;
        message: string;
        link: string;
        read: boolean;
        sender?: { name: string; avatar: string; role: string };
        createdAt: string;
    }>>([]);
    const [unreadNotifCount, setUnreadNotifCount] = useState(0);

    // Unread message count (separate quick-access badge)
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(async () => {
        if (!user?.token) return;
        try {
            const { data } = await axios.get('http://localhost:5000/api/notifications?limit=15', {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setNotifications(data.data || []);
        } catch {
            // silently ignore
        }
    }, [user?.token]);

    const fetchUnreadNotifCount = useCallback(async () => {
        if (!user?.token) return;
        try {
            const { data } = await axios.get('http://localhost:5000/api/notifications/unread-count', {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setUnreadNotifCount(data.count || 0);
        } catch {
            // silently ignore
        }
    }, [user?.token]);

    const fetchUnreadMsgCount = useCallback(async () => {
        if (!user?.token) return;
        try {
            const { data } = await axios.get('http://localhost:5000/api/messages/unread-count', {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setUnreadCount(data.count || 0);
        } catch {
            // silently ignore
        }
    }, [user?.token]);

    const markNotificationRead = async (id: string) => {
        if (!user?.token) return;
        try {
            await axios.patch(`http://localhost:5000/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadNotifCount(prev => Math.max(0, prev - 1));
        } catch {
            // silently ignore
        }
    };

    const markAllNotificationsRead = useCallback(async () => {
        if (!user?.token) return;
        try {
            await axios.patch('http://localhost:5000/api/notifications/read-all', {}, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadNotifCount(0);
        } catch {
            // silently ignore
        }
    }, [user?.token]);

    // Poll every 30 seconds
    useEffect(() => {
        fetchNotifications();
        fetchUnreadNotifCount();
        fetchUnreadMsgCount();
        const interval = setInterval(() => {
            fetchNotifications();
            fetchUnreadNotifCount();
            fetchUnreadMsgCount();
        }, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications, fetchUnreadNotifCount, fetchUnreadMsgCount]);

    // Mark all as read when dropdown opens
    useEffect(() => {
        if (notificationOpen && unreadNotifCount > 0) {
            markAllNotificationsRead();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notificationOpen]);

    // Clear message badge when navigating to /chat
    useEffect(() => {
        if (location.pathname === '/chat') {
            setUnreadCount(0);
        }
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    // ✅ Chat removed from here
    const navItems = [
        { name: 'Dashboard',       path: '/dashboard',      icon: Home },
        { name: 'Resources',       path: '/resources',      icon: FileText },
        { name: 'Referrals',       path: '/referrals',      icon: Briefcase },
        { name: 'Recommendation',     path: '/career-path',    icon: Map },
        // { name: 'Blogs',           path: '/blogs',          icon: FileText },
        { name: 'Events',          path: '/webinars',       icon: Calendar },
    ];

    const dropdownItems = [
        { name: 'Profile', path: '/profile', icon: User },
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
                setNotificationOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close dropdown on route change
    useEffect(() => {
        setDropdownOpen(false);
        setNotificationOpen(false);
    }, [location.pathname]);

    return (
        <header className="sticky top-0 z-[100] border-b border-white/10 bg-[#0E121B]/85 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">

                    {/* Logo/Brand */}
                    <div className="flex items-center gap-2">
  <Link to="/" className="flex items-center gap-2 group">
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-white/10 transition-transform group-hover:scale-105">
      <img
        src="/logo.png"
        alt="AlumniConnect"
            className="mt-2 block h-full w-full scale-[1.55] origin-center object-contain object-center"
      />
    </div>

        <span className="hidden text-xl font-bold font-syne bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent sm:block">
      AlumniConnect
    </span>
  </Link>
</div>


                    {/* Sidebar toggle — only shown when handler is provided */}
                    {onToggleSidebar && (
                        <button
                            onClick={onToggleSidebar}
                            title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-300 transition hover:bg-white/10 hover:text-white"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {sidebarOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    )}

                    {/* Navigation */}
                    <nav className="hidden xl:flex items-center gap-1 ml-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    title={item.name}
                                    className={`group relative flex items-center justify-center h-10 w-10 rounded-lg transition-all duration-200 hover:scale-[1.03] ${
                                        active
                                            ? 'text-amber-300 bg-amber-500/10 shadow-sm'
                                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    <Icon className={`h-5 w-5 ${active ? 'text-amber-300' : 'text-gray-400'}`} />
                                    <span className={`absolute -bottom-0.5 h-0.5 w-6 rounded-full bg-amber-300 transition-transform duration-200 ${active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                                </button>
                            );
                        })}
                    </nav>

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 border-l border-white/10 pl-4">

                            {/* Notifications */}
                            <div className="relative" ref={notificationRef}>
                                <button
                                    onClick={() => setNotificationOpen(prev => !prev)}
                                    className="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                                    title="Notifications"
                                >
                                    <Bell className="h-5 w-5" />
                                    {unreadNotifCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
                                            {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
                                        </span>
                                    )}
                                </button>

                                {notificationOpen && (
                                    <div className="absolute right-0 top-[calc(100%+8px)] w-80 rounded-xl border border-white/10 bg-[#121620] shadow-lg z-50 overflow-hidden">
                                        <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
                                            <p className="text-xs font-semibold text-white">Notifications</p>
                                            {notifications.some(n => !n.read) && (
                                                <button
                                                    onClick={markAllNotificationsRead}
                                                    className="text-[10px] text-amber-400 hover:text-amber-300 transition-colors"
                                                >
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>
                                        <div className="py-1 max-h-80 overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                notifications.map(item => (
                                                    <button
                                                        key={item._id}
                                                        onClick={() => {
                                                            if (!item.read) markNotificationRead(item._id);
                                                            if (item.link) navigate(item.link);
                                                            setNotificationOpen(false);
                                                        }}
                                                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/10 flex flex-col gap-0.5 ${
                                                            item.read ? 'opacity-60' : ''
                                                        }`}
                                                    >
                                                        <span className={`font-medium ${item.read ? 'text-gray-400' : 'text-gray-100'}`}>
                                                            {item.title}
                                                        </span>
                                                        {item.message && (
                                                            <span className="text-xs text-gray-400 line-clamp-1">{item.message}</span>
                                                        )}
                                                        <span className="text-[10px] text-gray-500 mt-0.5">
                                                            {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-4 py-6 text-sm text-gray-400 text-center">No notifications yet</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Message Notification */}
                            <button
                                onClick={() => navigate('/chat')}
                                className="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                title="Messages"
                            >
                                <MessageSquare className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* ✅ Profile Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(prev => !prev)}
                                    className="flex items-center gap-3 rounded-lg px-3 py-1.5 transition-all hover:bg-white/10 group"
                                >
                                    {/* Avatar */}
                                    <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-transparent ring-offset-2 ring-offset-[#0E121B] transition-all group-hover:ring-amber-400/60">
                                        {user?.avatar ? (
                                            <img
                                                src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000/${user.avatar}`}
                                                alt={user?.name || 'User'}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-500 to-amber-700 font-bold text-[#0A0D14] shadow-inner">
                                                {user?.name?.charAt(0)?.toUpperCase() || <User size={20} />}
                                            </div>
                                        )}
                                    </div>
                                    {/* Name + Role */}
                                    {/* <div className="hidden lg:block text-left">
                                        <h2 className="text-sm font-semibold text-gray-900 leading-tight">
                                            {user?.name}
                                        </h2>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                            {user?.role}
                                        </p>
                                    </div> */}
                                    {/* Chevron */}
                                    <ChevronDown
                                        className={`h-4 w-4 text-gray-300 transition-transform duration-200 ${
                                            dropdownOpen ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>

                                {/* ✅ Dropdown Menu */}
                                {dropdownOpen && (
                                    <div className="absolute right-0 top-[calc(100%+8px)] w-44 rounded-xl border border-white/10 bg-[#121620] shadow-lg z-50 overflow-hidden">
                                        {/* User info header */}
                                        <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                                            <p className="text-xs font-semibold text-white truncate">
                                                {user?.name}
                                            </p>
                                            <p className="text-[11px] text-gray-400 truncate">
                                                {user?.role}
                                            </p>
                                        </div>

                                        {/* Dropdown Items */}
                                        <div className="py-1">
                                            {dropdownItems.map((item) => {
                                                const Icon = item.icon;
                                                const active = isActive(item.path);
                                                return (
                                                    <button
                                                        key={item.path}
                                                        onClick={() => {
                                                            navigate(item.path);
                                                            setDropdownOpen(false);
                                                        }}
                                                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                                                            active
                                                                ? 'bg-amber-500/10 text-amber-300'
                                                                : 'text-gray-200 hover:bg-white/10 hover:text-white'
                                                        }`}
                                                    >
                                                        <Icon className={`h-4 w-4 ${active ? 'text-amber-300' : 'text-gray-400'}`} />
                                                        {item.name}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Logout inside dropdown too (optional divider) */}
                                        <div className="border-t border-white/10 py-1">
                                            <button
                                                onClick={handleLogout}
                                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Logout button (standalone icon) */}
                            {/* <button
                                onClick={handleLogout}
                                className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-100 bg-white text-red-500 shadow-sm transition-all hover:bg-red-50 hover:text-red-600"
                                title="Logout"
                            >
                                <LogOut className="h-5 w-5" />
                            </button> */}

                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navigation;
