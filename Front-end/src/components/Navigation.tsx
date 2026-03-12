import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import {
    Home,
    TrendingUp,
    Map,
    FileText,
    Users,
    MessageSquare,
    Calendar,
    LogOut,
    User,
    ChevronDown
} from 'lucide-react';

const Navigation = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Dropdown state
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
        { name: 'Recommendations', path: '/recommendations', icon: TrendingUp },
        { name: 'Career Path',     path: '/career-path',    icon: Map },
        { name: 'Blogs',           path: '/blogs',          icon: FileText },
        { name: 'Community',       path: '/community',      icon: Users },
        { name: 'Events',          path: '/webinars',       icon: Calendar },
    ];

    // ✅ Dropdown items — Profile & Chat
    const dropdownItems = [
        { name: 'Profile', path: '/profile', icon: User },
        { name: 'Chat',    path: '/chat',    icon: MessageSquare },
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close dropdown on route change
    useEffect(() => {
        setDropdownOpen(false);
    }, [location.pathname]);

    return (
        <header className="sticky top-0 z-[100] border-b border-gray-200 bg-white/80 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">

                    {/* Logo/Brand */}
                    <div className="flex items-center gap-2">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 shadow-md transition-transform group-hover:scale-110">
                                <Map className="h-6 w-6 text-white" />
                            </div>
                            <span className="hidden text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent sm:block">
                                AlumniConnect
                            </span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden xl:flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                                        active
                                            ? 'text-blue-600 bg-blue-50 shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                >
                                    <Icon className={`h-4 w-4 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                                    <span>{item.name}</span>
                                </button>
                            );
                        })}
                    </nav>

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 border-l border-gray-200 pl-4">

                            {/* ✅ Profile Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(prev => !prev)}
                                    className="flex items-center gap-3 rounded-lg px-3 py-1.5 transition-all hover:bg-gray-100 group"
                                >
                                    {/* Avatar */}
                                    <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-transparent ring-offset-2 transition-all group-hover:ring-blue-500">
                                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 font-bold text-white shadow-inner">
                                            {user?.name?.charAt(0)?.toUpperCase() || <User size={20} />}
                                        </div>
                                    </div>
                                    {/* Name + Role */}
                                    <div className="hidden lg:block text-left">
                                        <h2 className="text-sm font-semibold text-gray-900 leading-tight">
                                            {user?.name}
                                        </h2>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                            {user?.role}
                                        </p>
                                    </div>
                                    {/* Chevron */}
                                    <ChevronDown
                                        className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                                            dropdownOpen ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>

                                {/* ✅ Dropdown Menu */}
                                {dropdownOpen && (
                                    <div className="absolute right-0 top-[calc(100%+8px)] w-44 rounded-xl border border-gray-100 bg-white shadow-lg z-50 overflow-hidden">
                                        {/* User info header */}
                                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                                            <p className="text-xs font-semibold text-gray-900 truncate">
                                                {user?.name}
                                            </p>
                                            <p className="text-[11px] text-gray-500 truncate">
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
                                                                ? 'bg-blue-50 text-blue-600'
                                                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                                        }`}
                                                    >
                                                        <Icon className={`h-4 w-4 ${active ? 'text-blue-500' : 'text-gray-400'}`} />
                                                        {item.name}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Logout inside dropdown too (optional divider) */}
                                        <div className="border-t border-gray-100 py-1">
                                            <button
                                                onClick={handleLogout}
                                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
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
