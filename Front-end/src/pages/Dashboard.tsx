import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';
import ActivityFeed from '../components/ActivityFeed';
import { useState } from 'react';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [joinRoomId, setJoinRoomId] = useState('');

    const joinVideoCall = () => {
        if (!joinRoomId.trim()) {
            alert('Please enter a valid Room ID');
            return;
        }
        navigate(`/videocall/${joinRoomId.trim()}`);
    };

    const scheduleCall = async () => {
        try {
            const startTime = new Date(Date.now() + 10 * 60 * 1000);
            const endTime = new Date(startTime.getTime() + 30 * 60000);

            const res = await fetch('http://localhost:5000/api/availability/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ startTime, endTime }),
            });

            await res.json();
            alert('Availability published successfully ✅');
        } catch (err) {
            console.error(err);
            alert('Failed to create slot');
        }
    };

    const startVideoCall = () => {
        const newRoomId = uuidv4();
        navigate(`/videocall/${newRoomId}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-blue-100 blur-3xl opacity-50" />
                <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-indigo-100 blur-3xl opacity-50" />
            </div>

            <Navigation />

            <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Welcome */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {user?.name}! 👋
                    </h1>
                    <p className="mt-1 text-base text-gray-500">
                        Your mentorship journey starts here
                    </p>
                </div>

                {/* GitHub-style 3-column layout */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr_280px]">

                    {/* ── LEFT SIDEBAR ── */}
                    <aside className="flex flex-col gap-4">
                        {/* Profile card */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white text-lg font-bold">
                                    {user?.name?.[0]?.toUpperCase() ?? 'U'}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">{user?.name}</p>
                                    <p className="text-xs capitalize text-gray-500">{user?.role}</p>
                                </div>
                            </div>
                            <div className="h-px bg-gray-100 mb-3" />
                            <p className="text-xs text-gray-400">Member of AlumniConnect</p>
                        </div>

                        {/* Quick navigation */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Quick Actions</p>
                            <nav className="flex flex-col gap-1">
                                {[
                                    { label: 'Browse Resources', route: '/resources', icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'text-blue-500' },
                                    { label: 'Read Blogs', route: '/blogs', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'text-purple-500' },
                                    { label: 'Ask Community', route: '/community', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', color: 'text-amber-500' },
                                    { label: 'Join Events', route: '/webinars', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'text-green-500' },
                                    { label: 'Messages', route: '/chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', color: 'text-pink-500' },
                                    { label: 'Find Mentor', route: '/career-path', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', color: 'text-indigo-500' },
                                ].map(item => (
                                    <button
                                        key={item.route}
                                        onClick={() => navigate(item.route)}
                                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 hover:text-gray-900 text-left"
                                    >
                                        <svg className={`h-4 w-4 flex-shrink-0 ${item.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                        </svg>
                                        {item.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* ── CENTER: FEED ── */}
                    <section className="min-w-0">
                        <ActivityFeed />
                    </section>

                    {/* ── RIGHT SIDEBAR ── */}
                    <aside className="flex flex-col gap-4">
                        {/* Video call actions */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Video Calls</p>
                            <div className="flex flex-col gap-3">
                                {/* Instant call */}
                                <button
                                    onClick={startVideoCall}
                                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Start Instant Call
                                </button>

                                {/* Join with Room ID */}
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter Room ID"
                                        value={joinRoomId}
                                        onChange={e => setJoinRoomId(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                                    />
                                    <button
                                        onClick={joinVideoCall}
                                        className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-100"
                                    >
                                        Join Call →
                                    </button>
                                </div>

                                {/* Schedule (alumni only) */}
                                {user?.role === 'alumni' && (
                                    <button
                                        onClick={scheduleCall}
                                        className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Schedule Session
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Explore features */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Explore</p>
                            <div className="flex flex-col gap-3">
                                <div
                                    onClick={() => navigate('/resources')}
                                    className="group cursor-pointer rounded-xl border border-blue-100 bg-blue-50 p-3 transition hover:border-blue-300"
                                >
                                    <p className="text-sm font-semibold text-blue-800">Share Resources</p>
                                    <p className="mt-0.5 text-xs text-blue-600">Upload resumes, notes & projects</p>
                                    <p className="mt-1.5 text-xs font-medium text-blue-700 group-hover:underline">Upload Now →</p>
                                </div>

                                <div
                                    onClick={() => navigate('/blogs')}
                                    className="group cursor-pointer rounded-xl border border-purple-100 bg-purple-50 p-3 transition hover:border-purple-300"
                                >
                                    <p className="text-sm font-semibold text-purple-800">Write a Blog</p>
                                    <p className="mt-0.5 text-xs text-purple-600">Share your journey & insights</p>
                                    <p className="mt-1.5 text-xs font-medium text-purple-700 group-hover:underline">Start Writing →</p>
                                </div>

                                <div
                                    onClick={() => navigate('/career-path')}
                                    className="group cursor-pointer rounded-xl border border-indigo-100 bg-indigo-50 p-3 transition hover:border-indigo-300"
                                >
                                    <p className="text-sm font-semibold text-indigo-800">Find a Mentor</p>
                                    <p className="mt-0.5 text-xs text-indigo-600">Connect with experienced alumni</p>
                                    <p className="mt-1.5 text-xs font-medium text-indigo-700 group-hover:underline">Explore →</p>
                                </div>
                            </div>
                        </div>

                        {/* Getting started */}
                        <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
                            <h3 className="text-sm font-semibold text-gray-900">Getting Started</h3>
                            <p className="mt-1.5 text-xs text-gray-600">
                                Explore resources, read blogs, ask questions, and attend upcoming events.
                            </p>
                            <button
                                onClick={() => navigate('/resources')}
                                className="mt-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700"
                            >
                                Explore Now
                            </button>
                        </div>
                    </aside>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Dashboard;
