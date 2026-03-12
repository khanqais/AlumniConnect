// CareerPathVisualizer.tsx
import React, { useState, useEffect } from 'react';
import { Map, RefreshCw, ExternalLink, Award } from 'lucide-react';
// ✅ CSS import removed — all styles are now inline Tailwind
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';

interface CareerMatch {
    name: string;
    jobTitle: string;
    company: string;
    experience: string;
    skills: string[];
    skillMatchPercentage: number;
    missingSkills: string[];
}

const CareerPathVisualizer: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState<boolean>(true);
    const [matches, setMatches] = useState<CareerMatch[]>([]);
    const [selectedMatch, setSelectedMatch] = useState<CareerMatch | null>(null);

    useEffect(() => {
        const fetchMatches = async () => {
            setLoading(true);
            try {
                // Replace with actual API call:
                // const res = await fetch('/api/career-matches');
                // const data = await res.json();
                // setMatches(data);
                setMatches([]);
            } catch (err) {
                console.error('Failed to fetch career matches:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMatches();
    }, []);

    return (
        // .recommendation-page / .career-path-page
        <div className="min-h-screen bg-slate-50 relative overflow-x-hidden">
            <Navigation />

            {/* .background-effects — decorative blurred circles */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute w-96 h-96 -top-24 -right-24 rounded-full opacity-10 blur-3xl bg-gradient-to-br from-blue-600 to-indigo-600" />
                <div className="absolute w-72 h-72 -bottom-12 -left-24 rounded-full opacity-10 blur-3xl bg-gradient-to-br from-sky-500 to-blue-500" />
            </div>

            {/* .career-path-main / .recommendation-main */}
            <main className="max-w-6xl mx-auto px-6 py-8 relative z-10">

                {/* .page-header */}
                <div className="bg-white rounded-2xl p-8 mb-6 shadow-md flex flex-col md:flex-row md:items-start md:justify-between gap-6 border border-gray-100">
                    <div className="flex-1">
                        {/* .page-title */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Career Path Visualizer
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
                            </div>
                        </div>
                    </div>

                    {/* .refresh-button */}
                    <button
                        onClick={() => window.location.reload()}
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

                ) : matches.length === 0 ? (
                    // .empty-state
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-center">
                        {/* .empty-icon */}
                        <Map className="w-12 h-12 text-gray-400 mb-4" />
                        {/* .empty-title */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No career matches found</h3>
                        {/* .empty-message */}
                        <p className="text-sm text-gray-500">Make sure your skills are set in your profile.</p>
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
                                                <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full font-semibold text-white text-base flex-shrink-0">
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
                                            <button
                                                onClick={() => setSelectedMatch(match)}
                                                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition-colors duration-150"
                                            >
                                                Details <ExternalLink size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
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
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
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
                                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
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
                            <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
                                Connect Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CareerPathVisualizer;
