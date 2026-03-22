import { useEffect, useState } from 'react';
import api from '../config/api';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2, Shield, Upload, User, Calendar, Building2, GraduationCap, LinkIcon, Phone } from 'lucide-react';

const AlumniSupport = () => {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
    }, []);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        collegeName: '',
        graduationYear: '',
        branch: '',
        enrollmentNumber: '',
        dateOfBirth: '',
        experience: '',
        skills: '',
        linkedin: '',
        contactNumber: '',
        alternateEmail: ''
    });
    const [alumniProofFile, setAlumniProofFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
        const { name, value } = e.target;
        
        if (name === 'skills' && e.target instanceof HTMLSelectElement) {
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
        }

        if (error) {
            setError('');
        }
        if (success) {
            setSuccess('');
        }
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setAlumniProofFile(file);
        if (error) {
            setError('');
        }
        if (success) {
            setSuccess('');
        }
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const dataToSend = new FormData();
            
            // Add all form fields
            Object.entries(formData).forEach(([key, value]) => {
                if (value) {
                    dataToSend.append(key, value);
                }
            });

            // Add file if provided
            if (alumniProofFile) {
                dataToSend.append('alumniProof', alumniProofFile);
            }

            const response = await api.post('/auth/manual-verification', dataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setSuccess(response.data.message);
                // Reset form after successful submission
                setFormData({
                    name: '',
                    email: '',
                    collegeName: '',
                    graduationYear: '',
                    branch: '',
                    enrollmentNumber: '',
                    dateOfBirth: '',
                    experience: '',
                    skills: '',
                    linkedin: '',
                    contactNumber: '',
                    alternateEmail: ''
                });
                setAlumniProofFile(null);
            } else {
                setError(response.data.message || 'Something went wrong');
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to submit verification request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-black px-4 py-4 relative overflow-hidden">
            <div className="relative w-full max-w-2xl">
                {/* Alumni Support Card */}
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121620]/85 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                    <div className="px-8 py-10">
                        {/* Header */}
                        <div className="mb-8 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700">
                                <Shield className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-white">Alumni Verification Support</h2>
                            <p className="mt-2 text-gray-400">
                                Can't access your institute email? Submit a manual verification request with alternative identification.
                            </p>
                        </div>

                        {/* Success Message */}
                        {success && (
                            <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                                <svg className="h-5 w-5 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-green-700">{success}</p>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {/* Manual Verification Form */}
                        <form onSubmit={onSubmit} className="space-y-5">
                            {/* Personal Information */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <User className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={onChange}
                                            required
                                            className="block w-full rounded-lg border border-white/15 bg-white/5 py-3 pl-10 pr-3 text-gray-100 placeholder-gray-500 transition-all focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">
                                        Current Email <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <Mail className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={onChange}
                                            required
                                            className="block w-full rounded-lg border border-white/15 bg-white/5 py-3 pl-10 pr-3 text-gray-100 placeholder-gray-500 transition-all focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                                            placeholder="you@gmail.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* College Information */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">
                                        College Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="collegeName"
                                        value={formData.collegeName}
                                        onChange={onChange}
                                        required
                                        className="block w-full rounded-lg border border-white/15 bg-white/5 px-3 py-3 text-gray-100 placeholder-gray-500 transition-all focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                                        placeholder="Thadomal Shahani Engineering College"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">
                                        Graduation Year <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="graduationYear"
                                        value={formData.graduationYear}
                                        onChange={onChange}
                                        required
                                        min="1950"
                                        max="2030"
                                        className="block w-full rounded-lg border border-white/15 bg-white/5 px-3 py-3 text-gray-100 placeholder-gray-500 transition-all focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                                        placeholder="2024"
                                    />
                                </div>
                            </div>

                            {/* Alternative Identifiers */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">
                                        Branch/Department
                                    </label>
                                    <input
                                        type="text"
                                        name="branch"
                                        value={formData.branch}
                                        onChange={onChange}
                                        className="block w-full rounded-lg border border-white/15 bg-white/5 px-3 py-3 text-gray-100 placeholder-gray-500 transition-all focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                                        placeholder="Computer Engineering"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">
                                        Enrollment Number
                                    </label>
                                    <input
                                        type="text"
                                        name="enrollmentNumber"
                                        value={formData.enrollmentNumber}
                                        onChange={onChange}
                                        className="block w-full rounded-lg border border-white/15 bg-white/5 px-3 py-3 text-gray-100 placeholder-gray-500 transition-all focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                                        placeholder="TS123456789"
                                    />
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">
                                        Alternate Email
                                    </label>
                                    <input
                                        type="email"
                                        name="alternateEmail"
                                        value={formData.alternateEmail}
                                        onChange={onChange}
                                        className="block w-full rounded-lg border border-white/15 bg-white/5 px-3 py-3 text-gray-100 placeholder-gray-500 transition-all focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                                        placeholder="backup@gmail.com"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">
                                        Contact Number
                                    </label>
                                    <input
                                        type="text"
                                        name="contactNumber"
                                        value={formData.contactNumber}
                                        onChange={onChange}
                                        className="block w-full rounded-lg border border-white/15 bg-white/5 px-3 py-3 text-gray-100 placeholder-gray-500 transition-all focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>

                            {/* Professional Information */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">
                                        Experience (Years)
                                    </label>
                                    <input
                                        type="text"
                                        name="experience"
                                        value={formData.experience}
                                        onChange={onChange}
                                        className="block w-full rounded-lg border border-white/15 bg-white/5 px-3 py-3 text-gray-100 placeholder-gray-500 transition-all focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                                        placeholder="5 years"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">
                                        LinkedIn Profile
                                    </label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <LinkIcon className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <input
                                            type="url"
                                            name="linkedin"
                                            value={formData.linkedin}
                                            onChange={onChange}
                                            className="block w-full rounded-lg border border-white/15 bg-white/5 py-3 pl-10 pr-3 text-gray-100 placeholder-gray-500 transition-all focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                                            placeholder="https://linkedin.com/in/your-profile"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Skills */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-300">
                                    Skills
                                </label>
                                <select
                                    name="skills"
                                    value={formData.skills.split(',').map(s => s.trim()).filter(s => s)}
                                    onChange={onChange}
                                    multiple
                                    className="block w-full rounded-lg border border-white/15 bg-white/5 px-3 py-3 text-gray-100 transition-all focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 h-32 appearance-none"
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
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {formData.skills.split(',').filter(s => s.trim()).map((skill, index) => (
                                        <span key={index} className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-300">
                                            {skill.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Document Upload */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-300">
                                    Proof Document (Degree Certificate, Marksheet, or ID Card) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Upload className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="file"
                                        name="alumniProof"
                                        onChange={onFileChange}
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        className="block w-full rounded-lg border border-white/15 bg-white/5 py-3 pl-10 pr-3 text-sm text-gray-100 transition-all file:mr-4 file:rounded-md file:border-0 file:bg-amber-500 file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#111827] hover:file:bg-amber-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-400">
                                    Upload PDF, image, or document (max 10MB). This helps us verify your alumni status.
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
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Submitting Request...
                                        </>
                                    ) : (
                                        <>
                                            Submit Verification Request
                                            <Shield className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>

                        {/* Info Notice */}
                        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50/10 p-4 backdrop-blur-sm">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-400" />
                                <div>
                                    <h3 className="text-sm font-semibold text-amber-300">Important Notes</h3>
                                    <ul className="mt-1 text-xs text-amber-200 space-y-1">
                                        <li>• We'll review your request within 24-48 hours</li>
                                        <li>• All communications will be sent to your current email</li>
                                        <li>• Please ensure your documents are clear and readable</li>
                                        <li>• You can submit up to 3 requests per 24 hours</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Back to Register */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-400">
                                Have your institute email?{' '}
                                <a href="/register" className="font-semibold text-blue-400 transition-colors hover:text-blue-300">
                                    Go back to standard registration
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlumniSupport;