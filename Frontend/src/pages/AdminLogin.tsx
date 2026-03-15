import { useState } from 'react';
import api from '../config/api';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/admin/login', formData);
            
            console.log('✅ Admin Login Response:', res.data);
            
            if (res.data.success) {
                // Store admin session
                localStorage.setItem('adminAuth', 'true');
                localStorage.setItem('adminEmail', email);
                
                console.log('✅ Redirecting to /admin/dashboard');
                
                // Navigate to admin dashboard
                navigate('/admin/dashboard', { replace: true });
            }
        } catch (err: unknown) {
            console.error('❌ Admin Login Error:', err);
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Invalid admin credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0A0D14] px-4 pb-4 pt-28 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.08),transparent_38%),radial-gradient(circle_at_90%_0%,rgba(245,158,11,0.08),transparent_34%)]"></div>
            </div>

            <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4 pointer-events-none">
                <div className="flex items-center justify-between w-full max-w-5xl bg-[#121620]/80 backdrop-blur-md border border-white/10 rounded-full px-4 py-3 pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                    <Link to="/" className="flex items-center gap-3 pl-2">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-white/10">
                            <img
                                src="/logo.png"
                                alt="AlumniConnect"
                                className="mt-2 block h-full w-full scale-[1.7] origin-center object-contain object-center"
                            />
                        </div>
                        <span className="text-lg font-bold font-syne text-white tracking-tight">AlumniConnect</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Sign In</Link>
                        <Link
                            to="/register"
                            className="rounded-full bg-amber-500 px-5 py-2 text-sm font-bold text-[#0A0D14] hover:bg-amber-400 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                        >
                            Join Network
                        </Link>
                    </div>
                </div>
            </header>

            <div className="w-full max-w-md">
                <div className="rounded-2xl border border-white/10 bg-[#121620]/85 backdrop-blur-md p-8 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-bold text-white">Admin Login</h2>
                        <p className="mt-2 text-sm text-gray-400">Administrators only</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 rounded-md bg-red-50 border border-red-200 p-3">
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={onSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                                Admin Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={onChange}
                                required
                                className="block w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-gray-100 placeholder-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                                placeholder="admin@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                                Admin Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={onChange}
                                required
                                className="block w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-gray-100 placeholder-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                                placeholder="Enter admin password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-[#111827] shadow-sm hover:from-amber-400 hover:to-orange-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-[#121620] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign in as Admin'
                            )}
                        </button>
                    </form>

                    {/* Back to User Login */}
                    <div className="mt-6 text-center">
                        <a href="/login" className="text-sm text-gray-400 hover:text-gray-200">
                            ← Back to user login
                        </a>
                    </div>
                </div>

                {/* Security Notice */}
                <div className="mt-4 rounded-lg border border-yellow-400/25 bg-yellow-500/10 p-3 backdrop-blur-sm">
                    <div className="flex items-start gap-2">
                        <svg className="h-5 w-5 text-yellow-300 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-xs text-yellow-200">
                            <strong>Restricted Area:</strong> Only authorized administrators can access this portal.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
