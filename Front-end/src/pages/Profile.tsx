import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface UserProfile {
    _id: string;
    name: string;
    email: string;
    role: string;
    collegeName: string;
    graduationYear?: number;
    experience?: string;
    skills: string[];
    bio: string;
    avatar: string;
    linkedin: string;
    github: string;
    twitter: string;
    website: string;
    company: string;
    jobTitle: string;
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
        company: '',
        jobTitle: '',
        graduationYear: '',
        experience: '',
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
            
            setProfile(response.data.user);
            setFormData({
                name: response.data.user.name || '',
                bio: response.data.user.bio || '',
                skills: response.data.user.skills || [],
                linkedin: response.data.user.linkedin || '',
                github: response.data.user.github || '',
                twitter: response.data.user.twitter || '',
                website: response.data.user.website || '',
                company: response.data.user.company || '',
                jobTitle: response.data.user.jobTitle || '',
                graduationYear: response.data.user.graduationYear || '',
                experience: response.data.user.experience || '',
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const skillsArray = e.target.value.split(',').map(s => s.trim()).filter(s => s);
        setFormData({
            ...formData,
            skills: skillsArray
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

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
                    <p className="mt-4 text-lg font-semibold text-white">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-center">
                    <p className="text-lg text-white">Profile not found</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-700"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-purple-600/30 blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-pink-600/30 blur-3xl"></div>
            </div>

            <div className="relative z-10 mx-auto max-w-4xl px-4 py-8">
                {/* Profile Header */}
                <div className="overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl shadow-2xl border border-white/10">
                    {/* Cover/Header */}
                    <div className="h-32 bg-gradient-to-r from-purple-600 to-pink-600"></div>

                    <div className="relative px-6 pb-6">
                        {/* Avatar */}
                        <div className="relative -mt-16 flex items-end gap-6">
                            <div className="relative">
                                {profile.avatar ? (
                                    <img
                                        src={`http://localhost:5000/${profile.avatar}`}
                                        alt={profile.name}
                                        className="h-32 w-32 rounded-full border-4 border-slate-900 bg-white object-cover shadow-lg"
                                    />
                                ) : (
                                    <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-slate-900 bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg">
                                        <span className="text-4xl font-bold text-white">
                                            {getInitials(profile.name)}
                                        </span>
                                    </div>
                                )}

                                {isOwnProfile && !isEditing && (
                                    <label className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transition-all hover:from-purple-700 hover:to-pink-700">
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

                            <div className="flex-1 pb-4">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-2xl font-bold text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                ) : (
                                    <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                                )}

                                {!isEditing && profile.jobTitle && (
                                    <p className="text-lg text-gray-300">{profile.jobTitle}</p>
                                )}
                                {!isEditing && profile.company && (
                                    <p className="text-gray-400">{profile.company}</p>
                                )}

                                <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        {profile.email}
                                    </span>
                                    <span className="rounded-full bg-purple-600/30 px-3 py-1 text-purple-300 border border-purple-500/30">
                                        {profile.role}
                                    </span>
                                </div>
                            </div>

                            {isOwnProfile && (
                                <div className="pb-4">
                                    {isEditing ? (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleSave}
                                                className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-700"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    fetchProfile();
                                                }}
                                                className="rounded-lg border border-white/20 px-6 py-2 font-semibold text-gray-300 hover:bg-white/10"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="rounded-lg border border-white/20 px-6 py-2 font-semibold text-gray-300 hover:bg-white/10"
                                        >
                                            Edit Profile
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Content */}
                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                    {/* Left Column - About */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Bio */}
                        <div className="rounded-xl bg-white/10 backdrop-blur-xl p-6 shadow-xl border border-white/10">
                            <h2 className="mb-4 text-xl font-bold text-white">About</h2>
                            {isEditing ? (
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Tell us about yourself..."
                                    className="w-full rounded-lg border border-white/20 bg-white/10 p-3 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    maxLength={500}
                                />
                            ) : (
                                <p className="text-gray-300">
                                    {profile.bio || 'No bio added yet.'}
                                </p>
                            )}
                        </div>

                        {/* Skills */}
                        <div className="rounded-xl bg-white/10 backdrop-blur-xl p-6 shadow-xl border border-white/10">
                            <h2 className="mb-4 text-xl font-bold text-white">Skills</h2>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.skills.join(', ')}
                                    onChange={handleSkillsChange}
                                    placeholder="JavaScript, Python, React (comma-separated)"
                                    className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.length > 0 ? (
                                        profile.skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="rounded-full bg-purple-600/30 px-4 py-2 text-sm font-medium text-purple-300 border border-purple-500/30"
                                            >
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-400">No skills added yet.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Experience (Alumni only) */}
                        {profile.role === 'alumni' && (
                            <div className="rounded-xl bg-white/10 backdrop-blur-xl p-6 shadow-xl border border-white/10">
                                <h2 className="mb-4 text-xl font-bold text-white">Experience</h2>
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-300">
                                                Job Title
                                            </label>
                                            <input
                                                type="text"
                                                name="jobTitle"
                                                value={formData.jobTitle}
                                                onChange={handleInputChange}
                                                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                placeholder="e.g., Software Engineer"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-300">
                                                Company
                                            </label>
                                            <input
                                                type="text"
                                                name="company"
                                                value={formData.company}
                                                onChange={handleInputChange}
                                                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                placeholder="e.g., Google"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-300">
                                                Years of Experience
                                            </label>
                                            <input
                                                type="text"
                                                name="experience"
                                                value={formData.experience}
                                                onChange={handleInputChange}
                                                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                placeholder="e.g., 3 years"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {profile.experience && (
                                            <p className="text-gray-300">{profile.experience} of experience</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Info & Links */}
                    <div className="space-y-6">
                        {/* Details */}
                        <div className="rounded-xl bg-white/10 backdrop-blur-xl p-6 shadow-xl border border-white/10">
                            <h2 className="mb-4 text-xl font-bold text-white">Details</h2>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="font-medium text-gray-400">College</p>
                                    <p className="text-white">{profile.collegeName}</p>
                                </div>
                                {profile.graduationYear && (
                                    <div>
                                        <p className="font-medium text-gray-400">Graduation Year</p>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                name="graduationYear"
                                                value={formData.graduationYear}
                                                onChange={handleInputChange}
                                                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-white focus:border-purple-500 focus:outline-none"
                                            />
                                        ) : (
                                            <p className="text-white">{profile.graduationYear}</p>
                                        )}
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium text-gray-400">Member Since</p>
                                    <p className="text-white">
                                        {new Date(profile.createdAt).toLocaleDateString('en-US', {
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="rounded-xl bg-white/10 backdrop-blur-xl p-6 shadow-xl border border-white/10">
                            <h2 className="mb-4 text-xl font-bold text-white">Social Links</h2>
                            <div className="space-y-3">
                                {isEditing ? (
                                    <>
                                        <input
                                            type="url"
                                            name="linkedin"
                                            value={formData.linkedin}
                                            onChange={handleInputChange}
                                            placeholder="LinkedIn URL"
                                            className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                                        />
                                        <input
                                            type="url"
                                            name="github"
                                            value={formData.github}
                                            onChange={handleInputChange}
                                            placeholder="GitHub URL"
                                            className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                                        />
                                        <input
                                            type="url"
                                            name="twitter"
                                            value={formData.twitter}
                                            onChange={handleInputChange}
                                            placeholder="Twitter URL"
                                            className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                                        />
                                        <input
                                            type="url"
                                            name="website"
                                            value={formData.website}
                                            onChange={handleInputChange}
                                            placeholder="Website URL"
                                            className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                                        />
                                    </>
                                ) : (
                                    <>
                                        {profile.linkedin && (
                                            <a
                                                href={profile.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors"
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
                                                className="flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors"
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
                                                className="flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors"
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
                                                className="flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors"
                                            >
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                                </svg>
                                                Website
                                            </a>
                                        )}
                                        {!profile.linkedin && !profile.github && !profile.twitter && !profile.website && (
                                            <p className="text-sm text-gray-400">No social links added yet.</p>
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
