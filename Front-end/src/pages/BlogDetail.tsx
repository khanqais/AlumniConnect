import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
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
        graduationYear?: number;
        avatar?: string;
        bio?: string;
        company?: string;
        jobTitle?: string;
        linkedin?: string;
        github?: string;
        twitter?: string;
        website?: string;
    };
    authorName: string;
    tags: string[];
    category: string;
    readTime: number;
    views: number;
    likes: number;
    likedBy: string[];
    comments: {
        _id: string;
        user: string;
        userName: string;
        comment: string;
        createdAt: string;
    }[];
    createdAt: string;
    isPublished: boolean;
}

const BlogDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [comment, setComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);

    const fetchBlog = useCallback(async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/blogs/${id}`);
            setBlog(res.data);
            
            // Check if user has liked this blog
            if (user && res.data.likedBy.includes(user._id)) {
                setIsLiked(true);
            }
        } catch (error) {
            console.error('Error fetching blog:', error);
            navigate('/blogs');
        } finally {
            setLoading(false);
        }
    }, [id, user, navigate]);

    useEffect(() => {
        if (id) {
            fetchBlog();
        }
    }, [id, fetchBlog]);

    const handleLike = async () => {
        if (!user?.token || !blog) return;

        try {
            const res = await axios.post(`http://localhost:5000/api/blogs/like/${blog._id}`, {}, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });

            setBlog(prev => prev ? {
                ...prev,
                likes: res.data.likes,
                likedBy: res.data.isLiked 
                    ? [...prev.likedBy, user._id]
                    : prev.likedBy.filter(id => id !== user._id)
            } : null);
            
            setIsLiked(res.data.isLiked);
        } catch (error) {
            console.error('Error liking blog:', error);
        }
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.token || !blog || !comment.trim()) return;

        setCommentLoading(true);
        try {
            const res = await axios.post(`http://localhost:5000/api/blogs/comment/${blog._id}`, 
                { comment: comment.trim() },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );

            setBlog(prev => prev ? {
                ...prev,
                comments: res.data.comments
            } : null);
            
            setComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setCommentLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatContent = (content: string) => {
        // Simple formatting: convert line breaks to paragraphs
        return content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-4 leading-relaxed text-gray-300">
                {paragraph}
            </p>
        ));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="flex h-screen items-center justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
                </div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="flex h-screen items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white">Blog not found</h1>
                        <button
                            onClick={() => navigate('/blogs')}
                            className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
                        >
                            Back to Blogs
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-purple-600/30 blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-pink-600/30 blur-3xl"></div>
            </div>

            <Navigation />

            {/* Header */}
            <header className="relative z-10 border-b border-white/10 bg-slate-900/50 backdrop-blur-xl">
                <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/blogs')}
                            className="flex items-center gap-2 text-gray-400 hover:text-white"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Blogs
                        </button>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                {blog.views} views
                            </span>
                            
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-1 transition-colors ${
                                    isLiked ? 'text-pink-400' : 'hover:text-pink-400'
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
            </header>

            {/* Main Content */}
            <main className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <article>
                    {/* Blog Header */}
                    <header className="mb-8">
                        <div className="mb-4 flex items-center gap-4">
                            <span className="rounded-full bg-purple-500/20 px-3 py-1 text-sm font-medium text-purple-300">
                                {blog.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </span>
                            <span className="text-sm text-gray-400">{blog.readTime} min read</span>
                        </div>
                        
                        <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl">
                            {blog.title}
                        </h1>
                        
                        <div className="mb-6 text-xl text-gray-300">
                            {blog.excerpt}
                        </div>

                        {/* Author Info */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-6">
                            <div 
                                className="flex items-center gap-4 cursor-pointer group/author"
                                onClick={() => navigate(`/profile/${blog.author._id}`)}
                            >
                                {blog.author.avatar ? (
                                    <img
                                        src={`http://localhost:5000/${blog.author.avatar}`}
                                        alt={blog.authorName}
                                        className="h-12 w-12 rounded-full object-cover ring-2 ring-purple-500/50 group-hover/author:ring-purple-400 transition-all"
                                    />
                                ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-lg font-bold text-white ring-2 ring-purple-500/50 group-hover/author:ring-purple-400 transition-all">
                                        {blog.authorName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-semibold text-white group-hover/author:text-purple-300 transition-colors">
                                        {blog.authorName}
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        {blog.author.company && blog.author.jobTitle 
                                            ? `${blog.author.jobTitle} at ${blog.author.company}`
                                            : `${blog.author.role === 'alumni' ? 'Alumni' : 'Student'} • ${blog.author.collegeName}`
                                        }
                                        {blog.author.graduationYear && ` • Class of ${blog.author.graduationYear}`}
                                    </p>
                                    <p className="text-sm text-gray-500">{formatDate(blog.createdAt)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        {blog.tags.length > 0 && (
                            <div className="mt-6 flex flex-wrap gap-2">
                                {blog.tags.map((tag, idx) => (
                                    <span key={idx} className="rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-300">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </header>

                    {/* Cover Image */}
                    {blog.coverImage && (
                        <div className="mb-8 aspect-video overflow-hidden rounded-2xl">
                            <img
                                src={`http://localhost:5000/${blog.coverImage}`}
                                alt={blog.title}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="prose prose-lg prose-invert mb-12 max-w-none">
                        <div className="text-lg">
                            {formatContent(blog.content)}
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mb-8 flex items-center justify-center gap-6 border-t border-b border-white/10 py-6">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
                                isLiked 
                                    ? 'bg-pink-500/20 text-pink-400' 
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-pink-400'
                            }`}
                        >
                            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            {isLiked ? 'Liked' : 'Like'} ({blog.likes})
                        </button>
                        
                        <button
                            onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })}
                            className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Comments ({blog.comments.length})
                        </button>
                    </div>

                    {/* Author Card - Like Medium */}
                    <div className="mb-12 rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-8 backdrop-blur-xl">
                        <h3 className="mb-6 text-lg font-semibold text-white">About the Author</h3>
                        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
                            {blog.author.avatar ? (
                                <img
                                    src={`http://localhost:5000/${blog.author.avatar}`}
                                    alt={blog.authorName}
                                    className="h-20 w-20 rounded-full object-cover ring-4 ring-purple-500/50"
                                />
                            ) : (
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-2xl font-bold text-white ring-4 ring-purple-500/50">
                                    {blog.authorName.charAt(0).toUpperCase()}
                                </div>
                            )}
                            
                            <div className="mt-4 flex-1 sm:ml-6 sm:mt-0">
                                <h4 className="text-xl font-bold text-white">{blog.authorName}</h4>
                                <p className="mt-1 text-sm text-purple-300">
                                    {blog.author.company && blog.author.jobTitle 
                                        ? `${blog.author.jobTitle} at ${blog.author.company}`
                                        : `${blog.author.role === 'alumni' ? 'Alumni' : 'Student'} • ${blog.author.collegeName}`
                                    }
                                </p>
                                
                                {blog.author.bio && (
                                    <p className="mt-3 text-gray-300">{blog.author.bio}</p>
                                )}
                                
                                {/* Social Links */}
                                {(blog.author.linkedin || blog.author.github || blog.author.twitter || blog.author.website) && (
                                    <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
                                        {blog.author.linkedin && (
                                            <a
                                                href={blog.author.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm text-blue-300 transition-all hover:border-blue-500/50 hover:bg-blue-500/20"
                                            >
                                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                                </svg>
                                                LinkedIn
                                            </a>
                                        )}
                                        {blog.author.github && (
                                            <a
                                                href={blog.author.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 rounded-lg border border-gray-500/30 bg-gray-500/10 px-3 py-2 text-sm text-gray-300 transition-all hover:border-gray-500/50 hover:bg-gray-500/20"
                                            >
                                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                                </svg>
                                                GitHub
                                            </a>
                                        )}
                                        {blog.author.twitter && (
                                            <a
                                                href={blog.author.twitter}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-sm text-sky-300 transition-all hover:border-sky-500/50 hover:bg-sky-500/20"
                                            >
                                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                                </svg>
                                                Twitter
                                            </a>
                                        )}
                                        {blog.author.website && (
                                            <a
                                                href={blog.author.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-sm text-purple-300 transition-all hover:border-purple-500/50 hover:bg-purple-500/20"
                                            >
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                                </svg>
                                                Website
                                            </a>
                                        )}
                                    </div>
                                )}
                                
                                <button
                                    onClick={() => navigate(`/profile/${blog.author._id}`)}
                                    className="mt-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-pink-700"
                                >
                                    View Full Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </article>

                {/* Comments Section */}
                <section id="comments" className="space-y-6">
                    <h3 className="text-2xl font-bold text-white">
                        Comments ({blog.comments.length})
                    </h3>

                    {/* Add Comment Form */}
                    {user ? (
                        <form onSubmit={handleComment} className="rounded-xl border border-white/10 bg-white/5 p-4">
                            <div className="mb-4">
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                                    rows={3}
                                    placeholder="Share your thoughts..."
                                    required
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-sm font-bold text-white">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm text-gray-300">{user.name}</span>
                                </div>
                                <button
                                    type="submit"
                                    disabled={commentLoading || !comment.trim()}
                                    className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                                >
                                    {commentLoading ? 'Posting...' : 'Post Comment'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
                            <p className="mb-4 text-gray-400">Please sign in to leave a comment</p>
                            <button
                                onClick={() => navigate('/login')}
                                className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-pink-700"
                            >
                                Sign In
                            </button>
                        </div>
                    )}

                    {/* Comments List */}
                    <div className="space-y-4">
                        {blog.comments.length === 0 ? (
                            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <p className="mt-4 text-gray-400">No comments yet. Be the first to share your thoughts!</p>
                            </div>
                        ) : (
                            blog.comments.map((comment) => (
                                <div key={comment._id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                                    <div className="mb-3 flex items-start gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-sm font-bold text-white">
                                            {comment.userName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium text-white">{comment.userName}</h4>
                                                <span className="text-sm text-gray-500">
                                                    {formatDate(comment.createdAt)}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-gray-300">{comment.comment}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default BlogDetail;