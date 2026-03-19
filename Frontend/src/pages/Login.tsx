import { useState } from 'react';
import api from '../config/api';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Loader2, Shield, X } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

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
            const res = await api.post('/auth/login', formData);

            console.log('✅ User Login Response:', res.data);

            if (res.data.token) { localStorage.setItem("token", res.data.token); }

            login(res.data);

            
            navigate('/dashboard'); 

        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0A0D14] px-4 py-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.08),transparent_38%),radial-gradient(circle_at_90%_0%,rgba(245,158,11,0.08),transparent_34%)]"></div>
            </div>


            <div className="relative w-full max-w-md">
                {/* Login Card */}
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121620]/85 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                    <div className="px-8 py-10">
                        {/* Header */}
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
                            <p className="mt-2 text-gray-400">Sign in to continue to your account</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={onSubmit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Email Address</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Mail className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={onChange}
                                        required
                                        className="block w-full rounded-lg border border-white/15 bg-white/5 py-3 pl-10 pr-3 text-gray-100 placeholder-gray-400 transition-all focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Lock className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={password}
                                        onChange={onChange}
                                        required
                                        className="block w-full rounded-lg border border-white/15 bg-white/5 py-3 pl-10 pr-3 text-gray-100 placeholder-gray-400 transition-all focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 font-semibold text-[#111827] transition-all hover:from-amber-400 hover:to-orange-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-[#121620] disabled:opacity-50"
                            >
                                    <span className="relative flex items-center justify-center gap-2">
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Signing in...
                                            </>
                                        ) : (
                                            <>
                                                Sign In
                                                <X className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                            </>
                                        )}
                                    </span>
                            </button>
                        </form>

                        {/* Sign Up Link */}
                        <div className="mt-6 text-center">
                                <p className="text-sm text-gray-400">
                                Don't have an account?{' '}
                                <Link to="/register" className="font-semibold text-blue-600 transition-colors hover:text-blue-700">
                                    Create one now
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Admin Login Link */}
                <div className="mt-6 rounded-lg border border-blue-400/25 bg-blue-500/10 p-4 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 flex-shrink-0 text-blue-600" />
                        <div>
                            <h3 className="text-sm font-semibold text-blue-300">Admin Access</h3>
                            <p className="mt-1 text-xs text-blue-200">
                                Administrators should{' '}
                                <Link to="/admin" className="font-semibold text-blue-300 underline hover:text-blue-200">
                                    login here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;
