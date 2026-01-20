import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const startVideoCall = () => { 
        const newRoomId = uuidv4(); 
        navigate(`/videocall/${newRoomId}`); 
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-blue-100 blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-indigo-100 blur-3xl"></div>
            </div>

            {/* Navigation */}
            <Navigation />

            {/* Main Content */}
            <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Welcome back, {user?.name}! 👋</h1>
                    <p className="mt-2 text-lg text-gray-600">Your mentorship journey starts here</p>
                </div>

                {/* Profile Card */}
                <div className="mb-8">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm max-w-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Your Profile</p>
                                <p className="mt-2 text-2xl font-bold capitalize text-gray-900">{user?.role}</p>
                            </div>
                            <div className="rounded-xl bg-blue-50 p-3">
                                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="mb-4 text-2xl font-bold text-gray-900">Quick Actions</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <button
                            onClick={() => navigate('/resources')}
                            className="group rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all hover:border-blue-500 hover:shadow-md"
                        >
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900">Browse Resources</h3>
                            <p className="mt-1 text-sm text-gray-600">Download resumes, notes & more</p>
                        </button>

                        <button
                            onClick={() => navigate('/blogs')}
                            className="group rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all hover:border-blue-500 hover:shadow-md"
                        >
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900">Read Blogs</h3>
                            <p className="mt-1 text-sm text-gray-600">Career advice & experiences</p>
                        </button>

                        <button
                            onClick={() => navigate('/community')}
                            className="group rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all hover:border-blue-500 hover:shadow-md"
                        >
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900">Ask Community</h3>
                            <p className="mt-1 text-sm text-gray-600">Get help from alumni</p>
                        </button>

                        <button
                            onClick={() => navigate('/webinars')}
                            className="group rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all hover:border-blue-500 hover:shadow-md"
                        >
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900">Join Events</h3>
                            <p className="mt-1 text-sm text-gray-600">Webinars & workshops</p>
                        </button>

                        <button
                            onClick={() => navigate('/chat')}
                            className="group rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all hover:border-blue-500 hover:shadow-md"
                        >
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900">Messages</h3>
                            <p className="mt-1 text-sm text-gray-600">Chat with mentors & students</p>
                        </button>
                    </div>
                </div>

                {/* Feature Cards */}
                <div className="mb-8">
                    <h2 className="mb-4 text-2xl font-bold text-gray-900">Explore Features</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* Find Mentors for career path */}
                        <div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-md">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Find Mentors with similar interests</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Connect with experienced alumni in your field of interest
                            </p>
                            <button className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800" onClick={() => navigate('/career-path')}>
                                Explore →
                            </button>
                        </div>
                        
                        {/* Find Mentors for learning */}
                        <div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-md">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Find Mentors for learning new things</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Connect with experienced alumni to learn
                            </p>
                            <button className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800" onClick={() => navigate('/recommendations')}>
                                Explore →
                            </button>
                        </div>

                        {/* Upload Resource */}
                        <div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-md">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Share Resources</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Upload your resume, notes, or projects to help others
                            </p>
                            <button
                                onClick={() => navigate('/resources')}
                                className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                                Upload Now →
                            </button>
                        </div>

                        {/* Write Blog */}
                        <div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-md">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Write a Blog</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Share your journey, tips, and insights with the community
                            </p>
                            <button
                                onClick={() => navigate('/blogs')}
                                className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                                Start Writing →
                            </button>
                        </div>
                        
                        {/* Video Call Feature */}
                        <div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-md">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Video Calls</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Start video calls with mentors for real-time guidance
                            </p>
                            <button
                                onClick={startVideoCall}
                                className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                                Start Call →
                            </button>
                        </div>
                    </div>
                </div>

                {/* Getting Started Section */}
                <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">Getting Started</h3>
                            <p className="mt-2 text-sm text-gray-700">
                                Welcome to AlumniConnect! Explore our resource library, read blogs from alumni, ask questions in the community,
                                or attend upcoming events. Your journey starts here!
                            </p>
                            <button
                                onClick={() => navigate('/resources')}
                                className="mt-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-blue-700 hover:to-indigo-800"
                            >
                                Explore Now
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Dashboard;