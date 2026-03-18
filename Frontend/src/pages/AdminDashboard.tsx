import { useEffect, useState } from 'react';
import api from '../config/api';
import { useNavigate } from 'react-router-dom';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    university: string;
    graduationYear: number;
    skills: string[];
    branch?: string;
    cgpa?: number;
    isBanned?: boolean;
    banReason?: string;
    createdAt: string;
}

interface Stats {
    totalUsers: number;
    pendingUsers: number;
    approvedUsers: number;
    totalStudents: number;
    totalAlumni: number;
    approvalRate: string;
}

interface ReferralStats {
    totalReferrals: number;
    openReferrals: number;
    totalApplications: number;
    referredCount: number;
    flaggedApplications: number;
}

interface AlumniResult {
    _id: string;
    name: string;
    email: string;
    collegeName: string;
    graduationYear: number;
    branch: string;
    company: string;
    jobTitle: string;
    skills: string[];
    linkedin: string;
    experience: string;
}

interface Announcement {
    _id: string;
    title: string;
    content: string;
    category: 'Academic' | 'Events' | 'Career' | 'Recognition' | 'Policy' | 'Urgent/Emergency';
    adminName: string;
    adminEmail: string;
    isPublished: boolean;
    views: number;
    createdAt: string;
}

const AdminDashboard = () => {
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [approvedUsers, setApprovedUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'commandCenter' | 'referralOps' | 'announcements'>('pending');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [userToReject, setUserToReject] = useState<User | null>(null);
    const [alumniResults, setAlumniResults] = useState<AlumniResult[]>([]);
    const [alumniTotal, setAlumniTotal] = useState(0);
    const [alumniPage, setAlumniPage] = useState(1);
    const [alumniPages, setAlumniPages] = useState(1);
    const [isSearching, setIsSearching] = useState(false);
    const [searchFilters, setSearchFilters] = useState({ name: '', graduationYear: '', branch: '', company: '', skills: '' });
    const [hasSearched, setHasSearched] = useState(false);
    const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
    const [cgpaInputs, setCgpaInputs] = useState<Record<string, string>>({});
    const [banReasons, setBanReasons] = useState<Record<string, string>>({});
    

    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [announcementTitle, setAnnouncementTitle] = useState('');
    const [announcementContent, setAnnouncementContent] = useState('');
    const [announcementCategory, setAnnouncementCategory] = useState<'Academic' | 'Events' | 'Career' | 'Recognition' | 'Policy' | 'Urgent/Emergency'>('Academic');
    const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false);
    
    const navigate = useNavigate();

    useEffect(() => {
        const isAdmin = localStorage.getItem('adminAuth') === 'true';
        
        console.log('🔍 Checking admin auth:', isAdmin);
        
        if (!isAdmin) {
            console.log('❌ Not admin, redirecting to /admin');
            navigate('/admin');
            return;
        }
        
        console.log('✅ Admin verified, fetching data');
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [pendingRes, approvedRes, statsRes, referralStatsRes, announcementsRes] = await Promise.all([
                api.get('/admin/pending'),
                api.get('/admin/approved'),
                api.get('/admin/stats'),
                api.get('/admin/referral-stats'),
                api.get('/admin/announcements'),
            ]);
            
            setPendingUsers(pendingRes.data);
            setApprovedUsers(approvedRes.data);
            setStats(statsRes.data);
            setReferralStats(referralStatsRes.data?.stats || null);
            setAnnouncements(announcementsRes.data);
        } catch (err) {
            console.error(err);
            alert('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string, userName: string) => {
        if (!window.confirm(`Are you sure you want to approve ${userName}?`)) return;

        try {
            await api.put(`/admin/status/${id}`, { 
                status: 'approved' 
            });
            
            alert(`${userName} has been approved successfully!`);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Approval failed. Please try again.');
        }
    };

    const handleReject = async () => {
        if (!userToReject) return;

        try {
            await api.put(`/admin/status/${userToReject._id}`, { 
                status: 'rejected',
                reason: rejectionReason 
            });
            
            alert(`${userToReject.name}'s application has been rejected.`);
            setShowRejectModal(false);
            setUserToReject(null);
            setRejectionReason('');
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Rejection failed. Please try again.');
        }
    };

    const openRejectModal = (user: User) => {
        setUserToReject(user);
        setShowRejectModal(true);
    };

    const viewUserDetails = (user: User) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminEmail');
        navigate('/admin');
    };

    const handleAlumniSearch = async (page = 1) => {
        try {
            setIsSearching(true);
            setHasSearched(true);
            const params = new URLSearchParams();
            if (searchFilters.name) params.append('name', searchFilters.name);
            if (searchFilters.graduationYear) params.append('graduationYear', searchFilters.graduationYear);
            if (searchFilters.branch) params.append('branch', searchFilters.branch);
            if (searchFilters.company) params.append('company', searchFilters.company);
            if (searchFilters.skills) params.append('skills', searchFilters.skills);
            params.append('page', String(page));
            params.append('limit', '20');
            const res = await api.get(`/admin/alumni/search?${params.toString()}`);
            setAlumniResults(res.data.alumni);
            setAlumniTotal(res.data.total);
            setAlumniPage(res.data.page);
            setAlumniPages(res.data.pages);
        } catch (err) {
            console.error('Alumni search error:', err);
            alert('Failed to search alumni. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchReset = () => {
        setSearchFilters({ name: '', graduationYear: '', branch: '', company: '', skills: '' });
        setAlumniResults([]);
        setAlumniTotal(0);
        setAlumniPage(1);
        setAlumniPages(1);
        setHasSearched(false);
    };

    const handleUpdateCgpa = async (userId: string, userName: string) => {
        const rawValue = cgpaInputs[userId];
        if (rawValue === undefined || rawValue === '') {
            alert('Enter a CGPA value first.');
            return;
        }

        try {
            await api.put(`/admin/user/${userId}/cgpa`, {
                cgpa: Number(rawValue),
            });
            alert(`Updated CGPA for ${userName}`);
            fetchData();
        } catch (err: any) {
            console.error('CGPA update error:', err);
            alert(err?.response?.data?.message || 'Failed to update CGPA');
        }
    };

    const handleToggleBan = async (user: User, ban: boolean) => {
        const reason = banReasons[user._id] || '';
        if (ban && !reason.trim()) {
            alert('Please provide a ban reason.');
            return;
        }

        try {
            await api.put(`/admin/user/${user._id}/ban`, {
                ban,
                reason,
            });
            alert(ban ? `${user.name} has been banned` : `${user.name} has been unbanned`);
            fetchData();
        } catch (err: any) {
            console.error('Ban toggle error:', err);
            alert(err?.response?.data?.message || 'Failed to update ban status');
        }
    };

    const handleCreateAnnouncement = async () => {
        if (!announcementTitle.trim() || !announcementContent.trim()) {
            alert('Please fill in all fields');
            return;
        }

        try {
            setIsCreatingAnnouncement(true);
            const adminEmail = localStorage.getItem('adminEmail') || 'admin@domain.com';
            const adminId = localStorage.getItem('adminId') || 'admin';

            await api.post('/admin/announcements', {
                title: announcementTitle,
                content: announcementContent,
                category: announcementCategory,
            }, {
                headers: {
                    'admin-email': adminEmail,
                    'admin-id': adminId,
                }
            });

            alert('Announcement posted successfully!');
            setAnnouncementTitle('');
            setAnnouncementContent('');
            setAnnouncementCategory('Academic');
            fetchData();
        } catch (err) {
            console.error('Create announcement error:', err);
            alert('Failed to create announcement');
        } finally {
            setIsCreatingAnnouncement(false);
        }
    };

    const handleDeleteAnnouncement = async (id: string, title: string) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

        try {
            await api.delete(`/admin/announcements/${id}`);
            alert('Announcement deleted successfully!');
            fetchData();
        } catch (err) {
            console.error('Delete announcement error:', err);
            alert('Failed to delete announcement');
        }
    };

    const adminEmail = localStorage.getItem('adminEmail') || 'Admin';

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0A0D14]">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                    <p className="mt-4 text-lg font-semibold text-gray-300">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    const displayUsers = activeTab === 'pending' ? pendingUsers : approvedUsers;

    return (
        <div className="admin-theme min-h-screen bg-[#0A0D14] text-gray-200 relative overflow-x-hidden">
            <style>
                {`
                    .admin-noise {
                        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                        opacity: 0.03;
                        pointer-events: none;
                    }

                    .admin-grid {
                        background-size: 40px 40px;
                        background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
                    }

                    .admin-theme .admin-content .bg-white,
                    .admin-theme .admin-content .bg-gray-50,
                    .admin-theme .admin-content .bg-gray-100 {
                        background-color: rgba(18, 22, 32, 0.84) !important;
                    }

                    .admin-theme .admin-content .border-gray-100,
                    .admin-theme .admin-content .border-gray-200,
                    .admin-theme .admin-content .border-gray-300 {
                        border-color: rgba(255, 255, 255, 0.14) !important;
                    }

                    .admin-theme .admin-content .text-gray-900,
                    .admin-theme .admin-content .text-gray-800,
                    .admin-theme .admin-content .text-gray-700 {
                        color: #f3f4f6 !important;
                    }

                    .admin-theme .admin-content .text-gray-600,
                    .admin-theme .admin-content .text-gray-500,
                    .admin-theme .admin-content .text-gray-400 {
                        color: #9ca3af !important;
                    }

                    .admin-theme .admin-content input,
                    .admin-theme .admin-content textarea,
                    .admin-theme .admin-content select {
                        background-color: rgba(255, 255, 255, 0.05) !important;
                        color: #f9fafb !important;
                        border-color: rgba(255, 255, 255, 0.18) !important;
                    }

                    .admin-theme .admin-content input::placeholder,
                    .admin-theme .admin-content textarea::placeholder {
                        color: #94a3b8 !important;
                    }
                `}
            </style>

            {/* Background Effects */}
            <div className="fixed inset-0 admin-noise z-0 mix-blend-overlay"></div>
            <div className="fixed inset-0 admin-grid z-0"></div>
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0"></div>

            {/* Header */}
            <header className="relative z-10 border-b border-white/10 bg-[#0E121B]/85 backdrop-blur-md shadow-none">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-white/10">
                                <img
                                    src="/logo.png"
                                    alt="AlumniConnect"
                                    className="mt-2 block h-full w-full scale-[1.7] origin-center object-contain object-center"
                                />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold font-syne text-white">Admin Dashboard</h1>
                                <p className="text-sm text-gray-400">Welcome, {adminEmail}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-sm font-medium text-white hover:from-red-700 hover:to-red-800"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="admin-content relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Stats Cards */}
                {stats && (
                    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-white/10 bg-[#121620]/85 backdrop-blur-md p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Total Users</p>
                                    <p className="text-3xl font-bold text-white mt-2">{stats.totalUsers}</p>
                                </div>
                                <div className="rounded-full bg-blue-500/15 border border-blue-400/30 p-3">
                                    <svg className="h-6 w-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-[#121620]/85 backdrop-blur-md p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Pending</p>
                                    <p className="text-3xl font-bold text-white mt-2">{stats.pendingUsers}</p>
                                </div>
                                <div className="rounded-full bg-amber-500/15 border border-amber-400/30 p-3">
                                    <svg className="h-6 w-6 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-[#121620]/85 backdrop-blur-md p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Approved</p>
                                    <p className="text-3xl font-bold text-white mt-2">{stats.approvedUsers}</p>
                                </div>
                                <div className="rounded-full bg-emerald-500/15 border border-emerald-400/30 p-3">
                                    <svg className="h-6 w-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-[#121620]/85 backdrop-blur-md p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Approval Rate</p>
                                    <p className="text-3xl font-bold text-white mt-2">{stats.approvalRate}%</p>
                                </div>
                                <div className="rounded-full bg-purple-500/15 border border-purple-400/30 p-3">
                                    <svg className="h-6 w-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                            activeTab === 'pending'
                                ? 'bg-amber-500 text-[#0A0D14] shadow-sm'
                                : 'bg-white/5 border border-white/15 text-gray-300 hover:bg-white/10'
                        }`}
                    >
                        Pending Users ({pendingUsers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('approved')}
                        className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                            activeTab === 'approved'
                                ? 'bg-amber-500 text-[#0A0D14] shadow-sm'
                                : 'bg-white/5 border border-white/15 text-gray-300 hover:bg-white/10'
                        }`}
                    >
                        Approved Users ({approvedUsers.length})
                    </button>

                    <button
                        onClick={() => setActiveTab('commandCenter')}
                        className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                            activeTab === 'commandCenter'
                                ? 'bg-amber-500 text-[#0A0D14] shadow-sm'
                                : 'bg-white/5 border border-white/15 text-gray-300 hover:bg-white/10'
                        }`}
                    >
                        Command Center
                    </button>
                    <button
                        onClick={() => setActiveTab('referralOps')}
                        className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                            activeTab === 'referralOps'
                                ? 'bg-amber-500 text-[#0A0D14] shadow-sm'
                                : 'bg-white/5 border border-white/15 text-gray-300 hover:bg-white/10'
                        }`}
                    >
                        Referral Ops
                    </button>
                    <button
                        onClick={() => setActiveTab('announcements')}
                        className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                            activeTab === 'announcements'
                                ? 'bg-amber-500 text-[#0A0D14] shadow-sm'
                                : 'bg-white/5 border border-white/15 text-gray-300 hover:bg-white/10'
                        }`}
                    >
                        College Announcements
                    </button>
                </div>

                {/* Users Table */}
                {(activeTab === 'pending' || activeTab === 'approved') && (
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121620]/85 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                    {displayUsers.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="mt-4 text-lg font-medium text-gray-300">
                                {activeTab === 'pending' ? 'No pending applications' : 'No approved users yet'}
                            </p>
                            <p className="mt-2 text-sm text-gray-400">
                                {activeTab === 'pending'
                                    ? 'All applications have been processed'
                                    : 'Approved users will appear here'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-white/10">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">University</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Skills</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Applied</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {displayUsers.map((u) => (
                                        <tr key={u._id} className="hover:bg-white/5 transition-colors">
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 font-semibold text-white">
                                                        {u.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="font-medium text-white">{u.name}</div>
                                                        <div className="text-sm text-gray-400">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                    u.role === 'student'
                                                        ? 'bg-blue-500/15 text-blue-300 border border-blue-400/30'
                                                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                                                }`}>
                                                    {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm text-white">{u.university}</div>
                                                {u.graduationYear && (
                                                    <div className="text-xs text-gray-400">Class of {u.graduationYear}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {u.skills?.slice(0, 2).map((skill, idx) => (
                                                        <span key={idx} className="rounded-full bg-purple-500/15 px-2 py-1 text-xs text-purple-300 border border-purple-400/30">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {u.skills?.length > 2 && (
                                                        <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-gray-300 border border-white/15">
                                                            +{u.skills.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                                                {new Date(u.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => viewUserDetails(u)}
                                                        className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-amber-300 hover:bg-white/10 transition"
                                                    >
                                                        View
                                                    </button>
                                                    {activeTab === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(u._id, u.name)}
                                                                className="rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-3 py-1.5 text-emerald-300 hover:bg-emerald-500/25 transition"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => openRejectModal(u)}
                                                                className="rounded-lg border border-red-400/30 bg-red-500/15 px-3 py-1.5 text-red-300 hover:bg-red-500/25 transition"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                )}

                {/* Resources Table */}


                {/* Command Center */}
                {activeTab === 'commandCenter' && (
                <div className="space-y-6">
                    {/* Filter Card */}
                    <div className="rounded-2xl border border-white/10 bg-[#121620]/85 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                        <div className="border-b border-white/10 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
                                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Alumni Command Center</h2>
                                    <p className="text-sm text-gray-400">Search and filter the alumni database</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">Name / Email</label>
                                    <input
                                        type="text"
                                        value={searchFilters.name}
                                        onChange={(e) => setSearchFilters((f) => ({ ...f, name: e.target.value }))}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAlumniSearch(1)}
                                        placeholder="Search by name or email..."
                                        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">Graduation Year (Batch)</label>
                                    <input
                                        type="number"
                                        value={searchFilters.graduationYear}
                                        onChange={(e) => setSearchFilters((f) => ({ ...f, graduationYear: e.target.value }))}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAlumniSearch(1)}
                                        placeholder="e.g. 2022"
                                        min={1950}
                                        max={2100}
                                        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">Branch / Department</label>
                                    <input
                                        type="text"
                                        value={searchFilters.branch}
                                        onChange={(e) => setSearchFilters((f) => ({ ...f, branch: e.target.value }))}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAlumniSearch(1)}
                                        placeholder="e.g. Computer Science"
                                        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">Current Employer</label>
                                    <input
                                        type="text"
                                        value={searchFilters.company}
                                        onChange={(e) => setSearchFilters((f) => ({ ...f, company: e.target.value }))}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAlumniSearch(1)}
                                        placeholder="e.g. Google"
                                        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">Skills (comma-separated)</label>
                                    <input
                                        type="text"
                                        value={searchFilters.skills}
                                        onChange={(e) => setSearchFilters((f) => ({ ...f, skills: e.target.value }))}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAlumniSearch(1)}
                                        placeholder="e.g. React, Node.js"
                                        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none"
                                    />
                                </div>
                                <div className="flex items-end gap-2">
                                    <button
                                        onClick={() => handleAlumniSearch(1)}
                                        disabled={isSearching}
                                        className="flex-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-semibold text-[#0A0D14] hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
                                    >
                                        {isSearching ? 'Searching...' : 'Search'}
                                    </button>
                                    <button
                                        onClick={handleSearchReset}
                                        className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-white/10"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    {hasSearched && (
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121620]/85 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                        <div className="border-b border-white/10 px-6 py-4">
                            <p className="text-sm font-medium text-gray-300">
                                {isSearching ? 'Searching...' : `${alumniTotal} result${alumniTotal !== 1 ? 's' : ''} found`}
                            </p>
                        </div>

                        {alumniResults.length === 0 && !isSearching ? (
                            <div className="px-6 py-16 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <p className="mt-4 text-lg font-medium text-gray-300">No alumni found</p>
                                <p className="mt-2 text-sm text-gray-400">Try adjusting your filters</p>
                            </div>
                        ) : (
                            <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-white/10">
                                    <thead className="bg-white/5">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Alumni</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Batch</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Branch</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Current Employer</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Skills</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Connect</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {alumniResults.map((a) => (
                                            <tr key={a._id} className="hover:bg-white/5 transition-colors">
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 font-semibold text-white">
                                                            {a.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="font-medium text-white">{a.name}</div>
                                                            <div className="text-sm text-gray-400">{a.email}</div>
                                                            {a.collegeName && <div className="text-xs text-gray-500">{a.collegeName}</div>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    {a.graduationYear ? (
                                                        <span className="inline-flex rounded-full bg-blue-500/15 px-2 py-1 text-xs font-semibold text-blue-300 border border-blue-400/30">
                                                            Class of {a.graduationYear}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-500">—</span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                                                    {a.branch || <span className="text-xs text-gray-500">—</span>}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    {a.company ? (
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{a.company}</div>
                                                            {a.jobTitle && <div className="text-xs text-gray-500">{a.jobTitle}</div>}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {a.skills?.slice(0, 3).map((skill, idx) => (
                                                            <span key={idx} className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                        {a.skills?.length > 3 && (
                                                            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">+{a.skills.length - 3}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    {a.linkedin ? (
                                                        <a
                                                            href={a.linkedin}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                                                        >
                                                            LinkedIn
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Pagination */}
                            {alumniPages > 1 && (
                                <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                                    <p className="text-sm text-gray-700">
                                        Page {alumniPage} of {alumniPages} &mdash; {alumniTotal} total alumni
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAlumniSearch(alumniPage - 1)}
                                            disabled={alumniPage <= 1}
                                            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => handleAlumniSearch(alumniPage + 1)}
                                            disabled={alumniPage >= alumniPages}
                                            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                            </>
                        )}
                    </div>
                    )}
                </div>
                )}

                {activeTab === 'referralOps' && (
                    <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            <div className="rounded-2xl border border-white/10 bg-[#121620]/85 p-4">
                                <p className="text-xs uppercase tracking-wider text-gray-400">Total Referrals</p>
                                <p className="mt-2 text-2xl font-bold text-white">{referralStats?.totalReferrals ?? 0}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-[#121620]/85 p-4">
                                <p className="text-xs uppercase tracking-wider text-gray-400">Open Referrals</p>
                                <p className="mt-2 text-2xl font-bold text-white">{referralStats?.openReferrals ?? 0}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-[#121620]/85 p-4">
                                <p className="text-xs uppercase tracking-wider text-gray-400">Applications</p>
                                <p className="mt-2 text-2xl font-bold text-white">{referralStats?.totalApplications ?? 0}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-[#121620]/85 p-4">
                                <p className="text-xs uppercase tracking-wider text-gray-400">Referred</p>
                                <p className="mt-2 text-2xl font-bold text-white">{referralStats?.referredCount ?? 0}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-[#121620]/85 p-4">
                                <p className="text-xs uppercase tracking-wider text-gray-400">Flagged Fraud</p>
                                <p className="mt-2 text-2xl font-bold text-red-300">{referralStats?.flaggedApplications ?? 0}</p>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121620]/85 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                            <div className="border-b border-white/10 px-6 py-4">
                                <h3 className="text-lg font-semibold text-white">Student CGPA Verification & Ban Controls</h3>
                                <p className="text-sm text-gray-400">CGPA is used for eligibility checks. Banned users cannot continue referral actions.</p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-white/10">
                                    <thead className="bg-white/5">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Student</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Branch / Year</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Verified CGPA</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Ban Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {approvedUsers
                                            .filter((u) => u.role === 'student')
                                            .map((student) => (
                                                <tr key={student._id} className="hover:bg-white/5 transition-colors">
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <div className="font-medium text-white">{student.name}</div>
                                                        <div className="text-sm text-gray-400">{student.email}</div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                                                        {student.branch || '—'}
                                                        <div className="text-xs text-gray-500">{student.graduationYear || '—'}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="10"
                                                                step="0.1"
                                                                value={cgpaInputs[student._id] ?? (student.cgpa ?? '')}
                                                                onChange={(e) =>
                                                                    setCgpaInputs((prev) => ({
                                                                        ...prev,
                                                                        [student._id]: e.target.value,
                                                                    }))
                                                                }
                                                                className="w-24 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-gray-100 focus:border-amber-400 focus:outline-none"
                                                            />
                                                            <button
                                                                onClick={() => handleUpdateCgpa(student._id, student.name)}
                                                                className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-300 hover:bg-amber-500/20"
                                                            >
                                                                Save
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold border ${
                                                                student.isBanned
                                                                    ? 'border-red-400/30 bg-red-500/15 text-red-300'
                                                                    : 'border-emerald-400/30 bg-emerald-500/15 text-emerald-300'
                                                            }`}
                                                        >
                                                            {student.isBanned ? 'Banned' : 'Active'}
                                                        </span>
                                                        {student.isBanned && student.banReason && (
                                                            <p className="mt-1 max-w-xs text-xs text-red-300">{student.banReason}</p>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex flex-col items-end gap-2">
                                                            <input
                                                                value={banReasons[student._id] ?? student.banReason ?? ''}
                                                                onChange={(e) =>
                                                                    setBanReasons((prev) => ({
                                                                        ...prev,
                                                                        [student._id]: e.target.value,
                                                                    }))
                                                                }
                                                                placeholder="Ban reason"
                                                                className="w-52 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-gray-100 placeholder:text-gray-500 focus:border-amber-400 focus:outline-none"
                                                            />
                                                            <div className="flex gap-2">
                                                                {student.isBanned ? (
                                                                    <button
                                                                        onClick={() => handleToggleBan(student, false)}
                                                                        className="rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/25"
                                                                    >
                                                                        Unban
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleToggleBan(student, true)}
                                                                        className="rounded-lg border border-red-400/30 bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/25"
                                                                    >
                                                                        Ban
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'announcements' && (
                    <div className="space-y-6">
                        {/* Create Announcement Form */}
                        <div className="rounded-2xl border border-white/10 bg-[#121620]/85 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                            <div className="border-b border-white/10 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">Post New Announcement</h2>
                                        <p className="text-sm text-gray-400">Share important college updates with all students and alumni</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">Category</label>
                                    <select
                                        value={announcementCategory}
                                        onChange={(e) => setAnnouncementCategory(e.target.value as any)}
                                        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-400 focus:outline-none"
                                    >
                                        <option value="Academic">Academic — results, convocation dates, degree collection</option>
                                        <option value="Events">Events — college fests, alumni meets, sports events</option>
                                        <option value="Career">Career — placement drives, company visits, job fairs</option>
                                        <option value="Recognition">Recognition — notable alumni achievements, faculty awards</option>
                                        <option value="Policy">Policy — rule changes, fee updates, scholarship deadlines</option>
                                        <option value="Urgent/Emergency">Urgent/Emergency — campus closures, schedule changes</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">Title</label>
                                    <input
                                        type="text"
                                        value={announcementTitle}
                                        onChange={(e) => setAnnouncementTitle(e.target.value)}
                                        placeholder="e.g. Final Exam Schedule Released"
                                        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-400 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">Content</label>
                                    <textarea
                                        value={announcementContent}
                                        onChange={(e) => setAnnouncementContent(e.target.value)}
                                        placeholder="Write your announcement here..."
                                        rows={6}
                                        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-400 focus:outline-none"
                                    />
                                </div>
                                <button
                                    onClick={handleCreateAnnouncement}
                                    disabled={isCreatingAnnouncement}
                                    className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white hover:from-blue-600 hover:to-blue-700 disabled:opacity-50"
                                >
                                    {isCreatingAnnouncement ? 'Posting...' : 'Post Announcement'}
                                </button>
                            </div>
                        </div>

                        {/* Announcements List */}
                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121620]/85 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                            <div className="border-b border-white/10 px-6 py-4">
                                <h2 className="text-lg font-semibold text-white">All Announcements ({announcements.length})</h2>
                            </div>

                            {announcements.length === 0 ? (
                                <div className="px-6 py-16 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    <p className="mt-4 text-lg font-medium text-gray-300">No announcements yet</p>
                                    <p className="mt-2 text-sm text-gray-400">Start posting announcements for the college community</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/10">
                                    {announcements.map((announcement) => (
                                        <div key={announcement._id} className="p-6 hover:bg-white/5 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-semibold text-white">{announcement.title}</h3>
                                                        <span className="inline-flex rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-semibold text-blue-300 border border-blue-400/30">
                                                            {announcement.category}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-300 mb-3 line-clamp-2">{announcement.content}</p>
                                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                                        <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                                                        <span>{announcement.views} views</span>
                                                        <span>By {announcement.adminName}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteAnnouncement(announcement._id, announcement.title)}
                                                    className="ml-4 rounded-lg border border-red-400/30 bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/25 transition"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* User Details Modal */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Application Details</h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto p-6">
                            <div className="space-y-6">
                                {/* User Info */}
                                <div className="flex items-center gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-2xl font-bold text-white">
                                        {selectedUser.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-semibold text-gray-900">{selectedUser.name}</h4>
                                        <p className="text-gray-500">{selectedUser.email}</p>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                        <p className="text-sm text-gray-500">Role</p>
                                        <p className="mt-1 font-semibold capitalize text-gray-900">{selectedUser.role}</p>
                                    </div>
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                        <p className="text-sm text-gray-500">University</p>
                                        <p className="mt-1 font-semibold text-gray-900">{selectedUser.university}</p>
                                    </div>
                                    {selectedUser.graduationYear && (
                                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                            <p className="text-sm text-gray-500">Graduation Year</p>
                                            <p className="mt-1 font-semibold text-gray-900">{selectedUser.graduationYear}</p>
                                        </div>
                                    )}
                                    {selectedUser.role === 'student' && (
                                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                            <p className="text-sm text-gray-500">CGPA</p>
                                            <p className="mt-1 font-semibold text-gray-900">
                                                {selectedUser.cgpa !== undefined && selectedUser.cgpa !== null
                                                    ? selectedUser.cgpa
                                                    : 'Not set'}
                                            </p>
                                        </div>
                                    )}
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                        <p className="text-sm text-gray-500">Applied On</p>
                                        <p className="mt-1 font-semibold text-gray-900">
                                            {new Date(selectedUser.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Skills */}
                                {selectedUser.skills && selectedUser.skills.length > 0 && (
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                        <p className="mb-3 text-sm text-gray-500">Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedUser.skills.map((skill, idx) => (
                                                <span key={idx} className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Actions */}
                        {activeTab === 'pending' && (
                            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            handleApprove(selectedUser._id, selectedUser.name);
                                            setShowModal(false);
                                        }}
                                        className="flex-1 rounded-md bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
                                    >
                                        Approve Application
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowModal(false);
                                            openRejectModal(selectedUser);
                                        }}
                                        className="flex-1 rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                                    >
                                        Reject Application
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && userToReject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-semibold text-gray-900">Reject Application</h3>
                            <p className="mt-1 text-sm text-gray-500">Provide a reason for rejection (optional)</p>
                        </div>

                        <div className="p-6">
                            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4">
                                <p className="text-sm text-red-700">
                                    You are about to reject <strong>{userToReject.name}</strong>'s application.
                                </p>
                            </div>

                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Reason for rejection (optional)..."
                                rows={4}
                                className="w-full rounded-md border border-gray-300 p-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setUserToReject(null);
                                        setRejectionReason('');
                                    }}
                                    className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="flex-1 rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                                >
                                    Confirm Rejection
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
