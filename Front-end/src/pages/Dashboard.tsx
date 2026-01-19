import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">
                                {user?.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900">{user?.name}</h2>
                                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}! 👋</h1>
                    <p className="mt-2 text-lg text-gray-600">Your mentorship journey starts here</p>
                </div>

                {/* Stats Cards */}
                <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Your Profile</p>
                                <p className="mt-2 text-2xl font-bold text-gray-900 capitalize">{user?.role}</p>
                            </div>
                            <div className="rounded-full bg-indigo-100 p-3">
                                <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Connections</p>
                                <p className="mt-2 text-2xl font-bold text-gray-900">0</p>
                            </div>
                            <div className="rounded-full bg-green-100 p-3">
                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Messages</p>
                                <p className="mt-2 text-2xl font-bold text-gray-900">0</p>
                            </div>
                            <div className="rounded-full bg-blue-100 p-3">
                                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feature Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Find Mentors */}
                    <div className="rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                            <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Find Mentors</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Connect with experienced alumni in your field of interest
                        </p>
                        <button className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                            Explore →
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Chat with your mentors and peers in real-time
                        </p>
                        <button className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                            Open Inbox →
                        </button>
                    </div>

                    {/* My Profile */}
                    <div className="rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">My Profile</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Update your information and track your progress
                        </p>
                        <button className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                            View Profile →
                        </button>
                    </div>

                    {/* Events */}
                    <div className="rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                            <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Events</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Upcoming workshops, webinars, and networking events
                        </p>
                        <button className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                            See Events →
                        </button>
                    </div>

                    {/* Resources */}
                    <div className="rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Resources</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Access learning materials and career guides
                        </p>
                        <button className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                            Browse Resources →
                        </button>
                    </div>

                    {/* Achievements */}
                    <div className="rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-pink-100">
                            <svg className="h-6 w-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Track your mentorship milestones and badges
                        </p>
                        <button className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                            View Badges →
                        </button>
                    </div>
                </div>

                {/* Getting Started Section */}
                <div className="mt-8 rounded-lg bg-indigo-50 border border-indigo-200 p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-indigo-900">Getting Started</h3>
                            <p className="mt-2 text-sm text-indigo-700">
                                Welcome to the mentorship platform! Start by exploring mentors in your field, 
                                attending upcoming events, or browsing our learning resources. Need help? 
                                Check out our guide for new members.
                            </p>
                            <button className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
                                View Quick Start Guide
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
