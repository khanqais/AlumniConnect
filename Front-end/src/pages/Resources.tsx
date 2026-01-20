import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

interface Resource {
    _id: string;
    title: string;
    description: string;
    category: string;
    file: string;
    uploaderName: string;
    uploaderRole: string;
    uploadedBy: {
        _id: string;
        name: string;
        email: string;
        role: string;
        avatar?: string;
        bio?: string;
        company?: string;
        jobTitle?: string;
    } | null;
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

    useEffect(() => {
        if (user?.token) {
            fetchResources();
            fetchMyResources();
        }
    }, [user?.token, fetchResources, fetchMyResources]);

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

            
            setShowUploadModal(false);
            setUploadForm({ title: '', description: '', category: 'resume', tags: '' });
            setUploadFile(null);
            
            await fetchResources();
            await fetchMyResources();
            
            setActiveTab('my');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            alert(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploadLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchResources();
        fetchMyResources();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-black">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-blue-100 blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-indigo-100 blur-3xl"></div>
            </div>

            <Navigation />

            {/* Main Content */}
            <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-black">
                {/* Page Title & Actions */}
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">Resource Library</h1>
                    <div className="flex items-center gap-3">
                        {/* Refresh Button */}
                        <button
                            onClick={handleRefresh}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                            title="Refresh"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        {user?.role === 'alumni' && (
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2 text-sm font-medium text-white hover:from-blue-700 hover:to-indigo-800"
                            >
                                Upload Resource
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 flex gap-2 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`rounded-t-lg px-6 py-3 text-sm font-medium transition-all ${
                            activeTab === 'all'
                                ? 'border-b-2 border-blue-600 bg-blue-50 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        All Resources
                    </button>
                    {user?.role === 'alumni' && (
                        <button
                            onClick={() => setActiveTab('my')}
                            className={`rounded-t-lg px-6 py-3 text-sm font-medium transition-all ${
                                activeTab === 'my'
                                    ? 'border-b-2 border-blue-600 bg-blue-50 text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            My Uploads ({myResources.length})
                        </button>
                    )}
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
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white'
                                            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
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
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none sm:w-64"
                        />
                    </div>
                )}

                {/* Resources Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'my' && user?.role === 'alumni' ? (
                            // My Resources
                            myResources.length === 0 ? (
                                <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="mt-4 text-gray-600">You haven't uploaded any resources yet</p>
                                    <button
                                        onClick={() => setShowUploadModal(true)}
                                        className="mt-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-2 text-sm font-medium text-white hover:from-blue-700 hover:to-indigo-800"
                                    >
                                        Upload First Resource
                                    </button>
                                </div>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {myResources.map((resource) => (
                                        <div
                                            key={resource._id}
                                            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-md"
                                        >
                                            {/* Approval Status Badge */}
                                            <div className="mb-4 flex items-start justify-between">
                                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                                    {resource.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                </span>
                                                {resource.isApproved ? (
                                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                                                        ✓ Published
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                                                        ⏳ Pending
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="mb-2 text-lg font-semibold text-gray-900">{resource.title}</h3>
                                            <p className="mb-4 line-clamp-2 text-sm text-gray-600">{resource.description}</p>

                                            <div className="mb-4 flex flex-wrap gap-2">
                                                {resource.tags.slice(0, 3).map((tag, idx) => (
                                                    <span key={idx} className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700 border border-blue-200">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                                <div className="text-xs text-gray-600">
                                                    <p>📥 {resource.downloads} downloads</p>
                                                    <p>❤️ {resource.likes} likes</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDownload(resource._id, resource.file)}
                                                    className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2 text-sm font-medium text-white hover:from-blue-700 hover:to-indigo-800"
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
                                <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="mt-4 text-gray-600">No approved resources found</p>
                                </div>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {resources.map((resource) => (
                                        <div
                                            key={resource._id}
                                            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-md"
                                        >
                                            <div className="mb-4 flex items-start justify-between">
                                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                                    {resource.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                </span>
                                                <button
                                                    onClick={() => handleLike(resource._id)}
                                                    className="text-gray-600 transition-colors hover:text-red-500"
                                                >
                                                    ❤️ {resource.likes}
                                                </button>
                                            </div>

                                            <h3 className="mb-2 text-lg font-semibold text-gray-900">{resource.title}</h3>
                                            <p className="mb-4 line-clamp-2 text-sm text-gray-600">{resource.description}</p>

                                            <div className="mb-4 flex flex-wrap gap-2">
                                                {resource.tags.slice(0, 3).map((tag, idx) => (
                                                    <span key={idx} className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700 border border-blue-200">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                                {resource.uploadedBy ? (
                                                    <div 
                                                        className="flex items-center gap-3 cursor-pointer group/author"
                                                        onClick={() => resource.uploadedBy && navigate(`/profile/${resource.uploadedBy._id}`)}
                                                    >
                                                        {resource.uploadedBy.avatar ? (
                                                            <img
                                                                src={`http://localhost:5000/${resource.uploadedBy.avatar}`}
                                                                alt={resource.uploadedBy.name}
                                                                className="h-10 w-10 rounded-full object-cover ring-2 ring-blue-500/50 group-hover/author:ring-blue-400 transition-all"
                                                            />
                                                        ) : (
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 text-sm font-bold text-white ring-2 ring-blue-500/50 group-hover/author:ring-blue-400 transition-all">
                                                                {resource.uploadedBy.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-800 group-hover/author:text-blue-600 transition-colors truncate">
                                                                {resource.uploadedBy.name}
                                                            </p>
                                                            <p className="text-xs text-gray-600 truncate">
                                                                {resource.uploadedBy.company && resource.uploadedBy.jobTitle 
                                                                    ? `${resource.uploadedBy.jobTitle} at ${resource.uploadedBy.company}`
                                                                    : resource.uploadedBy.role === 'alumni' ? 'Alumni' : 'Student'
                                                                }
                                                            </p>
                                                            <p className="text-xs text-gray-500">📥 {resource.downloads} downloads</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-gray-400 to-gray-500 text-sm font-bold text-white ring-2 ring-gray-400/50">
                                                            ?
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-800 truncate">
                                                                {resource.uploaderName || 'Unknown User'}
                                                            </p>
                                                            <p className="text-xs text-gray-600 truncate">
                                                                {resource.uploaderRole || 'User'}
                                                            </p>
                                                            <p className="text-xs text-gray-500">📥 {resource.downloads} downloads</p>
                                                        </div>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => handleDownload(resource._id, resource.file)}
                                                    className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2 text-sm font-medium text-white hover:from-blue-700 hover:to-indigo-800"
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

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Upload Resource</h2>
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={uploadForm.title}
                                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                                    placeholder="e.g., My Software Engineer Resume"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={uploadForm.description}
                                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                                    placeholder="Describe your resource..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
                                    <select
                                        value={uploadForm.category}
                                        onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="resume" className="bg-white">Resume</option>
                                        <option value="interview-experience" className="bg-white">Interview Experience</option>
                                        <option value="study-material" className="bg-white">Study Material</option>
                                        <option value="project" className="bg-white">Project</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Tags (comma separated)</label>
                                    <input
                                        type="text"
                                        value={uploadForm.tags}
                                        onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                                        placeholder="e.g., Java, Backend, Google"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Upload File</label>
                                <input
                                    type="file"
                                    required
                                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                />
                                <p className="mt-1 text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={uploadLoading}
                                    className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 font-medium text-white hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50"
                                >
                                    {uploadLoading ? 'Uploading...' : 'Upload Resource'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
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