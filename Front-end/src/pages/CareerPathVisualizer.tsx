// import React, { useState, useEffect } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { 
//   User, 
//   LogOut, 
//   Home, 
//   Briefcase, 
//   Users, 
//   Target,
//   TrendingUp,
//   Map,
//   GitBranch,
//   CheckCircle,
//   ArrowRight,
//   Star,
//   Award,
//   Zap,
//   Clock,
//   Building,
//   GraduationCap,
//   ExternalLink,
//   Filter,
//   Search,
//   RefreshCw,
//   FileText
// } from 'lucide-react';
// import './CareerPathVisualizer.css';
// import { useAuth } from '../context/AuthContext';

// import { useEffect, useState } from "react";
// import { useAuth } from "../context/AuthContext";
// import { Link, useNavigate } from "react-router-dom";

// // interface CareerPath {
// //   id: string;
// //   title: string;
// //   description: string;
// //   difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
// //   duration: string;
// //   skills: string[];
// //   alumniCount: number;
// //   avgSalary: string;
// //   growth: 'High' | 'Medium' | 'Low';
// // }

// // interface AlumniPath {
// //   id: string;
// //   name: string;
// //   currentRole: string;
// //   company: string;
// //   path: string[];
// //   yearsToCurrent: number;
// //   skills: string[];
// //   matchScore: number;
// //   education: string;
// //   previousRoles: string[];
// //   achievements: string[];
// // }
// interface CareerRecommendation {
//   name: string;
//   jobTitle: string;
//   company: string;
//   skillMatchPercentage: number;
//   missingSkills: string[];
// }

// const CareerPathVisualizer: React.FC = () => {
//     const { user } = useAuth();
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [selectedPath, setSelectedPath] = useState<string>('software-engineer');
//   // const [alumniPaths, setAlumniPaths] = useState<AlumniPath[]>([]);
//   const [skillFilter, setSkillFilter] = useState<string>('all');
//   const [searchQuery, setSearchQuery] = useState<string>('');
//   const [viewMode, setViewMode] = useState<'timeline' | 'network'>('timeline');

// useEffect(() => {
//   const fetchCareer = async () => {
//     if (!user) return;
//     const res = await fetch(
//       `http://localhost:5000/api/recommend/career-path/${user._id}`
//     );
//     const data = await res.json();
//     setCareer(data);
//   };

//   fetchCareer();
// }, [user]);



//   const handleLogout = () => {
//     navigate('/login');
//   };

//   const handleRefresh = () => {
//     setLoading(true);
//     setTimeout(() => setLoading(false), 800);
//   };

//   const handleViewAlumni = (alumniId: string) => {
//     alert(`Opening detailed profile for alumni ${alumniId}`);
//   };

//   const filteredAlumniPaths = alumniPaths.filter(alumni => {
//     const matchesPath = selectedPath === 'all' || 
//       alumni.skills.some(skill => 
//         careerPaths.find(p => p.id === selectedPath)?.skills.includes(skill)
//       );
//     const matchesSearch = searchQuery === '' || 
//       alumni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       alumni.currentRole.toLowerCase().includes(searchQuery.toLowerCase());
//     return matchesPath && matchesSearch;
//   });

//   const getSelectedPath = () => careerPaths.find(p => p.id === selectedPath);

//   return (
//     <div className="career-path-page">
//       {/* Background Effects */}
//       <div className="background-effects">
//         <div className="effect-circle effect-circle-1"></div>
//         <div className="effect-circle effect-circle-2"></div>
//       </div>

//       {/* Updated Header */}
// <header className="career-path-header">
//   <div className="header-container">
//     <div className="flex items-center gap-6">
//       {/* Logo/Brand */}
//       <Link to="/" className="logo-link">
//         <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700">
//           <Map className="h-6 w-6 text-white" />
//         </div>
//         <span className="hidden text-lg font-bold text-gray-900 sm:block">
//           AlumniConnect
//         </span>
//       </Link>

//       {/* Navigation */}
//       <nav className="hidden md:flex items-center gap-1">
//         <button
//           onClick={() => navigate('/dashboard')}
//           className="rounded-lg px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 flex items-center gap-1"
//         >
//           <Home className="w-4 h-4" />
//           Dashboard
//         </button>
//         <button
//           onClick={() => navigate('/resources')}
//           className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center gap-1"
//         >
//           <FileText className="w-4 h-4" />
//           Resources
//         </button>
//         <button
//           onClick={() => navigate('/recommendations')}
//           className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center gap-1"
//         >
//           <TrendingUp className="w-4 h-4" />
//           Recommendations
//         </button>
//         <button
//           onClick={() => navigate('/career-paths')}
//           className="rounded-lg px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 flex items-center gap-1"
//         >
//           <Map className="w-4 h-4" />
//           Career Paths
//         </button>
//         <button
//           onClick={() => navigate('/profile')}
//           className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center gap-1"
//         >
//           <User className="w-4 h-4" />
//           Profile
//         </button>
//       </nav>
//     </div>

//     {/* User Menu */}
//     <div className="flex items-center gap-3">
//       <button
//         onClick={() => navigate('/profile')}
//         className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-gray-100"
//       >
//         <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 font-bold text-white">
//           {user.name.charAt(0).toUpperCase()}
//         </div>
//         <div className="hidden sm:block">
//           <h2 className="text-sm font-semibold text-gray-900">{user.name}</h2>
//           <p className="text-xs capitalize text-gray-600">{user.role}</p>
//         </div>
//       </button>
//       <button
//         onClick={handleLogout}
//         className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50"
//       >
//         <LogOut className="h-4 w-4" />
//         <span className="hidden sm:inline">Logout</span>
//       </button>
//     </div>
//   </div>
// </header>

//       {/* Main Content */}
//       <main className="career-path-main">
//         {/* Page Header */}
//         <div className="page-header">
//           <div className="page-title-container">
//             <h1 className="page-title">Career Path Visualizer</h1>
//             <p className="page-subtitle">
//               Explore real career trajectories of alumni who match your skill set
//             </p>
//           </div>
//           <div className="page-actions">
//             <button onClick={handleRefresh} className="refresh-button">
//               <RefreshCw className="refresh-icon" />
//               Refresh Data
//             </button>
//           </div>
//         </div>

//         {/* User Skills */}
//         <div className="user-skills-section">
//           <div className="skills-header">
//             <Target className="skills-icon" />
//             <h3 className="skills-title">Your Skill Profile</h3>
//           </div>
//           <div className="skills-container">
//             {user.skills.map((skill, index) => (
//               <div key={index} className="skill-pill">
//                 <Zap className="skill-icon" />
//                 <span>{skill}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Career Path Selection */}
//         <div className="career-paths-section">
//           <div className="section-header">
//             <h2 className="section-title">Choose Your Career Path</h2>
//             <p className="section-subtitle">Select a path to see alumni who followed similar trajectories</p>
//           </div>

//           <div className="career-paths-grid">
//             {careerPaths.map((path) => (
//               <div
//                 key={path.id}
//                 className={`career-path-card ${selectedPath === path.id ? 'selected' : ''}`}
//                 onClick={() => setSelectedPath(path.id)}
//               >
//                 <div className="path-header">
//                   <div className="path-icon">
//                     <Briefcase className="path-icon-svg" />
//                   </div>
//                   <div className="path-meta">
//                     <span className={`difficulty-badge difficulty-${path.difficulty.toLowerCase()}`}>
//                       {path.difficulty}
//                     </span>
//                     <span className="alumni-count">
//                       <Users className="alumni-count-icon" />
//                       {path.alumniCount} alumni
//                     </span>
//                   </div>
//                 </div>

//                 <h3 className="path-title">{path.title}</h3>
//                 <p className="path-description">{path.description}</p>

//                 <div className="path-stats">
//                   <div className="stat">
//                     <Clock className="stat-icon" />
//                     <div>
//                       <div className="stat-value">{path.duration}</div>
//                       <div className="stat-label">Duration</div>
//                     </div>
//                   </div>
//                   <div className="stat">
//                     <TrendingUp className="stat-icon" />
//                     <div>
//                       <div className="stat-value">{path.avgSalary}</div>
//                       <div className="stat-label">Avg. Salary</div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="path-skills">
//                   {path.skills.map((skill, idx) => (
//                     <span key={idx} className="path-skill-tag">{skill}</span>
//                   ))}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="filters-section">
//           <div className="search-container">
//             <Search className="search-icon" />
//             <input
//               type="text"
//               placeholder="Search alumni by name or role..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="search-input"
//             />
//           </div>

//           <div className="view-toggle">
//             <button
//               onClick={() => setViewMode('timeline')}
//               className={`view-button ${viewMode === 'timeline' ? 'active' : ''}`}
//             >
//               <GitBranch className="view-button-icon" />
//               Timeline View
//             </button>
//             <button
//               onClick={() => setViewMode('network')}
//               className={`view-button ${viewMode === 'network' ? 'active' : ''}`}
//             >
//               <Map className="view-button-icon" />
//               Network View
//             </button>
//           </div>
//         </div>

//         {/* Loading State */}
//         {loading ? (
//           <div className="loading-container">
//             <div className="loading-spinner"></div>
//             <p className="loading-text">Analyzing career paths and matching alumni...</p>
//           </div>
//         ) : (
//           <>
//             {/* Selected Path Info */}
//             {getSelectedPath() && (
//               <div className="selected-path-info">
//                 <div className="selected-path-header">
//                   <h2 className="selected-path-title">
//                     {getSelectedPath()?.title} Career Path
//                     <span className="match-badge">
//                       <CheckCircle className="match-icon" />
//                       {filteredAlumniPaths.length} Matching Alumni
//                     </span>
//                   </h2>
//                   <div className="path-growth">
//                     <span className={`growth-indicator growth-${getSelectedPath()?.growth.toLowerCase()}`}>
//                       {getSelectedPath()?.growth} Growth
//                     </span>
//                   </div>
//                 </div>

//                 <div className="path-details">
//                   <div className="detail-card">
//                     <div className="detail-icon">
//                       <Users className="detail-icon-svg" />
//                     </div>
//                     <div className="detail-content">
//                       <div className="detail-value">{getSelectedPath()?.alumniCount}</div>
//                       <div className="detail-label">Total Alumni</div>
//                     </div>
//                   </div>

//                   <div className="detail-card">
//                     <div className="detail-icon">
//                       <Clock className="detail-icon-svg" />
//                     </div>
//                     <div className="detail-content">
//                       <div className="detail-value">{getSelectedPath()?.duration}</div>
//                       <div className="detail-label">Typical Timeline</div>
//                     </div>
//                   </div>

//                   <div className="detail-card">
//                     <div className="detail-icon">
//                       <TrendingUp className="detail-icon-svg" />
//                     </div>
//                     <div className="detail-content">
//                       <div className="detail-value">{getSelectedPath()?.avgSalary}</div>
//                       <div className="detail-label">Salary Range</div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Alumni Career Paths */}
//             <div className="alumni-paths-section">
//               <div className="section-header">
//                 <h2 className="section-title">Alumni Career Trajectories</h2>
//                 <p className="section-subtitle">
//                   Real paths taken by alumni with similar skills to yours
//                 </p>
//               </div>

//               {filteredAlumniPaths.length === 0 ? (
//                 <div className="empty-state">
//                   <Map className="empty-icon" />
//                   <h3 className="empty-title">No matching alumni found</h3>
//                   <p className="empty-message">
//                     Try selecting a different career path or adjusting your search
//                   </p>
//                 </div>
//               ) : (
//                 <div className="alumni-paths-container">
//                   {filteredAlumniPaths.map((alumni) => (
//                     <div key={alumni.id} className="alumni-path-card">
//                       <div className="alumni-header">
//                         <div className="alumni-avatar">
//                           {alumni.name.charAt(0).toUpperCase()}
//                         </div>
//                         <div className="alumni-info">
//                           <h3 className="alumni-name">{alumni.name}</h3>
//                           <div className="alumni-role">
//                             <Building className="role-icon" />
//                             <span>{alumni.currentRole} at {alumni.company}</span>
//                           </div>
//                           <div className="alumni-match">
//                             <Star className="match-icon" />
//                             <span className="match-score">{alumni.matchScore}% Skill Match</span>
//                           </div>
//                         </div>
//                         <div className="alumni-meta">
//                           <div className="meta-item">
//                             <Clock className="meta-icon" />
//                             <span>{alumni.yearsToCurrent} years</span>
//                           </div>
//                           <div className="meta-item">
//                             <GraduationCap className="meta-icon" />
//                             <span>{alumni.education}</span>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Career Timeline */}
//                       <div className="career-timeline">
//                         <div className="timeline-title">
//                           <GitBranch className="timeline-icon" />
//                           <span>Career Progression</span>
//                         </div>
//                         <div className="timeline-path">
//                           {alumni.path.map((step, index) => (
//                             <div key={index} className="timeline-step">
//                               <div className="step-dot"></div>
//                               <div className="step-content">
//                                 <div className="step-title">{step}</div>
//                                 {index < alumni.path.length - 1 && (
//                                   <ArrowRight className="step-arrow" />
//                                 )}
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>

//                       {/* Skills & Achievements */}
//                       <div className="alumni-details">
//                         <div className="details-column">
//                           <h4 className="details-title">Key Skills</h4>
//                           <div className="skills-list">
//                             {alumni.skills.map((skill, idx) => (
//                               <span key={idx} className="skill-badge">
//                                 {skill}
//                               </span>
//                             ))}
//                           </div>
//                         </div>
//                         <div className="details-column">
//                           <h4 className="details-title">Achievements</h4>
//                           <ul className="achievements-list">
//                             {alumni.achievements.map((achievement, idx) => (
//                               <li key={idx} className="achievement-item">
//                                 <Award className="achievement-icon" />
//                                 <span>{achievement}</span>
//                               </li>
//                             ))}
//                           </ul>
//                         </div>
//                       </div>

//                       {/* Action Buttons */}
//                       <div className="alumni-actions">
//                         <button 
//                           onClick={() => handleViewAlumni(alumni.id)}
//                           className="view-profile-button"
//                         >
//                           <ExternalLink className="button-icon" />
//                           View Full Profile
//                         </button>
//                         <button className="connect-button">
//                           <Users className="button-icon" />
//                           Request Guidance
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Insights Section */}
//             <div className="insights-section">
//               <h2 className="insights-title">Career Path Insights</h2>
//               <div className="insights-grid">
//                 <div className="insight-card">
//                   <div className="insight-icon insight-icon-blue">
//                     <TrendingUp className="insight-icon-svg" />
//                   </div>
//                   <h3 className="insight-title">Average Time to Senior Role</h3>
//                   <p className="insight-value">
//                     {filteredAlumniPaths.length > 0
//                       ? Math.round(filteredAlumniPaths.reduce((acc, curr) => acc + curr.yearsToCurrent, 0) / filteredAlumniPaths.length)
//                       : 0} years
//                   </p>
//                 </div>

//                 <div className="insight-card">
//                   <div className="insight-icon insight-icon-purple">
//                     <Building className="insight-icon-svg" />
//                   </div>
//                   <h3 className="insight-title">Top Companies</h3>
//                   <p className="insight-value">
//                     Google, Microsoft, Amazon, Netflix
//                   </p>
//                 </div>

//                 <div className="insight-card">
//                   <div className="insight-icon insight-icon-green">
//                     <Zap className="insight-icon-svg" />
//                   </div>
//                   <h3 className="insight-title">Most Valuable Skills</h3>
//                   <p className="insight-value">
//                     System Design, Leadership, Cloud
//                   </p>
//                 </div>

//                 <div className="insight-card">
//                   <div className="insight-icon insight-icon-orange">
//                     <Award className="insight-icon-svg" />
//                   </div>
//                   <h3 className="insight-title">Common Milestones</h3>
//                   <p className="insight-value">
//                     Promotion within 2-3 years, Technical leadership
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </>
//         )}
//       </main>
//     </div>
//   );
// };

// export default CareerPathVisualizer;
// ... sab imports waise hi, jo tumhare original code me hai

// import React, { useState, useEffect } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { 
//   User, LogOut, Home, Briefcase, Users, Target, TrendingUp, Map, 
//   GitBranch, CheckCircle, ArrowRight, Star, Award, Zap, Clock, 
//   Building, GraduationCap, ExternalLink, Search, RefreshCw, FileText, 

// } from 'lucide-react';
// import './CareerPathVisualizer.css';
// // import { useAuth } from '../context/AuthContext';

// interface CareerRecommendation {
//   name: string;
//   jobTitle: string;
//   company: string;
//   skillMatchPercentage: number;
//   missingSkills: string[];
// }

// const CareerPathVisualizer: React.FC = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   const [career, setCareer] = useState<CareerRecommendation | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState<string>('');
//   const [viewMode, setViewMode] = useState<'timeline' | 'network'>('timeline');

//   // Backend Integration
//   useEffect(() => {
//     const fetchCareer = async () => {
//       if (!user?._id) return;
//       try {
//         setLoading(true);
//         const res = await fetch(`http://localhost:5000/api/recommend/career-path/${user._id}`);
//         const data = await res.json();

//         setCareer({
//           ...data,
//           missingSkills: Array.isArray(data.missingSkills) ? data.missingSkills : [],
//         });
//       } catch (err) {
//         console.error("Fetch error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCareer();
//   }, [user]);

//   const handleLogout = () => navigate('/login');

//   const handleRefresh = () => {
//     window.location.reload(); 
//   };

//   if (!user) return <div className="p-10 text-center">Please login to view this page.</div>;

//   return (
//     <div className="career-path-page">
//       {/* Background Effects */}
//       <div className="background-effects">
//         <div className="effect-circle effect-circle-1"></div>
//         <div className="effect-circle effect-circle-2"></div>
//       </div>

      // {/* Header Section */}
      //       <header className="career-path-header">
      //   <div className="header-container">
      //     <div className="flex items-center gap-6">
      //       {/* Logo/Brand */}
      //       <Link to="/" className="logo-link">
      //         <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700">
      //           <Map className="h-6 w-6 text-white" />
      //         </div>
      //         <span className="hidden text-lg font-bold text-gray-900 sm:block">
      //           AlumniConnect
      //         </span>
      //       </Link>

      //       {/* Navigation */}
      //       <nav className="hidden md:flex items-center gap-1">
      //         <button
      //           onClick={() => navigate('/dashboard')}
      //           className="rounded-lg px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 flex items-center gap-1"
      //         >
      //           <Home className="w-4 h-4" />
      //           Dashboard
      //         </button>
      //         <button
      //           onClick={() => navigate('/resources')}
      //           className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center gap-1"
      //         >
      //           <FileText className="w-4 h-4" />
      //           Resources
      //         </button>
      //         <button
      //           onClick={() => navigate('/recommendations')}
      //           className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center gap-1"
      //         >
      //           <TrendingUp className="w-4 h-4" />
      //           Recommendations
      //         </button>
      //         <button
      //           onClick={() => navigate('/career-paths')}
      //           className="rounded-lg px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 flex items-center gap-1"
      //         >
      //           <Map className="w-4 h-4" />
      //           Career Paths
      //         </button>
      //         <button
      //           onClick={() => navigate('/profile')}
      //           className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center gap-1"
      //         >
      //           <User className="w-4 h-4" />
      //           Profile
      //         </button>
      //       </nav>
      //     </div>

      //     {/* User Menu */}
      //     <div className="flex items-center gap-3">
      //       <button
      //         onClick={() => navigate('/profile')}
      //         className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-gray-100"
      //       >
      //         <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 font-bold text-white">
      //           {user.name.charAt(0).toUpperCase()}
      //         </div>
      //         <div className="hidden sm:block">
      //           <h2 className="text-sm font-semibold text-gray-900">{user.name}</h2>
      //           <p className="text-xs capitalize text-gray-600">{user.role}</p>
      //         </div>
      //       </button>
      //       <button
      //         onClick={handleLogout}
      //         className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50"
      //       >
      //         <LogOut className="h-4 w-4" />
      //         <span className="hidden sm:inline">Logout</span>
      //       </button>
      //     </div>
      //   </div>
      // </header>

//       <main className="career-path-main">
//         {/* Page Header */}
//         <div className="page-header">
//           <div>
//             <h1 className="page-title">Career Path Visualizer</h1>
//             <p className="page-subtitle">Explore real career trajectories of alumni matching your profile</p>
//           </div>
//           <button onClick={handleRefresh} className="refresh-button">
//             <RefreshCw className={`refresh-icon ${loading ? 'animate-spin' : ''}`} />
//             Refresh Data
//           </button>
//         </div>

//         {/* User Current Skills */}
//         <div className="user-skills-section">
//           <div className="skills-header">
//             <Target className="skills-icon" />
//             <h3 className="skills-title">Your Current Skill Profile</h3>
//           </div>
//           <div className="skills-container">
//             {user.skills?.map((skill, index) => (
//               <div key={index} className="skill-pill">
//                 <Zap className="skill-icon" /> <span>{skill}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {loading ? (
//           <div className="loading-container">
//             <div className="loading-spinner"></div>
//             <p>Analyzing career paths and matching alumni...</p>
//           </div>
//         ) : (
//           <>
//             {/* AI Recommendation Card */}
//             {career && (
//               <section className="recommendation-section">
//                 <div className="section-header">
//                   <h2 className="section-title">Recommended Path for You</h2>
//                 </div>

//                 <div className="alumni-path-card featured-path">
//                   <div className="alumni-header">
//                     {/* <div className="alumni-avatar featured-avatar">{career.name.charAt(0)}</div> */}
//                     <div className="alumni-avatar featured-avatar">
//   {career?.name ? career.name.charAt(0).toUpperCase() : '?'}
// </div>
//                     <div className="alumni-info">
//                       <h3 className="alumni-name">{career.jobTitle}</h3>
//                       <div className="alumni-role">
//                         <Building className="role-icon" />
//                         <span>Based on Top Alumni at {career.company}</span>
//                       </div>
//                       <div className="alumni-match">
//                         <Star className="match-icon fill-yellow-400" />
//                         <span className="match-score">{career.skillMatchPercentage}% Match Score</span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Skill Progress Bar */}
//                   <div className="match-progress-container">
//                     <div className="match-progress-bar">
//                       <div className="match-progress-fill" style={{ width: `${career.skillMatchPercentage}%` }}></div>
//                     </div>
//                   </div>

//                   <div className="alumni-details">
//                     <div className="details-column">
//                       <h4 className="details-title">Skills to Master</h4>
//                       <div className="skills-list">
//                         {career.missingSkills.length > 0 ? (
//                           career.missingSkills.map((skill, idx) => (
//                             <span key={idx} className="skill-badge missing">{skill}</span>
//                           ))
//                         ) : (
//                           <span className="text-green-600 text-sm font-medium">🎯 You have all the required skills!</span>
//                         )}
//                       </div>
//                     </div>
//                     <div className="details-column">
//                       <h4 className="details-title">Success Milestones</h4>
//                       <ul className="achievements-list">
//                         <li className="achievement-item"><Award className="achievement-icon" /> Average {career.jobTitle} salary: $120k+</li>
//                         <li className="achievement-item"><Award className="achievement-icon" /> High growth potential in {career.company}</li>
//                       </ul>
//                     </div>
//                   </div>

//                   <div className="alumni-actions">
//                     <button className="view-profile-button">
//                       <ExternalLink className="button-icon" /> Explore Path
//                     </button>
//                     <button className="connect-button">
//                       <Users className="button-icon" /> Mentor Search
//                     </button>
//                   </div>
//                 </div>
//               </section>
//             )}

//             {/* Insights Section */}
//             <div className="insights-section">
//               <h2 className="insights-title">Career Path Insights</h2>
//               <div className="insights-grid">
//                 <div className="insight-card">
//                   <div className="insight-icon insight-icon-blue"><TrendingUp /></div>
//                   <h3>Growth Trend</h3>
//                   <p className="insight-value">High Demand</p>
//                 </div>
//                 <div className="insight-card">
//                   <div className="insight-icon insight-icon-purple"><Building /></div>
//                   <h3>Top Companies</h3>
//                   <p className="insight-value">Google, Microsoft</p>
//                 </div>
//               </div>
//             </div>
//           </>
//         )}
//       </main>
//     </div>
//   );
// };

// export default CareerPathVisualizer;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogOut, Home, Briefcase, Users, FileText, TrendingUp,
  ChevronRight, Map, ExternalLink, Globe, Award
} from 'lucide-react';
import './Recommendation.css'; // Wahi CSS use kar rahe hain consistent design ke liye
import { useAuth } from '../context/AuthContext';

interface CareerPath {
  alumniName: string;
  currentRole: string;
  company: string;
  path: string[]; // Sequential roles e.g. ["Intern", "Junior Dev", "Senior Dev"]
  skillsAcquired: string[];
  duration: string;
  industry: string;
}

const CareerPathVisualizer: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<CareerPath | null>(null);
  const [industryFilter, setIndustryFilter] = useState('all');

  useEffect(() => {
    const fetchCareerPaths = async () => {
      const studentId = localStorage.getItem('userId') || user?._id;
      if (!studentId || studentId === "null") return;

      setLoading(true);
      try {
        // API endpoint change kar lena agar backend alag hai
        const res = await fetch(`http://localhost:5000/api/recommend/career-path/${studentId}`);
        const result = await res.json();

        const data: CareerPath[] = Array.isArray(result) ? result : (result.paths || []);
        setPaths(data);
      } catch (err) {
        console.error("Path Fetch Error:", err);
        setPaths([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCareerPaths();
  }, [user?._id]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const filteredPaths = industryFilter === 'all'
    ? paths
    : paths.filter(p => p.industry === industryFilter);

  return (
    <div className="recommendation-page">
      <div className="background-effects">
        <div className="effect-circle effect-circle-1"></div>
        <div className="effect-circle effect-circle-2"></div>
      </div>

      {/* Header Section */}
            <header className="career-path-header">
        <div className="header-container">
          <div className="flex items-center gap-6">
            {/* Logo/Brand */}
            <Link to="/" className="logo-link">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700">
                <Map className="h-6 w-6 text-white" />
              </div>
              <span className="hidden text-lg font-bold text-gray-900 sm:block">
                AlumniConnect
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => navigate('/dashboard')}
                className="rounded-lg px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 flex items-center gap-1"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => navigate('/resources')}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center gap-1"
              >
                <FileText className="w-4 h-4" />
                Resources
              </button>
              <button
                onClick={() => navigate('/recommendations')}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center gap-1"
              >
                <TrendingUp className="w-4 h-4" />
                Recommendations
              </button>
              <button
                onClick={() => navigate('/career-paths')}
                className="rounded-lg px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 flex items-center gap-1"
              >
                <Map className="w-4 h-4" />
                Career Paths
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center gap-1"
              >
                <Users className="w-4 h-4" />
                Profile
              </button>
            </nav>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-gray-100"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 font-bold text-white">
                {user && user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <h2 className="text-sm font-semibold text-gray-900">{user?.name}</h2>
                <p className="text-xs capitalize text-gray-600">{user?.role}</p>
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="recommendation-main">
        <div className="page-header">
          <div>
            <h1 className="page-title">Career Path Journey</h1>
            <p className="page-subtitle text-gray-500">Visualize how alumni reached their current positions</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Mapping career trajectories...</p>
          </div>
        ) : (
          <div className="recommendations-table-container">
            <table className="recommendations-table">
              <thead>
                <tr>
                  <th>Alumni & Role</th>
                  <th>Career Trajectory</th>
                  <th>Skills Path</th>
                  <th>Total Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPaths.map((path, idx) => (
                  <tr key={idx} className="table-row">
                    <td>
                      <div className="flex items-center gap-3">
                        {/* Safe charAt check: Agar name nahi hai toh '?' dikhayega */}
                        <div className="alumni-avatar bg-indigo-100 text-indigo-700">
                          {path?.alumniName ? path.alumniName.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">
                            {path?.alumniName || "Unknown Alumni"}
                          </div>
                          <div className="text-xs text-indigo-600 font-medium">
                            {path?.currentRole || "Position"} @ {path?.company || "Company"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-xs">
                        {/* path.path ko check kar rahe hain ki array hai ya nahi */}
                        {Array.isArray(path?.path) ? path.path.map((step, i) => (
                          <React.Fragment key={i}>
                            <span className="bg-gray-50 border border-gray-200 px-2 py-1 rounded text-gray-600 whitespace-nowrap">
                              {step}
                            </span>
                            {i < path.path.length - 1 && <ChevronRight size={12} className="text-gray-400" />}
                          </React.Fragment>
                        )) : "No path data"}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {/* Safe skills mapping */}
                        {Array.isArray(path?.skillsAcquired) ? path.skillsAcquired.slice(0, 3).map((s, i) => (
                          <span key={i} className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">
                            {s}
                          </span>
                        )) : null}
                      </div>
                    </td>
                    <td className="text-sm font-semibold text-gray-700">
                      {path?.duration || "N/A"}
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedPath(path)}
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-bold"
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

      {/* Career Detail Modal */}
      {selectedPath && (
        <div className="profile-modal-overlay">
          <div className="profile-modal max-w-2xl">
            <div className="profile-modal-header bg-indigo-600 text-white p-6">
              <h2 className="text-xl font-bold">Career Roadmap: {selectedPath.alumniName}</h2>
              <button onClick={() => setSelectedPath(null)} className="text-2xl hover:text-gray-200">&times;</button>
            </div>

            <div className="p-8">
              <div className="relative border-l-2 border-indigo-200 ml-4 pl-8 space-y-8">
                {selectedPath.path.map((step, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[41px] top-1 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white shadow"></div>
                    <div>
                      <h4 className="font-bold text-indigo-900 text-lg">{step}</h4>
                      {i === selectedPath.path.length - 1 && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">CURRENT POSITION</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Award className="text-indigo-600" size={18} /> Key Skills Mastered
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPath.skillsAcquired.map((skill, i) => (
                    <span key={i} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="profile-modal-footer">
              <button onClick={() => setSelectedPath(null)} className="px-6 py-2 text-gray-600 font-medium">Close</button>
              <button className="bg-indigo-600 text-white px-8 py-2 rounded-lg font-bold shadow-lg hover:bg-indigo-700 transition-colors">
                Connect to Discuss Path
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerPathVisualizer;