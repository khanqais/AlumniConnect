import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Resource {
    _id: string;
    title: string;
    description: string;
    category: string;
    file: string;
    uploaderName: string;
    uploaderRole: string;
    tags: string[];
    downloads: number;
    likes: number;
    isApproved: boolean;
    createdAt: string;
}

const Resources = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [myResources, setMyResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
    const [uploadForm, setUploadForm] = useState({
        title: '',
        description: '',
        category: 'resume',
        tags: '',
    });
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadLoading, setUploadLoading] = useState(false);

    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchResources = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/resources', {
                params: { category, search },
            });
            setResources(res.data);
        } catch (error) {
            console.error('Error fetching resources:', error);
        } finally {
            setLoading(false);
        }
    }, [category, search]);

    const fetchMyResources = useCallback(async () => {
        if (!user?.token) return;
        
        try {
            const res = await axios.get('http://localhost:5000/api/resources/my-resources', {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            setMyResources(res.data);
        } catch (error) {
            console.error('Error fetching my resources:', error);
        }
    }, [user?.token]);

    // Fetch resources when component mounts or dependencies change
    useEffect(() => {
        if (user?.token) {
            fetchResources();
            fetchMyResources();
        }
    }, [user?.token, fetchResources, fetchMyResources]);

    // Also fetch when tab changes
    useEffect(() => {
        if (user?.token && activeTab === 'my') {
            fetchMyResources();
        }
    }, [activeTab, user?.token, fetchMyResources]);

    const handleDownload = async (id: string, filePath: string) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/resources/download/${id}`, {
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            });
            
            if (res.data.success) {
                window.open(`http://localhost:5000/${filePath}`, '_blank');
            }
        } catch (error: unknown) {
            const err = error as { response?: { status?: number } };
            if (err.response?.status === 404) {
                alert('File not found. It may have been deleted.');
            } else {
                alert('Error downloading file. Please try again.');
            }
            console.error(error);
        }
    };

    const handleLike = async (id: string) => {
        try {
            await axios.post(`http://localhost:5000/api/resources/like/${id}`, {}, {
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            });
            // Refresh both lists after liking
            await fetchResources();
            await fetchMyResources();
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploadLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', uploadForm.title);
            formData.append('description', uploadForm.description);
            formData.append('category', uploadForm.category);
            formData.append('tags', uploadForm.tags);
            if (uploadFile) {
                formData.append('file', uploadFile);
            }

            await axios.post('http://localhost:5000/api/resources/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user?.token}`,
                },
            });

            // Show different message based on user role
            if (user?.role === 'alumni') {
                alert('Resource uploaded and published successfully! Everyone can see it now.');
            } else {
                alert('Resource uploaded! It will be visible after admin approval.');
            }

            setShowUploadModal(false);
            setUploadForm({ title: '', description: '', category: 'resume', tags: '' });
            setUploadFile(null);
            
            // Refresh both lists after upload
            await fetchResources();
            await fetchMyResources();
            
            // Switch to "My Uploads" tab to see the newly uploaded resource
            setActiveTab('my');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            alert(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploadLoading(false);
        }
    };

    // Manual refresh button
    const handleRefresh = () => {
        fetchResources();
        fetchMyResources();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-purple-600/30 blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-pink-600/30 blur-3xl"></div>
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-white/10 bg-slate-900/50 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="text-gray-400 hover:text-white"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <h1 className="text-2xl font-bold text-white">Resource Library</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Refresh Button */}
                            <button
                                onClick={handleRefresh}
                                className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
                                title="Refresh"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-pink-700"
                            >
                                Upload Resource
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Tabs */}
                <div className="mb-6 flex gap-2 border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`rounded-t-lg px-6 py-3 text-sm font-medium transition-all ${
                            activeTab === 'all'
                                ? 'border-b-2 border-purple-500 bg-white/10 text-white'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        All Resources
                    </button>
                    <button
                        onClick={() => setActiveTab('my')}
                        className={`rounded-t-lg px-6 py-3 text-sm font-medium transition-all ${
                            activeTab === 'my'
                                ? 'border-b-2 border-purple-500 bg-white/10 text-white'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        My Uploads ({myResources.length})
                    </button>
                </div>

                {/* Search & Filter - Only show for 'all' tab */}
                {activeTab === 'all' && (
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {['all', 'resume', 'interview-experience', 'study-material', 'project'].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                        category === cat
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                            : 'border border-white/20 bg-white/5 text-gray-300 hover:bg-white/10'
                                    }`}
                                >
                                    {cat === 'all' ? 'All' : cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                </button>
                            ))}
                        </div>

                        <input
                            type="text"
                            placeholder="Search resources..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none sm:w-64"
                        />
                    </div>
                )}

                {/* Resources Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
                    </div>
                ) : (
                    <>
                        {/* Show based on active tab */}
                        {activeTab === 'my' ? (
                            // My Resources
                            myResources.length === 0 ? (
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl">
                                    <svg className="mx-auto h-16 w-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="mt-4 text-gray-400">You haven't uploaded any resources yet</p>
                                    <button
                                        onClick={() => setShowUploadModal(true)}
                                        className="mt-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-pink-700"
                                    >
                                        Upload First Resource
                                    </button>
                                </div>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {myResources.map((resource) => (
                                        <div
                                            key={resource._id}
                                            className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all hover:border-purple-500/50 hover:bg-white/10"
                                        >
                                            {/* Approval Status Badge */}
                                            <div className="mb-4 flex items-start justify-between">
                                                <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-300">
                                                    {resource.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                </span>
                                                {resource.isApproved ? (
                                                    <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-300">
                                                        ✓ Published
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-300">
                                                        ⏳ Pending
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="mb-2 text-lg font-semibold text-white">{resource.title}</h3>
                                            <p className="mb-4 line-clamp-2 text-sm text-gray-400">{resource.description}</p>

                                            <div className="mb-4 flex flex-wrap gap-2">
                                                {resource.tags.slice(0, 3).map((tag, idx) => (
                                                    <span key={idx} className="rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-300">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between border-t border-white/10 pt-4">
                                                <div className="text-xs text-gray-400">
                                                    <p>📥 {resource.downloads} downloads</p>
                                                    <p>❤️ {resource.likes} likes</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDownload(resource._id, resource.file)}
                                                    className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-pink-700"
                                                >
                                                    Download
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            // All Resources
                            resources.length === 0 ? (
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl">
                                    <svg className="mx-auto h-16 w-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="mt-4 text-gray-400">No approved resources found</p>
                                </div>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {resources.map((resource) => (
                                        <div
                                            key={resource._id}
                                            className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all hover:border-purple-500/50 hover:bg-white/10"
                                        >
                                            <div className="mb-4 flex items-start justify-between">
                                                <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-300">
                                                    {resource.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                </span>
                                                <button
                                                    onClick={() => handleLike(resource._id)}
                                                    className="text-gray-400 transition-colors hover:text-pink-400"
                                                >
                                                    ❤️ {resource.likes}
                                                </button>
                                            </div>

                                            <h3 className="mb-2 text-lg font-semibold text-white">{resource.title}</h3>
                                            <p className="mb-4 line-clamp-2 text-sm text-gray-400">{resource.description}</p>

                                            <div className="mb-4 flex flex-wrap gap-2">
                                                {resource.tags.slice(0, 3).map((tag, idx) => (
                                                    <span key={idx} className="rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-300">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between border-t border-white/10 pt-4">
                                                <div className="text-xs text-gray-400">
                                                    <p className="font-medium text-gray-300">{resource.uploaderName}</p>
                                                    <p>📥 {resource.downloads} downloads</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDownload(resource._id, resource.file)}
                                                    className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-pink-700"
                                                >
                                                    Download
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </>
                )}
            </main>

            {/* Upload Modal - Same as before */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900 p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">Upload Resource</h2>
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Info Banner */}
                        <div className={`mb-6 rounded-lg p-4 ${
                            user?.role === 'alumni' 
                                ? 'border border-green-500/30 bg-green-500/10'
                                : 'border border-blue-500/30 bg-blue-500/10'
                        }`}>
                            <div className="flex items-start gap-3">
                                <svg className={`h-5 w-5 flex-shrink-0 ${
                                    user?.role === 'alumni' ? 'text-green-400' : 'text-blue-400'
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    {user?.role === 'alumni' ? (
                                        <>
                                            <h3 className="text-sm font-semibold text-green-300">Auto-Published</h3>
                                            <p className="mt-1 text-xs text-green-200/80">
                                                As an alumni, your resource will be published immediately and visible to everyone.
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="text-sm font-semibold text-blue-300">Pending Review</h3>
                                            <p className="mt-1 text-xs text-blue-200/80">
                                                Your upload will be reviewed by an admin before being published to everyone.
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-300">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={uploadForm.title}
                                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                                    placeholder="e.g., My Software Engineer Resume"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-300">Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={uploadForm.description}
                                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                                    placeholder="Describe your resource..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">Category</label>
                                    <select
                                        value={uploadForm.category}
                                        onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                                    >
                                        <option value="resume" className="bg-slate-800">Resume</option>
                                        <option value="interview-experience" className="bg-slate-800">Interview Experience</option>
                                        <option value="study-material" className="bg-slate-800">Study Material</option>
                                        <option value="project" className="bg-slate-800">Project</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">Tags (comma separated)</label>
                                    <input
                                        type="text"
                                        value={uploadForm.tags}
                                        onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                                        placeholder="e.g., Java, Backend, Google"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-300">Upload File</label>
                                <input
                                    type="file"
                                    required
                                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-purple-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-purple-700"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                />
                                <p className="mt-1 text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={uploadLoading}
                                    className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 font-medium text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                                >
                                    {uploadLoading ? 'Uploading...' : 'Upload Resource'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="rounded-lg border border-white/20 bg-white/5 px-6 py-3 font-medium text-white hover:bg-white/10"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Resources;
