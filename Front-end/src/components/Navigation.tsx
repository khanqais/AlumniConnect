import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const Navigation = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <header className="relative z-10 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo/Brand */}
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700">
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <Link to="/" className="hidden text-lg font-bold text-gray-900 sm:block">
                            AlumniConnect
                        </Link>
                    </div>

                    {/* Right Side Container */}
                    <div className="flex items-center gap-6">
                        {/* Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                                    isActive('/dashboard')
                                        ? 'text-blue-600 bg-blue-50'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => navigate('/resources')}
                                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                                    isActive('/resources')
                                        ? 'text-blue-600 bg-blue-50'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                Resources
                            </button>
                            <button
                                onClick={() => navigate('/blogs')}
                                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                                    isActive('/blogs')
                                        ? 'text-blue-600 bg-blue-50'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                Blogs
                            </button>
                            <button
                                onClick={() => navigate('/community')}
                                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                                    isActive('/community')
                                        ? 'text-blue-600 bg-blue-50'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                Community
                            </button>
                            <button
                                onClick={() => navigate('/webinars')}
                                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                                    isActive('/webinars') || isActive('/webinar-scheduler')
                                        ? 'text-blue-600 bg-blue-50'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                Events
                            </button>
                            <button
                                onClick={() => navigate('/chat')}
                                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                                    isActive('/chat')
                                        ? 'text-blue-600 bg-blue-50'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                Chat
                            </button>
                        </nav>

                        {/* User Menu */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/profile')}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-gray-100"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 font-bold text-white">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div className="hidden sm:block">
                                    <h2 className="text-sm font-semibold text-gray-900">{user?.name}</h2>
                                    <p className="text-xs capitalize text-gray-600">{user?.role}</p>
                                </div>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navigation;
