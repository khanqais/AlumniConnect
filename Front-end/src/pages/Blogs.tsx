import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Blog {
    _id: string;
    title: string;
    content: string;
    excerpt: string;
    coverImage?: string;
    author: {
        _id: string;
        name: string;
        role: string;
        collegeName: string;
    };
    authorName: string;
    tags: string[];
    category: string;
    readTime: number;
    views: number;
    likes: number;
    likedBy: string[];
    createdAt: string;
    isPublished: boolean;
}

const Blogs = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [myBlogs, setMyBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const fetchBlogs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/blogs', {
                params: { category, search },
            });
            setBlogs(res.data);
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setLoading(false);
        }
    }, [category, search]);

    const fetchMyBlogs = useCallback(async () => {
        if (!user?.token || user.role !== 'alumni') return;
        
        try {
            const res = await axios.get('http://localhost:5000/api/blogs/my-blogs', {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            setMyBlogs(res.data);
        } catch (error) {
            console.error('Error fetching my blogs:', error);
        }
    }, [user?.token, user?.role]);

    useEffect(() => {
        fetchBlogs();
        if (user?.role === 'alumni') {
            fetchMyBlogs();
        }
    }, [fetchBlogs, fetchMyBlogs, user?.role]);

    const handleLike = async (id: string) => {
        try {
            await axios.post(`http://localhost:5000/api/blogs/like/${id}`, {}, {
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            });
            await fetchBlogs();
            if (user?.role === 'alumni') {
                await fetchMyBlogs();
            }
        } catch (error) {
            console.error('Error liking blog:', error);
        }
    };

    const handleRefresh = () => {
        fetchBlogs();
        if (user?.role === 'alumni') {
            fetchMyBlogs();
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-purple-600/30 blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-pink-600/30 blur-3xl"></div>
            </div>

            {/* Header with Full Navigation */}
            <header className="relative z-10 border-b border-white/10 bg-slate-900/50 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            {/* Logo/Brand */}
                            <div className="flex items-center gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600">
                                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <span className="hidden text-lg font-bold text-white sm:block">AlumniConnect</span>
                            </div>

                            {/* Navigation */}
                            <nav className="hidden md:flex items-center gap-1">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white"
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => navigate('/resources')}
                                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white"
                                >
                                    Resources
                                </button>
                                <button
                                    onClick={() => navigate('/blogs')}
                                    className="rounded-lg px-3 py-2 text-sm font-medium text-white bg-white/10"
                                >
                                    Blogs
                                </button>
                                <button
                                    onClick={() => navigate('/community')}
                                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white"
                                >
                                    Community
                                </button>
                                <button
                                    onClick={() => navigate('/events')}
                                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white"
                                >
                                    Events
                                </button>
                            </nav>
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 font-bold text-white">
                                    {user?.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden sm:block">
                                    <h2 className="text-sm font-semibold text-white">{user?.name}</h2>
                                    <p className="text-xs capitalize text-gray-400">{user?.role}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition-all hover:bg-red-500/20"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Page Title & Actions */}
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-white">Blogs</h1>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
                            title="Refresh"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        {user?.role === 'alumni' && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-pink-700"
                            >
                                Write Blog
                            </button>
                        )}
                    </div>
                </div>

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
                        All Blogs
                    </button>
                    {user?.role === 'alumni' && (
                        <button
                            onClick={() => setActiveTab('my')}
                            className={`rounded-t-lg px-6 py-3 text-sm font-medium transition-all ${
                                activeTab === 'my'
                                    ? 'border-b-2 border-purple-500 bg-white/10 text-white'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            My Blogs ({myBlogs.length})
                        </button>
                    )}
                </div>

                {/* Search & Filter - Only show for 'all' tab */}
                {activeTab === 'all' && (
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {['all', 'career-advice', 'interview-tips', 'industry-insights', 'personal-journey', 'technical'].map((cat) => (
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
                            placeholder="Search blogs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none sm:w-64"
                        />
                    </div>
                )}

                {/* Blog Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'my' ? (
                            // My Blogs
                            user?.role === 'alumni' ? (
                                myBlogs.length === 0 ? (
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl">
                                        <svg className="mx-auto h-16 w-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        <p className="mt-4 text-gray-400">You haven't written any blogs yet</p>
                                        <button
                                            onClick={() => setShowCreateModal(true)}
                                            className="mt-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-pink-700"
                                        >
                                            Write Your First Blog
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {myBlogs.map((blog) => (
                                            <BlogCard key={blog._id} blog={blog} onLike={handleLike} />
                                        ))}
                                    </div>
                                )
                            ) : null
                        ) : (
                            // All Blogs
                            blogs.length === 0 ? (
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl">
                                    <svg className="mx-auto h-16 w-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <p className="mt-4 text-gray-400">No blogs found</p>
                                </div>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {blogs.map((blog) => (
                                        <BlogCard key={blog._id} blog={blog} onLike={handleLike} />
                                    ))}
                                </div>
                            )
                        )}
                    </>
                )}
            </main>

            {/* Create Blog Modal */}
            {showCreateModal && user?.role === 'alumni' && (
                <CreateBlogModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        handleRefresh();
                        setActiveTab('my');
                    }}
                />
            )}
        </div>
    );
};

// Blog Card Component
const BlogCard = ({ blog, onLike }: { blog: Blog; onLike: (id: string) => void }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all hover:border-purple-500/50 hover:bg-white/10">
            {blog.coverImage && (
                <div className="mb-4 aspect-video overflow-hidden rounded-lg">
                    <img
                        src={`http://localhost:5000/${blog.coverImage}`}
                        alt={blog.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                </div>
            )}

            <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-300">
                    {blog.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </span>
                <span className="text-xs text-gray-400">{blog.readTime} min read</span>
            </div>

            <h3 
                className="mb-2 cursor-pointer text-lg font-semibold text-white hover:text-purple-300 transition-colors line-clamp-2"
                onClick={() => navigate(`/blogs/${blog._id}`)}
            >
                {blog.title}
            </h3>

            <p className="mb-4 line-clamp-3 text-sm text-gray-400">{blog.excerpt}</p>

            {blog.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {blog.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-300">
                            {tag}
                        </span>
                    ))}
                    {blog.tags.length > 3 && (
                        <span className="rounded-full bg-gray-500/20 px-2 py-1 text-xs text-gray-300">
                            +{blog.tags.length - 3}
                        </span>
                    )}
                </div>
            )}

            <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-sm font-bold text-white">
                        {blog.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-300">{blog.authorName}</p>
                        <p className="text-xs text-gray-500">
                            {new Date(blog.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {blog.views}
                    </span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onLike(blog._id);
                        }}
                        className={`flex items-center gap-1 transition-colors ${
                            user && blog.likedBy.includes(user._id) 
                                ? 'text-pink-400 hover:text-pink-300' 
                                : 'hover:text-pink-400'
                        }`}
                    >
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        {blog.likes}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Create Blog Modal Component
const CreateBlogModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: 'career-advice',
        tags: '',
    });
    const [loading, setLoading] = useState(false);
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.token) return;

        setLoading(true);
        try {
            const submitData = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                submitData.append(key, value);
            });
            if (coverImage) {
                submitData.append('coverImage', coverImage);
            }

            await axios.post('http://localhost:5000/api/blogs/create', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`,
                },
            });

            const successMessage = user.role === 'alumni' 
                ? 'Blog published successfully!' 
                : 'Blog submitted successfully! It will be published after admin approval.';
            alert(successMessage);
            
            onSuccess();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            alert(err.response?.data?.message || 'Failed to create blog');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 p-8">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Write a Blog</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300">Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                            placeholder="Enter an engaging title..."
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300">Excerpt</label>
                        <textarea
                            required
                            rows={2}
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                            placeholder="Brief description of your blog..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-300">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                            >
                                <option value="career-advice" className="bg-slate-800">Career Advice</option>
                                <option value="interview-tips" className="bg-slate-800">Interview Tips</option>
                                <option value="industry-insights" className="bg-slate-800">Industry Insights</option>
                                <option value="personal-journey" className="bg-slate-800">Personal Journey</option>
                                <option value="technical" className="bg-slate-800">Technical</option>
                                <option value="other" className="bg-slate-800">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-300">Tags (comma separated)</label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                                placeholder="career, tech, advice..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300">Cover Image (optional)</label>
                        <input
                            type="file"
                            onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-purple-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-purple-700"
                            accept="image/*"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300">Content</label>
                        <textarea
                            required
                            rows={15}
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                            placeholder="Write your blog content here... You can use plain text or basic formatting."
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Tip: Use line breaks for paragraphs. Your blog will be published immediately.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-medium text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                        >
                            {loading ? 'Publishing...' : 'Publish Blog'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-white/20 bg-white/5 px-6 py-3 font-medium text-white hover:bg-white/10"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Blogs;
