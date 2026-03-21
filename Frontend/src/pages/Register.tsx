import { useState } from 'react';
import api from '../config/api';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        collegeName: '',
        cgpa: '',
        graduationYear: '',
        skills: '',
        experience: '',
        linkedin: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [alumniProofFile, setAlumniProofFile] = useState<File | null>(null);

    const navigate = useNavigate();

    const { name, email, password, role, collegeName, cgpa, graduationYear, skills, experience, linkedin } = formData;


    const techSkills = [

        "Java", "Python", "C", "C++", "JavaScript", "TypeScript", "Go", "Rust", 
        "Kotlin", "Swift", "C#", "PHP", "Ruby", "Scala",
        

        "Spring Boot", "Node.js", "Express.js", "Django", "Flask", "FastAPI", 
        "ASP.NET", "Ruby on Rails", "Laravel",
        

        "React", "Angular", "Vue.js", "HTML/CSS", "Tailwind CSS", "Bootstrap", 
        "SASS/SCSS", "Redux", "Next.js",
        

        "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Terraform", "Jenkins", 
        "GitLab CI/CD", "GitHub Actions", "Ansible",
        

        "MySQL", "PostgreSQL", "MongoDB", "Redis", "Oracle", "SQL Server", 
        "Cassandra", "Elasticsearch",
        

        "Microservices", "REST APIs", "GraphQL", "gRPC", "System Design", 
        "Design Patterns", "OOP", "Functional Programming", "Agile/Scrum",
        

        "Git", "Linux", "Shell Scripting", "Jira", "Confluence", "Postman", 
        "Swagger", "Apache Kafka", "RabbitMQ",
        

        "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Pandas", 
        "NumPy", "Data Analysis", "Computer Vision", "NLP",
        

        "Leadership", "Communication", "Problem Solving", "Team Management", 
        "Project Management", "Public Speaking", "Mentoring"
    ];

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'skills' && type === 'select-multiple') {
        const selectElement = e.target as HTMLSelectElement;
        const selectedOptions = Array.from(selectElement.selectedOptions)
            .map(option => option.value)
            .join(', ');
        setFormData((prevState) => ({
            ...prevState,
            [name]: selectedOptions,
        }));
    } else {
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));

        if (name === 'role' && value !== 'alumni') {
            setAlumniProofFile(null);
        }
    }

    if (error) {
        setError('');
    }
};

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setAlumniProofFile(file);
        if (error) {
            setError('');
        }
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');


        const normalizedEmail = email.trim().toLowerCase();
        const emailDomain = normalizedEmail.split('@')[1];

        if (role === 'alumni') {
            if (!emailDomain || emailDomain !== 'gmail.com') {
                setError('Alumni must register with Gmail (e.g., yourname@gmail.com)');
                setLoading(false);
                return;
            }
        } else if (!emailDomain || emailDomain !== 'tsecedu.org') {
            setError('Please use your institute email (e.g., yourname@tsecedu.org)');
            setLoading(false);
            return;
        }


        if (role === 'alumni' && (!graduationYear || !experience || !linkedin || !alumniProofFile)) {
            setError('Alumni must provide graduation year, experience, LinkedIn profile, and marksheet/graduation certificate');
            setLoading(false);
            return;
        }

        if (role === 'student') {
            const cgpaNumber = Number(cgpa);
            if (cgpa === '' || Number.isNaN(cgpaNumber) || cgpaNumber < 0 || cgpaNumber > 10) {
                setError('Please enter a valid CGPA between 0 and 10');
                setLoading(false);
                return;
            }
        }

        try {
            const dataToSend = new FormData();
            dataToSend.append('name', name);
            dataToSend.append('email', normalizedEmail);
            dataToSend.append('password', password);
            dataToSend.append('role', role);
            dataToSend.append('collegeName', collegeName);
            dataToSend.append('skills', skills);

            if (role === 'student') {
                dataToSend.append('cgpa', String(Number(cgpa)));
            }

            if (role === 'alumni') {
                dataToSend.append('graduationYear', graduationYear);
                dataToSend.append('experience', experience);
                dataToSend.append('linkedin', linkedin);
                if (alumniProofFile) {
                    dataToSend.append('alumniProof', alumniProofFile);
                }
            }

            await api.post('/auth/register', dataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert(`Registration successful! Please check ${normalizedEmail} to verify your account.`);
            navigate('/login');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-theme flex min-h-screen items-center justify-center bg-black px-4 py-4 relative overflow-hidden">
            <style>
                {`
                    .register-theme .register-card,
                    .register-theme .register-info {
                        border-color: rgba(255, 255, 255, 0.12) !important;
                        background-color: rgba(18, 22, 32, 0.85) !important;
                        backdrop-filter: blur(10px);
                    }

                    .register-theme .register-card input,
                    .register-theme .register-card select,
                    .register-theme .register-card textarea {
                        background-color: rgba(255, 255, 255, 0.05) !important;
                        border-color: rgba(255, 255, 255, 0.18) !important;
                        color: #f9fafb !important;
                    }

                    .register-theme .register-card select option {
                        background-color: #121620 !important;
                        color: #f9fafb !important;
                    }

                    .register-theme .register-card input::placeholder,
                    .register-theme .register-card textarea::placeholder {
                        color: #94a3b8 !important;
                    }

                    .register-theme .register-card .text-gray-900,
                    .register-theme .register-card .text-gray-800,
                    .register-theme .register-card .text-gray-700 {
                        color: #f3f4f6 !important;
                    }

                    .register-theme .register-card .text-gray-600,
                    .register-theme .register-card .text-gray-500 {
                        color: #9ca3af !important;
                    }

                    .register-theme .register-card .bg-blue-100 {
                        background-color: rgba(59, 130, 246, 0.2) !important;
                    }

                    .register-theme .register-card .text-blue-800,
                    .register-theme .register-card .text-blue-600 {
                        color: #93c5fd !important;
                    }

                    .register-theme .register-card .hover\\:text-blue-700:hover {
                        color: #bfdbfe !important;
                    }
                `}
            </style>
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.08),transparent_38%),radial-gradient(circle_at_90%_0%,rgba(245,158,11,0.08),transparent_34%)]"></div>
            </div>

            <div className="relative w-full max-w-2xl">
                {/* Register Card */}
                <div className="register-card overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                    <div className="px-8 py-10">
                        {/* Header */}
                        <div className="mb-8 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700">
                                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
                            <p className="mt-2 text-gray-600">Join our mentorship community</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                                <svg className="h-5 w-5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {/* Registration Form */}
                        <form onSubmit={onSubmit} className="space-y-5">
                            {/* Name and Role */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={name}
                                        onChange={onChange}
                                        required
                                        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 placeholder-gray-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        I am a <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="role"
                                        value={role}
                                        onChange={onChange}
                                        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    >
                                        <option value="student" className="bg-white text-gray-900">Student</option>
                                        <option value="alumni" className="bg-white text-gray-900">Alumni</option>
                                    </select>
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                     Email <span className="text-red-500">*</span>
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
                                        className="block w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-3 text-gray-900 placeholder-gray-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        placeholder=""
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-600">
                                    {role === 'alumni'
                                        ? 'Alumni: use Gmail only (@gmail.com). Your email must exist in alumni records.'
                                        : 'Students: use institute email only (@tsecedu.org).'}
                                </p>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Password <span className="text-red-500">*</span>
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
                                        className="block w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-3 text-gray-900 placeholder-gray-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        placeholder="Create a strong password"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-600">Minimum 8 characters recommended</p>
                            </div>

                            {/* College Name (Required for both) */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    College Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="collegeName"
                                    value={collegeName}
                                    onChange={onChange}
                                    required
                                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 placeholder-gray-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    placeholder="e.g., Thadomal Shahani Engineering College"
                                />
                            </div>

                            {role === 'student' && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        CGPA <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="cgpa"
                                        value={cgpa}
                                        onChange={onChange}
                                        required={role === 'student'}
                                        min="0"
                                        max="10"
                                        step="0.01"
                                        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 placeholder-gray-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        placeholder="e.g., 8.25"
                                    />
                                    <p className="mt-1 text-xs text-gray-600">CGPA can be set only at registration and cannot be edited later.</p>
                                </div>
                            )}

                            {/* Alumni-specific fields */}
                            {role === 'alumni' && (
                                <>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Graduation Year <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="graduationYear"
                                                value={graduationYear}
                                                onChange={onChange}
                                                required={role === 'alumni'}
                                                min="1950"
                                                max="2030"
                                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 placeholder-gray-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                placeholder="2024"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Experience (Years) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="experience"
                                                value={experience}
                                                onChange={onChange}
                                                required={role === 'alumni'}
                                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 placeholder-gray-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                placeholder="e.g., 3 years"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            LinkedIn Profile <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="url"
                                            name="linkedin"
                                            value={linkedin}
                                            onChange={onChange}
                                            required={role === 'alumni'}
                                            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 placeholder-gray-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            placeholder="https://www.linkedin.com/in/your-profile"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Marksheet / Graduation Certificate <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="file"
                                            name="alumniProof"
                                            onChange={onFileChange}
                                            required={role === 'alumni'}
                                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 transition-all file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        />
                                        <p className="mt-1 text-xs text-gray-600">Upload PDF, image, or document (max 10MB).</p>
                                    </div>
                                </>
                            )}

                            {/* Skills (Required for both) */}
                            {/* Skills (Required for both) */}
                            {/* Skills (Required for both) */}
<div>
    <label className="mb-2 block text-sm font-medium text-gray-700">
        Skills <span className="text-red-500">*</span>
    </label>
    <div className="relative">
        <select
            name="skills"
            value={skills.split(',').map(s => s.trim()).filter(s => s)}
            onChange={onChange}
            multiple
            required
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-32 appearance-none"
            size={5}
        >
            <option value="" disabled className="text-gray-500 bg-gray-100">
                Hold Ctrl (Cmd on Mac) to select multiple skills
            </option>
            {techSkills.map((skill, index) => (
                <option key={index} value={skill}>
                    {skill}
                </option>
            ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </div>
    </div>
    <div className="mt-2 flex flex-wrap gap-2">
        {skills.split(',').filter(s => s.trim()).map((skill, index) => (
            <span key={index} className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                {skill.trim()}
                <button
                    type="button"
                    onClick={() => {
                        const currentSkills = skills.split(',').map(s => s.trim()).filter(s => s);
                        const updatedSkills = currentSkills.filter(s => s !== skill.trim());
                        setFormData(prev => ({
                            ...prev,
                            skills: updatedSkills.join(', ')
                        }));
                    }}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                >
                    ×
                </button>
            </span>
        ))}
    </div>
    <p className="mt-2 text-xs text-gray-600">
        Hold Ctrl (Cmd on Mac) to select multiple skills. {skills.split(',').filter(s => s.trim()).length} skill(s) selected
    </p>
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
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link to="/login" className="font-semibold text-blue-600 transition-colors hover:text-blue-700">
                                    Sign in instead
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Info Notice */}
                <div className="register-info mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                        <svg className="h-5 w-5 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="text-sm font-semibold text-blue-800">Registration Process</h3>
                            <p className="mt-1 text-xs text-blue-700">
                                After submitting, a verification email is sent to your registered email if it passes validation.
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
