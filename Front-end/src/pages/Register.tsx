import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        university: '',
        graduationYear: '',
        skills: '',
    });
    const [document, setDocument] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const { name, email, password, role, university, graduationYear, skills } = formData;

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', name);
            formDataToSend.append('email', email);
            formDataToSend.append('password', password);
            formDataToSend.append('role', role);
            formDataToSend.append('university', university);
            if (role === 'alumni') {
                formDataToSend.append('graduationYear', graduationYear);
            }
            formDataToSend.append('skills', skills);
            if (document) {
                formDataToSend.append('document', document);
            }

            await axios.post('http://localhost:5000/api/auth/register', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert('Registration successful! Please wait for admin approval.');
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
            <div className="w-full max-w-2xl">
                {/* Register Card */}
                <div className="rounded-lg bg-white p-8 shadow-lg">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600">
                            <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                        <p className="mt-2 text-sm text-gray-600">Join our mentorship community</p>
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

                    {/* Registration Form */}
                    <form onSubmit={onSubmit} className="space-y-5">
                        {/* Name and Role */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={name}
                                    onChange={onChange}
                                    required
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                    I am a <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="role"
                                    name="role"
                                    value={role}
                                    onChange={onChange}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="student">Student</option>
                                    <option value="alumni">Alumni</option>
                                </select>
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={onChange}
                                required
                                className="block w-full rounded-md border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="you@university.edu"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={onChange}
                                required
                                className="block w-full rounded-md border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Create a strong password"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Minimum 8 characters recommended
                            </p>
                        </div>

                        {/* University and Graduation Year */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-1">
                                    University
                                </label>
                                <input
                                    type="text"
                                    id="university"
                                    name="university"
                                    value={university}
                                    onChange={onChange}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="University Name"
                                />
                            </div>

                            {role === 'alumni' && (
                                <div>
                                    <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700 mb-1">
                                        Graduation Year
                                    </label>
                                    <input
                                        type="number"
                                        id="graduationYear"
                                        name="graduationYear"
                                        value={graduationYear}
                                        onChange={onChange}
                                        min="1950"
                                        max="2030"
                                        className="block w-full rounded-md border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="2024"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Skills */}
                        <div>
                            <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                                Skills
                            </label>
                            <input
                                type="text"
                                id="skills"
                                name="skills"
                                value={skills}
                                onChange={onChange}
                                className="block w-full rounded-md border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="e.g., Java, Python, Leadership"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Separate multiple skills with commas
                            </p>
                        </div>

                        {/* Document Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Verification Document <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 py-8 hover:border-indigo-400 transition-colors">
                                <div className="space-y-1 text-center">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 48 48"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <div className="flex text-sm text-gray-600">
                                        <label
                                            htmlFor="document-upload"
                                            className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                                        >
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
                                            <span className="font-medium text-indigo-600">{document.name}</span>
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
                            className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Sign In Link */}
                    <div className="mt-6 text-center text-sm">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                                Sign in instead
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Info Notice */}
                <div className="mt-4 rounded-md bg-blue-50 border border-blue-200 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">Registration Process</h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <p>
                                    After submitting your registration, an admin will review your application and uploaded document. 
                                    You'll be notified once your account is approved.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
