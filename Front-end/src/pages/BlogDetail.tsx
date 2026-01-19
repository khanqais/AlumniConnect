import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

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
        graduationYear?: number;
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
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-lg font-bold text-white">
                                    {blog.authorName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">{blog.authorName}</h3>
                                    <p className="text-sm text-gray-400">
                                        {blog.author.role === 'alumni' ? 'Alumni' : 'Student'} • {blog.author.collegeName}
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