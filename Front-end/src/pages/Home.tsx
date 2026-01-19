import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-purple-600/30 blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-pink-600/30 blur-3xl"></div>
            </div>

            {/* Header/Navbar */}
            <header className="relative z-10 border-b border-white/10 bg-slate-900/50 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-white">AlumniConnect</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/login')}
                                className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/10"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-purple-700 hover:to-pink-700"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative z-10 px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="text-5xl font-bold text-white sm:text-6xl lg:text-7xl">
                        Bridge the Gap Between{' '}
                        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Students & Alumni
                        </span>
                    </h1>
                    <p className="mt-6 text-xl text-gray-300">
                        Creating a structured ecosystem for professional networking within educational institutions.
                    </p>
                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <button
                            onClick={() => navigate('/register')}
                            className="group flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-700"
                        >
                            Join as Student
                            <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="rounded-lg border border-white/20 bg-white/5 px-8 py-4 text-lg font-semibold text-white backdrop-blur-xl transition-all hover:bg-white/10"
                        >
                            Join as Alumni
                        </button>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="relative z-10 px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl">
                            <div className="text-4xl font-bold text-purple-400">500+</div>
                            <div className="mt-2 text-gray-400">Active Alumni</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl">
                            <div className="text-4xl font-bold text-pink-400">1200+</div>
                            <div className="mt-2 text-gray-400">Students</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl">
                            <div className="text-4xl font-bold text-purple-400">300+</div>
                            <div className="mt-2 text-gray-400">Mentorships</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl">
                            <div className="text-4xl font-bold text-pink-400">85%</div>
                            <div className="mt-2 text-gray-400">Success Rate</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative z-10 px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-12 text-center">
                        <h2 className="text-4xl font-bold text-white">How It Works</h2>
                        <p className="mt-4 text-xl text-gray-400">
                            Connect, learn, and grow with our structured mentorship platform
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {/* For Students */}
                        <div className="group rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all hover:border-purple-500/50 hover:bg-white/10">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-purple-800">
                                <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-semibold text-white">For Students</h3>
                            <p className="mt-3 text-gray-400">
                                Gain direct access to industry insights, career guidance, and mentorship from alumni who have walked the same path.
                            </p>
                        </div>

                        {/* For Alumni */}
                        <div className="group rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all hover:border-pink-500/50 hover:bg-white/10">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-pink-600 to-pink-800">
                                <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-semibold text-white">For Alumni</h3>
                            <p className="mt-3 text-gray-400">
                                Give back to your alma mater through a verified channel, share your expertise, and help shape the next generation.
                            </p>
                        </div>

                        {/* Structured Ecosystem */}
                        <div className="group rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all hover:border-purple-500/50 hover:bg-white/10">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600">
                                <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-semibold text-white">Structured Ecosystem</h3>
                            <p className="mt-3 text-gray-400">
                                A well-organized platform that facilitates meaningful connections with clear goals and outcomes.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="relative z-10 px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl lg:p-12">
                        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                            <div>
                                <h2 className="text-4xl font-bold text-white">Why Choose AlumniConnect?</h2>
                                <div className="mt-8 space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-500/20">
                                            <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-white">Verified Network</h4>
                                            <p className="mt-1 text-gray-400">All alumni are verified through institutional records ensuring authentic connections.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500/20">
                                            <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-white">Structured Mentorship</h4>
                                            <p className="mt-1 text-gray-400">Predefined mentorship programs with clear objectives and timelines.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-500/20">
                                            <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-white">Industry-Ready Insights</h4>
                                            <p className="mt-1 text-gray-400">Direct access to current industry trends and requirements from professionals.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-center">
                                <div className="w-full max-w-md">
                                    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-900/50 to-pink-900/50 p-8 backdrop-blur-xl">
                                        <h3 className="mb-6 text-center text-2xl font-bold text-white">Platform Impact</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="rounded-xl bg-white/10 p-4 text-center backdrop-blur-xl">
                                                <div className="text-3xl font-bold text-purple-400">500+</div>
                                                <div className="mt-2 text-sm text-gray-300">Active Alumni</div>
                                            </div>
                                            <div className="rounded-xl bg-white/10 p-4 text-center backdrop-blur-xl">
                                                <div className="text-3xl font-bold text-pink-400">1200+</div>
                                                <div className="mt-2 text-sm text-gray-300">Students</div>
                                            </div>
                                            <div className="rounded-xl bg-white/10 p-4 text-center backdrop-blur-xl">
                                                <div className="text-3xl font-bold text-purple-400">300+</div>
                                                <div className="mt-2 text-sm text-gray-300">Mentorships</div>
                                            </div>
                                            <div className="rounded-xl bg-white/10 p-4 text-center backdrop-blur-xl">
                                                <div className="text-3xl font-bold text-pink-400">85%</div>
                                                <div className="mt-2 text-sm text-gray-300">Success Rate</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-4xl font-bold text-white">Ready to Bridge the Gap?</h2>
                    <p className="mt-4 text-xl text-gray-300">
                        Join our growing community of students and alumni building meaningful professional connections.
                    </p>
                    <div className="mt-8">
                        <button
                            onClick={() => navigate('/register')}
                            className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-700"
                        >
                            Get Started Today
                            <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </button>
                    </div>
                    <p className="mt-6 text-gray-400">
                        Already have an account?{' '}
                        <button onClick={() => navigate('/login')} className="font-semibold text-purple-400 hover:text-purple-300">
                            Sign in
                        </button>
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 bg-slate-900/50 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="text-center text-gray-400">
                        <p>&copy; 2026 AlumniConnect. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
