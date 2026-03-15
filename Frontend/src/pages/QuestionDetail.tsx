import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../components/Navigation';

interface Answer {
    _id: string;
    user: {
        _id: string;
        name: string;
        role: string;
        avatar?: string;
    };
    userName: string;
    answer: string;
    isAccepted: boolean;
    upvotes: number;
    upvotedBy: string[];
    createdAt: string;
}

interface Question {
    _id: string;
    title: string;
    description: string;
    askedBy: {
        _id: string;
        name: string;
        role: string;
        collegeName: string;
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

const QuestionDetail = () => {
    const [question, setQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const [answerText, setAnswerText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        if (id) {
            fetchQuestion();
        }
    }, [id]);

    const fetchQuestion = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/questions/${id}`);
            setQuestion(res.data);
        } catch (error) {
            console.error('Error fetching question:', error);
            alert('Question not found');
            navigate('/community');
        } finally {
            setLoading(false);
        }
    };

    const handlePostAnswer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.token || !answerText.trim()) return;

        setSubmitting(true);
        try {
            await axios.post(
                `http://localhost:5000/api/questions/answer/${id}`,
                { answer: answerText },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );
            setAnswerText('');
            fetchQuestion();
            alert('Answer posted successfully!');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            alert(err.response?.data?.message || 'Failed to post answer');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpvote = async (answerId: string) => {
        if (!user?.token) return;

        try {
            await axios.post(
                `http://localhost:5000/api/questions/upvote/${id}`,
                { answerId },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );
            fetchQuestion();
        } catch (error) {
            console.error('Error upvoting answer:', error);
        }
    };

    const handleAcceptAnswer = async (answerId: string) => {
        if (!user?.token) return;

        try {
            await axios.post(
                `http://localhost:5000/api/questions/accept/${id}`,
                { answerId },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );
            fetchQuestion();
            alert('Answer accepted!');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            alert(err.response?.data?.message || 'Failed to accept answer');
        }
    };

    const handleToggleSolved = async () => {
        if (!user?.token) return;

        try {
            await axios.post(
                `http://localhost:5000/api/questions/toggle-solved/${id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );
            fetchQuestion();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            alert(err.response?.data?.message || 'Failed to toggle solved status');
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            </div>
        );
    }

    if (!question) {
        return null;
    }

    const resolveAvatarUrl = (avatar?: string, name?: string) => {
        if (avatar && avatar.trim()) {
            if (/^https?:\/\//i.test(avatar)) return avatar;
            return `http://localhost:5000/${avatar.replace(/^\/+/, '')}`;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=1F2937&color=F9FAFB&bold=true`;
    };

    const isQuestionOwner = user?._id === question.askedBy._id;

    return (
        <div className="min-h-screen bg-[#0A0D14] text-gray-200 relative overflow-x-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(245,158,11,0.08),transparent_35%)]"></div>
            </div>

            <Navigation />

            {/* Main Content */}
            <main className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/community')}
                    className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Community
                </button>

                {/* Question */}
                <div className="mb-8 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            question.category === 'career' ? 'bg-purple-500/20 text-purple-300' :
                            question.category === 'technical' ? 'bg-blue-500/20 text-blue-300' :
                            question.category === 'academic' ? 'bg-green-500/20 text-green-300' :
                            question.category === 'interview' ? 'bg-orange-500/20 text-orange-300' :
                            'bg-gray-500/20 text-gray-300'
                        }`}>
                            {question.category.charAt(0).toUpperCase() + question.category.slice(1)}
                        </span>
                        {question.isSolved && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-300">
                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Solved
                            </span>
                        )}
                        <span className="ml-auto text-sm text-gray-400">{question.views} views</span>
                    </div>

                    <h1 className="mb-4 text-3xl font-bold text-white">{question.title}</h1>

                    <p className="mb-6 whitespace-pre-wrap text-gray-300">{question.description}</p>

                    {question.tags.length > 0 && (
                        <div className="mb-6 flex flex-wrap gap-2">
                            {question.tags.map((tag, idx) => (
                                <span key={idx} className="rounded-md bg-white/10 px-2 py-1 text-xs text-gray-300">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {isQuestionOwner && (
                        <div className="mb-4">
                            <button
                                onClick={handleToggleSolved}
                                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                    question.isSolved
                                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                            >
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {question.isSolved ? 'Mark as Unanswered' : 'Mark as Answered'}
                            </button>
                        </div>
                    )}

                    <div className="flex items-center justify-between border-t border-white/10 pt-4">
                        <div 
                            className="flex cursor-pointer items-center gap-2"
                            onClick={() => navigate(`/profile/${question.askedBy._id}`)}
                        >
                            <img
                                src={resolveAvatarUrl(question.askedBy?.avatar, question.askedByName)}
                                alt={question.askedByName}
                                onError={(e) => {
                                    const target = e.currentTarget;
                                    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(question.askedByName || 'User')}&background=1F2937&color=F9FAFB&bold=true`;
                                    if (target.src !== fallback) target.src = fallback;
                                }}
                                className="h-10 w-10 rounded-full object-cover ring-2 ring-blue-500/50"
                            />
                            <div>
                                <p className="text-sm font-medium text-white">{question.askedByName}</p>
                                <p className="text-xs text-gray-400">
                                    Asked {new Date(question.createdAt).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Answers Section */}
                <div className="mb-8">
                    <h2 className="mb-4 text-2xl font-bold text-white">
                        {question.answers.length} {question.answers.length === 1 ? 'Answer' : 'Answers'}
                    </h2>

                    <div className="space-y-4">
                        {question.answers
                            .sort((a, b) => {
                                if (a.isAccepted) return -1;
                                if (b.isAccepted) return 1;
                                return b.upvotes - a.upvotes;
                            })
                            .map((answer) => (
                                <div 
                                    key={answer._id} 
                                    className={`rounded-lg border p-6 transition-all ${
                                        answer.isAccepted
                                            ? 'border-green-500/30 bg-green-500/10'
                                            : 'border-white/10 bg-white/5'
                                    }`}
                                >
                                    {answer.isAccepted && (
                                        <div className="mb-3 flex items-center gap-2 text-green-300">
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm font-semibold">Accepted Answer</span>
                                        </div>
                                    )}

                                    <p className="mb-4 whitespace-pre-wrap text-gray-300">{answer.answer}</p>

                                    <div className="flex items-center justify-between border-t border-white/10 pt-4">
                                        <div 
                                            className="flex cursor-pointer items-center gap-2"
                                            onClick={() => navigate(`/profile/${answer.user._id}`)}
                                        >
                                            <img
                                                src={resolveAvatarUrl(answer.user?.avatar, answer.userName)}
                                                alt={answer.userName}
                                                onError={(e) => {
                                                    const target = e.currentTarget;
                                                    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(answer.userName || 'User')}&background=1F2937&color=F9FAFB&bold=true`;
                                                    if (target.src !== fallback) target.src = fallback;
                                                }}
                                                className="h-8 w-8 rounded-full object-cover ring-2 ring-blue-500/50"
                                            />
                                            <div>
                                                <p className="text-sm font-medium text-white">{answer.userName}</p>
                                                <p className="text-xs text-gray-400">
                                                    {new Date(answer.createdAt).toLocaleDateString('en-US', { 
                                                        month: 'short', 
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleUpvote(answer._id)}
                                                className={`flex items-center gap-1 rounded-lg px-3 py-1 text-sm font-medium transition-all ${
                                                    user && answer.upvotedBy.includes(user._id)
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                                }`}
                                            >
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                </svg>
                                                {answer.upvotes}
                                            </button>
                                            {isQuestionOwner && !question.isSolved && (
                                                <button
                                                    onClick={() => handleAcceptAnswer(answer._id)}
                                                    className="rounded-lg bg-green-600 px-3 py-1 text-sm font-medium text-white transition-all hover:bg-green-700"
                                                >
                                                    Accept
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Post Answer Form */}
                <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                    <h3 className="mb-4 text-xl font-bold text-white">Your Answer</h3>
                    <form onSubmit={handlePostAnswer}>
                        <textarea
                            required
                            rows={8}
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            className="mb-4 w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            placeholder="Write your answer here..."
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-3 font-medium text-white transition-all hover:shadow-lg disabled:opacity-50"
                        >
                            {submitting ? 'Posting...' : 'Post Answer'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default QuestionDetail;
