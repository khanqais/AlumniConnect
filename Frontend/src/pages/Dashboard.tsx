import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';
import ActivityFeed from '../components/ActivityFeed';
import { useState, useEffect } from 'react';
import { BookOpen, Users, Flame, CalendarDays, Sparkles, CircleCheck, Circle } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [joinRoomId, setJoinRoomId] = useState('');
    const [sidebarHoverOpen, setSidebarHoverOpen] = useState(false);
    const [stats, setStats] = useState({ resources: 24, alumni: 12, streak: 5, events: 3 });
    const [profileCompletion, setProfileCompletion] = useState(60);
    const [profileChecklist, setProfileChecklist] = useState([
        { label: 'Add skills', done: false },
        { label: 'Add projects', done: false },
        { label: 'Add LinkedIn', done: false },
    ]);

    useEffect(() => {
        const fetchDashboardInsights = async () => {
            const token = user?.token ?? localStorage.getItem('token');
            if (!token) return;

            try {
                const [feedRes, profileRes] = await Promise.all([
                    fetch('http://localhost:5000/api/feed?filter=all&page=1&limit=50', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch('http://localhost:5000/api/profile/me/profile', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                if (feedRes.ok) {
                    const feedJson = await feedRes.json();
                    const feedItems = feedJson.data ?? [];
                    const resourcesCount = feedItems.filter((item: { type: string }) => item.type === 'resource').length;
                    const eventsCount = feedItems.filter((item: { type: string }) => item.type === 'event').length;
                    const alumniNames = new Set(
                        feedItems
                            .filter((item: { actorRole?: string; actorName?: string }) => item.actorRole?.toLowerCase() === 'alumni')
                            .map((item: { actorName?: string }) => item.actorName)
                            .filter(Boolean)
                    );

                    setStats(prev => ({
                        ...prev,
                        resources: resourcesCount || prev.resources,
                        events: eventsCount || prev.events,
                        alumni: alumniNames.size || prev.alumni,
                    }));
                }

                if (profileRes.ok) {
                    const profileJson = await profileRes.json();
                    const profile = profileJson.user ?? {};

                    const checks = [
                        { label: 'Add skills', done: Array.isArray(profile.skills) && profile.skills.length > 0 },
                        { label: 'Add projects', done: Array.isArray(profile.workExperience) && profile.workExperience.length > 0 },
                        { label: 'Add LinkedIn', done: Boolean(profile.linkedin) },
                    ];

                    const weightedChecks = [
                        Boolean(profile.name),
                        Boolean(profile.bio),
                        Array.isArray(profile.skills) && profile.skills.length > 0,
                        Array.isArray(profile.target_skills) && profile.target_skills.length > 0,
                        Boolean(profile.linkedin),
                        Boolean(profile.avatar),
                    ];
                    const completeCount = weightedChecks.filter(Boolean).length;
                    const completion = Math.round((completeCount / weightedChecks.length) * 100);

                    setProfileChecklist(checks);
                    setProfileCompletion(Math.max(20, completion));
                    setStats(prev => ({
                        ...prev,
                        streak: Math.max(1, Math.ceil(Math.max(20, completion) / 20)),
                    }));
                }
            } catch {
                // Keep graceful fallback values
            }
        };

        fetchDashboardInsights();
    }, [user?.token]);

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

    const navItems = [
        { label: 'Browse Resources', route: '/resources', icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'text-blue-500' },
        { label: 'Take Quiz', route: '/quiz', icon: 'M9 12h6m-6 4h6M8 8h8m-9 14h10a2 2 0 002-2V4a2 2 0 00-2-2H7a2 2 0 00-2 2v16a2 2 0 002 2z', color: 'text-cyan-500' },       
        { label: 'Read Blogs', route: '/blogs', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'text-purple-500' },
        { label: 'Ask Community', route: '/community', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', color: 'text-amber-500' },
        { label: 'Join Events', route: '/webinars', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'text-green-500' },
        { label: 'Messages', route: '/chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', color: 'text-pink-500' },
        { label: 'Find Mentor', route: '/career-path', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', color: 'text-indigo-500' },
    ];

    const isSidebarOpen = sidebarHoverOpen;

    return (
        <div className="min-h-screen bg-[#0A0D14] text-gray-200 font-dm relative overflow-x-hidden">
            <style>
                {`
                    .dashboard-noise {
                        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                        opacity: 0.03;
                        pointer-events: none;
                    }

                    .dashboard-grid {
                        background-size: 40px 40px;
                        background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
                    }
                `}
            </style>
            {/* Background Effects */}
            <div className="fixed inset-0 dashboard-noise z-0 mix-blend-overlay" />
            <div className="fixed inset-0 dashboard-grid z-0" />
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl opacity-50" />
                <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl opacity-50" />
            </div>

            <Navigation />

            <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:pl-[92px]">
                {/* Welcome row */}
                <div className="mb-6 flex items-center gap-3">
                    <div>
                        <h1 className="text-3xl font-bold text-white font-syne tracking-tight">
                            Welcome back, {user?.name}! 👋
                        </h1>
                        <p className="mt-1 text-base text-gray-400">
                            Your mentorship journey starts here
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-[#121620]/85 backdrop-blur-md p-4 shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:border-white/20">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Resources Shared</p>
                            <BookOpen className="h-4 w-4 text-amber-400" />
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.resources}</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#121620]/85 backdrop-blur-md p-4 shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:border-white/20">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Alumni Connected</p>
                            <Users className="h-4 w-4 text-blue-400" />
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.alumni}</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#121620]/85 backdrop-blur-md p-4 shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:border-white/20">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Current Streak</p>
                            <Flame className="h-4 w-4 text-amber-400" />
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.streak} Day{stats.streak > 1 ? 's' : ''}</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#121620]/85 backdrop-blur-md p-4 shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:border-white/20">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Upcoming Events</p>
                            <CalendarDays className="h-4 w-4 text-emerald-400" />
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.events}</p>
                    </div>
                </div>

                {/* Profile completion */}
                <div className="mb-6 rounded-2xl border border-white/10 bg-[#121620]/85 backdrop-blur-md p-5 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-white">Complete your profile</h3>
                            <p className="text-xs text-gray-500">Higher profile completion helps better mentorship matches.</p>
                        </div>
                        <span className="text-sm font-bold text-amber-400">{profileCompletion}%</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-white/10">
                        <div
                            className="h-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-700"
                            style={{ width: `${profileCompletion}%` }}
                        />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                        {profileChecklist.map(item => (
                            <span key={item.label} className={`inline-flex items-center gap-1 ${item.done ? 'text-emerald-400' : 'text-gray-500'}`}>
                                {item.done ? <CircleCheck className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                                {item.label}
                            </span>
                        ))}
                    </div>
                </div>

                <aside
                    onMouseEnter={() => setSidebarHoverOpen(true)}
                    onMouseLeave={() => setSidebarHoverOpen(false)}
                    className={`fixed left-4 top-24 z-40 hidden lg:flex h-[calc(100vh-7rem)] flex-col gap-0 rounded-2xl border border-white/10 bg-[#121620]/90 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.35)] overflow-y-auto transition-all duration-300 ${
                        isSidebarOpen ? 'w-60' : 'w-14'
                    }`}
                >
                    <div className={isSidebarOpen ? 'block' : 'hidden'}>
                        <div className="p-4">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Quick Actions</p>
                            <nav className="flex flex-col gap-1">
                                {navItems.map(item => (
                                    <button
                                        key={item.route}
                                        onClick={() => navigate(item.route)}
                                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-200 transition hover:bg-white/10 hover:text-white text-left"
                                    >
                                        <svg className={`h-4 w-4 flex-shrink-0 ${item.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                        </svg>
                                        {item.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    <div className={isSidebarOpen ? 'hidden' : 'flex flex-col items-center gap-3 py-3'}>
                        {navItems.map(item => (
                            <button
                                key={item.route}
                                onClick={() => navigate(item.route)}
                                className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-300 transition hover:bg-white/10 hover:text-white"
                                title={item.label}
                            >
                                <svg className={`h-4 w-4 ${item.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                </svg>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* GitHub-style 2-column layout */}
                <div className="grid gap-6 lg:grid-cols-[1fr_280px]">

                    {/* ── CENTER: FEED ── */}
                    <section className="min-w-0">
                        <ActivityFeed />
                    </section>

                    {/* ── RIGHT SIDEBAR ── */}
                    <aside className="flex flex-col gap-4">
                        {/* Video call actions */}
                        <div className="rounded-2xl border border-white/10 bg-[#121620]/85 backdrop-blur-md p-5 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Video Calls</p>

                            {/* <div className="mb-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Mentor Online</p>
                                <div className="mt-1 flex items-center gap-2">
                                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                    <p className="text-sm font-semibold text-white">Rahul Sharma</p>
                                </div>
                                <p className="text-xs text-gray-300">Amazon SDE</p>
                            </div> */}

                            <div className="mb-3 rounded-xl border border-blue-400/20 bg-blue-400/10 p-3">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">Upcoming Session</p>
                                <p className="mt-1 text-sm font-semibold text-white">Career Guidance with Priya</p>
                                <p className="text-xs text-gray-300">Today • 6:30 PM</p>
                            </div>

                            <div className="flex flex-col gap-3">
                                {/* Instant call */}
                                <button
                                    onClick={startVideoCall}
                                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-sm font-semibold text-[#0A0D14] shadow-sm transition-all hover:scale-[1.01] hover:from-amber-400 hover:to-amber-500"
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
                                        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                                    />
                                    <button
                                        onClick={joinVideoCall}
                                        className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-100 transition-all hover:scale-[1.01] hover:bg-white/10"
                                    >
                                        Join Call →
                                    </button>
                                </div>

                                {/* Schedule (alumni only) */}
                                {user?.role === 'alumni' && (
                                    <button
                                        onClick={scheduleCall}
                                        className="flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300 transition-all hover:scale-[1.01] hover:bg-emerald-400/15"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Schedule Session
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Trending widget */}
                        <div className="rounded-2xl border border-white/10 bg-[#121620]/85 backdrop-blur-md p-5 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                            <div className="mb-3 flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Trending</p>
                                <Sparkles className="h-4 w-4 text-amber-400" />
                            </div>
                            <div className="space-y-2">
                                <button
                                    onClick={() => navigate('/resources')}
                                    className="w-full rounded-lg bg-white/5 px-3 py-2 text-left text-sm font-medium text-gray-200 transition hover:bg-white/10"
                                >
                                    System Design Notes
                                </button>
                                <button
                                    onClick={() => navigate('/resources')}
                                    className="w-full rounded-lg bg-white/5 px-3 py-2 text-left text-sm font-medium text-gray-200 transition hover:bg-white/10"
                                >
                                    Google Interview Prep
                                </button>
                                <button
                                    onClick={() => navigate('/blogs')}
                                    className="w-full rounded-lg bg-white/5 px-3 py-2 text-left text-sm font-medium text-gray-200 transition hover:bg-white/10"
                                >
                                    Java DSA Guide
                                </button>
                            </div>
                        </div>

                        {/* Explore features */}
                        <div className="rounded-2xl border border-white/10 bg-[#121620]/85 backdrop-blur-md p-5 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Explore</p>
                            <div className="flex flex-col gap-3">
                                <div
                                    onClick={() => navigate('/resources')}
                                    className="group cursor-pointer rounded-xl border border-blue-400/20 bg-blue-400/10 p-3 transition hover:border-blue-300/40"
                                >
                                    <p className="text-sm font-semibold text-blue-300">Share Resources</p>
                                    <p className="mt-0.5 text-xs text-blue-200">Upload resumes, notes &amp; projects</p>
                                    <p className="mt-1.5 text-xs font-medium text-blue-300 group-hover:underline">Upload Now →</p>
                                </div>

                                <div
                                    onClick={() => navigate('/blogs')}
                                    className="group cursor-pointer rounded-xl border border-purple-400/20 bg-purple-400/10 p-3 transition hover:border-purple-300/40"
                                >
                                    <p className="text-sm font-semibold text-purple-300">Write a Blog</p>
                                    <p className="mt-0.5 text-xs text-purple-200">Share your journey &amp; insights</p>
                                    <p className="mt-1.5 text-xs font-medium text-purple-300 group-hover:underline">Start Writing →</p>
                                </div>

                                <div
                                    onClick={() => navigate('/career-path')}
                                    className="group cursor-pointer rounded-xl border border-indigo-400/20 bg-indigo-400/10 p-3 transition hover:border-indigo-300/40"
                                >
                                    <p className="text-sm font-semibold text-indigo-300">Find a Mentor</p>
                                    <p className="mt-0.5 text-xs text-indigo-200">Connect with experienced alumni</p>
                                    <p className="mt-1.5 text-xs font-medium text-indigo-300 group-hover:underline">Explore →</p>
                                </div>
                            </div>
                        </div>

                        {/* Getting started */}
                        <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/15 to-blue-500/10 p-5">
                            <h3 className="text-sm font-semibold text-white">Getting Started</h3>
                            <p className="mt-1.5 text-xs text-gray-300">
                                Explore resources, read blogs, ask questions, and attend upcoming events.
                            </p>
                            <button
                                onClick={() => navigate('/resources')}
                                className="mt-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-semibold text-[#0A0D14] shadow-sm transition hover:from-amber-400 hover:to-amber-500"
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
