
import React, { useState, useEffect, useMemo } from 'react';
import {
    Users, TrendingUp,
    RefreshCw, Star, Zap, Target, Award
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';

interface AlumniRecommendation {
    name: string;
    jobTitle: string;
    company: string;
    experience: string;
    skillMatchPercentage: number;
    skills: string[];
    matchedTargetSkills?: string[];
}

type SortType = 'match' | 'experience' | 'skills';


const getMatchColor = (pct: number): string => {
    if (pct >= 80) return '#16a34a';
    if (pct >= 50) return '#d97706';
    return '#dc2626';
};


const getMatchTextClass = (pct: number): string => {
    if (pct >= 80) return 'text-green-600';
    if (pct >= 50) return 'text-amber-600';
    return 'text-red-600';
};

const Recommendation: React.FC = () => {
    const { user } = useAuth();

    const [loading, setLoading] = useState<boolean>(true);
    const [alumniList, setAlumniList] = useState<AlumniRecommendation[]>([]);
    const [selectedAlumni, setSelectedAlumni] = useState<AlumniRecommendation | null>(null);
    const [sortBy, setSortBy] = useState<SortType>('match');
    const [skillFilter, setSkillFilter] = useState<string>('all');

    useEffect(() => {
        const fetchAlumni = async () => {
            setLoading(true);
            try {


                setAlumniList([]);
            } catch (err) {
                console.error('Failed to fetch alumni recommendations:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAlumni();
    }, []);

    const availableSkills = useMemo(() => {
        const skillSet = new Set<string>(['all']);
        alumniList.forEach(a => a.skills?.forEach(s => skillSet.add(s)));
        return Array.from(skillSet);
    }, [alumniList]);

    const filteredAlumni = useMemo(() => {
        let list = [...alumniList];
        if (skillFilter !== 'all') {
            list = list.filter(a => a.skills?.includes(skillFilter));
        }
        if (sortBy === 'match') {
            list.sort((a, b) => b.skillMatchPercentage - a.skillMatchPercentage);
        } else if (sortBy === 'experience') {
            list.sort((a, b) => a.experience.localeCompare(b.experience));
        } else if (sortBy === 'skills') {
            list.sort((a, b) => (b.skills?.length ?? 0) - (a.skills?.length ?? 0));
        }
        return list;
    }, [alumniList, sortBy, skillFilter]);

    const avgMatch = alumniList.length
        ? Math.round(alumniList.reduce((sum, a) => sum + a.skillMatchPercentage, 0) / alumniList.length)
        : 0;

    const topMatch = alumniList.length
        ? Math.max(...alumniList.map(a => a.skillMatchPercentage))
        : 0;

    return (

        <div className="min-h-screen bg-[#0A0D14] text-gray-200 relative overflow-x-hidden">
            <Navigation />

            {/* .background-effects + .effect-circle-1 + .effect-circle-2 */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:30px_30px]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.08),transparent_38%),radial-gradient(circle_at_90%_0%,rgba(245,158,11,0.08),transparent_34%)]" />
            </div>

            {/* .recommendation-main */}
            <main className="max-w-6xl mx-auto px-6 py-8 relative z-10">

                {/* .page-header */}
                <div className="bg-white rounded-2xl p-8 mb-6 shadow-md flex flex-col md:flex-row md:justify-between md:items-start gap-6">

                    {/* .page-title-container */}
                    <div className="flex-1">
                        {/* .page-title */}
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            AI Alumni Recommendations
                        </h1>
                        {/* .page-subtitle */}
                        <p className="text-gray-500 text-base mb-6">
                            Alumni matched to your target skills using collaborative filtering
                        </p>
                        {user?.skills && user.skills.length > 0 && (

                            <div className="flex items-center gap-4">
                                {/* .skills-label */}
                                <span className="text-gray-600 font-semibold text-sm whitespace-nowrap">
                                    Your Skills:
                                </span>
                                {/* .skills-tags */}
                                <div className="flex gap-2 flex-wrap">
                                    {user.skills.map((s, i) => (

                                        <span
                                            key={i}
                                            className="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium border border-blue-200"
                                        >
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* .page-actions */}
                    <div className="flex gap-4 self-start">
                        {/* .refresh-button */}
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center gap-2 px-7 py-3 bg-gradient-to-br from-blue-600 to-blue-700 border-none rounded-xl text-white text-sm font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-200"
                        >
                            {/* .refresh-icon */}
                            <RefreshCw className={`w-[18px] h-[18px] ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Stats Cards — .stats-section */}
                {!loading && alumniList.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">

                        {/* .stat-card × 4 */}
                        {/* Purple — Alumni Matched */}
                        <div className="bg-white rounded-2xl p-6 shadow-md flex items-center gap-4 transition-transform duration-300 hover:-translate-y-1">
                            {/* .stat-icon-container .stat-icon-purple */}
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-indigo-100 to-indigo-200">
                                <Users className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-4xl font-bold text-gray-900 mb-1">{alumniList.length}</p>
                                <p className="text-gray-500 text-sm font-medium">Alumni Matched</p>
                            </div>
                        </div>

                        {/* Blue — Avg Match Score */}
                        <div className="bg-white rounded-2xl p-6 shadow-md flex items-center gap-4 transition-transform duration-300 hover:-translate-y-1">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-100 to-blue-200">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-4xl font-bold text-gray-900 mb-1">{avgMatch}%</p>
                                <p className="text-gray-500 text-sm font-medium">Avg Match Score</p>
                            </div>
                        </div>

                        {/* Green — Top Match */}
                        <div className="bg-white rounded-2xl p-6 shadow-md flex items-center gap-4 transition-transform duration-300 hover:-translate-y-1">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-green-100 to-green-200">
                                <Star className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-4xl font-bold text-gray-900 mb-1">{topMatch}%</p>
                                <p className="text-gray-500 text-sm font-medium">Top Match</p>
                            </div>
                        </div>

                        {/* Orange — Your Skills */}
                        <div className="bg-white rounded-2xl p-6 shadow-md flex items-center gap-4 transition-transform duration-300 hover:-translate-y-1">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-orange-100 to-orange-200">
                                <Target className="w-6 h-6 text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-4xl font-bold text-gray-900 mb-1">{user?.skills?.length ?? 0}</p>
                                <p className="text-gray-500 text-sm font-medium">Your Skills</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* .filters-section */}
                <div className="bg-white rounded-2xl p-6 mb-6 shadow-md flex flex-col md:flex-row gap-8 items-start md:items-center">

                    {/* Sort By filter group */}
                    <div className="flex items-center gap-4">
                        {/* .filter-label */}
                        <label className="text-gray-600 font-semibold text-sm whitespace-nowrap">
                            Sort By:
                        </label>
                        {/* .filter-buttons */}
                        <div className="flex gap-2">
                            {(['match', 'experience', 'skills'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setSortBy(type)}

                                    className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 border
                                        ${sortBy === type
                                            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-600'
                                            : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-600'
                                        }`}
                                >
                                    {/* .filter-button-icon */}
                                    {type === 'match' && <TrendingUp className="w-4 h-4" />}
                                    {type === 'experience' && <Award className="w-4 h-4" />}
                                    {type === 'skills' && <Zap className="w-4 h-4" />}
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Skill Filter group */}
                    <div className="flex items-center gap-4">
                        <label className="text-gray-600 font-semibold text-sm whitespace-nowrap">
                            Filter by Skill:
                        </label>
                        {/* .skill-select */}
                        <select
                            value={skillFilter}
                            onChange={e => setSkillFilter(e.target.value)}
                            className="py-3 px-5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-sm font-medium min-w-[200px] cursor-pointer focus:outline-none focus:border-blue-600 transition-colors"
                        >
                            {availableSkills.map(s => (
                                <option key={s} value={s}>{s === 'all' ? 'All Skills' : s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Content States */}
                {loading ? (

                    <div className="bg-white rounded-2xl py-16 px-8 text-center shadow-md">
                        {/* .loading-spinner */}
                        <div className="w-[60px] h-[60px] border-4 border-indigo-100 border-t-blue-600 rounded-full mx-auto mb-6 animate-spin" />
                        {/* .loading-text */}
                        <p className="text-gray-500 text-lg">Finding your best alumni matches...</p>
                    </div>

                ) : filteredAlumni.length === 0 ? (
                    <div className="bg-white rounded-2xl py-16 px-8 text-center shadow-md">
                        <TrendingUp className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No matches found.</p>
                        <p className="text-gray-400 text-sm mt-2">
                            Make sure your target skills are set in your profile.
                        </p>
                    </div>

                ) : (

                    <div className="bg-white rounded-2xl overflow-hidden shadow-md mb-6 overflow-x-auto">
                        {/* .recommendations-table */}
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    {/* .table-header */}
                                    {['Alumni', 'Role & Company', 'Skills', 'Match Score', 'Experience', 'Actions'].map((h, i) => (
                                        <th
                                            key={h}
                                            className={`bg-gradient-to-br from-blue-800 to-blue-900 text-white px-6 py-5 text-left font-semibold text-sm
                                                ${i === 0 ? 'rounded-tl-2xl' : ''}
                                                ${i === 5 ? 'rounded-tr-2xl' : ''}`}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAlumni.map((alumni, idx) => (

                                    <tr key={idx} className="border-b border-gray-100 transition-colors duration-300 hover:bg-gray-50">

                                        {/* Alumni Info — .table-cell .alumni-info-cell */}
                                        <td className="px-6 py-5 min-w-[250px]">
                                            {/* .alumni-info */}
                                            <div className="flex items-center gap-3">
                                                {/* .alumni-avatar */}
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white text-xl font-semibold flex-shrink-0">
                                                    {alumni.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    {/* .alumni-name */}
                                                    <p className="text-gray-900 text-lg font-semibold mb-1">{alumni.name}</p>
                                                    {/* .alumni-company */}
                                                    <p className="text-gray-500 text-sm">{alumni.company}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Role — .table-cell */}
                                        <td className="px-6 py-5">
                                            <span className="font-medium text-gray-900">
                                                {alumni.jobTitle || '—'}
                                            </span>
                                        </td>

                                        {/* Skills — .table-cell .skills-cell */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                {alumni.skills?.slice(0, 3).map((s, i) => (

                                                    <span key={i} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-md text-xs font-medium">
                                                        {s}
                                                    </span>
                                                ))}
                                                {(alumni.skills?.length || 0) > 3 && (

                                                    <span className="text-gray-400 text-xs font-medium">
                                                        +{alumni.skills.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Match Score — .table-cell .match-score-cell */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3 min-w-[180px]">
                                                {/* .match-score-bar */}
                                                <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
                                                    {/* .match-score-fill */}
                                                    <div
                                                        className="h-full rounded transition-all duration-300"
                                                        style={{
                                                            width: `${alumni.skillMatchPercentage}%`,
                                                            background: getMatchColor(alumni.skillMatchPercentage)
                                                        }}
                                                    />
                                                </div>
                                                {/* .match-percentage (replaces getMatchClass CSS) */}
                                                <span className={`text-base font-bold min-w-[50px] text-right ${getMatchTextClass(alumni.skillMatchPercentage)}`}>
                                                    {alumni.skillMatchPercentage}%
                                                </span>
                                            </div>
                                        </td>

                                        {/* Experience — .table-cell .experience-cell */}
                                        <td className="px-6 py-5 text-gray-600 font-semibold">
                                            {alumni.experience}
                                        </td>

                                        {/* Actions — .table-cell .actions-cell */}
                                        <td className="px-6 py-5">
                                            <div className="flex gap-3">
                                                {/* .view-button */}
                                                <button
                                                    onClick={() => setSelectedAlumni(alumni)}
                                                    className="flex items-center gap-1 px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-sm font-semibold cursor-pointer transition-all duration-300 hover:bg-gray-100 hover:text-gray-900"
                                                >
                                                    View
                                                </button>
                                                {/* .connect-button */}
                                                <button
                                                    onClick={() => alert(`Connection request sent to ${alumni.name}!`)}
                                                    className="flex items-center gap-1.5 px-5 py-3 bg-gradient-to-br from-blue-600 to-blue-700 border-none rounded-lg text-white text-sm font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-px hover:shadow-md hover:shadow-blue-200"
                                                >
                                                    {/* .connect-icon */}
                                                    <Users className="w-4 h-4" />
                                                    Connect
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* .how-it-works */}
                {!loading && (
                    <div className="bg-white rounded-2xl p-8 shadow-md">
                        {/* .how-it-works-title */}
                        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
                            How Matching Works
                        </h2>
                        {/* .how-it-works-grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { n: 1, title: 'Set Target Skills', desc: 'Add the skills you want to learn in your profile under target skills.' },
                                { n: 2, title: 'AI Matching', desc: 'Our algorithm finds alumni whose skill sets overlap with your targets.' },
                                { n: 3, title: 'Ranked Results', desc: 'Alumni are ranked by match percentage so the best mentors appear first.' },
                                { n: 4, title: 'Connect & Grow', desc: 'Reach out to matched alumni for mentorship, guidance, and career advice.' },
                            ].map(({ n, title, desc }) => (

                                <div key={n} className="bg-gray-50 rounded-xl p-6 text-center transition-transform duration-300 hover:-translate-y-1">
                                    {/* .step-number */}
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                                        {n}
                                    </div>
                                    {/* .step-title */}
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                                    {/* .step-description */}
                                    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* ── Alumni Detail Modal ── */}
            {selectedAlumni && (

                <div
                    className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-[1000] p-4"
                    onClick={() => setSelectedAlumni(null)}
                >
                    {/* .profile-modal */}
                    <div
                        className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-[modalSlideIn_0.3s_ease]"
                        onClick={e => e.stopPropagation()}

                        style={{ animation: 'modalSlideIn 0.3s ease' }}
                    >
                        {/* .profile-modal-header */}
                        <div className="px-6 py-6 border-b border-gray-200 flex justify-between items-center">
                            {/* .profile-modal-title */}
                            <h2 className="text-xl font-bold text-gray-900">Alumni Profile</h2>
                            {/* .close-modal-button */}
                            <button
                                className="bg-transparent border-none text-2xl text-gray-400 cursor-pointer w-8 h-8 flex items-center justify-center rounded-md transition-all hover:bg-gray-100 hover:text-red-600"
                                onClick={() => setSelectedAlumni(null)}
                            >
                                &times;
                            </button>
                        </div>

                        {/* .profile-modal-content */}
                        <div className="p-6">

                            {/* .profile-header */}
                            <div className="flex items-center gap-6 mb-6">
                                {/* .profile-avatar-large */}
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
                                    {selectedAlumni.name.charAt(0).toUpperCase()}
                                </div>
                                {/* .profile-info */}
                                <div className="flex-1">
                                    {/* .profile-name */}
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                                        {selectedAlumni.name}
                                    </h3>
                                    {/* .profile-role */}
                                    <p className="text-gray-500 text-base mb-3">
                                        {selectedAlumni.jobTitle} @ {selectedAlumni.company}
                                    </p>
                                    {/* .profile-match */}
                                    <div className="flex items-center gap-2">
                                        {/* .match-label */}
                                        <span className="text-gray-600 text-sm font-medium">
                                            Target Skill Match:
                                        </span>
                                        {/* .match-value */}
                                        <span
                                            className="text-base font-bold"
                                            style={{ color: getMatchColor(selectedAlumni.skillMatchPercentage) }}
                                        >
                                            {selectedAlumni.skillMatchPercentage}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Match Progress Bar — .profile-section */}
                            <div className="mb-6">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-semibold text-gray-700">Match Progress</span>
                                    <span
                                        className="text-sm font-bold"
                                        style={{ color: getMatchColor(selectedAlumni.skillMatchPercentage) }}
                                    >
                                        {selectedAlumni.skillMatchPercentage}%
                                    </span>
                                </div>
                                {/* .match-score-bar */}
                                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                    {/* .match-score-fill */}
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${selectedAlumni.skillMatchPercentage}%`,
                                            background: getMatchColor(selectedAlumni.skillMatchPercentage),
                                            transition: 'width 0.6s ease'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Details Grid — .profile-section */}
                            <div className="mb-6">
                                {/* .section-title */}
                                <h4 className="text-base font-semibold text-gray-900 mb-3">Details</h4>
                                {/* .details-grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        { label: 'Experience', value: selectedAlumni.experience },
                                        { label: 'Company', value: selectedAlumni.company || '—' },
                                        { label: 'Total Skills', value: String(selectedAlumni.skills?.length ?? 0) },
                                        { label: 'Role', value: selectedAlumni.jobTitle || '—' },
                                    ].map(({ label, value }) => (

                                        <div key={label} className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-lg">
                                            {/* .detail-label */}
                                            <span className="text-gray-500 text-sm font-medium">{label}</span>
                                            {/* .detail-value */}
                                            <span className="text-gray-900 text-sm font-semibold">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Technical Skills — .profile-section */}
                            <div className="mb-6">
                                <h4 className="text-base font-semibold text-gray-900 mb-3">Technical Skills</h4>
                                {/* .skills-list */}
                                <div className="flex flex-wrap gap-2">
                                    {selectedAlumni.skills?.map((s, i) => (

                                        <span
                                            key={i}
                                            className="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 px-5 py-2.5 rounded-lg text-sm font-medium border border-blue-200"
                                        >
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Matched Target Skills */}
                            {selectedAlumni.matchedTargetSkills && selectedAlumni.matchedTargetSkills.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-base font-semibold text-green-700 mb-3">
                                        Matched to Your Target Skills
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedAlumni.matchedTargetSkills.map((s, i) => (
                                            <span
                                                key={i}
                                                className="px-5 py-2.5 rounded-lg text-sm font-medium border"
                                                style={{
                                                    background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                                                    color: '#166534',
                                                    borderColor: '#bbf7d0'
                                                }}
                                            >
                                                ✓ {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* .profile-modal-footer */}
                        <div className="px-6 py-6 border-t border-gray-200 flex gap-3 justify-end">
                            {/* .modal-secondary-button */}
                            <button
                                className="px-6 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-sm font-semibold cursor-pointer transition-all hover:bg-gray-100 hover:text-gray-900"
                                onClick={() => setSelectedAlumni(null)}
                            >
                                Close
                            </button>
                            {/* .modal-primary-button */}
                            <button
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-blue-600 to-blue-700 border-none rounded-lg text-white text-sm font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-200"
                                onClick={() => {
                                    alert(`Connection request sent to ${selectedAlumni.name}!`);
                                    setSelectedAlumni(null);
                                }}
                            >
                                {/* .button-icon */}
                                <Users className="w-[18px] h-[18px]" />
                                Connect Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/*
              Modal slide-in animation — add this once to your global CSS or tailwind.config.js:
              @keyframes modalSlideIn {
                from { opacity: 0; transform: translateY(-20px); }
                to   { opacity: 1; transform: translateY(0); }
              }
            */}
        </div>
    );
};

export default Recommendation;
