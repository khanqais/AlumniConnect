import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        collegeName: '',
        graduationYear: '',
        skills: '',
        experience: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const { name, email, password, role, collegeName, graduationYear, skills, experience } = formData;

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Email domain validation
        const emailDomain = email.split('@')[1];
        if (!emailDomain || emailDomain !== 'tsecedu.org') {
            setError('Please use your institute email (e.g., yourname@tsecedu.org)');
            setLoading(false);
            return;
        }

        // Validation
        if (role === 'alumni' && (!graduationYear || !experience)) {
            setError('Alumni must provide graduation year and experience');
            setLoading(false);
            return;
        }

        try {
            const dataToSend = {
                name,
                email,
                password,
                role,
                collegeName,
                graduationYear: role === 'alumni' ? graduationYear : undefined,
                experience: role === 'alumni' ? experience : undefined,
                skills,
            };

            await axios.post('http://localhost:5000/api/auth/register', dataToSend, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            alert('Registration successful! Please check your Outlook email (@tsecol.onmicrosoft.com) to verify your account.');
            navigate('/login');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-purple-600/30 blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-pink-600/30 blur-3xl"></div>
            </div>

            {/* Home Link */}
            <Link to="/" className="absolute left-6 top-6 z-20 flex items-center gap-2 transition-opacity hover:opacity-80">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </div>
                <span className="text-xl font-bold text-white">AlumniConnect</span>
            </Link>

            <div className="relative w-full max-w-2xl">
                {/* Register Card */}
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 shadow-2xl backdrop-blur-xl">
                    <div className="px-8 py-10">
                        {/* Header */}
                        <div className="mb-8 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600">
                                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-white">Create Account</h2>
                            <p className="mt-2 text-gray-400">Join our mentorship community</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
                                <svg className="h-5 w-5 flex-shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-red-300">{error}</p>
                            </div>
                        )}

                        {/* Registration Form */}
                        <form onSubmit={onSubmit} className="space-y-5">
                            {/* Name and Role */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">
                                        Full Name <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={name}
                                        onChange={onChange}
                                        required
                                        className="block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-white placeholder-gray-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">
                                        I am a <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        name="role"
                                        value={role}
                                        onChange={onChange}
                                        className="block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-white transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    >
                                        <option value="student" className="bg-slate-800">Student</option>
                                        <option value="alumni" className="bg-slate-800">Alumni</option>
                                    </select>
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-300">
                                    Institute Email <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={onChange}
                                        required
                                        className="block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-white placeholder-gray-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        placeholder="yourname@tsecedu.org"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Only institute email (@tsecedu.org) is accepted</p>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-300">
                                    Password <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={password}
                                        onChange={onChange}
                                        required
                                        className="block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-white placeholder-gray-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        placeholder="Create a strong password"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Minimum 8 characters recommended</p>
                            </div>

                            {/* College Name (Required for both) */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-300">
                                    College Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="collegeName"
                                    value={collegeName}
                                    onChange={onChange}
                                    required
                                    className="block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-white placeholder-gray-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    placeholder="e.g., Thadomal Shahani Engineering College"
                                />
                            </div>

                            {/* Alumni-specific fields */}
                            {role === 'alumni' && (
                                <>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-300">
                                                Graduation Year <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="graduationYear"
                                                value={graduationYear}
                                                onChange={onChange}
                                                required={role === 'alumni'}
                                                min="1950"
                                                max="2030"
                                                className="block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-white placeholder-gray-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                placeholder="2024"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-300">
                                                Experience (Years) <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="experience"
                                                value={experience}
                                                onChange={onChange}
                                                required={role === 'alumni'}
                                                className="block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-white placeholder-gray-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                placeholder="e.g., 3 years"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Skills (Required for both) */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-300">
                                    Skills <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="skills"
                                    value={skills}
                                    onChange={onChange}
                                    required
                                    className="block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-white placeholder-gray-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    placeholder="e.g., Java, Python, Leadership"
                                />
                                <p className="mt-1 text-xs text-gray-500">Separate multiple skills with commas</p>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
                            >
                                <span className="relative flex items-center justify-center gap-2">
                                    {loading ? (
                                        <>
                                            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            Create Account
                                            <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>

                        {/* Sign In Link */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-400">
                                Already have an account?{' '}
                                <Link to="/login" className="font-semibold text-purple-400 transition-colors hover:text-purple-300">
                                    Sign in instead
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Info Notice */}
                <div className="mt-6 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                        <svg className="h-5 w-5 flex-shrink-0 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="text-sm font-semibold text-blue-300">Registration Process</h3>
                            <p className="mt-1 text-xs text-blue-200/80">
                                After submitting, you'll receive a verification email at your Outlook address (@tsecol.onmicrosoft.com). 
                                Click the verification link to activate your account instantly - no admin approval needed!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
