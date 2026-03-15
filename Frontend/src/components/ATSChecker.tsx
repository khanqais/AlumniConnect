import { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';

/* ================================================================
   Types
   ================================================================ */

interface ATSBreakdown {
    quantifyImpact: number;
    leadership: number;
    communication: number;
    teamwork: number;
    drive: number;
    structure: number;
}

interface ATSFix {
    category: string;
    priority: 'high' | 'medium' | 'low';
    fix: string;
    icon: string;
}

interface ATSStructure {
    wordCount: number;
    sectionsFound: string[];
    sectionsMissing: string[];
    actionVerbsFound: number;
    weakVerbsFound: number;
    verbVariety: number;
    bulletCount: number;
}

interface ATSResult {
    overall: number;
    grade: string;
    label: string;
    breakdown: ATSBreakdown;
    structure: ATSStructure;
    topFixes: ATSFix[];
}

interface CategoryItem {
    key: keyof ATSBreakdown;
    label: string;
    icon: string;
    weight: string;
    score: number;
}

/* ================================================================
   Score Ring — big sidebar ring matching Resume Worded style
   ================================================================ */

const ScoreRing = ({ score, size = 140, strokeWidth = 11 }: {
    score: number;
    size?: number;
    strokeWidth?: number;
}) => {
    const r = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;

    // Orange-red gradient color like Resume Worded
    const strokeColor =
        score >= 80 ? '#22c55e' :
        score >= 65 ? '#3b82f6' :
        score >= 45 ? '#f97316' :
        '#ef4444';

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
                <circle
                    cx={size / 2} cy={size / 2} r={r}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' }}
                />
            </svg>
            <div className="flex flex-col items-center justify-center z-10">
                <span className="text-4xl font-black text-gray-800 leading-none">{score}</span>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-0.5">OVERALL</span>
            </div>
        </div>
    );
};

/* ================================================================
   Color Spectrum Bar — "YOUR RESUME ▼ ... TOP RESUMES ┆"
   ================================================================ */

const SpectrumBar = ({ score }: { score: number }) => {
    return (
        <div className="mt-6">
            <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                <span>YOUR RESUME</span>
                <span>TOP RESUMES</span>
            </div>
            <div className="relative h-5 rounded-full overflow-visible"
                style={{ background: 'linear-gradient(to right, #ef4444, #f97316, #eab308, #84cc16, #22c55e)' }}>
                {/* User marker */}
                <div
                    className="absolute -top-1.5 flex flex-col items-center"
                    style={{ left: `${score}%`, transform: 'translateX(-50%)' }}
                >
                    <div className="w-0 h-0"
                        style={{
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderTop: '8px solid #1e293b',
                        }}
                    />
                </div>
                {/* Top resumes marker (dashed line at ~85%) */}
                <div
                    className="absolute top-0 bottom-0 w-0.5 border-l-2 border-dashed border-white/80"
                    style={{ left: '85%' }}
                />
            </div>
        </div>
    );
};

/* ================================================================
   Upload Zone
   ================================================================ */

const UploadZone = ({ onFile, loading }: { onFile: (f: File) => void; loading: boolean }) => {
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) onFile(file);
    }, [onFile]);

    return (
        <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onClick={() => !loading && inputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 py-20 px-8 text-center
                ${dragging ? 'border-blue-500 bg-blue-50 scale-[1.01]' : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/40'}
                ${loading ? 'pointer-events-none opacity-60' : ''}`}
        >
            <input
                ref={inputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }}
                disabled={loading}
            />

            {loading ? (
                <>
                    <div className="h-14 w-14 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
                    <div>
                        <p className="text-lg font-bold text-gray-700">Analyzing your resume…</p>
                        <p className="text-sm text-gray-400 mt-1">Running ATS scoring engine</p>
                    </div>
                </>
            ) : (
                <>
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 shadow-sm">
                        <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-lg font-bold text-gray-800">
                            {dragging ? 'Drop it here!' : 'Upload your resume'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Drag & drop or click to browse — PDF, DOC, DOCX (max 10MB)
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {['PDF', 'DOC', 'DOCX'].map(f => (
                            <span key={f} className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm">
                                {f}
                            </span>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

/* ================================================================
   Main ATSChecker Component — 3-panel Resume Worded layout
   ================================================================ */

const CATEGORIES: Omit<CategoryItem, 'score'>[] = [
    { key: 'quantifyImpact', label: 'Quantify impact',  icon: '📊', weight: '25%' },
    { key: 'leadership',     label: 'Leadership',        icon: '🎯', weight: '20%' },
    { key: 'communication',  label: 'Communication',     icon: '💬', weight: '15%' },
    { key: 'teamwork',       label: 'Teamwork',          icon: '🤝', weight: '15%' },
    { key: 'drive',          label: 'Drive',             icon: '🚀', weight: '15%' },
];

const LOADING_STEPS = [
    'Please wait…',
    'Loading your resume…',
    'Parsing your resume…',
    'Identifying your work experiences…',
    'Identifying other experiences…',
    'Evaluating resume length…',
    'Identifying bullet points…',
    'Checking for quantified impact…',
    'Evaluating leadership signals…',
    'Analyzing communication skills…',
    'Checking teamwork indicators…',
    'Measuring drive & initiative…',
    'Calculating your ATS score…',
];

const STEP_DELAY = 550; // ms per step

const ATSChecker = () => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ATSResult | null>(null);
    const [error, setError] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // Staged loading animation state
    const [showSteps, setShowSteps] = useState(false);
    const [currentStep, setCurrentStep] = useState(-1);
    const pendingResult = useRef<ATSResult | null>(null);
    const pendingError = useRef<string>('');
    const apiDone = useRef(false);
    const stepTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

    // Clean up blob URL on unmount / file change
    useEffect(() => {
        return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
    }, [previewUrl]);

    // Clean up timers on unmount
    useEffect(() => {
        return () => { stepTimers.current.forEach(t => clearTimeout(t)); };
    }, []);

    const handleFile = useCallback(async (selectedFile: File) => {
        setFile(selectedFile);
        setError('');
        setResult(null);
        setActiveCategory(null);
        pendingResult.current = null;
        pendingError.current = '';
        apiDone.current = false;

        // Create preview URL for PDF
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        if (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf')) {
            setPreviewUrl(URL.createObjectURL(selectedFile));
        } else {
            setPreviewUrl(null);
        }

        // Start staged loading animation
        setShowSteps(true);
        setCurrentStep(-1);
        setLoading(true);

        // Clear any prior timers
        stepTimers.current.forEach(t => clearTimeout(t));
        stepTimers.current = [];

        // Kick off step progression — each step reveals after STEP_DELAY
        LOADING_STEPS.forEach((_, i) => {
            const t = setTimeout(() => {
                setCurrentStep(i);
            }, (i + 1) * STEP_DELAY);
            stepTimers.current.push(t);
        });

        // API call in parallel — track start time for animation sync
        const animStart = Date.now();
        const totalAnimTime = (LOADING_STEPS.length + 1) * STEP_DELAY + 800;

        try {
            const formData = new FormData();
            formData.append('resume', selectedFile);
            const res = await axios.post<ATSResult>(
                'http://localhost:5000/api/resources/ats-check',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            pendingResult.current = res.data;
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            pendingError.current = e.response?.data?.message || 'Failed to analyze resume. Please try again.';
        }
        apiDone.current = true;

        // Wait for remaining animation time (API may finish before steps complete)
        const elapsed = Date.now() - animStart;
        const waitMore = Math.max(0, totalAnimTime - elapsed);
        if (waitMore > 0) {
            await new Promise(resolve => setTimeout(resolve, waitMore));
        }

        // Show results
        if (pendingResult.current) {
            setResult(pendingResult.current);
            const first = CATEGORIES.find(c =>
                pendingResult.current!.breakdown[c.key] < 80
            );
            if (first) setActiveCategory(first.key);
        }
        if (pendingError.current) {
            setError(pendingError.current);
        }
        setShowSteps(false);
        setCurrentStep(-1);
        setLoading(false);
    }, [previewUrl]);

    const handleReset = useCallback(() => {
        setFile(null);
        setResult(null);
        setError('');
        setActiveCategory(null);
        if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
    }, [previewUrl]);

    const categories: CategoryItem[] = result
        ? CATEGORIES.map(c => ({ ...c, score: result.breakdown[c.key] }))
        : [];

    const fixesForCategory = (catKey: string) =>
        result?.topFixes.filter(f => f.category.toLowerCase().replace(/\s/g, '') === catKey.toLowerCase()) ?? [];

    const issueCount = (catKey: string) =>
        result ? Math.max(0, fixesForCategory(catKey).length) : 0;

    // Score description text like Resume Worded
    const getScoreBlurb = (score: number) => {
        if (score >= 85) return { headline: `Your resume scored ${score} out of 100.`, body: `Excellent work! Your resume is highly optimized for ATS systems and hiring managers. Minor tweaks below can push it even higher.` };
        if (score >= 70) return { headline: `Your resume scored ${score} out of 100.`, body: `Good start! Your resume passes most ATS filters. It scored lower on a few criteria that hiring managers look for, but they can be improved.` };
        if (score >= 50) return { headline: `Your resume scored ${score} out of 100.`, body: `This is a decent start, but there's clear room for improvement on your resume. It scored low on some key criteria hiring managers and resume screening software look for, but they can be easily improved. Let's dive into what we checked your resume for, and how you can improve your score by ${Math.min(30, 100 - score)}+ points.` };
        return { headline: `Your resume scored ${score} out of 100.`, body: `Your resume needs significant work before it's ready for ATS systems. Many hiring managers and resume screening tools will filter it out. Follow the fixes below — you could improve your score by ${Math.min(40, 100 - score)}+ points with targeted changes.` };
    };

    /* ── PRE-UPLOAD VIEW ── */
    if (!result && !loading) {
        return (
            <div className="space-y-4">
                {/* Page header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Score My Resume</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Get an instant ATS score + prioritized fixes</p>
                    </div>
                </div>

                {error && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                        <span className="text-xl">⚠️</span>
                        <div>
                            <p className="font-semibold text-red-800">Analysis Failed</p>
                            <p className="text-sm text-red-600 mt-0.5">{error}</p>
                        </div>
                    </div>
                )}

                <UploadZone onFile={handleFile} loading={loading} />

                {/* What we check */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 mt-2">
                    {CATEGORIES.map(c => (
                        <div key={c.key} className="rounded-xl border border-gray-200 bg-white p-3 text-center shadow-sm">
                            <div className="text-2xl mb-1">{c.icon}</div>
                            <p className="text-xs font-semibold text-gray-700">{c.label}</p>
                            <p className="text-xs text-gray-400">{c.weight} weight</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    /* ── LOADING — Staged steps overlay ── */
    if (loading && showSteps) {
        return (
            <div className="flex min-h-[600px] items-center justify-center rounded-2xl bg-[#1a1a40] p-8">
                <div className="w-full max-w-md space-y-5">
                    {LOADING_STEPS.map((step, i) => {
                        const isDone = i < currentStep;
                        const isActive = i === currentStep;
                        const isPending = i > currentStep;

                        return (
                            <div
                                key={i}
                                className={`flex items-center gap-4 transition-all duration-500 ${
                                    isPending ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                                }`}
                            >
                                {/* Circle icon */}
                                <div className="shrink-0">
                                    {isDone ? (
                                        /* Green completed check */
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
                                            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    ) : isActive ? (
                                        /* Active spinner ring */
                                        <div className="relative flex h-9 w-9 items-center justify-center">
                                            <div className="absolute inset-0 rounded-full border-2 border-white/20" />
                                            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-400 animate-spin" />
                                            <svg className="h-4 w-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    ) : (
                                        /* Pending dimmed circle */
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/10">
                                            <svg className="h-4 w-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* Step text */}
                                <span className={`text-base font-medium transition-colors duration-500 ${
                                    isDone ? 'text-white/40' :
                                    isActive ? 'text-white' :
                                    'text-white/20'
                                }`}>
                                    {step}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    /* ── RESULTS — 3-PANEL LAYOUT ── */
    const blurb = result ? getScoreBlurb(result.overall) : null;
    const totalIssues = result ? result.topFixes.length : 0;

    return (
        <div className="flex h-[calc(100vh-180px)] min-h-[600px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            {/* ══════════════════════════════════════════
                LEFT SIDEBAR
                ══════════════════════════════════════════ */}
            <aside className="flex w-56 shrink-0 flex-col border-r border-gray-200 bg-gray-50">

                {/* Score ring */}
                <div className="flex flex-col items-center px-4 py-6 border-b border-gray-200">
                    {result && <ScoreRing score={result.overall} size={130} strokeWidth={11} />}
                </div>

                {/* Nav: Home */}
                <div className="px-3 py-3 border-b border-gray-200">
                    <button className="flex w-full items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Home
                    </button>
                </div>

                {/* TOP FIXES */}
                <div className="flex-1 overflow-y-auto px-3 py-3">
                    <p className="mb-2 px-1 text-xs font-bold uppercase tracking-widest text-gray-400">Top Fixes</p>
                    <div className="space-y-0.5">
                        {categories.map(cat => {
                            const count = issueCount(cat.key);
                            const isActive = activeCategory === cat.key;
                            return (
                                <button
                                    key={cat.key}
                                    onClick={() => setActiveCategory(isActive ? null : cat.key)}
                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all ${
                                        isActive
                                            ? 'bg-white text-gray-900 shadow-sm font-semibold'
                                            : 'text-gray-600 hover:bg-white hover:text-gray-900'
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        {cat.icon && <span className="text-base">{cat.icon}</span>}
                                        {cat.label}
                                    </span>
                                    {count > 0 ? (
                                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                                            {count}
                                        </span>
                                    ) : (
                                        <span className="text-green-500 text-base">✓</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Issues count chip */}
                    {totalIssues > 0 && (
                        <div className="mt-3 px-1">
                            <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm">
                                <span className="text-red-500">+</span>
                                {totalIssues} issue{totalIssues !== 1 ? 's' : ''} found
                            </div>
                        </div>
                    )}
                </div>

                {/* Re-score button */}
                <div className="p-3 border-t border-gray-200">
                    <button
                        onClick={handleReset}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Re-score Resume
                    </button>
                </div>
            </aside>

            {/* ══════════════════════════════════════════
                CENTER PANEL
                ══════════════════════════════════════════ */}
            <main className="flex flex-1 flex-col overflow-hidden">
                {/* Tab bar */}
                <div className="flex border-b border-gray-200 bg-white px-6">
                    <button className="border-b-2 border-blue-600 px-4 py-3 text-sm font-semibold text-blue-600">
                        ★ LATEST SCORE
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

                    {/* Greeting + score headline */}
                    {result && blurb && (
                        <div>
                            <p className="text-2xl font-bold text-gray-900 mb-3">
                                Welcome to your resume review.
                            </p>
                            <p className="text-lg font-bold text-gray-800">{blurb.headline}</p>
                            <p className="mt-2 text-sm leading-relaxed text-gray-500 max-w-2xl">
                                {blurb.body.split(/(It scored low|but they can be easily improved|improve your score)/gi).map((part, i) => {
                                    if (/scored low|improve your score/i.test(part)) {
                                        return <span key={i} className="text-blue-600 font-medium">{part}</span>;
                                    }
                                    return part;
                                })}
                            </p>
                        </div>
                    )}

                    {/* Color spectrum bar */}
                    {result && <SpectrumBar score={result.overall} />}

                    {/* ── Category Breakdown Accordion ── */}
                    {result && (
                        <div className="space-y-1">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                                What We Checked
                            </h3>
                            {categories.map(cat => {
                                const fixes = fixesForCategory(cat.key);
                                const isOpen = activeCategory === cat.key;
                                const pct = cat.score;
                                const barColor =
                                    pct >= 80 ? 'bg-green-500' :
                                    pct >= 60 ? 'bg-blue-500' :
                                    pct >= 40 ? 'bg-amber-500' :
                                    'bg-red-500';
                                const textColor =
                                    pct >= 80 ? 'text-green-700' :
                                    pct >= 60 ? 'text-blue-700' :
                                    pct >= 40 ? 'text-amber-700' :
                                    'text-red-600';

                                return (
                                    <div key={cat.key} className="rounded-xl border border-gray-200 bg-white overflow-hidden transition-shadow hover:shadow-sm">
                                        {/* Category header row */}
                                        <button
                                            className="flex w-full items-center gap-3 px-5 py-4 text-left"
                                            onClick={() => setActiveCategory(isOpen ? null : cat.key)}
                                        >
                                            <span className="text-xl shrink-0">{cat.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-sm font-semibold text-gray-800">{cat.label}</span>
                                                    <span className={`text-sm font-bold ${textColor}`}>{pct}/100</span>
                                                </div>
                                                <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${barColor} transition-all duration-1000`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <span className={`ml-2 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </span>
                                        </button>

                                        {/* Fixes accordion body */}
                                        {isOpen && (
                                            <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 space-y-3">
                                                {fixes.length === 0 ? (
                                                    <div className="flex items-center gap-2 text-sm text-green-700">
                                                        <span className="text-lg">🎉</span>
                                                        <span className="font-medium">Great job! No issues found in this category.</span>
                                                    </div>
                                                ) : (
                                                    fixes.map((fix, i) => (
                                                        <div key={i} className={`flex gap-3 rounded-lg border p-3.5 ${
                                                            fix.priority === 'high'
                                                                ? 'border-red-200 bg-red-50'
                                                                : fix.priority === 'medium'
                                                                ? 'border-amber-200 bg-amber-50'
                                                                : 'border-blue-200 bg-blue-50'
                                                        }`}>
                                                            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                                                                fix.priority === 'high'
                                                                    ? 'bg-red-500 text-white'
                                                                    : fix.priority === 'medium'
                                                                    ? 'bg-amber-400 text-white'
                                                                    : 'bg-blue-400 text-white'
                                                            }`}>
                                                                {i + 1}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-1.5 mb-1">
                                                                    <span className={`text-xs font-bold uppercase tracking-wide ${
                                                                        fix.priority === 'high' ? 'text-red-700' : fix.priority === 'medium' ? 'text-amber-700' : 'text-blue-700'
                                                                    }`}>
                                                                        {fix.priority === 'high' ? '🔴 High Priority' : fix.priority === 'medium' ? '🟡 Medium Priority' : '🔵 Low Priority'}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-700 leading-relaxed">{fix.fix}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}

                                                {/* Sub-score detail */}
                                                <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                                                    <span>Score: <strong className={textColor}>{pct}/100</strong></span>
                                                    <span>·</span>
                                                    <span>Weight: <strong>{cat.weight}</strong></span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Structure stats */}
                    {result && (
                        <div className="rounded-xl border border-gray-200 bg-white p-5">
                            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                                📋 Structure Analysis
                            </h3>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {[
                                    { label: 'Word Count',    value: result.structure.wordCount,         good: result.structure.wordCount >= 300 && result.structure.wordCount <= 900 },
                                    { label: 'Bullet Points', value: result.structure.bulletCount,       good: result.structure.bulletCount >= 8 },
                                    { label: 'Action Verbs',  value: result.structure.actionVerbsFound,  good: result.structure.actionVerbsFound >= 5 },
                                    { label: 'Weak Verbs',    value: result.structure.weakVerbsFound,    good: result.structure.weakVerbsFound <= 2 },
                                    { label: 'Verb Variety',  value: result.structure.verbVariety,       good: result.structure.verbVariety >= 5 },
                                    { label: 'Sections Found',value: result.structure.sectionsFound.length, good: result.structure.sectionsFound.length >= 4 },
                                    { label: 'Missing',       value: result.structure.sectionsMissing.length, good: result.structure.sectionsMissing.length === 0 },
                                ].map(stat => (
                                    <div key={stat.label} className={`rounded-lg border p-3 text-center ${
                                        stat.good ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                                    }`}>
                                        <p className={`text-2xl font-black ${stat.good ? 'text-green-700' : 'text-red-600'}`}>
                                            {stat.value}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Sections found/missing */}
                            {result.structure.sectionsFound.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {result.structure.sectionsFound.map(s => (
                                        <span key={s} className="rounded-md bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 capitalize">
                                            ✓ {s}
                                        </span>
                                    ))}
                                    {result.structure.sectionsMissing.map(s => (
                                        <span key={s} className="rounded-md bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 capitalize">
                                            ✗ {s}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pro Tips */}
                    {result && (
                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                            <p className="text-sm font-bold text-blue-800 mb-3">💡 Pro Tips for ATS Success</p>
                            <div className="grid gap-1.5 sm:grid-cols-2">
                                {[
                                    'Use standard section headings — Experience, Education, Skills',
                                    'Include exact keywords from the target job description',
                                    'Avoid tables, columns, graphics — ATS can\'t parse them',
                                    'Quantify every achievement with numbers and percentages',
                                    'Start every bullet with a strong action verb',
                                    'Submit as PDF unless the posting explicitly asks for DOCX',
                                ].map((tip, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm text-blue-700">
                                        <span className="mt-0.5 shrink-0 text-blue-400 font-bold">›</span>
                                        {tip}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ══════════════════════════════════════════
                RIGHT PANEL — PDF Preview
                ══════════════════════════════════════════ */}
            <aside className="hidden w-[38%] shrink-0 border-l border-gray-200 xl:flex xl:flex-col">
                <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Resume Preview</p>
                    {file && (
                        <span className="truncate max-w-[160px] text-xs text-gray-400">{file.name}</span>
                    )}
                </div>

                <div className="flex-1 bg-gray-100 overflow-hidden">
                    {previewUrl ? (
                        <iframe
                            src={previewUrl}
                            title="Resume Preview"
                            className="h-full w-full border-0"
                            style={{ background: '#f3f4f6' }}
                        />
                    ) : file ? (
                        /* DOC/DOCX — no native preview */
                        <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
                                <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-700">{file.name}</p>
                                <p className="mt-1 text-xs text-gray-400">
                                    Preview not available for DOC/DOCX.<br />Upload a PDF for live preview.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-2 text-center p-8">
                            <svg className="h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-sm text-gray-400">Upload a PDF resume to see a live preview here</p>
                        </div>
                    )}
                </div>
            </aside>

        </div>
    );
};

export default ATSChecker;
