// CareerPathVisualizer.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../config/api';
import { useNavigate } from 'react-router-dom';
import { Map, RefreshCw, ExternalLink, Award, MessageCircle, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';

interface CareerMatch {
    alumniId: string;
    name: string;
    avatar?: string;
    jobTitle: string;
    company: string;
    experience: string;
    skills: string[];
    skillMatchPercentage: number;
    missingSkills: string[];
}

interface AlumniDirectoryItem {
    _id: string;
    name: string;
    avatar?: string;
    jobTitle?: string;
    company?: string;
    experience?: string;
    skills?: string[];
    graduationYear?: number;
}

const CareerPathVisualizer: React.FC = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(true);
    const [matches, setMatches] = useState<CareerMatch[]>([]);
    const [selectedMatch, setSelectedMatch] = useState<CareerMatch | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [allAlumni, setAllAlumni] = useState<AlumniDirectoryItem[]>([]);
    const [loadingAllAlumni, setLoadingAllAlumni] = useState<boolean>(true);
    const [allAlumniError, setAllAlumniError] = useState<string | null>(null);
    const [alumniCompanyFilter, setAlumniCompanyFilter] = useState('');
    const [alumniExperienceFilter, setAlumniExperienceFilter] = useState('');
    const [alumniSkillsFilter, setAlumniSkillsFilter] = useState('');
    const [alumniGraduationYearFilter, setAlumniGraduationYearFilter] = useState('');
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [creatingGroup, setCreatingGroup] = useState(false);
    const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
    const [selectedInviteeIds, setSelectedInviteeIds] = useState<string[]>([]);
    const [sendingInvites, setSendingInvites] = useState(false);
    const [groupActionMessage, setGroupActionMessage] = useState<string | null>(null);

    // Target skills inline editor
    const [editingTargetSkills, setEditingTargetSkills] = useState(false);
    const [targetSkillsInput, setTargetSkillsInput] = useState('');
    const [savingTargetSkills, setSavingTargetSkills] = useState(false);

    const saveTargetSkills = async () => {
        if (!user?.token) return;
        setSavingTargetSkills(true);
        try {
            const newSkills = targetSkillsInput.split(',').map(s => s.trim()).filter(s => s);
            await api.put(
                '/profile/me/profile',
                { target_skills: newSkills },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            updateUser({ target_skills: newSkills });
            setEditingTargetSkills(false);
            fetchMatches();
        } catch (err) {
            console.error('Failed to save target skills:', err);
        } finally {
            setSavingTargetSkills(false);
        }
    };

    const startEditingTargetSkills = () => {
        setTargetSkillsInput((user?.target_skills ?? []).join(', '));
        setEditingTargetSkills(true);
    };

    // Sync latest skills/target_skills from DB into auth context on mount
    useEffect(() => {
        if (!user?.token) return;
        api.get('/profile/me/profile', {
            headers: { Authorization: `Bearer ${user.token}` }
        }).then(res => {
            const u = res.data.user;
            if (u) {
                updateUser({ skills: u.skills ?? [], target_skills: u.target_skills ?? [] });
            }
        }).catch(err => {
            console.error('Failed to sync profile skills:', err);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.token]);

    const fetchMatches = useCallback(async () => {
        if (!user?._id) return;
        setLoading(true);
        setError(null);
        try {
            // Use target-skills endpoint when target skills are set, otherwise fall back to career-path
            const hasTargetSkills = (user?.target_skills ?? []).length > 0;
            const endpoint = hasTargetSkills
                ? `/recommend/target-skills/${user._id}`
                : `/recommend/career-path/${user._id}`;
            const res = await api.get(
                endpoint,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setMatches(res.data);
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            console.error('Failed to fetch career matches:', err);
            setError(e.response?.data?.message || 'Failed to load career matches. Make sure the backend and ML service are running.');
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?._id, user?.token, (user?.target_skills ?? []).join(',')]);

    const resolveAvatarUrl = (avatar?: string): string => {
        if (!avatar) return '';
        if (avatar.startsWith('http')) return avatar;
        return `http://localhost:5000/${avatar}`;
    };

    useEffect(() => {
        fetchMatches();
    }, [fetchMatches]);

    const fetchAllAlumni = useCallback(async () => {
        setLoadingAllAlumni(true);
        setAllAlumniError(null);
        try {
            const res = await api.get('/auth/alumni', {
                headers: user?.token ? { Authorization: `Bearer ${user.token}` } : undefined,
            });
            setAllAlumni(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Failed to load alumni directory:', err);
            setAllAlumniError('Failed to load alumni directory');
            setAllAlumni([]);
        } finally {
            setLoadingAllAlumni(false);
        }
    }, [user?.token]);

    useEffect(() => {
        fetchAllAlumni();
    }, [fetchAllAlumni]);

    const filteredAlumni = useMemo(() => {
        const companyFilter = alumniCompanyFilter.trim().toLowerCase();
        const experienceFilter = alumniExperienceFilter.trim().toLowerCase();
        const skillsFilter = alumniSkillsFilter.trim().toLowerCase();
        const graduationYearFilter = alumniGraduationYearFilter.trim().toLowerCase();

        return allAlumni.filter((alumni) => {
            const isCurrentUser = Boolean(user?._id) && alumni._id === user?._id;
            if (isCurrentUser) {
                return false;
            }

            const companyText = (alumni.company || '').toLowerCase();
            const experienceText = (alumni.experience || '').toLowerCase();
            const skillsText = (alumni.skills || []).join(' ').toLowerCase();
            const graduationYearText = String(alumni.graduationYear || '').toLowerCase();

            const companyMatch = !companyFilter || companyText.includes(companyFilter);
            const experienceMatch = !experienceFilter || experienceText.includes(experienceFilter);
            const skillsMatch = !skillsFilter || skillsText.includes(skillsFilter);
            const graduationYearMatch = !graduationYearFilter || graduationYearText.includes(graduationYearFilter);

            return companyMatch && experienceMatch && skillsMatch && graduationYearMatch;
        });
    }, [allAlumni, alumniCompanyFilter, alumniExperienceFilter, alumniSkillsFilter, alumniGraduationYearFilter, user?._id]);

    const toggleInviteSelection = (alumniId: string) => {
        setSelectedInviteeIds((prev) => {
            if (prev.includes(alumniId)) {
                return prev.filter((id) => id !== alumniId);
            }
            return [...prev, alumniId];
        });
    };

    const createBatchGroup = async () => {
        if (!user?.token) return;

        const normalizedName = groupName.trim();
        if (!normalizedName) {
            setGroupActionMessage('Please enter a group name first.');
            return;
        }

        setCreatingGroup(true);
        setGroupActionMessage(null);

        try {
            const { data } = await api.post(
                '/groups',
                {
                    name: normalizedName,
                    description: groupDescription.trim(),
                },
                {
                    headers: { Authorization: `Bearer ${user.token}` },
                }
            );

            const newGroupId = data?.group?._id as string | undefined;
            if (newGroupId) {
                setCurrentGroupId(newGroupId);
                setGroupActionMessage('Group created. Select alumni and send join requests.');
            }
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setGroupActionMessage(e.response?.data?.message || 'Failed to create group');
        } finally {
            setCreatingGroup(false);
        }
    };

    const sendJoinRequests = async () => {
        if (!user?.token || !currentGroupId) return;
        if (selectedInviteeIds.length === 0) {
            setGroupActionMessage('Please select at least one alumni to invite.');
            return;
        }

        setSendingInvites(true);
        setGroupActionMessage(null);
        try {
            const { data } = await api.post(
                `/groups/${currentGroupId}/invites`,
                {
                    recipientIds: selectedInviteeIds,
                    message: `Please join my alumni batch group: ${groupName.trim()}`,
                },
                {
                    headers: { Authorization: `Bearer ${user.token}` },
                }
            );

            const invitedCount = Number(data?.results?.invited || 0);
            const skippedList = Array.isArray(data?.results?.skipped) ? data.results.skipped : [];
            const skippedCount = skippedList.length;

            let reasonSuffix = '';
            if (skippedCount > 0) {
                const formatted = skippedList
                    .slice(0, 3)
                    .map((entry: { recipientName?: string; reason?: string; expectedBatchYear?: number; recipientBatchYear?: number }) => {
                        if (entry.reason === 'invite_pending') {
                            return `${entry.recipientName || 'Unknown'} (invite already pending)`;
                        }
                        if (entry.reason === 'already_member') {
                            return `${entry.recipientName || 'Unknown'} (already in group)`;
                        }
                        if (entry.reason === 'not_alumni') {
                            return `${entry.recipientName || 'Unknown'} (not alumni)`;
                        }
                        if (entry.reason === 'not_active_alumni') {
                            return `${entry.recipientName || 'Unknown'} (account not active)`;
                        }
                        return `${entry.recipientName || 'Unknown'} (${entry.reason || 'skipped'})`;
                    })
                    .join(', ');

                reasonSuffix = ` Reasons: ${formatted}${skippedCount > 3 ? '...' : ''}`;
            }

            setGroupActionMessage(`Join requests sent: ${invitedCount}${skippedCount ? `, skipped: ${skippedCount}` : ''}.${reasonSuffix}`);
            setSelectedInviteeIds([]);
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setGroupActionMessage(e.response?.data?.message || 'Failed to send join requests');
        } finally {
            setSendingInvites(false);
        }
    };

    return (
        // .recommendation-page / .career-path-page
        <div className="career-theme min-h-screen bg-[#0A0D14] text-gray-200 relative overflow-x-hidden">
            <style>
                {`
                    .career-theme .career-content .bg-white,
                    .career-theme .career-content .bg-gray-50,
                    .career-theme .career-modal .bg-white {
                        background-color: rgba(18, 22, 32, 0.84) !important;
                    }

                    .career-theme .career-content .border-gray-100,
                    .career-theme .career-content .border-gray-200,
                    .career-theme .career-modal .border-gray-200 {
                        border-color: rgba(255, 255, 255, 0.14) !important;
                    }

                    .career-theme .career-content .text-gray-900,
                    .career-theme .career-content .text-gray-800,
                    .career-theme .career-modal .text-gray-900,
                    .career-theme .career-modal .text-gray-800 {
                        color: #f3f4f6 !important;
                    }

                    .career-theme .career-content .text-gray-700,
                    .career-theme .career-content .text-gray-600,
                    .career-theme .career-content .text-gray-500,
                    .career-theme .career-content .text-gray-400,
                    .career-theme .career-modal .text-gray-700,
                    .career-theme .career-modal .text-gray-600,
                    .career-theme .career-modal .text-gray-500,
                    .career-theme .career-modal .text-gray-400 {
                        color: #9ca3af !important;
                    }

                    .career-theme .career-content input,
                    .career-theme .career-content textarea,
                    .career-theme .career-content select,
                    .career-theme .career-modal input,
                    .career-theme .career-modal textarea,
                    .career-theme .career-modal select {
                        background-color: rgba(255, 255, 255, 0.05) !important;
                        color: #f9fafb !important;
                        border-color: rgba(255, 255, 255, 0.18) !important;
                    }

                    .career-theme .career-content tbody tr:hover {
                        background-color: rgba(255, 255, 255, 0.06) !important;
                    }
                `}
            </style>
            <Navigation />

            {/* .background-effects — decorative blurred circles */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:30px_30px]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(245,158,11,0.08),transparent_35%)]" />
            </div>

            {/* .career-path-main / .recommendation-main */}
            <main className="career-content max-w-6xl mx-auto px-6 py-8 relative z-10">

                {/* .page-header */}
                <div className="bg-white rounded-2xl p-8 mb-6 shadow-md flex flex-col md:flex-row md:items-start md:justify-between gap-6 border border-gray-100">
                    <div className="flex-1">
                        {/* .page-title */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            
                        </h1>
                        <div className="mt-2">
                            <span className="text-sm text-gray-500 mr-2">Your Skills:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {user?.skills?.map((s, i) => (
                                    // .skill-pill
                                    <span
                                        key={i}
                                        className="flex items-center gap-1 px-3 py-1 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-full text-blue-600 text-xs font-medium"
                                    >
                                        {s}
                                    </span>
                                ))}
                                {(!user?.skills || user.skills.length === 0) && (
                                    <span className="text-xs text-gray-400 italic">None set — go to Profile to add your skills</span>
                                )}
                            </div>
                        </div>

                        {/* Target Skills row */}
                        <div className="mt-4">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm text-gray-500">Target Skills:</span>
                                {!editingTargetSkills && (
                                    <button
                                        onClick={startEditingTargetSkills}
                                        className="text-xs text-orange-500 hover:text-orange-700 font-medium underline"
                                    >
                                        {(user?.target_skills ?? []).length === 0 ? '+ Add target skills' : 'Edit'}
                                    </button>
                                )}
                            </div>
                            {editingTargetSkills ? (
                                <div className="flex flex-col gap-2 mt-1">
                                    <input
                                        type="text"
                                        value={targetSkillsInput}
                                        onChange={e => setTargetSkillsInput(e.target.value)}
                                        placeholder="React, Node.js, Machine Learning, AWS (comma-separated)"
                                        className="w-full rounded-lg border border-orange-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-300"
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={saveTargetSkills}
                                            disabled={savingTargetSkills}
                                            className="px-4 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors"
                                        >
                                            {savingTargetSkills ? 'Saving…' : 'Save'}
                                        </button>
                                        <button
                                            onClick={() => setEditingTargetSkills(false)}
                                            className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400">Separate skills with commas. These are used by the Mentor Recommendations page.</p>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {(user?.target_skills ?? []).map((s, i) => (
                                        <span
                                            key={i}
                                            className="flex items-center gap-1 px-3 py-1 bg-gradient-to-br from-orange-50 to-amber-100 border border-orange-200 rounded-full text-orange-600 text-xs font-medium"
                                        >
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* .refresh-button */}
                    <button
                        onClick={fetchMatches}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-blue-600 to-blue-700 border-none rounded-lg text-white text-sm font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-200 self-start"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* Content States */}
                {loading ? (
                    // .loading-container
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-md text-center border border-gray-100">
                        {/* .loading-spinner */}
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                        {/* .loading-text */}
                        <p className="text-gray-500 text-base">Mapping career paths...</p>
                    </div>

                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-red-200 text-center">
                        <p className="text-red-500 font-semibold mb-2">Error</p>
                        <p className="text-sm text-gray-500 max-w-md">{error}</p>
                        <button
                            onClick={fetchMatches}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>

                ) : matches.length === 0 ? (
                    // .empty-state
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-center">
                        {/* .empty-icon */}
                        <Map className="w-12 h-12 text-gray-400 mb-4" />
                        {/* .empty-title */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No career matches found</h3>
                        {/* .empty-message */}
                        {(user?.target_skills ?? []).length === 0 ? (
                            <p className="text-sm text-gray-500">
                                No target skills set. Add target skills above to find alumni whose career path matches where you want to go.
                            </p>
                        ) : (
                            <p className="text-sm text-gray-500">
                                No alumni match your target skills yet. Try broader skills or check back as more alumni join.
                            </p>
                        )}
                    </div>

                ) : (
                    // .recommendations-table-container
                    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
                        {/* .recommendations-table */}
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    {['Alumni', 'Role & Company', 'Match', 'Experience', 'Actions'].map(h => (
                                        <th
                                            key={h}
                                            className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {matches.map((match, idx) => (
                                    // .table-row
                                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">

                                        {/* Alumni column */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {/* .alumni-avatar */}
                                                {match.avatar ? (
                                                    <img
                                                        src={resolveAvatarUrl(match.avatar)}
                                                        alt={match.name}
                                                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                                        onError={(e) => {
                                                            const target = e.currentTarget;
                                                            target.style.display = 'none';
                                                            const fallback = target.nextElementSibling as HTMLElement | null;
                                                            if (fallback) fallback.style.display = 'flex';
                                                        }}
                                                    />
                                                ) : null}
                                                <div 
                                                    className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full font-semibold text-white text-base flex-shrink-0"
                                                    style={{ display: match.avatar ? 'none' : 'flex' }}
                                                >
                                                    {match.name.charAt(0)}
                                                </div>
                                                <span className="font-bold text-gray-900">{match.name}</span>
                                            </div>
                                        </td>

                                        {/* Role & Company */}
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-800">{match.jobTitle}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{match.company}</div>
                                        </td>

                                        {/* Match bar */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {/* .career-match-bar */}
                                                <div className="w-20 bg-gray-200 h-2 rounded-full overflow-hidden">
                                                    {/* .career-match-fill */}
                                                    <div
                                                        className="bg-green-500 h-full rounded-full transition-all duration-500"
                                                        style={{ width: `${match.skillMatchPercentage}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-green-700">
                                                    {match.skillMatchPercentage}%
                                                </span>
                                            </div>
                                        </td>

                                        {/* Experience */}
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {match.experience}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setSelectedMatch(match)}
                                                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition-colors duration-150"
                                                >
                                                    Details <ExternalLink size={14} />
                                                </button>
                                                {match.alumniId && (
                                                    <button
                                                        onClick={() => navigate(`/chat/${match.alumniId}`)}
                                                        className="flex items-center gap-1 text-green-600 hover:text-green-800 text-sm font-semibold transition-colors duration-150"
                                                    >
                                                        Chat <MessageCircle size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* All Alumni Section */}
                <section className="mt-8 bg-white rounded-2xl shadow-md border border-gray-200 p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-500" />
                        <h2 className="text-xl font-semibold text-gray-900">All Alumni</h2>
                    </div>

                    {user?.role === 'alumni' && (
                        <div className="mb-5 rounded-xl border border-amber-300/40 bg-amber-500/10 p-4">
                            <h3 className="text-sm font-semibold text-amber-300">Create Batch Group</h3>
                            <p className="mt-1 text-xs text-gray-400">
                                Alumni can create a group and send join requests. Invited alumni receive a notification.
                            </p>
                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                                <input
                                    type="text"
                                    value={groupName}
                                    onChange={(event) => setGroupName(event.target.value)}
                                    placeholder="Group name"
                                    className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none"
                                />
                                <input
                                    type="text"
                                    value={groupDescription}
                                    onChange={(event) => setGroupDescription(event.target.value)}
                                    placeholder="Short description (optional)"
                                    className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none"
                                />
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <button
                                    onClick={createBatchGroup}
                                    disabled={creatingGroup || !groupName.trim()}
                                    className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-black hover:bg-amber-400 disabled:opacity-60"
                                >
                                    {creatingGroup ? 'Creating...' : currentGroupId ? 'Create Another Group' : 'Create Group'}
                                </button>

                                <button
                                    onClick={sendJoinRequests}
                                    disabled={!currentGroupId || sendingInvites || selectedInviteeIds.length === 0}
                                    className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                                >
                                    {sendingInvites ? 'Sending...' : `Send Join Requests (${selectedInviteeIds.length})`}
                                </button>
                            </div>

                            {groupActionMessage && (
                                <p className="mt-2 text-xs text-gray-300">{groupActionMessage}</p>
                            )}
                        </div>
                    )}

                    <div className="mb-4 grid gap-3 md:grid-cols-4">
                        <input
                            type="text"
                            value={alumniSkillsFilter}
                            onChange={(event) => setAlumniSkillsFilter(event.target.value)}
                            placeholder="Filter by skills"
                            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none"
                        />
                        <input
                            type="text"
                            value={alumniExperienceFilter}
                            onChange={(event) => setAlumniExperienceFilter(event.target.value)}
                            placeholder="Filter by experience"
                            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none"
                        />
                        <input
                            type="text"
                            value={alumniCompanyFilter}
                            onChange={(event) => setAlumniCompanyFilter(event.target.value)}
                            placeholder="Filter by company"
                            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none"
                        />
                        <input
                            type="text"
                            value={alumniGraduationYearFilter}
                            onChange={(event) => setAlumniGraduationYearFilter(event.target.value)}
                            placeholder="Filter by graduation year"
                            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none"
                        />
                    </div>

                    {loadingAllAlumni ? (
                        <p className="text-sm text-gray-500">Loading alumni directory...</p>
                    ) : allAlumniError ? (
                        <p className="text-sm text-red-400">{allAlumniError}</p>
                    ) : filteredAlumni.length === 0 ? (
                        <p className="text-sm text-gray-500">No alumni found for the selected filters.</p>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredAlumni.map((alumni) => (
                                <div
                                    key={alumni._id}
                                    className="rounded-xl border border-white/10 bg-white/5 p-4"
                                >
                                    {user?.role === 'alumni' && (
                                        <label className="mb-2 inline-flex items-center gap-2 text-xs text-gray-400">
                                            <input
                                                type="checkbox"
                                                checked={selectedInviteeIds.includes(alumni._id)}
                                                onChange={() => toggleInviteSelection(alumni._id)}
                                                className="h-3.5 w-3.5 rounded border-white/30 bg-transparent"
                                            />
                                            Select for group invite
                                        </label>
                                    )}

                                    <div className="flex items-center gap-3">
                                        {alumni.avatar ? (
                                            <img
                                                src={resolveAvatarUrl(alumni.avatar)}
                                                alt={alumni.name}
                                                className="h-12 w-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-lg font-semibold text-white">
                                                {alumni.name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-semibold text-gray-900">{alumni.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {alumni.jobTitle || 'Alumni'}{alumni.company ? ` @ ${alumni.company}` : ''}
                                            </p>
                                        </div>
                                    </div>

                                    {alumni.experience && (
                                        <p className="mt-3 text-xs text-gray-500">Experience: {alumni.experience}</p>
                                    )}

                                    {alumni.skills && alumni.skills.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            {alumni.skills.slice(0, 4).map((skill, index) => (
                                                <span
                                                    key={`${alumni._id}-${skill}-${index}`}
                                                    className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => navigate(`/profile/${alumni._id}`)}
                                        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-800"
                                    >
                                        View Profile <ExternalLink size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* ── Detail Modal ── */}
            {selectedMatch && (
                // .profile-modal-overlay
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedMatch(null)}
                >
                    {/* .profile-modal */}
                    <div
                        className="career-modal bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* .profile-modal-header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Career Details</h2>
                            <button
                                onClick={() => setSelectedMatch(null)}
                                className="text-2xl leading-none text-gray-400 hover:text-gray-700 transition-colors"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Modal body */}
                        <div className="p-6">

                            {/* Profile overview */}
                            <div className="flex items-center gap-4 mb-6">
                                {selectedMatch.avatar ? (
                                    <img
                                        src={resolveAvatarUrl(selectedMatch.avatar)}
                                        alt={selectedMatch.name}
                                        className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                                        onError={(e) => {
                                            const target = e.currentTarget;
                                            target.style.display = 'none';
                                            const fallback = target.nextElementSibling as HTMLElement | null;
                                            if (fallback) fallback.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div 
                                    className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
                                    style={{ display: selectedMatch.avatar ? 'none' : 'flex' }}
                                >
                                    {selectedMatch.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{selectedMatch.name}</h3>
                                    <p className="text-gray-600 text-sm">
                                        {selectedMatch.jobTitle} @ {selectedMatch.company}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Experience: {selectedMatch.experience}
                                    </p>
                                </div>
                            </div>

                            {/* Skill Match Bar */}
                            <div className="mb-6">
                                <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                                    <span>Skill Match</span>
                                    <span className="text-green-600 font-bold">
                                        {selectedMatch.skillMatchPercentage}%
                                    </span>
                                </div>
                                {/* .career-match-bar */}
                                <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                                    {/* .career-match-fill */}
                                    <div
                                        className="bg-green-500 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${selectedMatch.skillMatchPercentage}%` }}
                                    />
                                </div>
                            </div>

                            {/* Skills grid */}
                            <div className="grid grid-cols-2 gap-4">

                                {/* Skills they have */}
                                <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-1 text-gray-800 text-sm">
                                        <Award size={16} className="text-indigo-600" />
                                        Skills They Have
                                    </h4>
                                    {/* .skills-list */}
                                    <div className="flex flex-wrap gap-2">
                                        {selectedMatch.skills?.map((s, i) => (
                                            // .skill-badge
                                            <span
                                                key={i}
                                                className="px-3 py-1 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-full text-xs text-blue-700 font-medium"
                                            >
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Skills to learn */}
                                <div>
                                    <h4 className="font-semibold mb-2 text-orange-600 text-sm">
                                        Skills to Learn
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedMatch.missingSkills?.length > 0 ? (
                                            selectedMatch.missingSkills.map((s, i) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1 bg-orange-50 text-orange-700 border border-orange-100 rounded-full text-xs font-medium"
                                                >
                                                    {s}
                                                </span>
                                            ))
                                        ) : (
                                            // .career-perfect
                                            <span className="text-sm text-green-700 font-medium bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                                                🎯 You have all required skills!
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* .profile-modal-footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-200">
                            <button
                                onClick={() => setSelectedMatch(null)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors text-sm"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    if (selectedMatch?.alumniId) {
                                        navigate(`/chat/${selectedMatch.alumniId}`);
                                    }
                                }}
                                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm flex items-center gap-2"
                            >
                                <MessageCircle size={16} /> Connect Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CareerPathVisualizer;
