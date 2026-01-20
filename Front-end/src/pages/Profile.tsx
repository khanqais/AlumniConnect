import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface WorkExperience {
    id: string;
    company: string;
    jobTitle: string;
    startDate: string;
    endDate: string;
    currentlyWorking: boolean;
    description: string;
}

interface UserProfile {
    _id: string;
    name: string;
    email: string;
    role: string;
    collegeName: string;
    graduationYear?: number;
    skills: string[];
    bio: string;
    avatar: string;
    linkedin: string;
    github: string;
    twitter: string;
    website: string;
    workExperience: WorkExperience[];
    createdAt: string;
}

const Profile = () => {
    const { userId } = useParams<{ userId?: string }>();
    const { user: currentUser, updateUser } = useAuth();
    const navigate = useNavigate();
    
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        skills: [] as string[],
        linkedin: '',
        github: '',
        twitter: '',
        website: '',
        graduationYear: '',
        workExperience: [] as WorkExperience[],
    });

    const [newExperience, setNewExperience] = useState<WorkExperience>({
        id: '',
        company: '',
        jobTitle: '',
        startDate: '',
        endDate: '',
        currentlyWorking: false,
        description: '',
    });

    const isOwnProfile = !userId || userId === currentUser?._id;

    useEffect(() => {
        fetchProfile();
    }, [userId, currentUser]);

    const fetchProfile = async () => {
        try {
            const endpoint = userId 
                ? `http://localhost:5000/api/profile/${userId}`
                : 'http://localhost:5000/api/profile/me/profile';
                
            const response = await axios.get(endpoint, {
                headers: currentUser?.token ? {
                    Authorization: `Bearer ${currentUser.token}`
                } : {}
            });
            
            const userData = response.data.user;
            setProfile(userData);
            setFormData({
                name: userData.name || '',
                bio: userData.bio || '',
                skills: userData.skills || [],
                linkedin: userData.linkedin || '',
                github: userData.github || '',
                twitter: userData.twitter || '',
                website: userData.website || '',
                graduationYear: userData.graduationYear || '',
                workExperience: userData.workExperience || [],
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const skillsArray = e.target.value.split(',').map(s => s.trim()).filter(s => s);
        setFormData({
            ...formData,
            skills: skillsArray
        });
    };

    const handleExperienceChange = (index: number, field: keyof WorkExperience, value: string | boolean) => {
        const updatedExperiences = [...formData.workExperience];
        updatedExperiences[index] = {
            ...updatedExperiences[index],
            [field]: value
        };
        setFormData({
            ...formData,
            workExperience: updatedExperiences
        });
    };

    const handleNewExperienceChange = (field: keyof WorkExperience, value: string | boolean) => {
        setNewExperience({
            ...newExperience,
            [field]: value
        });
    };

    const addExperience = () => {
        if (!newExperience.company || !newExperience.jobTitle || !newExperience.startDate) {
            alert('Please fill in at least company, job title, and start date');
            return;
        }

        const experienceToAdd = {
            ...newExperience,
            id: Date.now().toString()
        };

        setFormData({
            ...formData,
            workExperience: [...formData.workExperience, experienceToAdd]
        });

        // Reset new experience form
        setNewExperience({
            id: '',
            company: '',
            jobTitle: '',
            startDate: '',
            endDate: '',
            currentlyWorking: false,
            description: '',
        });
    };

    const removeExperience = (id: string) => {
        setFormData({
            ...formData,
            workExperience: formData.workExperience.filter(exp => exp.id !== id)
        });
    };

    const handleSave = async () => {
        try {
            const response = await axios.put(
                'http://localhost:5000/api/profile/me/profile',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${currentUser?.token}`
                    }
                }
            );
            
            setProfile(response.data.user);
            updateUser({ name: formData.name });
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        
        setUploadingAvatar(true);
        const formData = new FormData();
        formData.append('avatar', e.target.files[0]);

        try {
            const response = await axios.post(
                'http://localhost:5000/api/profile/me/avatar',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${currentUser?.token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            
            if (profile) {
                setProfile({ ...profile, avatar: response.data.avatar });
            }
            alert('Avatar uploaded successfully!');
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Failed to upload avatar');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-4 text-lg font-semibold text-gray-700">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
                <div className="text-center">
                    <p className="text-lg text-gray-700">Profile not found</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-2 font-semibold text-white transition-all hover:from-blue-700 hover:to-indigo-800"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-blue-100 blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-indigo-100 blur-3xl"></div>
            </div>

            <div className="relative z-10 mx-auto max-w-4xl px-4 py-8">
                {/* Profile Header */}
                <div className="overflow-hidden rounded-2xl bg-white backdrop-blur-xl shadow-xl border border-gray-200">
                    {/* Cover/Header with Name */}
                    <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                        <div className="absolute bottom-6 left-6">
                            <div className="flex items-end gap-6">
                                {/* Avatar */}
                                <div className="relative">
                                    {profile.avatar ? (
                                        <img
                                            src={`http://localhost:5000/${profile.avatar}`}
                                            alt={profile.name}
                                            className="h-32 w-32 rounded-full border-4 border-white bg-white object-cover shadow-lg"
                                        />
                                    ) : (
                                        <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                                            <span className="text-4xl font-bold text-white">
                                                {getInitials(profile.name)}
                                            </span>
                                        </div>
                                    )}

                                    {isOwnProfile && !isEditing && (
                                        <label className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-blue-600 shadow-lg transition-all hover:bg-blue-50">
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleAvatarUpload}
                                                disabled={uploadingAvatar}
                                            />
                                            {uploadingAvatar ? (
                                                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : (
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            )}
                                        </label>
                                    )}
                                </div>

                                {/* Name and Info in Blue Area */}
                                <div className="text-white">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="mb-2 rounded-lg border border-white/30 bg-white/20 px-4 py-2 text-3xl font-bold text-white focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
                                            placeholder="Enter your name"
                                        />
                                    ) : (
                                        <h1 className="text-3xl font-bold">{profile.name}</h1>
                                    )}
                                    
                                    <div className="flex items-center gap-4 text-lg">
                                        <span className="flex items-center gap-1">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            {profile.email}
                                        </span>
                                        <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
                                            {profile.role}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 pb-6 pt-20">
                        {/* Edit Button */}
                        {isOwnProfile && (
                            <div className="mb-6 text-right">
                                {isEditing ? (
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={handleSave}
                                            className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-2 font-semibold text-white transition-all hover:from-blue-700 hover:to-indigo-800"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                fetchProfile();
                                            }}
                                            className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Content */}
                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                    {/* Left Column - About and Experiences */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Bio */}
                        <div className="rounded-xl bg-white shadow-md p-6 border border-gray-200">
                            <h2 className="mb-4 text-xl font-bold text-gray-900">About</h2>
                            {isEditing ? (
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Tell us about yourself..."
                                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    maxLength={500}
                                />
                            ) : (
                                <p className="text-gray-700">
                                    {profile.bio || 'No bio added yet.'}
                                </p>
                            )}
                        </div>

                        {/* Skills */}
                        <div className="rounded-xl bg-white shadow-md p-6 border border-gray-200">
                            <h2 className="mb-4 text-xl font-bold text-gray-900">Skills</h2>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.skills.join(', ')}
                                    onChange={handleSkillsChange}
                                    placeholder="JavaScript, Python, React (comma-separated)"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.length > 0 ? (
                                        profile.skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 border border-blue-200"
                                            >
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-500">No skills added yet.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Work Experience */}
                        <div className="rounded-xl bg-white shadow-md p-6 border border-gray-200">
                            <h2 className="mb-4 text-xl font-bold text-gray-900">Work Experience</h2>
                            
                            {isEditing ? (
                                <div className="space-y-6">
                                    {/* Existing Experiences */}
                                    {formData.workExperience.map((exp, index) => (
                                        <div key={exp.id} className="rounded-lg border border-gray-200 p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="space-y-1">
                                                    <input
                                                        type="text"
                                                        value={exp.jobTitle}
                                                        onChange={(e) => handleExperienceChange(index, 'jobTitle', e.target.value)}
                                                        placeholder="Job Title"
                                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1 text-lg font-semibold text-gray-900 focus:border-blue-500 focus:outline-none"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={exp.company}
                                                        onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                                                        placeholder="Company"
                                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1 text-gray-700 focus:border-blue-500 focus:outline-none"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeExperience(exp.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                                    <input
                                                        type="month"
                                                        value={exp.startDate}
                                                        onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1 text-gray-900 focus:border-blue-500 focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="month"
                                                            value={exp.currentlyWorking ? '' : exp.endDate}
                                                            onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                                                            disabled={exp.currentlyWorking}
                                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1 text-gray-900 focus:border-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                                        />
                                                        <label className="flex items-center gap-1 text-sm">
                                                            <input
                                                                type="checkbox"
                                                                checked={exp.currentlyWorking}
                                                                onChange={(e) => handleExperienceChange(index, 'currentlyWorking', e.target.checked)}
                                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <span className="text-gray-700">Currently</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <textarea
                                                value={exp.description}
                                                onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                                                placeholder="Describe your role and responsibilities..."
                                                rows={3}
                                                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 focus:border-blue-500 focus:outline-none"
                                            />
                                        </div>
                                    ))}

                                    {/* Add New Experience Form */}
                                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-4">
                                        <h3 className="mb-3 text-lg font-semibold text-gray-900">Add New Experience</h3>
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <input
                                                    type="text"
                                                    value={newExperience.jobTitle}
                                                    onChange={(e) => handleNewExperienceChange('jobTitle', e.target.value)}
                                                    placeholder="Job Title"
                                                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                                                />
                                                <input
                                                    type="text"
                                                    value={newExperience.company}
                                                    onChange={(e) => handleNewExperienceChange('company', e.target.value)}
                                                    placeholder="Company"
                                                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <input
                                                    type="month"
                                                    value={newExperience.startDate}
                                                    onChange={(e) => handleNewExperienceChange('startDate', e.target.value)}
                                                    placeholder="Start Date"
                                                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                                                />
                                                <div className="space-y-2">
                                                    <input
                                                        type="month"
                                                        value={newExperience.currentlyWorking ? '' : newExperience.endDate}
                                                        onChange={(e) => handleNewExperienceChange('endDate', e.target.value)}
                                                        disabled={newExperience.currentlyWorking}
                                                        placeholder="End Date"
                                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                                    />
                                                    <label className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={newExperience.currentlyWorking}
                                                            onChange={(e) => handleNewExperienceChange('currentlyWorking', e.target.checked)}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm text-gray-700">I currently work here</span>
                                                    </label>
                                                </div>
                                            </div>
                                            <textarea
                                                value={newExperience.description}
                                                onChange={(e) => handleNewExperienceChange('description', e.target.value)}
                                                placeholder="Describe your role and responsibilities..."
                                                rows={3}
                                                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 focus:border-blue-500 focus:outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={addExperience}
                                                className="w-full rounded-lg border border-blue-600 bg-white px-4 py-2 font-semibold text-blue-600 hover:bg-blue-50"
                                            >
                                                + Add Experience
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {profile.workExperience && profile.workExperience.length > 0 ? (
                                        profile.workExperience.map((exp, index) => (
                                            <div key={index} className="border-l-2 border-blue-500 pl-4 py-1">
                                                <h3 className="text-lg font-semibold text-gray-900">{exp.jobTitle}</h3>
                                                <p className="text-gray-700">{exp.company}</p>
                                                <p className="text-sm text-gray-600">
                                                    {formatDate(exp.startDate)} - {exp.currentlyWorking ? 'Present' : formatDate(exp.endDate)}
                                                </p>
                                                {exp.description && (
                                                    <p className="mt-2 text-gray-700">{exp.description}</p>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500">No work experience added yet.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Info & Links */}
                    <div className="space-y-6">
                        {/* Details */}
                        <div className="rounded-xl bg-white shadow-md p-6 border border-gray-200">
                            <h2 className="mb-4 text-xl font-bold text-gray-900">Details</h2>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="font-medium text-gray-600">College</p>
                                    <p className="text-gray-900">{profile.collegeName}</p>
                                </div>
                                {profile.graduationYear && (
                                    <div>
                                        <p className="font-medium text-gray-600">Graduation Year</p>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                name="graduationYear"
                                                value={formData.graduationYear}
                                                onChange={handleInputChange}
                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1 text-gray-900 focus:border-blue-500 focus:outline-none"
                                                min="1950"
                                                max="2030"
                                            />
                                        ) : (
                                            <p className="text-gray-900">{profile.graduationYear}</p>
                                        )}
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium text-gray-600">Member Since</p>
                                    <p className="text-gray-900">
                                        {new Date(profile.createdAt).toLocaleDateString('en-US', {
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="rounded-xl bg-white shadow-md p-6 border border-gray-200">
                            <h2 className="mb-4 text-xl font-bold text-gray-900">Social Links</h2>
                            <div className="space-y-3">
                                {isEditing ? (
                                    <>
                                        <input
                                            type="url"
                                            name="linkedin"
                                            value={formData.linkedin}
                                            onChange={handleInputChange}
                                            placeholder="LinkedIn URL"
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                                        />
                                        <input
                                            type="url"
                                            name="github"
                                            value={formData.github}
                                            onChange={handleInputChange}
                                            placeholder="GitHub URL"
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                                        />
                                        <input
                                            type="url"
                                            name="twitter"
                                            value={formData.twitter}
                                            onChange={handleInputChange}
                                            placeholder="Twitter URL"
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                                        />
                                        <input
                                            type="url"
                                            name="website"
                                            value={formData.website}
                                            onChange={handleInputChange}
                                            placeholder="Website URL"
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                                        />
                                    </>
                                ) : (
                                    <>
                                        {profile.linkedin && (
                                            <a
                                                href={profile.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                                            >
                                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                                </svg>
                                                LinkedIn
                                            </a>
                                        )}
                                        {profile.github && (
                                            <a
                                                href={profile.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                                            >
                                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.840 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.430.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                                </svg>
                                                GitHub
                                            </a>
                                        )}
                                        {profile.twitter && (
                                            <a
                                                href={profile.twitter}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                                            >
                                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                                </svg>
                                                Twitter
                                            </a>
                                        )}
                                        {profile.website && (
                                            <a
                                                href={profile.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                                            >
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                                </svg>
                                                Website
                                            </a>
                                        )}
                                        {!profile.linkedin && !profile.github && !profile.twitter && !profile.website && (
                                            <p className="text-sm text-gray-500">No social links added yet.</p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;