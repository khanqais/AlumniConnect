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
    const [document, setDocument] = useState<File | null>(null);
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

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setDocument(e.target.files[0]);
        }
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validation
        if (role === 'alumni' && (!graduationYear || !experience)) {
            setError('Alumni must provide graduation year and experience');
            setLoading(false);
            return;
        }

        if (!document) {
            setError('Please upload a verification document');
            setLoading(false);
            return;
        }

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', name);
            formDataToSend.append('email', email);
            formDataToSend.append('password', password);
            formDataToSend.append('role', role);
            formDataToSend.append('collegeName', collegeName);
            if (role === 'alumni') {
                formDataToSend.append('graduationYear', graduationYear);
                formDataToSend.append('experience', experience);
            }
            formDataToSend.append('skills', skills);
            formDataToSend.append('document', document);

            await axios.post('http://localhost:5000/api/auth/register', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert('Registration successful! Please wait for admin approval.');
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
                                    Email Address <span className="text-red-400">*</span>
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
                                        placeholder="you@university.edu"
                                    />
                                </div>
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

                            {/* Document Upload */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-300">
                                    Verification Document <span className="text-red-400">*</span>
                                </label>
                                <div className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-white/20 bg-white/5 px-6 py-8 transition-all hover:border-purple-500/50">
                                    <div className="space-y-2 text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <div className="flex text-sm text-gray-400">
                                            <label htmlFor="document-upload" className="relative cursor-pointer rounded-md font-medium text-purple-400 transition-colors hover:text-purple-300">
                                                <span>Upload a file</span>
                                                <input
                                                    id="document-upload"
                                                    name="document-upload"
                                                    type="file"
                                                    className="sr-only"
                                                    onChange={onFileChange}
                                                    required
                                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {document ? (
                                                <span className="font-medium text-purple-400">✓ {document.name}</span>
                                            ) : (
                                                'ID Card or Marksheet (PDF, JPG, PNG up to 10MB)'
                                            )}
                                        </p>
                                    </div>
                                </div>
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
                                After submitting, an admin will review your application and uploaded document. 
                                You'll be notified once your account is approved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
