import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

const Home = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const isLoggedIn = !!user;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">

            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-blue-100 blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-indigo-100 blur-3xl"></div>
            </div>

            {/* Header/Navbar */}
            <header className="relative z-10 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-gray-900">AlumniConnect</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {isLoggedIn ? (
                                <>
                                    <div className="hidden items-center gap-2 sm:flex">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-sm font-bold text-white">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{user.name}</span>
                                    </div>
                                    {/* Primary Button - btn-primary styles */}
                                    <button
                                        onClick={() => navigate('/dashboard')}
                                        className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-300/40 transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-800 hover:shadow-lg hover:shadow-blue-400/40"
                                    >
                                        Go to Dashboard
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* Secondary Button - btn-secondary styles */}
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
                                    >
                                        Sign In
                                    </button>
                                    {/* Primary Button */}
                                    <button
                                        onClick={() => navigate('/register')}
                                        className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-300/40 transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-800 hover:shadow-lg hover:shadow-blue-400/40"
                                    >
                                        Get Started
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            {isLoggedIn ? (
                // Logged In View — min-h-[600px] matches CSS min-height: 600px
                <section className="relative z-10 flex min-h-[600px] items-center px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl text-center">
                        {/* hero-title: text-5xl/6xl/7xl, font-extrabold, leading-tight */}
                        <h1 className="text-5xl font-extrabold leading-tight text-gray-900 sm:text-6xl lg:text-7xl">
                            Welcome back,{' '}
                            {/* text-gradient: bg-gradient from amber */}
                            <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
                                {user.name}!
                            </span>
                        </h1>
                        {/* hero-subtitle: text-2xl, text-gray-600, max-w-3xl, leading-relaxed */}
                        <p className="mx-auto mt-6 max-w-3xl text-xl leading-relaxed text-gray-600 sm:text-2xl">
                            Continue your mentorship journey and explore new opportunities.
                        </p>
                        {/* hero-buttons: flex, gap-4, flex-wrap, justify-center */}
                        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-3 text-lg font-semibold text-white shadow-md shadow-blue-300/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-400/40"
                            >
                                Go to Dashboard
                                <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                            <button
                                onClick={() => navigate('/resources')}
                                className="rounded-lg border border-gray-300 bg-white px-8 py-3 text-lg font-semibold text-indigo-700 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-lg"
                            >
                                Browse Resources
                            </button>
                        </div>
                    </div>
                </section>
            ) : (
                // Guest View
                <section className="relative z-10 flex min-h-[600px] items-center px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl text-center">
                        <h1 className="text-5xl font-extrabold leading-tight text-gray-900 sm:text-6xl lg:text-7xl">
                            Bridge the Gap Between{' '}
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                                Students & Alumni
                            </span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-3xl text-xl leading-relaxed text-gray-600 sm:text-2xl">
                            Creating a structured ecosystem for professional networking within educational institutions.
                        </p>
                        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                            <button
                                onClick={() => navigate('/register')}
                                className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-3 text-lg font-semibold text-white shadow-md shadow-blue-300/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-400/40"
                            >
                                Join as Student
                                <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="rounded-lg border border-gray-300 bg-white px-8 py-3 text-lg font-semibold text-indigo-700 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-lg"
                            >
                                Join as Alumni
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* Stats Section — stats-card: shadow-xl rounded-2xl */}
            <section className="relative z-10 px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                        {[
                            { value: '500+', label: 'Active Alumni', color: 'text-blue-600' },
                            { value: '1200+', label: 'Students', color: 'text-indigo-600' },
                            { value: '300+', label: 'Mentorships', color: 'text-blue-600' },
                            { value: '85%', label: 'Success Rate', color: 'text-indigo-600' },
                        ].map(({ value, label, color }) => (
                            <div
                                key={label}
                                className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                            >
                                <div className={`text-4xl font-bold ${color}`}>{value}</div>
                                <div className="mt-2 text-gray-600">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quick Access — only for logged-in users */}
            {isLoggedIn && (
                <section className="relative z-10 px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        {/* section-title / section-description */}
                        <div className="mb-12 text-center">
                            <h2 className="text-4xl font-bold text-gray-900">Quick Access</h2>
                            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-gray-500">
                                Jump right into what you need
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                            {/* feature-card: rounded-2xl bg-white shadow hover:-translate-y-1 hover:shadow-xl */}
                            {[
                                {
                                    path: '/resources',
                                    gradient: 'from-blue-500 to-blue-600',
                                    border: 'hover:border-blue-500',
                                    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
                                    title: 'Resources',
                                    desc: 'Download resumes, notes & interview experiences',
                                },
                                {
                                    path: '/blogs',
                                    gradient: 'from-indigo-500 to-indigo-600',
                                    border: 'hover:border-indigo-500',
                                    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
                                    title: 'Blogs',
                                    desc: 'Read career advice & alumni experiences',
                                },
                                {
                                    path: '/community',
                                    gradient: 'from-blue-500 to-blue-600',
                                    border: 'hover:border-blue-500',
                                    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
                                    title: 'Community',
                                    desc: 'Ask questions & get help from alumni',
                                },
                                {
                                    path: '/events',
                                    gradient: 'from-indigo-500 to-indigo-600',
                                    border: 'hover:border-indigo-500',
                                    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                                    title: 'Events',
                                    desc: 'Join webinars & networking events',
                                },
                            ].map(({ path, gradient, border, icon, title, desc }) => (
                                <button
                                    key={title}
                                    onClick={() => navigate(path)}
                                    className={`group rounded-2xl border border-gray-200 bg-white p-8 text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${border}`}
                                >
                                    {/* feature-icon-wrapper: w-20 h-20 rounded-full (mapped to rounded-xl here) */}
                                    <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${gradient}`}>
                                        <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                                        </svg>
                                    </div>
                                    {/* feature-title */}
                                    <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>
                                    {/* feature-description */}
                                    <p className="mt-3 leading-relaxed text-gray-600">{desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* How It Works — only for guests */}
            {!isLoggedIn && (
                <section className="relative z-10 px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-12 text-center">
                            <h2 className="text-4xl font-bold text-gray-900">How It Works</h2>
                            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-gray-500">
                                Connect, learn, and grow with our structured mentorship platform
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            {[
                                {
                                    gradient: 'from-blue-500 to-blue-600',
                                    border: 'hover:border-blue-500',
                                    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
                                    title: 'For Students',
                                    desc: 'Gain direct access to industry insights, career guidance, and mentorship from alumni who have walked the same path.',
                                },
                                {
                                    gradient: 'from-indigo-500 to-indigo-600',
                                    border: 'hover:border-indigo-500',
                                    icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
                                    title: 'For Alumni',
                                    desc: 'Give back to your alma mater through a verified channel, share your expertise, and help shape the next generation.',
                                },
                                {
                                    gradient: 'from-blue-500 to-indigo-600',
                                    border: 'hover:border-blue-500',
                                    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
                                    title: 'Structured Ecosystem',
                                    desc: 'A well-organized platform that facilitates meaningful connections with clear goals and outcomes.',
                                },
                            ].map(({ gradient, border, icon, title, desc }) => (
                                // feature-card hover effects
                                <div
                                    key={title}
                                    className={`group rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${border}`}
                                >
                                    {/* feature-icon-wrapper: centered circle */}
                                    <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${gradient}`}>
                                        <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>
                                    <p className="mt-4 leading-relaxed text-gray-600">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Benefits Section — only for guests */}
            {!isLoggedIn && (
                <section className="relative z-10 px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        {/* stats-card: shadow-xl rounded-3xl */}
                        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl lg:p-12">
                            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                                <div>
                                    <h2 className="text-4xl font-bold text-gray-900">Why Choose AlumniConnect?</h2>
                                    <div className="mt-8 space-y-6">
                                        {[
                                            {
                                                bg: 'bg-green-100',
                                                iconColor: 'text-green-600',
                                                icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
                                                title: 'Verified Network',
                                                desc: 'All alumni are verified through institutional records ensuring authentic connections.',
                                            },
                                            {
                                                bg: 'bg-blue-100',
                                                iconColor: 'text-blue-600',
                                                icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
                                                title: 'Structured Mentorship',
                                                desc: 'Predefined mentorship programs with clear objectives and timelines.',
                                            },
                                            {
                                                bg: 'bg-indigo-100',
                                                iconColor: 'text-indigo-600',
                                                icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
                                                title: 'Industry-Ready Insights',
                                                desc: 'Direct access to current industry trends and requirements from professionals.',
                                            },
                                        ].map(({ bg, iconColor, icon, title, desc }) => (
                                            <div key={title} className="flex items-start gap-4">
                                                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${bg}`}>
                                                    <svg className={`h-6 w-6 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
                                                    <p className="mt-1 leading-relaxed text-gray-600">{desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-center">
                                    <div className="w-full max-w-md">
                                        {/* stats-card inner: shadow-xl */}
                                        <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 shadow-xl">
                                            <h3 className="mb-6 text-center text-2xl font-bold text-gray-900">Platform Impact</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                {[
                                                    { value: '500+', label: 'Active Alumni', color: 'text-blue-600' },
                                                    { value: '1200+', label: 'Students', color: 'text-indigo-600' },
                                                    { value: '300+', label: 'Mentorships', color: 'text-blue-600' },
                                                    { value: '85%', label: 'Success Rate', color: 'text-indigo-600' },
                                                ].map(({ value, label, color }) => (
                                                    <div key={label} className="rounded-xl bg-white p-4 text-center shadow-md">
                                                        <div className={`text-3xl font-bold ${color}`}>{value}</div>
                                                        <div className="mt-2 text-sm text-gray-600">{label}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="relative z-10 px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    {isLoggedIn ? (
                        <>
                            <h2 className="text-4xl font-bold text-gray-900">Ready to Continue?</h2>
                            <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-600">
                                Your dashboard is waiting for you with personalized recommendations.
                            </p>
                            <div className="mt-8">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-md shadow-blue-300/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-400/40"
                                >
                                    Open Dashboard
                                    <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="text-4xl font-bold text-gray-900">Ready to Bridge the Gap?</h2>
                            <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-600">
                                Join our growing community of students and alumni building meaningful professional connections.
                            </p>
                            <div className="mt-8">
                                <button
                                    onClick={() => navigate('/register')}
                                    className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-md shadow-blue-300/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-400/40"
                                >
                                    Get Started Today
                                    <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </button>
                            </div>
                            <p className="mt-6 text-gray-600">
                                Already have an account?{' '}
                                <button onClick={() => navigate('/login')} className="font-semibold text-blue-600 transition-colors hover:text-blue-700">
                                    Sign in
                                </button>
                            </p>
                        </>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Home;
