
import { useState, useEffect, useCallback } from 'react';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

interface Blog {
    _id: string;
    title: string;
    content: string;
    excerpt: string;
    coverImage?: string;
    author: {
        _id: string;
        name: string;
        email: string;
        role: string;
        collegeName: string;
        avatar?: string;
        bio?: string;
        company?: string;
        jobTitle?: string;
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

    const { user } = useAuth();

    const fetchBlogs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/blogs', {
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
            const res = await api.get('/blogs/my-blogs', {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setMyBlogs(res.data);
        } catch (error) {
            console.error('Error fetching my blogs:', error);
        }
    }, [user?.token, user?.role]);

    useEffect(() => {
        fetchBlogs();
        if (user?.role === 'alumni') fetchMyBlogs();
    }, [fetchBlogs, fetchMyBlogs, user?.role]);

    const handleLike = async (id: string) => {
        try {
            await api.post(`/blogs/like/${id}`, {}, {
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            await fetchBlogs();
            if (user?.role === 'alumni') await fetchMyBlogs();
        } catch (error) {
            console.error('Error liking blog:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
            return;
        }

        try {
            await api.delete(`/blogs/${id}`, {
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            await fetchBlogs();
            if (user?.role === 'alumni') await fetchMyBlogs();
            alert('Blog deleted successfully');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            alert(err.response?.data?.message || 'Failed to delete blog');
            console.error('Error deleting blog:', error);
        }
    };

    const handleRefresh = () => {
        fetchBlogs();
        if (user?.role === 'alumni') fetchMyBlogs();
    };

    const categories = ['all', 'career-advice', 'interview-tips', 'industry-insights', 'personal-journey', 'technical'];
    const formatCategory = (cat: string) =>
        cat === 'all' ? 'All' : cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return (

        <div className="blogs-theme min-h-screen bg-[#0A0D14] text-gray-200 relative overflow-x-hidden">
            <style>
                {`
                    .blogs-noise {
                        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                        opacity: 0.03;
                        pointer-events: none;
                    }

                    .blogs-grid {
                        background-size: 40px 40px;
                        background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
                    }

                    .blogs-theme .blogs-content .bg-white,
                    .blogs-theme .blogs-content .bg-gray-50,
                    .blogs-theme .blogs-content .bg-gray-100,
                    .blogs-theme .blogs-modal .bg-white,
                    .blogs-theme .blog-card {
                        background-color: rgba(18, 22, 32, 0.84) !important;
                    }

                    .blogs-theme .blogs-content .border-gray-100,
                    .blogs-theme .blogs-content .border-gray-200,
                    .blogs-theme .blogs-content .border-gray-300,
                    .blogs-theme .blogs-modal .border-gray-200,
                    .blogs-theme .blogs-modal .border-gray-300,
                    .blogs-theme .blog-card {
                        border-color: rgba(255, 255, 255, 0.14) !important;
                    }

                    .blogs-theme .blogs-content .text-gray-900,
                    .blogs-theme .blogs-content .text-gray-800,
                    .blogs-theme .blogs-content .text-gray-700,
                    .blogs-theme .blogs-modal .text-gray-900,
                    .blogs-theme .blogs-modal .text-gray-700,
                    .blogs-theme .blog-card .text-gray-900,
                    .blogs-theme .blog-card .text-gray-800,
                    .blogs-theme .blog-card .text-gray-700 {
                        color: #f3f4f6 !important;
                    }

                    .blogs-theme .blogs-content .text-gray-600,
                    .blogs-theme .blogs-content .text-gray-500,
                    .blogs-theme .blogs-content .text-gray-400,
                    .blogs-theme .blogs-modal .text-gray-600,
                    .blogs-theme .blogs-modal .text-gray-500,
                    .blogs-modal .text-gray-400,
                    .blogs-theme .blog-card .text-gray-600,
                    .blogs-theme .blog-card .text-gray-500,
                    .blogs-theme .blog-card .text-gray-400 {
                        color: #9ca3af !important;
                    }

                    .blogs-theme .blogs-content input,
                    .blogs-theme .blogs-content textarea,
                    .blogs-theme .blogs-content select,
                    .blogs-theme .blogs-modal input,
                    .blogs-theme .blogs-modal textarea,
                    .blogs-theme .blogs-modal select {
                        background-color: rgba(255, 255, 255, 0.05) !important;
                        color: #f9fafb !important;
                        border-color: rgba(255, 255, 255, 0.18) !important;
                    }
                `}
            </style>

            {/* .background-effects */}
            <div className="fixed inset-0 blogs-noise z-0 mix-blend-overlay"></div>
            <div className="fixed inset-0 blogs-grid z-0"></div>

            <Navigation />

            {/* .main-content */}
            <main className="blogs-content relative z-10 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

                {/* .page-header-actions */}
                <div className="mb-8 flex items-center justify-between rounded-2xl border border-white/10 bg-[#121620]/85 backdrop-blur-md px-6 py-5 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                    {/* .page-title */}
                    <h1 className="text-3xl font-bold font-syne text-white">Blogs</h1>

                    {/* .action-buttons */}
                    <div className="flex items-center gap-3">
                        {/* .refresh-btn */}
                        <button
                            onClick={handleRefresh}
                            title="Refresh"
                            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-gray-200 cursor-pointer transition-all hover:bg-white/10"
                        >
                            {/* .refresh-icon */}
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>

                        {user?.role === 'alumni' && (

                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-medium text-[#0A0D14] cursor-pointer transition-all hover:from-amber-400 hover:to-amber-500 border-none"
                            >
                                Write Blog
                            </button>
                        )}
                    </div>
                </div>

                {/* .blog-tabs */}
                <div className="mb-6 flex gap-2 border-b border-white/10">
                    {/* .tab-btn / .tab-btn.active */}
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`rounded-t-lg px-6 py-3 text-sm font-medium transition-all cursor-pointer border-none
                            ${activeTab === 'all'
                                ? 'border-b-2 border-amber-400 bg-amber-500/10 text-amber-300'
                                : 'text-gray-400 bg-transparent hover:text-white'
                            }`}
                    >
                        All Blogs
                    </button>
                    {user?.role === 'alumni' && (
                        <button
                            onClick={() => setActiveTab('my')}
                            className={`rounded-t-lg px-6 py-3 text-sm font-medium transition-all cursor-pointer border-none
                                ${activeTab === 'my'
                                    ? 'border-b-2 border-amber-400 bg-amber-500/10 text-amber-300'
                                    : 'text-gray-400 bg-transparent hover:text-white'
                                }`}
                        >
                            My Blogs ({myBlogs.length})
                        </button>
                    )}
                </div>

                {/* .search-filter-container */}
                {activeTab === 'all' && (
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* .category-filters */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {categories.map((cat) => (

                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer
                                        ${category === cat
                                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-[#0A0D14] border-transparent'
                                            : 'border border-white/15 bg-white/5 text-gray-200 hover:bg-white/10'
                                        }`}
                                >
                                    {formatCategory(cat)}
                                </button>
                            ))}
                        </div>

                        {/* .search-input */}
                        <input
                            type="text"
                            placeholder="Search blogs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-gray-100 transition-all focus:outline-none focus:border-amber-400 sm:w-64"
                        />
                    </div>
                )}

                {/* Blog Grid / Loading / Empty */}
                {loading ? (

                    <div className="flex justify-center py-20">
                        {/* .loading-spinner */}
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
                    </div>
                ) : (
                    <>
                        {activeTab === 'my' ? (
                            user?.role === 'alumni' ? (
                                myBlogs.length === 0 ? (

                                    <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                                        <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        <p className="mt-4 text-gray-900">You haven't written any blogs yet</p>
                                        <button
                                            onClick={() => setShowCreateModal(true)}
                                            className="mt-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2 text-sm font-medium text-white cursor-pointer transition-all border-none hover:from-blue-700 hover:to-indigo-700"
                                        >
                                            Write Your First Blog
                                        </button>
                                    </div>
                                ) : (

                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {myBlogs.map((blog) => (
                                            <BlogCard key={blog._id} blog={blog} onLike={handleLike} onDelete={handleDelete} />
                                        ))}
                                    </div>
                                )
                            ) : null
                        ) : (
                            blogs.length === 0 ? (
                                <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <p className="mt-4 text-gray-900">No blogs found</p>
                                </div>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {blogs.map((blog) => (
                                        <BlogCard key={blog._id} blog={blog} onLike={handleLike} onDelete={handleDelete} />
                                    ))}
                                </div>
                            )
                        )}
                    </>
                )}
            </main>

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


const BlogCard = ({ blog, onLike, onDelete }: { blog: Blog; onLike: (id: string) => void; onDelete: (id: string) => void }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isLiked = user && blog.likedBy.includes(user._id);

    const resolveImageUrl = (imagePath?: string) => {
        if (!imagePath) return '';
        if (/^https?:\/\//i.test(imagePath)) return imagePath;
        return `http://localhost:5000/${imagePath.replace(/^\/+/, '')}`;
    };

    const formatCategory = (cat: string) =>
        cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return (

        <div className="blog-card group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-600 hover:shadow-md text-gray-900">

            {/* .cover-image-container */}
            {blog.coverImage && (
                <div className="mb-4 aspect-video overflow-hidden rounded-xl">
                    {/* .cover-image — group-hover:scale-105 replaces .blog-card:hover .cover-image */}
                    <img
                        src={resolveImageUrl(blog.coverImage)}
                        alt={blog.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            )}

            {/* .card-header */}
            <div className="mb-3 flex items-center justify-between">
                {/* .category-badge */}
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">
                    {formatCategory(blog.category)}
                </span>
                {/* .read-time */}
                <span className="text-xs text-gray-500">{blog.readTime} min read</span>
            </div>

            {/* .blog-title */}
            <h3
                className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900 cursor-pointer transition-colors hover:text-blue-600"
                onClick={() => navigate(`/blogs/${blog._id}`)}
            >
                {blog.title}
            </h3>

            {/* .blog-excerpt */}
            <p className="mb-4 line-clamp-3 text-sm text-gray-600 leading-relaxed">
                {blog.excerpt}
            </p>

            {/* .blog-tags */}
            {blog.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {blog.tags.slice(0, 3).map((tag, idx) => (

                        <span key={idx} className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                            {tag}
                        </span>
                    ))}
                    {blog.tags.length > 3 && (

                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">
                            +{blog.tags.length - 3}
                        </span>
                    )}
                </div>
            )}

            {/* .card-footer */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">

                {/* .author-info — group for child hover effects */}
                <div
                    className="group/author flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                    onClick={() => navigate(`/profile/${blog.author._id}`)}
                >
                    {blog.author.avatar ? (

                        <img
                            src={resolveImageUrl(blog.author.avatar)}
                            alt={blog.authorName}
                            onError={(e) => {
                                const target = e.currentTarget;
                                const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(blog.authorName || 'User')}&background=1F2937&color=F9FAFB&bold=true`;
                                if (target.src !== fallback) target.src = fallback;
                            }}
                            className="h-10 w-10 rounded-full object-cover border-2 border-blue-200 transition-colors group-hover/author:border-blue-600 flex-shrink-0"
                        />
                    ) : (

                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-bold text-white border-2 border-blue-200 transition-colors group-hover/author:border-blue-600">
                            {blog.authorName.charAt(0).toUpperCase()}
                        </div>
                    )}

                    {/* .author-details */}
                    <div className="flex-1 min-w-0">
                        {/* .author-name */}
                        <p className="truncate text-sm font-medium text-gray-900 transition-colors group-hover/author:text-blue-600">
                            {blog.authorName}
                        </p>
                        {/* .author-meta */}
                        <p className="truncate text-xs text-gray-500">
                            {blog.author.company && blog.author.jobTitle
                                ? `${blog.author.jobTitle} at ${blog.author.company}`
                                : `${blog.author.role === 'alumni' ? 'Alumni' : 'Student'} • ${blog.author.collegeName}`
                            }
                        </p>
                        {/* .blog-date */}
                        <p className="text-xs text-gray-400">
                            {new Date(blog.createdAt).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric'
                            })}
                        </p>
                    </div>
                </div>

                {/* .blog-stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    {/* .view-count */}
                    <span className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {blog.views}
                    </span>

                    {/* .like-btn / .like-btn.liked */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onLike(blog._id); }}
                        className={`flex items-center gap-1 transition-colors bg-transparent border-none cursor-pointer p-0
                            ${isLiked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'}`}
                    >
                        {/* .like-icon */}
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        {blog.likes}
                    </button>

                    {/* Delete button - only for author or admin */}
                    {(blog.author._id === user?._id || user?.role === 'admin') && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(blog._id); }}
                            className="flex items-center gap-1 transition-colors bg-transparent border-none cursor-pointer p-0 text-gray-500 hover:text-red-500"
                            title="Delete blog"
                        >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


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
            Object.entries(formData).forEach(([key, value]) => submitData.append(key, value));
            if (coverImage) submitData.append('coverImage', coverImage);

            await api.post('/blogs/create', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`,
                },
            });

            alert(user.role === 'alumni'
                ? 'Blog published successfully!'
                : 'Blog submitted! It will be published after admin approval.');
            onSuccess();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            alert(err.response?.data?.message || 'Failed to create blog');
        } finally {
            setLoading(false);
        }
    };


    const fieldBase = "w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 transition-all focus:outline-none focus:border-blue-600 focus:bg-white";

    return (

        <div className="blogs-modal fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4">
            {/* .modal */}
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-8">

                {/* .modal-header */}
                <div className="mb-6 flex items-center justify-between">
                    {/* .modal-title */}
                    <h2 className="text-2xl font-bold text-gray-900">Write a Blog</h2>
                    {/* .modal-close-btn */}
                    <button
                        onClick={onClose}
                        className="bg-transparent border-none cursor-pointer p-0 text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* .blog-form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-gray-900">

                    {/* Title */}
                    <div className="flex flex-col">
                        <label className="mb-2 text-sm font-medium text-gray-900">Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className={fieldBase}
                            placeholder="Enter an engaging title..."
                        />
                    </div>

                    {/* Excerpt */}
                    <div className="flex flex-col">
                        <label className="mb-2 text-sm font-medium text-gray-900">Excerpt</label>
                        <textarea
                            required
                            rows={2}
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            className={`${fieldBase} resize-y min-h-[5rem]`}
                            placeholder="Brief description of your blog..."
                        />
                    </div>

                    {/* .form-grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Category */}
                        <div className="flex flex-col">
                            <label className="mb-2 text-sm font-medium text-gray-900">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className={fieldBase}
                            >
                                <option value="career-advice">Career Advice</option>
                                <option value="interview-tips">Interview Tips</option>
                                <option value="industry-insights">Industry Insights</option>
                                <option value="personal-journey">Personal Journey</option>
                                <option value="technical">Technical</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-col">
                            <label className="mb-2 text-sm font-medium text-gray-900">Tags (comma separated)</label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                className={fieldBase}
                                placeholder="career, tech, advice..."
                            />
                        </div>
                    </div>

                    {/* Cover Image — .file-input */}
                    <div className="flex flex-col">
                        <label className="mb-2 text-sm font-medium text-gray-900">Cover Image (optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 transition-all focus:outline-none focus:border-blue-600 focus:bg-white
                                file:mr-4 file:rounded-lg file:border-none file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white file:cursor-pointer hover:file:bg-blue-700"
                        />
                    </div>

                    {/* Content — .content-textarea */}
                    <div className="flex flex-col">
                        <label className="mb-2 text-sm font-medium text-gray-900">Content</label>
                        <textarea
                            required
                            rows={15}
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className={`${fieldBase} resize-y min-h-[20rem] font-[inherit] leading-relaxed`}
                            placeholder="Write your blog content here..."
                        />
                        {/* .form-hint */}
                        <p className="mt-1 text-xs text-gray-500">
                            Tip: Use line breaks for paragraphs. Your blog will be published immediately.
                        </p>
                    </div>

                    {/* .form-actions */}
                    <div className="flex gap-3">
                        {/* .submit-btn */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-medium text-white transition-all border-none cursor-pointer hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Publishing...' : 'Publish Blog'}
                        </button>
                        {/* .cancel-btn */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-white/15 bg-white/5 px-6 py-3 font-medium text-gray-200 transition-all cursor-pointer hover:bg-white/10"
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
