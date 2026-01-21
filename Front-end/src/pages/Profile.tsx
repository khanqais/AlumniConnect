import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';

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
                <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-blue-100 blur-3xl opacity-50"></div>
                <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-indigo-100 blur-3xl opacity-50"></div>
            </div>

            <Navigation />

            {/* Header Navigation */}
            <header className="relative z-10 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="font-medium">Back to Dashboard</span>
                        </button>
                        {isOwnProfile && !isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-all hover:bg-gray-50"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Edit Profile
                            </button>
                        )}
                        {isEditing && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        fetchProfile();
                                    }}
                                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-all hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2 font-medium text-white transition-all hover:from-blue-700 hover:to-indigo-800"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Profile Header Card */}
                <div className="overflow-hidden rounded-2xl bg-white shadow-lg border border-gray-200">
                    {/* Cover Banner */}
                    <div className="h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 relative">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                        }}></div>
                    </div>

                    {/* Profile Info Section */}
                    <div className="relative px-6 pb-6">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                            {/* Avatar and Basic Info */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
                                {/* Avatar */}
                                <div className="relative -mt-16 sm:-mt-20">
                                    {profile.avatar ? (
                                        <img
                                            src={`http://localhost:5000/${profile.avatar}`}
                                            alt={profile.name}
                                            className="h-32 w-32 sm:h-40 sm:w-40 rounded-2xl border-4 border-white bg-white object-cover shadow-xl ring-4 ring-gray-100"
                                        />
                                    ) : (
                                        <div className="flex h-32 w-32 sm:h-40 sm:w-40 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl ring-4 ring-gray-100">
                                            <span className="text-4xl sm:text-5xl font-bold text-white">
                                                {getInitials(profile.name)}
                                            </span>
                                        </div>
                                    )}

                                    {isOwnProfile && !isEditing && (
                                        <label className="absolute bottom-2 right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-white text-blue-600 shadow-lg transition-all hover:bg-blue-50 hover:scale-105 border border-gray-200">
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

                                {/* Name and Info */}
                                <div className="pt-4 sm:pb-4">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="mb-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-2xl sm:text-3xl font-bold text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter your name"
                                        />
                                    ) : (
                                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{profile.name}</h1>
                                    )}
                                    
                                    <div className="mt-2 flex flex-wrap items-center gap-3 text-gray-600">
                                        <span className="flex items-center gap-1.5 text-sm sm:text-base">
                                            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            {profile.role === 'alumni' ? 'Alumni' : 'Student'}
                                        </span>
                                        <span className="text-gray-300">•</span>
                                        <span className="flex items-center gap-1.5 text-sm sm:text-base">
                                            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            {profile.collegeName}
                                        </span>
                                        {profile.graduationYear && (
                                            <>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-sm sm:text-base">Class of {profile.graduationYear}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons - Hidden on mobile when editing */}
                            {!isOwnProfile && (
                                <div className="flex flex-wrap gap-2 sm:pb-4">
                                    <button 
                                        onClick={() => navigate('/chat')}
                                        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2.5 font-medium text-white transition-all hover:from-blue-700 hover:to-indigo-800 shadow-sm"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        Message
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* About Section */}
                        <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
                            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                                <h2 className="text-lg font-semibold text-gray-900">About</h2>
                            </div>
                            <div className="p-6">
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            rows={5}
                                            placeholder="Write a brief introduction about yourself, your interests, and what you're looking for..."
                                            className="w-full rounded-lg border border-gray-300 bg-white p-4 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                            maxLength={500}
                                        />
                                        <p className="text-xs text-gray-500 text-right">{formData.bio.length}/500 characters</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-700 leading-relaxed">
                                        {profile.bio || (
                                            <span className="text-gray-400 italic">
                                                No bio added yet. {isOwnProfile && 'Click "Edit Profile" to add your introduction.'}
                                            </span>
                                        )}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Skills & Expertise Section */}
                        <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
                            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                                <h2 className="text-lg font-semibold text-gray-900">Skills & Expertise</h2>
                            </div>
                            <div className="p-6">
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={formData.skills.join(', ')}
                                            onChange={handleSkillsChange}
                                            placeholder="JavaScript, Python, React, Machine Learning, Data Analysis (comma-separated)"
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <p className="text-xs text-gray-500">Separate skills with commas</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {profile.skills.length > 0 ? (
                                            profile.skills.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 px-4 py-2 text-sm font-medium text-blue-900 transition-all hover:from-blue-100 hover:to-indigo-100"
                                                >
                                                    {skill}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 italic">
                                                No skills added yet. {isOwnProfile && 'Add your skills to help others find you.'}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Work Experience */}
                        <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
                            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                                <h2 className="text-lg font-semibold text-gray-900">Work Experience</h2>
                            </div>
                            <div className="p-6">
                                {isEditing ? (
                                    <div className="space-y-6">
                                        {/* Existing Experiences */}
                                        {formData.workExperience.map((exp, index) => (
                                            <div key={exp.id} className="rounded-xl border border-gray-200 bg-gray-50 p-5 hover:border-gray-300 transition-colors">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex-1 space-y-3">
                                                        <input
                                                            type="text"
                                                            value={exp.jobTitle}
                                                            onChange={(e) => handleExperienceChange(index, 'jobTitle', e.target.value)}
                                                            placeholder="Job Title (e.g., Software Engineer)"
                                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-base font-semibold text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={exp.company}
                                                            onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                                                            placeholder="Company Name"
                                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExperience(exp.id)}
                                                        className="ml-3 rounded-lg p-2 text-red-500 hover:bg-red-50 transition-colors"
                                                        title="Remove experience"
                                                    >
                                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                                        <input
                                                            type="month"
                                                            value={exp.startDate}
                                                            onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                                        <input
                                                            type="month"
                                                            value={exp.currentlyWorking ? '' : exp.endDate}
                                                            onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                                                            disabled={exp.currentlyWorking}
                                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                                                        />
                                                        <label className="flex items-center gap-2 mt-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={exp.currentlyWorking}
                                                                onChange={(e) => handleExperienceChange(index, 'currentlyWorking', e.target.checked)}
                                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                                            />
                                                            <span className="text-sm text-gray-700">I currently work here</span>
                                                        </label>
                                                    </div>
                                                </div>
                                                
                                                <textarea
                                                    value={exp.description}
                                                    onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                                                    placeholder="Describe your key responsibilities and achievements..."
                                                    rows={3}
                                                    className="w-full rounded-lg border border-gray-300 bg-white p-4 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                />
                                            </div>
                                        ))}

                                        {/* Add New Experience Form */}
                                        <div className="rounded-xl border-2 border-dashed border-gray-300 p-6 hover:border-blue-400 transition-colors bg-white">
                                            <div className="flex items-center gap-2 mb-4">
                                                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                <h3 className="text-base font-semibold text-gray-900">Add New Experience</h3>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <input
                                                        type="text"
                                                        value={newExperience.jobTitle}
                                                        onChange={(e) => handleNewExperienceChange('jobTitle', e.target.value)}
                                                        placeholder="Job Title"
                                                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={newExperience.company}
                                                        onChange={(e) => handleNewExperienceChange('company', e.target.value)}
                                                        placeholder="Company Name"
                                                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <input
                                                        type="month"
                                                        value={newExperience.startDate}
                                                        onChange={(e) => handleNewExperienceChange('startDate', e.target.value)}
                                                        placeholder="Start Date"
                                                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <div className="space-y-2">
                                                        <input
                                                            type="month"
                                                            value={newExperience.currentlyWorking ? '' : newExperience.endDate}
                                                            onChange={(e) => handleNewExperienceChange('endDate', e.target.value)}
                                                            disabled={newExperience.currentlyWorking}
                                                            placeholder="End Date"
                                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-100"
                                                        />
                                                        <label className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={newExperience.currentlyWorking}
                                                                onChange={(e) => handleNewExperienceChange('currentlyWorking', e.target.checked)}
                                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                                            />
                                                            <span className="text-sm text-gray-700">I currently work here</span>
                                                        </label>
                                                    </div>
                                                </div>
                                                <textarea
                                                    value={newExperience.description}
                                                    onChange={(e) => handleNewExperienceChange('description', e.target.value)}
                                                    placeholder="Describe your role, responsibilities, and key achievements..."
                                                    rows={3}
                                                    className="w-full rounded-lg border border-gray-300 bg-white p-4 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={addExperience}
                                                    className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2.5 font-medium text-white hover:from-blue-700 hover:to-indigo-800 transition-all shadow-sm"
                                                >
                                                    Add Experience
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {profile.workExperience && profile.workExperience.length > 0 ? (
                                            profile.workExperience.map((exp, index) => (
                                                <div key={index} className="relative pl-8 pb-6 last:pb-0">
                                                    {/* Timeline connector */}
                                                    <div className="absolute left-0 top-2 h-full w-px bg-gradient-to-b from-blue-500 to-indigo-500 last:bg-gradient-to-b last:from-blue-500 last:to-transparent"></div>
                                                    {/* Timeline dot */}
                                                    <div className="absolute left-0 top-2 -translate-x-1/2 h-4 w-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 ring-4 ring-white shadow-sm"></div>
                                                    
                                                    <div className="space-y-2">
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-900">{exp.jobTitle}</h3>
                                                            <p className="text-base text-gray-700 font-medium">{exp.company}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            <span>
                                                                {formatDate(exp.startDate)} - {exp.currentlyWorking ? <span className="font-medium text-blue-600">Present</span> : formatDate(exp.endDate)}
                                                            </span>
                                                        </div>
                                                        {exp.description && (
                                                            <p className="text-gray-700 leading-relaxed mt-3">{exp.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <p className="mt-2 text-gray-400 italic">
                                                    No work experience added yet. {isOwnProfile && 'Click "Edit Profile" to add your experience.'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Profile Details Card */}
                        <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
                            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                                <h2 className="text-lg font-semibold text-gray-900">Profile Details</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                                        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</p>
                                        <p className="text-sm text-gray-900 break-all">{profile.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                                        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Institution</p>
                                        <p className="text-sm text-gray-900">{profile.collegeName}</p>
                                    </div>
                                </div>

                                {profile.graduationYear && (
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                                            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Graduation</p>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    name="graduationYear"
                                                    value={formData.graduationYear}
                                                    onChange={handleInputChange}
                                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    min="1950"
                                                    max="2030"
                                                    placeholder="Year"
                                                />
                                            ) : (
                                                <p className="text-sm text-gray-900">Class of {profile.graduationYear}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                                        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Member Since</p>
                                        <p className="text-sm text-gray-900">
                                            {new Date(profile.createdAt).toLocaleDateString('en-US', {
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Links Card */}
                        <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
                            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                                <h2 className="text-lg font-semibold text-gray-900">Connect</h2>
                            </div>
                            <div className="p-6">
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1.5">LinkedIn</label>
                                            <input
                                                type="url"
                                                name="linkedin"
                                                value={formData.linkedin}
                                                onChange={handleInputChange}
                                                placeholder="https://linkedin.com/in/username"
                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1.5">GitHub</label>
                                            <input
                                                type="url"
                                                name="github"
                                                value={formData.github}
                                                onChange={handleInputChange}
                                                placeholder="https://github.com/username"
                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Twitter</label>
                                            <input
                                                type="url"
                                                name="twitter"
                                                value={formData.twitter}
                                                onChange={handleInputChange}
                                                placeholder="https://twitter.com/username"
                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Website</label>
                                            <input
                                                type="url"
                                                name="website"
                                                value={formData.website}
                                                onChange={handleInputChange}
                                                placeholder="https://yourwebsite.com"
                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {profile.linkedin && (
                                            <a
                                                href={profile.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 group"
                                            >
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white group-hover:bg-blue-100 transition-colors">
                                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium">LinkedIn</p>
                                                    <p className="text-xs text-gray-500 truncate">View profile</p>
                                                </div>
                                                <svg className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        )}
                                        {profile.github && (
                                            <a
                                                href={profile.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 group"
                                            >
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white group-hover:bg-blue-100 transition-colors">
                                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.840 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.430.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium">GitHub</p>
                                                    <p className="text-xs text-gray-500 truncate">View repositories</p>
                                                </div>
                                                <svg className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        )}
                                        {profile.twitter && (
                                            <a
                                                href={profile.twitter}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 group"
                                            >
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white group-hover:bg-blue-100 transition-colors">
                                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium">Twitter</p>
                                                    <p className="text-xs text-gray-500 truncate">Follow on Twitter</p>
                                                </div>
                                                <svg className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        )}
                                        {profile.website && (
                                            <a
                                                href={profile.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 group"
                                            >
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white group-hover:bg-blue-100 transition-colors">
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium">Website</p>
                                                    <p className="text-xs text-gray-500 truncate">Visit website</p>
                                                </div>
                                                <svg className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        )}
                                        {!profile.linkedin && !profile.github && !profile.twitter && !profile.website && (
                                            <div className="text-center py-8">
                                                <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                </svg>
                                                <p className="mt-2 text-sm text-gray-400 italic">
                                                    No social links added yet.
                                                </p>
                                                {isOwnProfile && (
                                                    <p className="mt-1 text-xs text-gray-400">
                                                        Add links to help others connect with you.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
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