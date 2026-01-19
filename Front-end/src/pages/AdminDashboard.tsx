import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    document: string;
    university: string;
    graduationYear: number;
    skills: string[];
    createdAt: string;
}

interface Resource {
    _id: string;
    title: string;
    description: string;
    category: string;
    file: string;
    uploadedBy: {
        _id: string;
        name: string;
        email: string;
        role: string;
        collegeName: string;
    };
    uploaderName: string;
    uploaderRole: string;
    tags: string[];
    isApproved: boolean;
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

const AdminDashboard = () => {
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [approvedUsers, setApprovedUsers] = useState<User[]>([]);
    const [pendingResources, setPendingResources] = useState<Resource[]>([]);
    const [approvedResources, setApprovedResources] = useState<Resource[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'pendingResources' | 'approvedResources'>('pending');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [userToReject, setUserToReject] = useState<User | null>(null);
    
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
            const [pendingRes, approvedRes, statsRes, pendingResourcesRes, approvedResourcesRes] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/pending'),
                axios.get('http://localhost:5000/api/admin/approved'),
                axios.get('http://localhost:5000/api/admin/stats'),
                axios.get('http://localhost:5000/api/admin/resources/pending'),
                axios.get('http://localhost:5000/api/admin/resources/approved'),
            ]);
            
            setPendingUsers(pendingRes.data);
            setApprovedUsers(approvedRes.data);
            setStats(statsRes.data);
            setPendingResources(pendingResourcesRes.data);
            setApprovedResources(approvedResourcesRes.data);
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
            await axios.put(`http://localhost:5000/api/admin/status/${id}`, { 
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
            await axios.put(`http://localhost:5000/api/admin/status/${userToReject._id}`, { 
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

    const handleApproveResource = async (id: string, title: string) => {
        if (!window.confirm(`Are you sure you want to approve "${title}"?`)) return;

        try {
            await axios.put(`http://localhost:5000/api/admin/resources/status/${id}`, {
                status: 'approved'
            });
            
            alert(`"${title}" has been approved successfully!`);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Resource approval failed. Please try again.');
        }
    };

    const handleRejectResource = async (id: string, title: string) => {
        if (!window.confirm(`Are you sure you want to reject and delete "${title}"?`)) return;

        try {
            await axios.put(`http://localhost:5000/api/admin/resources/status/${id}`, {
                status: 'rejected'
            });
            
            alert(`"${title}" has been rejected and deleted.`);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Resource rejection failed. Please try again.');
        }
    };

    const viewUserDetails = (user: User) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const openDocument = (path: string) => {
        const normalizedPath = path.replace(/\\/g, '/');
        const url = `http://localhost:5000/${normalizedPath}`;
        window.open(url, '_blank');
    };

    const handleLogout = () => {
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminEmail');
        navigate('/admin');
    };

    const adminEmail = localStorage.getItem('adminEmail') || 'Admin';

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                    <p className="mt-4 text-lg font-semibold text-gray-700">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    const displayUsers = activeTab === 'pending' ? pendingUsers : approvedUsers;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                                <p className="text-sm text-gray-600">Welcome, {adminEmail}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Stats Cards */}
                {stats && (
                    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg bg-white p-6 shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                                </div>
                                <div className="rounded-full bg-blue-100 p-3">
                                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.pendingUsers}</p>
                                </div>
                                <div className="rounded-full bg-yellow-100 p-3">
                                    <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Approved</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.approvedUsers}</p>
                                </div>
                                <div className="rounded-full bg-green-100 p-3">
                                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Approval Rate</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.approvalRate}%</p>
                                </div>
                                <div className="rounded-full bg-purple-100 p-3">
                                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                                    activeTab === 'pending'
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                }`}
                            >
                                Pending Users ({pendingUsers.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('approved')}
                                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                                    activeTab === 'approved'
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                }`}
                            >
                                Approved Users ({approvedUsers.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('pendingResources')}
                                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                                    activeTab === 'pendingResources'
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                }`}
                            >
                                Pending Resources ({pendingResources.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('approvedResources')}
                                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                                    activeTab === 'approvedResources'
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                }`}
                            >
                                Approved Resources ({approvedResources.length})
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Users Table */}
                {(activeTab === 'pending' || activeTab === 'approved') && (
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    {displayUsers.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="mt-4 text-lg font-medium text-gray-900">
                                {activeTab === 'pending' ? 'No pending applications' : 'No approved users yet'}
                            </p>
                            <p className="mt-2 text-sm text-gray-500">
                                {activeTab === 'pending'
                                    ? 'All applications have been processed'
                                    : 'Approved users will appear here'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">University</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Skills</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Applied</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {displayUsers.map((u) => (
                                        <tr key={u._id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">
                                                        {u.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="font-medium text-gray-900">{u.name}</div>
                                                        <div className="text-sm text-gray-500">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                    u.role === 'student'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm text-gray-900">{u.university}</div>
                                                {u.graduationYear && (
                                                    <div className="text-xs text-gray-500">Class of {u.graduationYear}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {u.skills?.slice(0, 2).map((skill, idx) => (
                                                        <span key={idx} className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {u.skills?.length > 2 && (
                                                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                                            +{u.skills.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {new Date(u.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => viewUserDetails(u)}
                                                        className="rounded-md bg-indigo-50 px-3 py-1 text-indigo-600 hover:bg-indigo-100"
                                                    >
                                                        View
                                                    </button>
                                                    {activeTab === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(u._id, u.name)}
                                                                className="rounded-md bg-green-50 px-3 py-1 text-green-600 hover:bg-green-100"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => openRejectModal(u)}
                                                                className="rounded-md bg-red-50 px-3 py-1 text-red-600 hover:bg-red-100"
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
                {(activeTab === 'pendingResources' || activeTab === 'approvedResources') && (
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    {((activeTab === 'pendingResources' && pendingResources.length === 0) || 
                      (activeTab === 'approvedResources' && approvedResources.length === 0)) ? (
                        <div className="px-6 py-16 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="mt-4 text-lg font-medium text-gray-900">
                                {activeTab === 'pendingResources' ? 'No pending resources' : 'No approved resources yet'}
                            </p>
                            <p className="mt-2 text-sm text-gray-500">
                                {activeTab === 'pendingResources'
                                    ? 'All resources have been processed'
                                    : 'Approved resources will appear here'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Resource</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Uploaded By</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tags</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {(activeTab === 'pendingResources' ? pendingResources : approvedResources).map((resource) => (
                                        <tr key={resource._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{resource.title}</div>
                                                <div className="text-sm text-gray-500">{resource.description}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className="inline-flex rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-800">
                                                    {resource.category}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm text-gray-900">{resource.uploaderName}</div>
                                                <div className="text-xs text-gray-500 capitalize">{resource.uploaderRole}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {resource.tags?.slice(0, 2).map((tag, idx) => (
                                                        <span key={idx} className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {resource.tags?.length > 2 && (
                                                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                                            +{resource.tags.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {new Date(resource.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openDocument(resource.file)}
                                                        className="rounded-md bg-indigo-50 px-3 py-1 text-indigo-600 hover:bg-indigo-100"
                                                    >
                                                        View File
                                                    </button>
                                                    {activeTab === 'pendingResources' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApproveResource(resource._id, resource.title)}
                                                                className="rounded-md bg-green-50 px-3 py-1 text-green-600 hover:bg-green-100"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectResource(resource._id, resource.title)}
                                                                className="rounded-md bg-red-50 px-3 py-1 text-red-600 hover:bg-red-100"
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

                                {/* Document */}
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <p className="mb-3 text-sm text-gray-500">Verification Document</p>
                                    <button
                                        onClick={() => openDocument(selectedUser.document)}
                                        className="flex w-full items-center justify-between rounded-lg bg-indigo-50 p-4 hover:bg-indigo-100"
                                    >
                                        <div className="flex items-center gap-3">
                                            <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span className="text-sm font-medium text-indigo-600">
                                                {selectedUser.document.split('/').pop()}
                                            </span>
                                        </div>
                                        <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </button>
                                </div>
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
