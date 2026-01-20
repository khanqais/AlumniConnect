import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Blogs.css';

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
        <div className="blogs-container">
            {/* Background Effects */}
            <div className="background-effects">
                <div className="background-blur bg-blue-100"></div>
                <div className="background-blur bg-indigo-100"></div>
            </div>

            {/* Header with Full Navigation */}
            <header className="relative z-10 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            {/* Logo/Brand */}
                            <div className="flex items-center gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700">
                                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <Link to="/" className="hidden text-lg font-bold text-gray-900 sm:block">
                                    AlumniConnect
                                </Link>
                            </div>

                            {/* Navigation */}
                            <nav className="hidden md:flex items-center gap-1">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => navigate('/resources')}
                                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                >
                                    Resources
                                </button>
                                <button
                                    onClick={() => navigate('/blogs')}
                                    className="rounded-lg px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50"
                                >
                                    Blogs
                                </button>
                                <button
                                    onClick={() => navigate('/community')}
                                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                >
                                    Community
                                </button>
                                <button
                                    onClick={() => navigate('/webinar-scheduler')}
                                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                >
                                    Events
                                </button>
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                >
                                    Profile
                                </button>
                            </nav>
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/profile')}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-gray-100"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 font-bold text-white">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div className="hidden sm:block">
                                    <h2 className="text-sm font-semibold text-gray-900">{user?.name}</h2>
                                    <p className="text-xs capitalize text-gray-600">{user?.role}</p>
                                </div>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50"
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
            <main className="main-content text-black">
                {/* Page Title & Actions */}
                <div className="page-header-actions">
                    <h1 className="page-title">Blogs</h1>
                    <div className="action-buttons">
                        <button
                            onClick={handleRefresh}
                            className="refresh-btn"
                            title="Refresh"
                        >
                            <svg className="refresh-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        {user?.role === 'alumni' && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="write-blog-btn"
                            >
                                Write Blog
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="blog-tabs">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                    >
                        All Blogs
                    </button>
                    {user?.role === 'alumni' && (
                        <button
                            onClick={() => setActiveTab('my')}
                            className={`tab-btn ${activeTab === 'my' ? 'active' : ''}`}
                        >
                            My Blogs ({myBlogs.length})
                        </button>
                    )}
                </div>

                {/* Search & Filter - Only show for 'all' tab */}
                {activeTab === 'all' && (
                    <div className="search-filter-container">
                        <div className="category-filters">
                            {['all', 'career-advice', 'interview-tips', 'industry-insights', 'personal-journey', 'technical'].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`category-btn ${category === cat ? 'active' : ''}`}
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
                            className="search-input"
                        />
                    </div>
                )}

                {/* Blog Grid */}
                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'my' ? (
                            // My Blogs
                            user?.role === 'alumni' ? (
                                myBlogs.length === 0 ? (
                                    <div className="empty-state">
                                        <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        <p className="empty-text">You haven't written any blogs yet</p>
                                        <button
                                            onClick={() => setShowCreateModal(true)}
                                            className="write-first-btn"
                                        >
                                            Write Your First Blog
                                        </button>
                                    </div>
                                ) : (
                                    <div className="blogs-grid">
                                        {myBlogs.map((blog) => (
                                            <BlogCard key={blog._id} blog={blog} onLike={handleLike} />
                                        ))}
                                    </div>
                                )
                            ) : null
                        ) : (
                            // All Blogs
                            blogs.length === 0 ? (
                                <div className="empty-state">
                                    <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <p className="empty-text">No blogs found</p>
                                </div>
                            ) : (
                                <div className="blogs-grid">
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
        <div className="blog-card text-black">
            {blog.coverImage && (
                <div className="cover-image-container">
                    <img
                        src={`http://localhost:5000/${blog.coverImage}`}
                        alt={blog.title}
                        className="cover-image"
                    />
                </div>
            )}

            <div className="card-header">
                <span className="category-badge">
                    {blog.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </span>
                <span className="read-time">{blog.readTime} min read</span>
            </div>

            <h3 
                className="blog-title"
                onClick={() => navigate(`/blogs/${blog._id}`)}
            >
                {blog.title}
            </h3>

            <p className="blog-excerpt">{blog.excerpt}</p>

            {blog.tags.length > 0 && (
                <div className="blog-tags">
                    {blog.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="tag">
                            {tag}
                        </span>
                    ))}
                    {blog.tags.length > 3 && (
                        <span className="tag-more">
                            +{blog.tags.length - 3}
                        </span>
                    )}
                </div>
            )}

            <div className="card-footer">
                <div 
                    className="author-info"
                    onClick={() => navigate(`/profile/${blog.author._id}`)}
                >
                    {blog.author.avatar ? (
                        <img
                            src={`http://localhost:5000/${blog.author.avatar}`}
                            alt={blog.authorName}
                            className="author-avatar"
                        />
                    ) : (
                        <div className="author-avatar-placeholder">
                            {blog.authorName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="author-details">
                        <p className="author-name">{blog.authorName}</p>
                        <p className="author-meta">
                            {blog.author.company && blog.author.jobTitle 
                                ? `${blog.author.jobTitle} at ${blog.author.company}`
                                : `${blog.author.role === 'alumni' ? 'Alumni' : 'Student'} • ${blog.author.collegeName}`
                            }
                        </p>
                        <p className="blog-date">
                            {new Date(blog.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </p>
                    </div>
                </div>

                <div className="blog-stats">
                    <span className="view-count">
                        <svg className="view-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        className={`like-btn ${user && blog.likedBy.includes(user._id) ? 'liked' : ''}`}
                    >
                        <svg className="like-icon" viewBox="0 0 24 24">
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
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h2 className="modal-title text-black">Write a Blog</h2>
                    <button onClick={onClose} className="modal-close-btn">
                        <svg className="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="blog-form text-black">
                    <div className="form-group">
                        <label className="form-label text-black">Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="form-input text-black"
                            placeholder="Enter an engaging title..."
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label text-black">Excerpt</label>
                        <textarea
                            required
                            rows={2}
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            className="form-textarea text-black"
                            placeholder="Brief description of your blog..."
                        />
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label text-black">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="form-select text-black"
                            >
                                <option value="career-advice" className="option-bg text-black">Career Advice</option>
                                <option value="interview-tips" className="option-bg text-black">Interview Tips</option>
                                <option value="industry-insights" className="option-bg text-black">Industry Insights</option>
                                <option value="personal-journey" className="option-bg text-black">Personal Journey</option>
                                <option value="technical" className="option-bg text-black">Technical</option>
                                <option value="other" className="option-bg text-black">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label text-black">Tags (comma separated)</label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                className="form-input text-black"
                                placeholder="career, tech, advice..."
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label text-black">Cover Image (optional)</label>
                        <input
                            type="file"
                            onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                            className="file-input"
                            accept="image/*"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label text-black">Content</label>
                        <textarea
                            required
                            rows={15}
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="content-textarea text-black"
                            placeholder="Write your blog content here... You can use plain text or basic formatting."
                        />
                        <p className="form-hint text-gray-600">
                            Tip: Use line breaks for paragraphs. Your blog will be published immediately.
                        </p>
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            disabled={loading}
                            className="submit-btn"
                        >
                            {loading ? 'Publishing...' : 'Publish Blog'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="cancel-btn text-black"
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