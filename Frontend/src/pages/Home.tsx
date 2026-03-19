import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import { motion, useScroll, useTransform } from "framer-motion";
import { Users, BookOpen, Calendar, MessageSquare, Briefcase, Shield, GraduationCap, Network, Zap, Globe } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);


  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
  };

  const bentoStagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } }
  };

  return (
    <>
      <style>
        {`
          .bg-noise {
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
            opacity: 0.03;
            pointer-events: none;
          }
          
          .bg-grid {
            background-size: 40px 40px;
            background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          }

          @keyframes heroFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-14px); }
          }

          @keyframes heroFloatReverse {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(10px); }
          }

          @keyframes orbitSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes glowPulse {
            0%, 100% { opacity: 0.35; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.08); }
          }

          .hero-float {
            animation: heroFloat 6s ease-in-out infinite;
            will-change: transform;
          }

          .hero-float-reverse {
            animation: heroFloatReverse 5s ease-in-out infinite;
            will-change: transform;
          }

          .hero-orbit {
            animation: orbitSpin 18s linear infinite;
            transform-origin: center;
          }

           .hero-pulse {
             animation: glowPulse 3.8s ease-in-out infinite;
           }

           @keyframes float-3d {
             0%, 100% { transform: translate3d(0, 0, 0) rotate3d(1, 1, 1, 0deg); }
             25% { transform: translate3d(5px, -10px, 5px) rotate3d(1, 0.5, 0.5, 5deg); }
             50% { transform: translate3d(-8px, 5px, -3px) rotate3d(0.5, 1, 0.5, -3deg); }
             75% { transform: translate3d(3px, 8px, 8px) rotate3d(0.5, 0.5, 1, 2deg); }
           }

           @keyframes particle-float {
             0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
             50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
           }

           @keyframes shimmer {
             0% { transform: translateX(-100%) skewX(-15deg); }
             100% { transform: translateX(200%) skewX(-15deg); }
           }

           .particle-float {
             animation: particle-float 4s ease-in-out infinite;
           }

           .shimmer-overlay {
             position: relative;
             overflow: hidden;
           }

           .shimmer-overlay::after {
             content: '';
             position: absolute;
             top: 0;
             left: 0;
             width: 50%;
             height: 100%;
             background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
             animation: shimmer 2s infinite;
             transform: skewX(-15deg);
           }
         `}
      </style>

      <div className="min-h-screen bg-[#0A0D14] text-gray-200 font-dm overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-200 relative">
        {/* Decorative Background */}
        <div className="fixed inset-0 bg-noise z-0 mix-blend-overlay"></div>
        <div className="fixed inset-0 bg-grid z-0 mask-image:linear-gradient(to_bottom,transparent,black)]"></div>

        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/4 w-[50vw] h-[50vh] bg-amber-500/5 rounded-[100%] blur-[120px] -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute top-[40%] right-0 w-[40vw] h-[60vh] bg-blue-500/5 rounded-[100%] blur-[120px] pointer-events-none"></div>


        {/* Navigation */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4 pointer-events-none"
        >
          <div className="flex items-center justify-between w-full max-w-5xl bg-[#121620]/80 backdrop-blur-md border border-white/10 rounded-full px-4 py-3 pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-3 pl-2">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-white/10">
                <img
                  src="/logo.png"
                  alt="AlumniConnect"
                  className="mt-2 block h-full w-full scale-[1.7] origin-center object-contain object-center"
                />
              </div>
              <span className="text-lg font-bold font-syne text-white tracking-tight">
                AlumniConnect
              </span>
              
            </div>

            <div className="flex items-center gap-2">
              {isLoggedIn ? (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#0A0D14] hover:bg-amber-400 transition-colors"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.header>


        {/* HERO SECTION */}
        <section className="relative z-10 pt-20 pb-20 px-4 min-h-[90vh] flex flex-col justify-center">
          <div className="max-w-5xl mx-auto w-full grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
            
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="max-w-2xl lg:px-2"
            >
              

              <motion.h1
                variants={fadeUp}
                className="text-5xl sm:text-6xl md:text-7xl font-extrabold font-syne leading-[1.05] text-white tracking-tight"
              >
                Where <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Ambition</span> meets Experience.
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="mt-6 text-lg sm:text-xl text-gray-400 leading-relaxed max-w-xl font-light"
              >
                The exclusive hub for institutional excellence. Connect with verified alumni, secure elite mentorships, and unlock career-defining opportunities.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mt-10 flex flex-wrap items-center gap-4"
              >
                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/10 backdrop-blur-sm"
                >
                  Explore Dashboard
                </button>
              </motion.div>
            </motion.div>

             {/* Hero Visual - Modern Animated System */}
             <motion.div 
               initial={{ opacity: 0, x: 40 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
               className="relative hidden lg:block h-[500px]"
             >
               {/* Animated Background Particles */}
               <div className="absolute inset-0 pointer-events-none">
                 {/* Floating Particles */}
                 {Array.from({ length: 12 }).map((_, i) => (
                   <motion.div
                     key={i}
                     className={`absolute w-2 h-2 rounded-full ${
                       i % 3 === 0 ? 'bg-amber-400/40' : 
                       i % 3 === 1 ? 'bg-blue-400/40' : 
                       'bg-white/30'
                     }`}
                     style={{
                       top: `${15 + (i * 7) % 70}%`,
                       left: `${10 + (i * 11) % 80}%`,
                     }}
                     animate={{
                       y: [0, -20, 0],
                       scale: [1, 1.2, 1],
                       opacity: [0.3, 0.8, 0.3]
                     }}
                     transition={{
                       duration: 4 + Math.random() * 2,
                       repeat: Infinity,
                       delay: i * 0.3
                     }}
                   />
                 ))}
                 
                 {/* Animated Orbits */}
                 <motion.div
                   className="absolute left-1/2 top-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5"
                   animate={{ rotate: 360 }}
                   transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                 >
                   <motion.div
                     className="absolute top-0 left-1/2 w-3 h-3 -translate-x-1/2 rounded-full bg-amber-400/80"
                     animate={{ scale: [1, 1.5, 1] }}
                     transition={{ duration: 2, repeat: Infinity }}
                   />
                   <motion.div
                     className="absolute bottom-0 left-1/2 w-2 h-2 -translate-x-1/2 rounded-full bg-blue-400/80"
                     animate={{ scale: [1, 1.8, 1] }}
                     transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                   />
                 </motion.div>

                 {/* Ambient Glow Effects */}
                 <motion.div
                   className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-amber-500/10 blur-[100px]"
                   animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                   transition={{ duration: 8, repeat: Infinity }}
                 />
                 <motion.div
                   className="absolute bottom-1/3 left-1/3 w-48 h-48 rounded-full bg-blue-500/10 blur-[80px]"
                   animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
                   transition={{ duration: 6, repeat: Infinity, delay: 2 }}
                 />
               </div>

               {/* Interactive Floating Cards */}
               <motion.div
                 style={{ y: y1 }}
                 className="absolute top-12 right-8 w-72 h-80 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-md p-6 shadow-2xl flex flex-col gap-4 group hover:border-amber-500/30 transition-all duration-300"
                 whileHover={{ scale: 1.05, y: -5 }}
                 animate={{ 
                   rotateZ: [0, -1, 0, 1, 0],
                   rotateX: [0, -0.5, 0, 0.5, 0],
                   rotateY: [0, 0.5, 0, -0.5, 0]
                 }}
                 transition={{ 
                   duration: 8, 
                   repeat: Infinity,
                   ease: "easeInOut"
                 }}
               >
                 <div className="shimmer-overlay absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                 <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mb-3 group-hover:bg-amber-500/30 transition-colors">
                   <Briefcase className="text-amber-500 group-hover:scale-110 transition-transform" size={22} />
                 </div>
                 <div className="h-4 w-3/4 rounded bg-gradient-to-r from-white/10 to-white/5"></div>
                 <div className="h-4 w-1/2 rounded bg-gradient-to-r from-white/5 to-transparent"></div>
                 <div className="mt-auto h-12 w-full rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-transparent flex items-center justify-center text-sm font-medium text-amber-400 group-hover:from-amber-500/10 transition-all">
                   Connect with Mentors
                 </div>
               </motion.div>

               {/* Floating Profile Card */}
               <motion.div
                 style={{ y: y2 }}
                 className="absolute bottom-8 left-4 w-80 h-72 rounded-2xl border border-white/10 bg-gradient-to-br from-[#121620] to-[#1A1F2E] p-6 shadow-2xl z-10 flex flex-col gap-4 group hover:border-blue-500/30 transition-all duration-300"
                 whileHover={{ scale: 1.03, y: -3 }}
                 animate={{ 
                   rotateZ: [0, 1, 0, -1, 0],
                   rotateX: [0, 0.5, 0, -0.5, 0]
                 }}
                 transition={{ 
                   duration: 10, 
                   repeat: Infinity,
                   ease: "easeInOut",
                   delay: 1
                 }}
               >
                 <div className="shimmer-overlay absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                 <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                   <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                     <Users className="text-blue-400 group-hover:scale-110 transition-transform" size={20} />
                   </div>
                   <div>
                     <div className="h-3 w-24 rounded bg-gradient-to-r from-white/20 to-white/10 mb-2"></div>
                     <div className="h-2 w-16 rounded bg-gradient-to-r from-white/10 to-transparent"></div>
                   </div>
                 </div>
                 <div className="flex -space-x-3 mt-4">
                   {[1,2,3,4].map(i => (
                     <motion.div 
                       key={i}
                       className={`w-8 h-8 rounded-full border-2 border-[#121620] bg-gradient-to-br from-gray-700 to-gray-800 z-[${10-i}]`}
                       whileHover={{ scale: 1.2, y: -2 }}
                       transition={{ type: "spring", stiffness: 300 }}
                     />
                   ))}
                   <div className="w-8 h-8 rounded-full border-2 border-[#121620] bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center text-[10px] text-gray-400 z-0">+42</div>
                 </div>
               </motion.div>

               {/* Floating Stats Bubble */}
               <motion.div
                 className="absolute top-1/2 right-4 w-24 h-24 rounded-full border border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-500/5 backdrop-blur-md flex items-center justify-center shadow-2xl"
                 animate={{ 
                   y: [0, -15, 0],
                   scale: [1, 1.1, 1]
                 }}
                 transition={{ 
                   duration: 6, 
                   repeat: Infinity,
                   ease: "easeInOut"
                 }}
                 whileHover={{ scale: 1.2, rotate: 180 }}
               >
                 <div className="text-center">
                   <div className="text-lg font-bold text-white">85%</div>
                   <div className="text-[10px] text-gray-400">Success</div>
                 </div>
               </motion.div>
             </motion.div>

          </div>
        </section>


        {/* STATS SECTION */}
        <section className="relative z-10 border-y border-white/5 bg-white/[0.02] py-12 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
              className="grid grid-cols-2 gap-8 md:grid-cols-4 divide-x divide-white/10"
            >
              {[
                { value: "500+", label: "Verified Alumni", icon: Shield },
                { value: "1.2k", label: "Active Students", icon: GraduationCap },
                { value: "300+", label: "Mentorships", icon: Network },
                { value: "85%", label: "Placement Rate", icon: Zap }
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  variants={fadeUp}
                  className={`flex flex-col items-center justify-center text-center ${i === 0 ? 'pl-0' : ''} ${i === 3 ? 'pr-0' : ''}`}
                >
                  <stat.icon className="mb-4 text-amber-500/50" size={24} strokeWidth={1.5} />
                  <div className="text-4xl md:text-5xl font-bold font-syne text-white tracking-tight">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm font-medium text-gray-500 tracking-wide uppercase">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>


        {/* BENTO GRID FEATURES */}
        <section className="relative z-10 py-32 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 md:flex md:items-end md:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-5xl font-bold font-syne text-white tracking-tight">
                  Engineered for <br/>
                  <span className="text-gray-500">Meaningful Connections.</span>
                </h2>
              </div>
              <p className="mt-6 md:mt-0 text-gray-400 max-w-sm md:text-right font-light">
                A purpose-built suite of tools designed to facilitate mentorship, discover talent, and foster lifelong institutional loyalty.
              </p>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={bentoStagger}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[240px]"
            >
              {/* Large Feature */}
              <motion.div variants={fadeUp} className="md:col-span-2 md:row-span-1 rounded-3xl bg-[#121620] border border-white/5 p-8 relative overflow-hidden group hover:border-white/10 transition-colors">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] group-hover:bg-amber-500/10 transition-colors"></div>
                <div className="h-full flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                    <Globe className="text-amber-500" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold font-syne text-white mb-3">Global Alumni Directory</h3>
                  <p className="text-gray-400 max-w-md font-light">
                    Navigate a comprehensive database of graduates. Filter by industry, company, location, and graduation year to find the exact expertise you need.
                  </p>
                  {/* Abstract UI element */}
                  {/*<div className="mt-auto hidden md:flex gap-2 opacity-50">
                    <div className="h-8 w-24 bg-white/5 rounded-md border border-white/10"></div>
                    <div className="h-8 w-32 bg-white/5 rounded-md border border-white/10"></div>
                    <div className="h-8 w-20 bg-amber-500/10 rounded-md border border-amber-500/20"></div>
                  </div> */}
                </div>
              </motion.div>

              {/* Standard Features */}
              <motion.div variants={fadeUp} className="rounded-3xl bg-gradient-to-br from-[#1A1F2E] to-[#121620] border border-white/5 p-8 flex flex-col group hover:border-white/10 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 text-blue-400">
                  <MessageSquare size={20} />
                </div>
                <h3 className="text-xl font-bold font-syne text-white mb-2 mt-auto">Structured Mentorship</h3>
                <p className="text-sm text-gray-400 font-light">
                  Long-term guidance frameworks connecting ambitious students with seasoned professionals.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="rounded-3xl bg-gradient-to-br from-[#1A1F2E] to-[#121620] border border-white/5 p-8 flex flex-col group hover:border-white/10 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-400">
                  <Calendar size={20} />
                </div>
                <h3 className="text-xl font-bold font-syne text-white mb-2 mt-auto">Exclusive Events</h3>
                <p className="text-sm text-gray-400 font-light">
                  Curated webinars, networking sessions, and regional alumni meetups.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="md:col-span-2 rounded-3xl bg-[#121620] border border-white/5 p-8 flex flex-col md:flex-row items-start md:items-center gap-6 group hover:border-white/10 transition-colors">
                <div className="w-14 h-14 shrink-0 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                  <BookOpen size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-syne text-white mb-2">Knowledge Hub & Resources</h3>
                  <p className="text-sm text-gray-400 font-light max-w-lg">
                    Access proprietary career guides, interview prep materials, and industry insights written exclusively by alumni for the community.
                  </p>
                </div>
              </motion.div>

            </motion.div>
          </div>
        </section>


        {/* ROLE BASED ACCESS - TIMELINE/COMPARISON */}
        <section className="relative z-10 py-32 border-t border-white/5 bg-gradient-to-b from-transparent to-[#0A0D14]/80">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold font-syne text-white tracking-tight">
                One Platform. <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-600">Three Perspectives.</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-px bg-white/10 rounded-3xl overflow-hidden border border-white/10">
              {[
                {
                  title: "Students",
                  desc: "Gain an unfair advantage. Connect with mentors, explore hidden job opportunities, and learn from those who walked the path.",
                  features: ["Find Mentors", "Attend Events", "Access Resources"],
                  accent: "text-blue-400"
                },
                {
                  title: "Alumni",
                  desc: "Give back and expand your network. Discover peers in your city, recruit top talent from your alma mater, and build your legacy.",
                  features: ["Mentorship matching", "Talent recruitment", "Peer networking"],
                  accent: "text-amber-400",
                  highlight: true
                },
                {
                  title: "Administration",
                  desc: "Data-driven community management. Track engagement, organize scaleable events, and measure the ROI of your alumni network.",
                  features: ["Analytics dashboard", "Event management", "User moderation"],
                  accent: "text-emerald-400"
                }
              ].map((role) => (
                <div 
                  key={role.title} 
                  className={`bg-[#121620] p-10 flex flex-col ${role.highlight ? 'relative before:absolute before:inset-0 before:bg-amber-500/5' : ''}`}
                >
                  {role.highlight && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-amber-500 rounded-b-full"></div>
                  )}
                  <div className={`text-sm font-bold tracking-widest uppercase mb-6 ${role.accent}`}>
                    {role.title}
                  </div>
                  <p className="text-gray-400 font-light mb-8 flex-grow">
                    {role.desc}
                  </p>
                  <ul className="space-y-3">
                    {role.features.map(f => (
                      <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                        <div className={`w-1.5 h-1.5 rounded-full bg-current ${role.accent}`}></div>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* CTA SECTION */}
        <section className="relative z-10 py-32 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-amber-500/5 z-0"></div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-5xl mx-auto rounded-[3rem] bg-[#1A1F2E] border border-white/10 p-12 md:p-20 text-center relative overflow-hidden"
          >
             {/* CTA Abstract Background */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/20 rounded-full blur-[100px]"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]"></div>

            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
              <Network size={48} className="text-amber-500 mb-8" strokeWidth={1} />
              <h2 className="text-4xl md:text-6xl font-bold font-syne text-white tracking-tight mb-6">
                Your Network is your Net Worth.
              </h2>
              <p className="text-xl text-gray-400 font-light mb-10">
                Join the platform designed to turn institutional affiliation into lifelong professional advantage.
              </p>
              
              <button
                onClick={() => navigate("/login")}
                className="group relative inline-flex items-center justify-center gap-3 rounded-full bg-white px-10 py-5 text-base font-bold text-[#0A0D14] transition-all hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Explore Dashboard
              </button>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <div className="relative z-10 border-t border-white/10 bg-[#0A0D14]">
          <Footer />
        </div>
      </div>
    </>
  );
};

export default Home;
