import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../config/api';
import Navigation from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import {
    AlertTriangle,
    Building2,
    Calendar,
    CheckCircle,
    ChevronRight,
    Clock,
    Plus,
    Star,
    Upload,
    Users,
    X,
} from 'lucide-react';

type Role = 'alumni' | 'student' | 'admin';
type AppStatus = 'pending' | 'reviewed' | 'referred' | 'rejected';
type ReferralStatus = 'open' | 'closed' | 'filled';
type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

interface Referral {
    _id: string;
    postedBy: {
        _id: string;
        name: string;
        email: string;
        company?: string;
        jobTitle?: string;
        avatar?: string;
    };
    company: string;
    jobTitle: string;
    jobDescription: string;
    jobLink?: string;
    requiredSkills: string[];
    eligibleBranches: string[];
    minCGPA: number;
    eligibleYears: number[];
    maxApplications: number;
    deadline: string;
    status: ReferralStatus;
    applicationsCount: number;
    createdAt: string;
}

interface ScoreBreakdown {
    skillsMatch: number;
    projectDepth: number;
    educationMatch: number;
    resumeCompleteness: number;
    cgpaScore: number;
    fraudPenalty: number;
}

interface ReferralApplication {
    _id: string;
    referral: {
        _id: string;
        company: string;
        jobTitle: string;
        status?: ReferralStatus;
        deadline?: string;
        postedBy?: {
            name?: string;
            avatar?: string;
        };
    };
    student?: {
        _id: string;
        name: string;
        avatar?: string;
        branch?: string;
        graduationYear?: number;
        cgpa?: number;
    };
    fitScore: ScoreBreakdown;
    totalScore: number;
    fraudFlags: string[];
    status: AppStatus;
    appliedAt?: string;
    createdAt?: string;
    resumeUrl?: string;
    coverNote?: string;
    projectLinks?: Array<{ title: string; url: string; type: 'github' | 'deployed' | 'other' }>;
}

interface ProjectLinkItem {
    title: string;
    url: string;
    type: 'github';
}

const API_BASE = 'http://localhost:5000';

const scoreWeights = [
    { label: 'Required skills match', key: 'skillsMatch', weight: 30 },
    { label: 'Projects/experience depth', key: 'projectDepth', weight: 25 },
    { label: 'Education match', key: 'educationMatch', weight: 15 },
    { label: 'Resume completeness', key: 'resumeCompleteness', weight: 10 },
    { label: 'CGPA/eligibility threshold', key: 'cgpaScore', weight: 10 },
    { label: 'Fraud risk penalty', key: 'fraudPenalty', weight: -10 },
] as const;

const initialCreateForm = {
    company: '',
    jobTitle: '',
    jobDescription: '',
    jobLink: '',
    requiredSkills: '',
    eligibleBranches: '',
    minCGPA: '',
    eligibleYears: '',
    maxApplications: '50',
    deadline: '',
};

const scoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-300';
    if (score >= 45) return 'text-amber-300';
    return 'text-red-300';
};

const scoreBarColor = (score: number) => {
    if (score >= 70) return 'from-emerald-400 to-emerald-500';
    if (score >= 45) return 'from-amber-400 to-amber-500';
    return 'from-red-400 to-red-500';
};

const resolveFileUrl = (url?: string) => {
    if (!url) return '#';
    if (/^https?:\/\//i.test(url)) return url;
    return `${API_BASE}/${url.replace(/^\/+/, '')}`;
};

const sanitizeResumeDownloadName = (url: string) => {
    try {
        const parsedUrl = new URL(resolveFileUrl(url));
        const rawName = decodeURIComponent(parsedUrl.pathname.split('/').pop() || 'resume');
        const nameWithoutTimestamp = rawName.replace(/^\d+-/, '');
        const hasExtension = /\.[a-zA-Z0-9]{2,6}$/.test(nameWithoutTimestamp);
        return hasExtension ? nameWithoutTimestamp : `${nameWithoutTimestamp}.pdf`;
    } catch {
        return 'resume.pdf';
    }
};

const getFileNameFromDisposition = (headerValue?: string) => {
    if (!headerValue) return '';
    const match = headerValue.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
    const encodedName = match?.[1];
    const plainName = match?.[2];
    if (encodedName) {
        try {
            return decodeURIComponent(encodedName);
        } catch {
            return encodedName;
        }
    }
    return plainName || '';
};

const statusBadge = (status: string) => {
    if (status === 'pending') return 'border-amber-400/30 bg-amber-500/10 text-amber-300';
    if (status === 'reviewed') return 'border-blue-400/30 bg-blue-500/10 text-blue-300';
    if (status === 'referred') return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300';
    if (status === 'rejected') return 'border-red-400/30 bg-red-500/10 text-red-300';
    if (status === 'open') return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300';
    if (status === 'filled') return 'border-purple-400/30 bg-purple-500/10 text-purple-300';
    return 'border-white/15 bg-white/5 text-gray-300';
};

const toCsvList = (input: string) =>
    input
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

const toNumberList = (input: string) =>
    input
        .split(',')
        .map((item) => Number(item.trim()))
        .filter((item) => !Number.isNaN(item));

const CircularScore = ({ score }: { score: number }) => {
    const clamped = Math.max(0, Math.min(100, score));
    return (
        <div
            className="grid h-16 w-16 place-items-center rounded-full"
            style={{
                background: `conic-gradient(rgba(251,191,36,0.95) ${clamped * 3.6}deg, rgba(255,255,255,0.08) ${clamped * 3.6}deg)`,
            }}
        >
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[#121620] text-sm font-semibold text-white">{Math.round(clamped)}</div>
        </div>
    );
};

export default function Referrals() {
    const { user } = useAuth();
    const role = user?.role as Role | undefined;

    const [activeTab, setActiveTab] = useState<'browse' | 'myListings' | 'myApplications'>(
        role === 'alumni' ? 'myListings' : 'browse'
    );
    const [loadingBrowse, setLoadingBrowse] = useState(true);
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [myListings, setMyListings] = useState<Referral[]>([]);
    const [myApplications, setMyApplications] = useState<ReferralApplication[]>([]);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createSubmitting, setCreateSubmitting] = useState(false);
    const [createForm, setCreateForm] = useState(initialCreateForm);

    const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [existingApplication, setExistingApplication] = useState<{
        _id: string;
        status: AppStatus;
        totalScore: number;
    } | null>(null);

    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [coverNote, setCoverNote] = useState('');
    const [projectLinks, setProjectLinks] = useState<ProjectLinkItem[]>([{ title: '', url: '', type: 'github' }]);
    const [skillRatings, setSkillRatings] = useState<Array<{ skill: string; level: SkillLevel }>>([]);
    const [cgpaConfirmed, setCgpaConfirmed] = useState(false);
    const [applySubmitting, setApplySubmitting] = useState(false);
    const [applyResult, setApplyResult] = useState<ReferralApplication | null>(null);

    const [selectedListing, setSelectedListing] = useState<Referral | null>(null);
    const [listingApplications, setListingApplications] = useState<ReferralApplication[]>([]);
    const [loadingApplications, setLoadingApplications] = useState(false);

    const downloadResume = async (applicationId: string, resumeUrl?: string) => {
        if (!applicationId) return;
        try {
            const response = await api.get(
                `${API_BASE}/api/referrals/applications/${applicationId}/resume/download`,
                {
                    headers: authHeaders,
                    responseType: 'blob',
                }
            );
            const blobUrl = window.URL.createObjectURL(response.data);
            const anchor = document.createElement('a');
            anchor.href = blobUrl;
            const contentDisposition = response.headers['content-disposition'] as string | undefined;
            const fileName =
                getFileNameFromDisposition(contentDisposition) ||
                sanitizeResumeDownloadName(resumeUrl || 'resume.pdf');
            anchor.download = fileName;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Resume download failed:', error);
            alert('Failed to download resume');
        }
    };

    const authHeaders = useMemo(
        () => ({ Authorization: `Bearer ${user?.token || ''}` }),
        [user?.token]
    );

    const fetchReferrals = useCallback(async () => {
        if (!user?.token) return;
        try {
            setLoadingBrowse(true);
            const params = new URLSearchParams();
            params.append('limit', '30');

            const { data } = await api.get(`${API_BASE}/api/referrals?${params.toString()}`, {
                headers: authHeaders,
            });
            setReferrals(data?.referrals || []);
        } catch (error) {
            console.error('Failed to load referrals:', error);
            setReferrals([]);
        } finally {
            setLoadingBrowse(false);
        }
    }, [authHeaders, user?.token]);

    const fetchMyListings = useCallback(async () => {
        if (!user?.token || role !== 'alumni') return;
        try {
            const { data } = await api.get(`${API_BASE}/api/referrals/my-listings`, {
                headers: authHeaders,
            });
            setMyListings(data?.referrals || []);
        } catch (error) {
            console.error('Failed to load listings:', error);
            setMyListings([]);
        }
    }, [authHeaders, role, user?.token]);

    const fetchMyApplications = useCallback(async () => {
        if (!user?.token || role !== 'student') return;
        try {
            const { data } = await api.get(`${API_BASE}/api/referrals/my-applications`, {
                headers: authHeaders,
            });
            setMyApplications(data?.applications || []);
        } catch (error) {
            console.error('Failed to load applications:', error);
            setMyApplications([]);
        }
    }, [authHeaders, role, user?.token]);

    useEffect(() => {
        if (role === 'student') {
            fetchReferrals();
        }
    }, [fetchReferrals, role]);

    useEffect(() => {
        if (role === 'alumni' && activeTab !== 'myListings') {
            setActiveTab('myListings');
        }

        if (role === 'student' && activeTab === 'myListings') {
            setActiveTab('browse');
        }
    }, [activeTab, role]);

    useEffect(() => {
        if (role === 'alumni') fetchMyListings();
        if (role === 'student') fetchMyApplications();
    }, [fetchMyApplications, fetchMyListings, role]);

    const openReferralDetail = async (referral: Referral) => {
        setSelectedReferral(referral);
        setApplyResult(null);
        setExistingApplication(null);
        setResumeFile(null);
        setCoverNote('');
        setProjectLinks([{ title: '', url: '', type: 'github' }]);
        setCgpaConfirmed(false);
        setSkillRatings(referral.requiredSkills.map((skill) => ({ skill, level: 'intermediate' })));

        if (role !== 'student' || !user?.token) return;

        try {
            setLoadingDetail(true);
            const { data } = await api.get(`${API_BASE}/api/referrals/${referral._id}`, {
                headers: authHeaders,
            });
            setExistingApplication(data?.existingApplication || null);
        } catch (error) {
            console.error('Failed to load referral detail:', error);
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleCreateReferral = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!user?.token || role !== 'alumni') return;

        try {
            setCreateSubmitting(true);
            await api.post(
                `${API_BASE}/api/referrals`,
                {
                    company: createForm.company,
                    jobTitle: createForm.jobTitle,
                    jobDescription: createForm.jobDescription,
                    jobLink: createForm.jobLink,
                    requiredSkills: toCsvList(createForm.requiredSkills),
                    eligibleBranches: toCsvList(createForm.eligibleBranches),
                    minCGPA: Number(createForm.minCGPA || 0),
                    eligibleYears: toNumberList(createForm.eligibleYears),
                    maxApplications: Number(createForm.maxApplications || 50),
                    deadline: createForm.deadline,
                },
                { headers: authHeaders }
            );

            setShowCreateModal(false);
            setCreateForm(initialCreateForm);
            fetchMyListings();
            fetchReferrals();
        } catch (error: any) {
            alert(error?.response?.data?.message || 'Failed to create referral');
        } finally {
            setCreateSubmitting(false);
        }
    };

    const handleApply = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!user?.token || role !== 'student' || !selectedReferral) return;
        if (!resumeFile) {
            alert('Resume is required');
            return;
        }

        if (selectedReferral.minCGPA > 0 && !cgpaConfirmed) {
            alert('Please confirm your CGPA consent to continue.');
            return;
        }

        const sanitizedLinks = projectLinks
            .filter((item) => item.title.trim() && item.url.trim())
            .map((item) => ({
                title: item.title.trim(),
                url: item.url.trim(),
                type: 'github' as const,
            }));

        try {
            setApplySubmitting(true);
            const formData = new FormData();
            formData.append('resume', resumeFile);
            formData.append('coverNote', coverNote.slice(0, 500));
            formData.append('projectLinks', JSON.stringify(sanitizedLinks));
            formData.append('skillSelfRatings', JSON.stringify(skillRatings));
            formData.append('cgpaConfirmed', String(cgpaConfirmed));

            const { data } = await api.post(
                `${API_BASE}/api/referrals/${selectedReferral._id}/apply`,
                formData,
                {
                    headers: {
                        ...authHeaders,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            setApplyResult(data?.application || null);
            fetchMyApplications();
            fetchReferrals();
        } catch (error: any) {
            alert(error?.response?.data?.message || 'Application failed');
        } finally {
            setApplySubmitting(false);
        }
    };

    const fetchListingApplications = async (listing: Referral) => {
        if (!user?.token || role !== 'alumni') return;
        try {
            setSelectedListing(listing);
            setLoadingApplications(true);
            const { data } = await api.get(`${API_BASE}/api/referrals/${listing._id}/applications?sortBy=totalScore&limit=10&page=1`, {
                headers: authHeaders,
            });
            const sorted = [...(data?.applications || [])].sort(
                (a, b) => (b.totalScore || 0) - (a.totalScore || 0)
            );
            setListingApplications(sorted);
        } catch (error) {
            console.error('Failed to load listing applications:', error);
            setListingApplications([]);
        } finally {
            setLoadingApplications(false);
        }
    };

    const handleUpdateApplicationStatus = async (appId: string, status: AppStatus) => {
        if (!user?.token || role !== 'alumni') return;
        try {
            await api.put(
                `${API_BASE}/api/referrals/applications/${appId}/status`,
                { status },
                { headers: authHeaders }
            );
            if (selectedListing) {
                fetchListingApplications(selectedListing);
            }
        } catch (error: any) {
            alert(error?.response?.data?.message || 'Failed to update status');
        }
    };

    const handleDeleteOrCloseListing = async (listingId: string) => {
        if (!user?.token || role !== 'alumni') return;
        if (!window.confirm('Delete/close this referral listing?')) return;

        try {
            const { data } = await api.delete(`${API_BASE}/api/referrals/${listingId}`, { headers: authHeaders });

            if (data?.action === 'deleted') {
                setMyListings((prev) => prev.filter((listing) => listing._id !== listingId));
                if (selectedListing?._id === listingId) {
                    setSelectedListing(null);
                    setListingApplications([]);
                }
            } else if (data?.action === 'closed') {
                setMyListings((prev) =>
                    prev.map((listing) =>
                        listing._id === listingId ? { ...listing, status: 'closed' } : listing
                    )
                );
                if (selectedListing?._id === listingId) {
                    setSelectedListing((prev) =>
                        prev ? { ...prev, status: 'closed' } : prev
                    );
                }
            }

            if (selectedListing?._id === listingId && data?.action !== 'closed') {
                setSelectedListing(null);
                setListingApplications([]);
            }

            alert(data?.message || 'Listing updated successfully');
            fetchMyListings();
            fetchReferrals();
        } catch (error: any) {
            alert(error?.response?.data?.message || 'Failed to delete/close listing');
        }
    };

    const handleListingStatusUpdate = async (listing: Referral, status: ReferralStatus) => {
        if (!user?.token || role !== 'alumni') return;
        try {
            await api.put(
                `${API_BASE}/api/referrals/${listing._id}`,
                { status },
                { headers: authHeaders }
            );
            fetchMyListings();
            fetchReferrals();
        } catch (error: any) {
            alert(error?.response?.data?.message || 'Failed to update listing status');
        }
    };

    const alreadyAppliedSet = useMemo(
        () => new Set(myApplications.map((application) => application.referral?._id).filter(Boolean)),
        [myApplications]
    );

    return (
        <div className="min-h-screen bg-[#0A0D14] text-gray-200">
            <Navigation />
            <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%270%200%20200%20200%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.65%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E')] opacity-[0.03] z-0 mix-blend-overlay" />
            <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px] z-0" />

            <main className="relative z-10 mx-auto max-w-7xl px-4 py-8">
                <div className="mb-6 rounded-2xl border border-white/10 bg-[#121620]/85 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Referral Hub</h1>
                            <p className="mt-1 text-sm text-gray-400">Browse, apply, and manage referrals with fit scoring and fraud checks.</p>
                        </div>
                        {role === 'alumni' && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-medium text-[#0A0D14]"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Create Referral
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="mb-6 flex flex-wrap gap-2 border-b border-white/10">
                    {role === 'student' && (
                        <button
                            onClick={() => setActiveTab('browse')}
                            className={`rounded-t-lg px-4 py-2 text-sm font-medium ${
                                activeTab === 'browse'
                                    ? 'border-b-2 border-amber-400 bg-amber-500/10 text-amber-300'
                                    : 'text-gray-400 hover:text-gray-200'
                            }`}
                        >
                            Browse Referrals
                        </button>
                    )}
                    {role === 'alumni' && (
                        <button
                            onClick={() => setActiveTab('myListings')}
                            className={`rounded-t-lg px-4 py-2 text-sm font-medium ${
                                activeTab === 'myListings'
                                    ? 'border-b-2 border-amber-400 bg-amber-500/10 text-amber-300'
                                    : 'text-gray-400 hover:text-gray-200'
                            }`}
                        >
                            My Listings
                        </button>
                    )}
                    {role === 'student' && (
                        <button
                            onClick={() => setActiveTab('myApplications')}
                            className={`rounded-t-lg px-4 py-2 text-sm font-medium ${
                                activeTab === 'myApplications'
                                    ? 'border-b-2 border-amber-400 bg-amber-500/10 text-amber-300'
                                    : 'text-gray-400 hover:text-gray-200'
                            }`}
                        >
                            My Applications
                        </button>
                    )}
                </div>

                {activeTab === 'browse' && role === 'student' && (
                    <>
                        {loadingBrowse ? (
                            <div className="rounded-2xl border border-white/10 bg-[#121620]/85 p-10 text-center text-gray-400">Loading referrals...</div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {referrals.map((referral) => {
                                    const isClosed = referral.status !== 'open' || new Date(referral.deadline).getTime() < Date.now();
                                    const alreadyApplied = alreadyAppliedSet.has(referral._id);

                                    return (
                                        <div
                                            key={referral._id}
                                            className="rounded-2xl border border-white/10 bg-[#121620]/85 p-5 shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
                                        >
                                            <div className="mb-3 flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                                                        <Building2 className="h-5 w-5 text-amber-300" />
                                                        {referral.company}
                                                    </h3>
                                                    <p className="text-sm text-amber-300">{referral.jobTitle}</p>
                                                </div>
                                                <span className={`rounded-full border px-2.5 py-1 text-xs ${statusBadge(referral.status)}`}>
                                                    {referral.status}
                                                </span>
                                            </div>

                                            <p className="mb-4 line-clamp-3 text-sm text-gray-300">{referral.jobDescription}</p>

                                            <div className="mb-4 flex flex-wrap gap-2">
                                                {referral.requiredSkills.slice(0, 5).map((skill) => (
                                                    <span key={skill} className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-xs text-gray-200">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {referral.requiredSkills.length > 5 && (
                                                    <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-xs text-gray-300">
                                                        +{referral.requiredSkills.length - 5}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="space-y-1.5 text-xs text-gray-400">
                                                <p className="flex items-center gap-2">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    Deadline: {new Date(referral.deadline).toLocaleDateString()}
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <Users className="h-3.5 w-3.5" />
                                                    Applications: {referral.applicationsCount}/{referral.maxApplications}
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    Min CGPA: {referral.minCGPA || 0}
                                                </p>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                                                <p className="text-xs text-gray-400">By {referral.postedBy?.name || 'Alumni'}</p>
                                                <button
                                                    onClick={() => openReferralDetail(referral)}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300"
                                                >
                                                    {role === 'student' && !isClosed && !alreadyApplied ? 'View & Apply' : 'View'}
                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            {role === 'student' && (isClosed || alreadyApplied) && (
                                                <p className="mt-2 text-xs text-gray-400">
                                                    {alreadyApplied ? 'Already applied for this referral.' : 'This referral is currently closed.'}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {!loadingBrowse && referrals.length === 0 && (
                            <div className="mt-4 rounded-2xl border border-white/10 bg-[#121620]/85 p-8 text-center text-gray-400">No referrals found for current filters.</div>
                        )}
                    </>
                )}

                {activeTab === 'myListings' && role === 'alumni' && (
                    <div className="space-y-4">
                        {selectedListing ? (
                            <div className="rounded-2xl border border-white/10 bg-[#121620]/85 p-5 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <button
                                            onClick={() => {
                                                setSelectedListing(null);
                                                setListingApplications([]);
                                            }}
                                            className="mb-2 text-xs text-amber-300"
                                        >
                                            ← Back to listings
                                        </button>
                                        <h2 className="text-xl font-semibold text-white">
                                            {selectedListing.company} · {selectedListing.jobTitle}
                                        </h2>
                                        <p className="text-sm text-gray-400">Applications sorted by fit score</p>
                                    </div>
                                </div>

                                {loadingApplications ? (
                                    <div className="text-sm text-gray-400">Loading applications...</div>
                                ) : listingApplications.length === 0 ? (
                                    <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-gray-400">No applications yet.</div>
                                ) : (
                                    <div className="space-y-4">
                                        {listingApplications.map((application) => (
                                            <div key={application._id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                                                <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                                                    <div className="flex-1">
                                                        <div className="mb-2 flex flex-wrap items-center gap-2">
                                                            <p className="text-base font-semibold text-white">{application.student?.name || 'Student'}</p>
                                                            <span className={`rounded-full border px-2 py-0.5 text-xs ${statusBadge(application.status)}`}>
                                                                {application.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-400">
                                                            Branch: {application.student?.branch || 'N/A'} · CGPA: {application.student?.cgpa ?? 'N/A'}
                                                        </p>
                                                        {application.coverNote && (
                                                            <p className="mt-2 rounded-lg border border-white/10 bg-[#0A0D14] p-2 text-sm text-gray-300">{application.coverNote}</p>
                                                        )}

                                                        {application.projectLinks && application.projectLinks.length > 0 && (
                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                {application.projectLinks.map((link, index) => (
                                                                    <a
                                                                        key={`${link.url}-${index}`}
                                                                        href={link.url}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs text-amber-300"
                                                                    >
                                                                        {link.title}
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {application.resumeUrl && (
                                                            <button
                                                                type="button"
                                                                onClick={() => downloadResume(application._id, application.resumeUrl)}
                                                                className="mt-3 inline-flex text-xs text-amber-300"
                                                            >
                                                                Download resume
                                                            </button>
                                                        )}

                                                        {application.fraudFlags?.length > 0 && (
                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                {application.fraudFlags.map((flag) => (
                                                                    <span
                                                                        key={flag}
                                                                        className="inline-flex items-center gap-1 rounded-full border border-red-400/30 bg-red-500/10 px-2 py-1 text-xs text-red-300"
                                                                    >
                                                                        <AlertTriangle className="h-3 w-3" />
                                                                        {flag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="w-full rounded-xl border border-white/10 bg-[#0A0D14] p-3 lg:w-72">
                                                        <div className="mb-3 flex items-center justify-between">
                                                            <span className="text-xs text-gray-400">Total score</span>
                                                            <span className={`text-lg font-bold ${scoreColor(application.totalScore || 0)}`}>
                                                                {(application.totalScore || 0).toFixed(1)}
                                                            </span>
                                                        </div>
                                                        <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/10">
                                                            <div
                                                                className={`h-full bg-gradient-to-r ${scoreBarColor(application.totalScore || 0)}`}
                                                                style={{ width: `${Math.max(0, Math.min(100, application.totalScore || 0))}%` }}
                                                            />
                                                        </div>
                                                        <div className="space-y-1 text-[11px] text-gray-300">
                                                            {scoreWeights.map((weight) => (
                                                                <div key={weight.key} className="flex items-center justify-between">
                                                                    <span className="text-gray-400">{weight.label} ({weight.weight}%)</span>
                                                                    <span>
                                                                        {((application.fitScore as any)?.[weight.key] || 0).toFixed(1)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <select
                                                            value={application.status}
                                                            onChange={(event) =>
                                                                handleUpdateApplicationStatus(application._id, event.target.value as AppStatus)
                                                            }
                                                            className="mt-4 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-gray-100 focus:border-amber-400 focus:outline-none"
                                                        >
                                                            <option value="pending">pending</option>
                                                            <option value="reviewed">reviewed</option>
                                                            <option value="referred">referred</option>
                                                            <option value="rejected">rejected</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {myListings.map((listing) => (
                                    <div key={listing._id} className="rounded-2xl border border-white/10 bg-[#121620]/85 p-5 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                                        <h3 className="text-lg font-semibold text-white">{listing.company}</h3>
                                        <p className="text-sm text-amber-300">{listing.jobTitle}</p>
                                        <p className="mt-2 text-xs text-gray-400">
                                            {listing.applicationsCount}/{listing.maxApplications} applications
                                        </p>
                                        <p className="text-xs text-gray-500">Deadline: {new Date(listing.deadline).toLocaleDateString()}</p>
                                        <div className="mt-3">
                                            <label className="mb-1 block text-xs text-gray-400">Listing status</label>
                                            <select
                                                value={listing.status}
                                                onChange={(event) => handleListingStatusUpdate(listing, event.target.value as ReferralStatus)}
                                                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-gray-100 focus:border-amber-400 focus:outline-none"
                                            >
                                                <option value="open">open</option>
                                                <option value="closed">closed</option>
                                                <option value="filled">filled</option>
                                            </select>
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() => fetchListingApplications(listing)}
                                                className="flex-1 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-300"
                                            >
                                                View applications
                                            </button>
                                            <button
                                                onClick={() => handleDeleteOrCloseListing(listing._id)}
                                                className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300"
                                            >
                                                Close/Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {myListings.length === 0 && (
                            <div className="rounded-2xl border border-white/10 bg-[#121620]/85 p-8 text-center text-gray-400">
                                You have no referral listings yet.
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'myApplications' && role === 'student' && (
                    <div className="space-y-4">
                        {myApplications.map((application) => (
                            <div key={application._id} className="rounded-2xl border border-white/10 bg-[#121620]/85 p-5 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{application.referral.company}</h3>
                                        <p className="text-sm text-amber-300">{application.referral.jobTitle}</p>
                                        <p className="mt-1 text-xs text-gray-400">
                                            Applied on {new Date(application.appliedAt || application.createdAt || Date.now()).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CircularScore score={application.totalScore || 0} />
                                        <span className={`rounded-full border px-3 py-1 text-xs ${statusBadge(application.status)}`}>
                                            {application.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 grid gap-2 md:grid-cols-2">
                                    {scoreWeights.map((weight) => (
                                        <div key={weight.key} className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0A0D14] px-3 py-2 text-xs">
                                            <span className="text-gray-400">{weight.label} ({weight.weight}%)</span>
                                            <span className="text-gray-200">{((application.fitScore as any)?.[weight.key] || 0).toFixed(1)}</span>
                                        </div>
                                    ))}
                                </div>

                                {application.fraudFlags?.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {application.fraudFlags.map((flag) => (
                                            <span
                                                key={flag}
                                                className="inline-flex items-center gap-1 rounded-full border border-red-400/30 bg-red-500/10 px-2 py-1 text-xs text-red-300"
                                            >
                                                <AlertTriangle className="h-3 w-3" />
                                                {flag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {myApplications.length === 0 && (
                            <div className="rounded-2xl border border-white/10 bg-[#121620]/85 p-8 text-center text-gray-400">
                                You have not applied to any referrals yet.
                            </div>
                        )}
                    </div>
                )}
            </main>

            {showCreateModal && role === 'alumni' && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 px-4">
                    <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#121620] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-white">Create Referral Listing</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-200">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateReferral} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <input
                                    required
                                    value={createForm.company}
                                    onChange={(event) => setCreateForm((prev) => ({ ...prev, company: event.target.value }))}
                                    placeholder="Company"
                                    className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-gray-100 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none"
                                />
                                <input
                                    required
                                    value={createForm.jobTitle}
                                    onChange={(event) => setCreateForm((prev) => ({ ...prev, jobTitle: event.target.value }))}
                                    placeholder="Job Title"
                                    className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-gray-100 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none"
                                />
                            </div>

                            <textarea
                                required
                                value={createForm.jobDescription}
                                onChange={(event) => setCreateForm((prev) => ({ ...prev, jobDescription: event.target.value }))}
                                placeholder="Job Description"
                                rows={4}
                                className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-gray-100 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none"
                            />

                            <input
                                value={createForm.jobLink}
                                onChange={(event) => setCreateForm((prev) => ({ ...prev, jobLink: event.target.value }))}
                                placeholder="Job Link (optional)"
                                className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-gray-100 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none"
                            />

                            <div className="grid gap-4 md:grid-cols-2">
                                <input
                                    required
                                    value={createForm.requiredSkills}
                                    onChange={(event) => setCreateForm((prev) => ({ ...prev, requiredSkills: event.target.value }))}
                                    placeholder="Required skills (comma separated)"
                                    className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-gray-100 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none"
                                />
                                <input
                                    value={createForm.eligibleBranches}
                                    onChange={(event) => setCreateForm((prev) => ({ ...prev, eligibleBranches: event.target.value }))}
                                    placeholder="Eligible branches (comma separated)"
                                    className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-gray-100 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none"
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <input
                                    value={createForm.eligibleYears}
                                    onChange={(event) => setCreateForm((prev) => ({ ...prev, eligibleYears: event.target.value }))}
                                    placeholder="Eligible years (comma separated)"
                                    className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-gray-100 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none"
                                />
                                <input
                                    required
                                    type="date"
                                    value={createForm.deadline}
                                    onChange={(event) => setCreateForm((prev) => ({ ...prev, deadline: event.target.value }))}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-gray-100 focus:border-amber-400 focus:outline-none"
                                    style={{ colorScheme: 'dark' }}
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <input
                                    type="number"
                                    min={0}
                                    max={10}
                                    step={0.1}
                                    value={createForm.minCGPA}
                                    onChange={(event) => setCreateForm((prev) => ({ ...prev, minCGPA: event.target.value }))}
                                    placeholder="Minimum CGPA"
                                    className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-gray-100 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none"
                                />
                                <input
                                    type="number"
                                    min={1}
                                    value={createForm.maxApplications}
                                    onChange={(event) => setCreateForm((prev) => ({ ...prev, maxApplications: event.target.value }))}
                                    placeholder="Max Applications"
                                    className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-gray-100 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={createSubmitting}
                                    type="submit"
                                    className="rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-medium text-[#0A0D14] disabled:opacity-60"
                                >
                                    {createSubmitting ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedReferral && (
                <div className="fixed inset-0 z-[120] overflow-y-auto bg-black/70 px-4 py-8">
                    <div className="mx-auto w-full max-w-4xl rounded-2xl border border-white/10 bg-[#121620] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-semibold text-white">{selectedReferral.company}</h2>
                                <p className="text-sm text-amber-300">{selectedReferral.jobTitle}</p>
                            </div>
                            <button onClick={() => setSelectedReferral(null)} className="text-gray-400 hover:text-gray-200">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-5 grid gap-4 rounded-xl border border-white/10 bg-white/5 p-4 md:grid-cols-2">
                            <p className="text-sm text-gray-300">{selectedReferral.jobDescription}</p>
                            <div className="space-y-2 text-xs text-gray-400">
                                <p className="flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5" />
                                    Deadline: {new Date(selectedReferral.deadline).toLocaleDateString()}
                                </p>
                                <p className="flex items-center gap-2">
                                    <Users className="h-3.5 w-3.5" />
                                    Applications: {selectedReferral.applicationsCount}/{selectedReferral.maxApplications}
                                </p>
                                <p className="flex items-center gap-2">
                                    <Star className="h-3.5 w-3.5" />
                                    Min CGPA: {selectedReferral.minCGPA || 0}
                                </p>
                                {selectedReferral.jobLink && (
                                    <a href={selectedReferral.jobLink} target="_blank" rel="noreferrer" className="text-amber-300">
                                        Open job link
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="mb-4 flex flex-wrap gap-2">
                            {selectedReferral.requiredSkills.map((skill) => (
                                <span key={skill} className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-xs text-gray-200">
                                    {skill}
                                </span>
                            ))}
                        </div>

                        {role === 'student' && (
                            <>
                                {loadingDetail ? (
                                    <p className="text-sm text-gray-400">Checking eligibility and existing application...</p>
                                ) : existingApplication ? (
                                    <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-300">
                                        You already applied to this referral. Current status: {existingApplication.status} · Score: {existingApplication.totalScore?.toFixed?.(1) ?? existingApplication.totalScore}
                                    </div>
                                ) : applyResult ? (
                                    <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-center">
                                        <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full border border-emerald-400/40 bg-emerald-500/20 text-emerald-300">
                                            <CheckCircle className="h-6 w-6" />
                                        </div>
                                        <p className="font-medium text-emerald-300">Application submitted successfully</p>
                                        <p className={`mt-1 text-lg font-semibold ${scoreColor(applyResult.totalScore || 0)}`}>
                                            Total fit score: {(applyResult.totalScore || 0).toFixed(1)} / 100
                                        </p>
                                        {applyResult.fraudFlags?.length > 0 && (
                                            <div className="mt-3 flex flex-wrap justify-center gap-2">
                                                {applyResult.fraudFlags.map((flag) => (
                                                    <span
                                                        key={flag}
                                                        className="inline-flex items-center gap-1 rounded-full border border-red-400/30 bg-red-500/10 px-2 py-1 text-xs text-red-300"
                                                    >
                                                        <AlertTriangle className="h-3 w-3" />
                                                        {flag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="mt-4 grid gap-2 text-left md:grid-cols-2">
                                            {scoreWeights.map((weight) => (
                                                <div key={weight.key} className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0A0D14] px-3 py-2 text-xs text-gray-300">
                                                    <span className="text-gray-400">{weight.label} ({weight.weight}%)</span>
                                                    <span>{((applyResult.fitScore as any)?.[weight.key] || 0).toFixed(1)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleApply} className="space-y-4">
                                        <div>
                                            <label className="mb-1 block text-sm text-gray-300">Resume (PDF/DOC/DOCX)</label>
                                            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-gray-200">
                                                <Upload className="h-4 w-4 text-amber-300" />
                                                <span>{resumeFile?.name || 'Upload resume file'}</span>
                                                <input
                                                    required
                                                    type="file"
                                                    accept=".pdf,.doc,.docx"
                                                    className="hidden"
                                                    onChange={(event) => setResumeFile(event.target.files?.[0] || null)}
                                                />
                                            </label>
                                        </div>

                                        <textarea
                                            value={coverNote}
                                            onChange={(event) => setCoverNote(event.target.value)}
                                            rows={3}
                                            maxLength={500}
                                            placeholder="Cover note (optional, max 500 chars)"
                                            className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-gray-100 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none"
                                        />

                                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                            <p className="mb-2 text-sm text-gray-200">Project links</p>
                                            <div className="space-y-2">
                                                {projectLinks.map((link, index) => (
                                                    <div key={`project-${index}`} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                                                        <input
                                                            value={link.title}
                                                            onChange={(event) =>
                                                                setProjectLinks((prev) =>
                                                                    prev.map((item, itemIndex) =>
                                                                        itemIndex === index ? { ...item, title: event.target.value } : item
                                                                    )
                                                                )
                                                            }
                                                            placeholder="Project title"
                                                            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none"
                                                        />
                                                        <input
                                                            value={link.url}
                                                            onChange={(event) =>
                                                                setProjectLinks((prev) =>
                                                                    prev.map((item, itemIndex) =>
                                                                        itemIndex === index ? { ...item, url: event.target.value } : item
                                                                    )
                                                                )
                                                            }
                                                            placeholder="https://github.com/..."
                                                            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setProjectLinks((prev) =>
                                                                    prev.length > 1 ? prev.filter((_, itemIndex) => itemIndex !== index) : prev
                                                                )
                                                            }
                                                            className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-300"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setProjectLinks((prev) => [...prev, { title: '', url: '', type: 'github' }])}
                                                className="mt-2 rounded-md border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-300"
                                            >
                                                Add project link
                                            </button>
                                        </div>

                                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                            <p className="mb-2 text-sm text-gray-200">Skill self-ratings</p>
                                            <div className="grid gap-2 md:grid-cols-2">
                                                {(selectedReferral.requiredSkills.length > 0
                                                    ? selectedReferral.requiredSkills
                                                    : ['General']).map((skill) => {
                                                    const current = skillRatings.find((rating) => rating.skill === skill)?.level || 'intermediate';
                                                    return (
                                                        <div key={skill} className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0A0D14] px-3 py-2 text-sm">
                                                            <span className="text-gray-300">{skill}</span>
                                                            <select
                                                                value={current}
                                                                onChange={(event) =>
                                                                    setSkillRatings((prev) => {
                                                                        const rest = prev.filter((item) => item.skill !== skill);
                                                                        return [...rest, { skill, level: event.target.value as SkillLevel }];
                                                                    })
                                                                }
                                                                className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs text-gray-200 focus:border-amber-400 focus:outline-none"
                                                            >
                                                                <option value="beginner">beginner</option>
                                                                <option value="intermediate">intermediate</option>
                                                                <option value="advanced">advanced</option>
                                                            </select>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {selectedReferral.minCGPA > 0 && (
                                            <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200">
                                                <input
                                                    type="checkbox"
                                                    checked={cgpaConfirmed}
                                                    onChange={(event) => setCgpaConfirmed(event.target.checked)}
                                                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-amber-400 focus:ring-amber-400"
                                                />
                                                I confirm my profile CGPA is accurate and can be used for eligibility checks.
                                            </label>
                                        )}

                                        <div className="flex justify-end">
                                            <button
                                                disabled={applySubmitting}
                                                type="submit"
                                                className="rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-medium text-[#0A0D14] disabled:opacity-60"
                                            >
                                                {applySubmitting ? 'Submitting...' : 'Submit Application'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
