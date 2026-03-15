import { useState, useEffect, useCallback } from 'react';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

interface Question {
    _id: string;
    title: string;
    description: string;
    type?: 'question' | 'poll';
    pollOptions?: { optionText: string; votes: string[] }[];
    askedBy: {
        _id: string;
        name: string;
        role: string;
        avatar?: string;
    };
    askedByName: string;
    tags: string[];
    category: string;
    answers: Answer[];
    views: number;
    isSolved: boolean;
    createdAt: string;
}

interface Answer {
    _id: string;
    user: {
        _id: string;
        name: string;
        role: string;
    };
    userName: string;
    answer: string;
    isAccepted: boolean;
    upvotes: number;
    upvotedBy: string[];
    createdAt: string;
}

const Community = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [myQuestions, setMyQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
    const [showAskModal, setShowAskModal] = useState(false);
    const [showPollModal, setShowPollModal] = useState(false);

    const { user } = useAuth();

    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/questions', {
                params: { category, search, filter: filter === 'all' ? undefined : filter },
            });
            setQuestions(res.data);
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
        }
    }, [category, search, filter]);

    const fetchMyQuestions = useCallback(async () => {
        if (!user?.token) return;
        
        try {
            const res = await api.get('/questions');
            const filtered = res.data.filter((q: Question) => q.askedBy._id === user._id);
            setMyQuestions(filtered);
        } catch (error) {
            console.error('Error fetching my questions:', error);
        }
    }, [user?.token, user?._id]);

    useEffect(() => {
        fetchQuestions();
        if (user) {
            fetchMyQuestions();
        }
    }, [fetchQuestions, fetchMyQuestions, user]);

    const handleRefresh = () => {
        fetchQuestions();
        if (user) {
            fetchMyQuestions();
        }
    };

    return (
        <div className="community-theme min-h-screen bg-[#0A0D14] text-gray-200 relative overflow-x-hidden">
            <style>
                {`
                    .community-noise {
                        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                        opacity: 0.03;
                        pointer-events: none;
                    }

                    .community-grid {
                        background-size: 40px 40px;
                        background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
                    }

                    .community-theme .community-content .bg-white,
                    .community-theme .community-content .bg-gray-50,
                    .community-theme .community-content .bg-gray-100,
                    .community-theme .community-modal .bg-white,
                    .community-theme .question-card {
                        background-color: rgba(18, 22, 32, 0.84) !important;
                    }

                    .community-theme .community-content .border-gray-100,
                    .community-theme .community-content .border-gray-200,
                    .community-theme .community-content .border-gray-300,
                    .community-theme .community-modal .border-gray-200,
                    .community-theme .community-modal .border-gray-300,
                    .community-theme .question-card {
                        border-color: rgba(255, 255, 255, 0.14) !important;
                    }

                    .community-theme .community-content .text-gray-900,
                    .community-theme .community-content .text-gray-800,
                    .community-theme .community-content .text-gray-700,
                    .community-theme .community-modal .text-gray-900,
                    .community-theme .community-modal .text-gray-700,
                    .community-theme .question-card .text-gray-900,
                    .community-theme .question-card .text-gray-800,
                    .community-theme .question-card .text-gray-700 {
                        color: #f3f4f6 !important;
                    }

                    .community-theme .community-content .text-gray-600,
                    .community-theme .community-content .text-gray-500,
                    .community-theme .community-content .text-gray-400,
                    .community-theme .community-modal .text-gray-600,
                    .community-theme .community-modal .text-gray-500,
                    .community-theme .community-modal .text-gray-400,
                    .community-theme .question-card .text-gray-600,
                    .community-theme .question-card .text-gray-500,
                    .community-theme .question-card .text-gray-400 {
                        color: #9ca3af !important;
                    }

                    .community-theme .community-content input,
                    .community-theme .community-content textarea,
                    .community-theme .community-content select,
                    .community-theme .community-modal input,
                    .community-theme .community-modal textarea,
                    .community-theme .community-modal select {
                        background-color: rgba(255, 255, 255, 0.05) !important;
                        color: #f9fafb !important;
                        border-color: rgba(255, 255, 255, 0.18) !important;
                    }
                `}
            </style>
            {/* Background Effects */}
            <div className="fixed inset-0 community-noise z-0 mix-blend-overlay"></div>
            <div className="fixed inset-0 community-grid z-0"></div>

            {/* Navigation */}
            <Navigation />

            {/* Main Content */}
            <main className="community-content relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Page Title & Actions */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/10 bg-[#121620]/85 backdrop-blur-md px-6 py-5 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                    <h1 className="text-3xl font-bold font-syne text-white">Q&A Community</h1>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 transition-all hover:bg-white/10"
                            title="Refresh"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setShowPollModal(true)}
                            className="flex items-center gap-2 rounded-lg border border-blue-400/25 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300 transition-all hover:bg-blue-500/15"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5v14m6-14v14M4 9h16M4 15h16" />
                            </svg>
                            Create Poll
                        </button>
                        <button
                            onClick={() => setShowAskModal(true)}
                            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-medium text-[#0A0D14] transition-all hover:shadow-lg hover:from-amber-400 hover:to-amber-500"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Ask Question
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 flex gap-2 border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === 'all'
                                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                                : 'border-transparent text-gray-400 hover:border-white/20 hover:text-white'
                        }`}
                    >
                        All Questions
                    </button>
                    <button
                        onClick={() => setActiveTab('my')}
                        className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === 'my'
                                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                                : 'border-transparent text-gray-400 hover:border-white/20 hover:text-white'
                        }`}
                    >
                        My Questions ({myQuestions.length})
                    </button>
                </div>

                {/* Search & Filter - Only show for 'all' tab */}
                {activeTab === 'all' && (
                    <div className="mb-6 space-y-4 rounded-lg border border-gray-200 bg-white p-4">
                        {/* Category Filters */}
                        <div className="flex flex-wrap gap-2">
                            {['all', 'career', 'technical', 'academic', 'interview', 'general'].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                        category === cat
                                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-[#0A0D14] shadow-md'
                                            : 'bg-white/10 text-gray-200 hover:bg-white/15'
                                    }`}
                                >
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Filter by Status */}
                        <div className="flex flex-wrap gap-2">
                            <span className="text-sm font-medium text-gray-700">Filter:</span>
                            {['all', 'unanswered', 'solved'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`rounded-lg px-3 py-1 text-sm font-medium transition-all ${
                                        filter === f
                                            ? 'bg-blue-500/20 text-blue-300'
                                            : 'bg-white/10 text-gray-200 hover:bg-white/15'
                                    }`}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <input
                            type="text"
                            placeholder="Search questions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-white/15 px-4 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>
                )}

                {/* Questions Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent"></div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'my' ? (
                            // My Questions
                            myQuestions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-20">
                                    <svg className="mb-4 h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="mb-4 text-lg text-gray-600">You haven't asked any questions yet</p>
                                    <button
                                        onClick={() => setShowAskModal(true)}
                                        className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-3 font-medium text-white transition-all hover:shadow-lg"
                                    >
                                        Ask Your First Question
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {myQuestions.map((question) => (
                                        <QuestionCard key={question._id} question={question} onVoted={handleRefresh} />
                                    ))}
                                </div>
                            )
                        ) : (
                            // All Questions
                            questions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-20">
                                    <svg className="mb-4 h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-lg text-gray-600">No questions found</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {questions.map((question) => (
                                        <QuestionCard key={question._id} question={question} onVoted={handleRefresh} />
                                    ))}
                                </div>
                            )
                        )}
                    </>
                )}
            </main>

            {/* Ask Question Modal */}
            {showAskModal && (
                <AskQuestionModal
                    onClose={() => setShowAskModal(false)}
                    onSuccess={() => {
                        setShowAskModal(false);
                        handleRefresh();
                        setActiveTab('my');
                    }}
                />
            )}
            {showPollModal && (
                <CreatePollModal
                    onClose={() => setShowPollModal(false)}
                    onSuccess={() => {
                        setShowPollModal(false);
                        handleRefresh();
                        setActiveTab('my');
                    }}
                />
            )}
        </div>
    );
};

// Question Card Component
const QuestionCard = ({ question, onVoted }: { question: Question; onVoted: () => void }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const resolveAvatarUrl = (avatar?: string, name?: string) => {
        if (avatar && avatar.trim()) {
            if (/^https?:\/\//i.test(avatar)) return avatar;
            return `http://localhost:5000/${avatar.replace(/^\/+/, '')}`;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=1F2937&color=F9FAFB&bold=true`;
    };

    const handleVote = async (optionIndex: number) => {
        try {
            if (!user?.token) return;
            await api.post(`/questions/poll/vote/${question._id}`,
                { optionIndex },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            onVoted();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            alert(err.response?.data?.message || 'Failed to vote');
        }
    };

    return (
        <div 
            className="question-card cursor-pointer rounded-lg border border-gray-200 bg-white p-6 transition-all hover:shadow-lg"
            onClick={() => navigate(`/community/${question._id}`)}
        >
            <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            question.category === 'career' ? 'bg-purple-100 text-purple-800' :
                            question.category === 'technical' ? 'bg-blue-100 text-blue-800' :
                            question.category === 'academic' ? 'bg-green-100 text-green-800' :
                            question.category === 'interview' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                            {question.category.charAt(0).toUpperCase() + question.category.slice(1)}
                        </span>
                        {question.isSolved && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Solved
                            </span>
                        )}
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 hover:text-blue-600">
                        {question.title}
                    </h3>
                    {question.type === 'poll' ? (
                        <div className="mb-4 space-y-2">
                            {(question.pollOptions || []).map((option, idx) => (
                                <button
                                    key={`${question._id}-option-${idx}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleVote(idx);
                                    }}
                                    className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
                                >
                                    <span>{option.optionText}</span>
                                    <span className="text-xs text-gray-500">{option.votes?.length || 0}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="mb-4 text-gray-600 line-clamp-2">
                            {question.description}
                        </p>
                    )}

                    {question.tags.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2">
                            {question.tags.slice(0, 5).map((tag, idx) => (
                                <span key={idx} className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                    #{tag}
                                </span>
                            ))}
                            {question.tags.length > 5 && (
                                <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                    +{question.tags.length - 5}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div 
                    className="flex items-center gap-2"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${question.askedBy._id}`);
                    }}
                >
                    <img
                        src={resolveAvatarUrl(question.askedBy?.avatar, question.askedByName)}
                        alt={question.askedByName}
                        onError={(e) => {
                            const target = e.currentTarget;
                            const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(question.askedByName || 'User')}&background=1F2937&color=F9FAFB&bold=true`;
                            if (target.src !== fallback) target.src = fallback;
                        }}
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-blue-500/50"
                    />
                    <div>
                        <p className="text-sm font-medium text-gray-900">{question.askedByName}</p>
                        <p className="text-xs text-gray-500">
                            {new Date(question.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {question.views}
                    </span>
                    <span className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        {question.answers.length} {question.answers.length === 1 ? 'answer' : 'answers'}
                    </span>
                </div>
            </div>
        </div>
    );
};

// Ask Question Modal Component
const AskQuestionModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'career',
        tags: '',
    });
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.token) return;

        setLoading(true);
        try {
            await api.post('/questions/ask', formData, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });

            alert('Question posted successfully!');
            onSuccess();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            alert(err.response?.data?.message || 'Failed to post question');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="community-modal fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-200 p-6">
                    <h2 className="text-2xl font-bold text-gray-900">Ask a Question</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 p-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="What's your question?"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            required
                            rows={6}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Provide details about your question..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="career">Career</option>
                                <option value="technical">Technical</option>
                                <option value="academic">Academic</option>
                                <option value="interview">Interview</option>
                                <option value="general">General</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Tags (comma separated)</label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="javascript, career, advice..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 border-t border-gray-200 pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-3 font-medium text-white transition-all hover:shadow-lg disabled:opacity-50"
                        >
                            {loading ? 'Posting...' : 'Post Question'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-white/15 bg-white/5 px-6 py-3 font-medium text-gray-200 transition-all hover:bg-white/10"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Create Poll Modal Component
const CreatePollModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
    const [formData, setFormData] = useState({
        title: '',
        category: 'career',
        tags: '',
    });
    const [options, setOptions] = useState(['', '']);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const handleOptionChange = (index: number, value: string) => {
        setOptions(prev => prev.map((opt, i) => (i === index ? value : opt)));
    };

    const addOption = () => {
        if (options.length >= 4) return;
        setOptions(prev => [...prev, '']);
    };

    const removeOption = (index: number) => {
        if (options.length <= 2) return;
        setOptions(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.token) return;

        const cleanedOptions = options.map(opt => opt.trim()).filter(Boolean);
        if (cleanedOptions.length < 2) {
            alert('Please provide at least two poll options');
            return;
        }

        setLoading(true);
        try {
            await api.post('/questions/poll',
                {
                    title: formData.title,
                    category: formData.category,
                    tags: formData.tags,
                    options: cleanedOptions,
                },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            alert('Poll created successfully!');
            onSuccess();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            alert(err.response?.data?.message || 'Failed to create poll');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="community-modal fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-200 p-6">
                    <h2 className="text-2xl font-bold text-gray-900">Create Poll</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 p-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Poll Question</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ask a question..."
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">Options</label>
                        {options.map((option, idx) => (
                            <div key={`poll-option-${idx}`} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={`Option ${idx + 1}`}
                                />
                                {options.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => removeOption(idx)}
                                        className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-gray-200 transition-all hover:bg-white/10"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addOption}
                            disabled={options.length >= 4}
                            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-gray-200 transition-all hover:bg-white/10 disabled:opacity-50"
                        >
                            Add Option
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="career">Career</option>
                                <option value="technical">Technical</option>
                                <option value="academic">Academic</option>
                                <option value="interview">Interview</option>
                                <option value="general">General</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Tags (comma separated)</label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="poll, mentorship, advice..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 border-t border-gray-200 pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-3 font-medium text-white transition-all hover:shadow-lg disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Poll'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-white/15 bg-white/5 px-6 py-3 font-medium text-gray-200 transition-all hover:bg-white/10"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Community;
