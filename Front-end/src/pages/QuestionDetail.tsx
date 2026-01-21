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

    const isQuestionOwner = user?._id === question.askedBy._id;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Background Effects */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-blue-100 opacity-50 blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-indigo-100 opacity-50 blur-3xl"></div>
            </div>

            <Navigation />

            {/* Main Content */}
            <main className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/community')}
                    className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Community
                </button>

                {/* Question */}
                <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
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
                        <span className="ml-auto text-sm text-gray-500">{question.views} views</span>
                    </div>

                    <h1 className="mb-4 text-3xl font-bold text-gray-900">{question.title}</h1>

                    <p className="mb-6 whitespace-pre-wrap text-gray-700">{question.description}</p>

                    {question.tags.length > 0 && (
                        <div className="mb-6 flex flex-wrap gap-2">
                            {question.tags.map((tag, idx) => (
                                <span key={idx} className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700">
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
                                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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

                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                        <div 
                            className="flex cursor-pointer items-center gap-2"
                            onClick={() => navigate(`/profile/${question.askedBy._id}`)}
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 text-sm font-bold text-white">
                                {question.askedByName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">{question.askedByName}</p>
                                <p className="text-xs text-gray-500">
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
                    <h2 className="mb-4 text-2xl font-bold text-gray-900">
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
                                    className={`rounded-lg border p-6 ${
                                        answer.isAccepted
                                            ? 'border-green-300 bg-green-50'
                                            : 'border-gray-200 bg-white'
                                    }`}
                                >
                                    {answer.isAccepted && (
                                        <div className="mb-3 flex items-center gap-2 text-green-700">
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm font-semibold">Accepted Answer</span>
                                        </div>
                                    )}

                                    <p className="mb-4 whitespace-pre-wrap text-gray-700">{answer.answer}</p>

                                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                        <div 
                                            className="flex cursor-pointer items-center gap-2"
                                            onClick={() => navigate(`/profile/${answer.user._id}`)}
                                        >
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 text-sm font-bold text-white">
                                                {answer.userName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{answer.userName}</p>
                                                <p className="text-xs text-gray-500">
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
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <h3 className="mb-4 text-xl font-bold text-gray-900">Your Answer</h3>
                    <form onSubmit={handlePostAnswer}>
                        <textarea
                            required
                            rows={8}
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
