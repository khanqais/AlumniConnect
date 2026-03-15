import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/auth/verify-email/${token}`);
                
                setStatus('success');
                setMessage(response.data.message);
                setUserName(response.data.user?.name || '');
                
                // Redirect to login after 5 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 5000);
            } catch (err: unknown) {
                const error = err as { response?: { data?: { message?: string } } };
                setStatus('error');
                setMessage(error.response?.data?.message || 'Failed to verify email. The link may be invalid or expired.');
            }
        };

        if (token) {
            verifyEmail();
        }
    }, [token, navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0A0D14] p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.08),transparent_38%),radial-gradient(circle_at_90%_0%,rgba(245,158,11,0.08),transparent_34%)]"></div>
            </div>

            <div className="relative w-full max-w-md">
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                    <div className="px-8 py-10">
                        {/* Loading State */}
                        {status === 'loading' && (
                            <div className="text-center">
                                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-700">
                                    <svg className="h-8 w-8 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Verifying Your Email</h2>
                                <p className="mt-2 text-gray-600">Please wait while we verify your email address...</p>
                            </div>
                        )}

                        {/* Success State */}
                        {status === 'success' && (
                            <div className="text-center">
                                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600">
                                    <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
                                {userName && (
                                    <p className="mt-2 text-lg text-gray-800">Welcome, {userName}!</p>
                                )}
                                <p className="mt-4 text-gray-700">{message}</p>
                                
                                <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-4">
                                    <div className="flex items-start gap-3">
                                        <svg className="h-5 w-5 flex-shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div className="text-left">
                                            <h3 className="text-sm font-semibold text-green-800">Account Activated</h3>
                                            <p className="mt-1 text-xs text-green-700">
                                                Your account has been automatically approved. You can now access all platform features!
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-3 font-semibold text-white transition-all hover:from-blue-700 hover:to-indigo-800"
                                    >
                                        Continue to Login
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>
                                </div>

                                <p className="mt-4 text-xs text-gray-500">
                                    Redirecting to login in 5 seconds...
                                </p>
                            </div>
                        )}

                        {/* Error State */}
                        {status === 'error' && (
                            <div className="text-center">
                                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600">
                                    <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
                                <p className="mt-4 text-gray-700">{message}</p>
                                
                                <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4">
                                    <div className="flex items-start gap-3">
                                        <svg className="h-5 w-5 flex-shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div className="text-left">
                                            <h3 className="text-sm font-semibold text-red-800">What to do?</h3>
                                            <ul className="mt-1 list-inside list-disc text-xs text-red-700">
                                                <li>Check if you used the correct verification link</li>
                                                <li>The link may have expired (valid for 24 hours)</li>
                                                <li>Try registering again or contact support</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-col gap-3">
                                    <Link
                                        to="/register"
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-3 font-semibold text-white transition-all hover:from-blue-700 hover:to-indigo-800"
                                    >
                                        Register Again
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        Back to Login
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;