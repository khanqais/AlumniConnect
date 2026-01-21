import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogOut, Home, Briefcase, Users, FileText, TrendingUp,
  Target, RefreshCw, ChevronRight, Award, Map
} from 'lucide-react';
import './Recommendation.css';
import { useAuth } from '../context/AuthContext';

interface AlumniRecommendation {
  name: string;
  jobTitle: string;
  company: string;
  experience: number;
  skillMatchPercentage: number;
  skills: string[];
}

const Recommendation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [alumniList, setAlumniList] = useState<AlumniRecommendation[]>([]);
  const [sortBy, setSortBy] = useState<'match' | 'experience' | 'skills'>('match');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [availableSkills, setAvailableSkills] = useState<string[]>(['all']);
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniRecommendation | null>(null);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    const fetchRecommendations = async () => {
      // 1. Check if user ID exists to avoid ".../null" error
      const studentId = localStorage.getItem('userId') || user?._id;
      if (!studentId || studentId === "null") {
        console.warn("Waiting for Student ID...");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/recommend/target-skills/${studentId}`);
        const result = await res.json();

        // 2. Data format check (Fix for flatMap is not a function)
        // Agar backend object bhej raha hai { recommendations: [] }, toh usse handle karein
        const data: AlumniRecommendation[] = Array.isArray(result) 
          ? result 
          : (result.recommendations || []);

        setAlumniList(data);

        // 3. Extract unique skills safely
        const allSkills = Array.from(
          new Set(data.flatMap(a => (Array.isArray(a.skills) ? a.skills : [])))
        );
        setAvailableSkills(['all', ...allSkills]);

      } catch (err) {
        console.error("Fetch Error:", err);
        // Fallback to empty array on error to prevent "not iterable" crash
        setAlumniList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user?._id]); // Re-run when user ID is available

  const handleRefresh = () => {
    setLoading(true);
    // Yahan dobara fetchRecommendations() call karna better rahega
    window.location.reload(); 
  };

  const handleConnect = (name: string) => {
    alert(`Connection request sent to ${name}!`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // 4. Sorting logic with safety check
  const sortedAlumni = [...(alumniList || [])].sort((a, b) => {
    switch (sortBy) {
      case 'match': return b.skillMatchPercentage - a.skillMatchPercentage;
      case 'experience': return b.experience - a.experience;
      case 'skills': return (b.skills?.length || 0) - (a.skills?.length || 0);
      default: return 0;
    }
  });

  const filteredAlumni = skillFilter === 'all'
    ? sortedAlumni
    : sortedAlumni.filter(alumni => alumni.skills?.includes(skillFilter));

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
              <span style={{ 
                fontSize: '1.125rem', 
                fontWeight: '700', 
                color: '#111827',
                display: window.innerWidth >= 640 ? 'block' : 'none'
              }}>
                AlumniConnect
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#374151',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.color = '#111827';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#374151';
                }}
              >
                <Home style={{ width: '1rem', height: '1rem' }} />
                <span style={{ display: window.innerWidth >= 768 ? 'inline' : 'none' }}>Dashboard</span>
              </button>
              <button
                onClick={() => navigate('/resources')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#374151',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.color = '#111827';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#374151';
                }}
              >
                <FileText style={{ width: '1rem', height: '1rem' }} />
                <span style={{ display: window.innerWidth >= 768 ? 'inline' : 'none' }}>Resources</span>
              </button>
              <button
                onClick={() => navigate('/recommendations')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: '#eff6ff',
                  cursor: 'pointer',
                  color: '#2563eb',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                <TrendingUp style={{ width: '1rem', height: '1rem' }} />
                <span style={{ display: window.innerWidth >= 768 ? 'inline' : 'none' }}>Recommendations</span>
              </button>
              <button
                onClick={() => navigate('/career-path')}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => navigate('/profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
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
              onClick={() => navigate('/login')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #fecaca',
                background: 'white',
                cursor: 'pointer',
                color: '#dc2626',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fef2f2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <LogOut style={{ height: '1rem', width: '1rem' }} />
              <span style={{ display: window.innerWidth >= 640 ? 'inline' : 'none' }}>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="recommendation-main">
        <div className="page-header">
          <div>
            <h1 className="page-title">AI Alumni Recommendations</h1>
            <div className="user-skills mt-2">
              <span className="text-sm text-gray-500 mr-2">Your Skills:</span>
              <div className="flex flex-wrap gap-2 inline-flex">
                {user?.skills?.map((s, i) => (
                  <span key={i} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{s}</span>
                ))}
              </div>
            </div>
          </div>
          <button onClick={handleRefresh} className="refresh-button">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <label className="filter-label">Sort By:</label>
            <div className="filter-buttons">
              {(['match', 'experience', 'skills'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSortBy(type)}
                  className={`filter-button ${sortBy === type ? 'active' : ''}`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Skill Filter:</label>
            <select value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} className="skill-select">
              {availableSkills.map(s => <option key={s} value={s}>{s === 'all' ? 'All Skills' : s}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Finding best matches...</p>
          </div>
        ) : (
          <div className="recommendations-table-container">
            <table className="recommendations-table">
              <thead>
                <tr>
                  <th>Alumni</th>
                  <th>Role</th>
                  <th>Skills</th>
                  <th>Match</th>
                  <th>Exp.</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlumni.map((alumni, idx) => (
                  <tr key={idx} className="table-row">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="alumni-avatar">{alumni.name.charAt(0)}</div>
                        <div>
                          <div className="font-bold">{alumni.name}</div>
                          <div className="text-xs text-gray-500">{alumni.company}</div>
                        </div>
                      </div>
                    </td>
                    <td>{alumni.jobTitle}</td>
                    <td>
                      <div className="flex gap-1">
                        {alumni.skills?.slice(0, 2).map((s, i) => (
                          <span key={i} className="text-[10px] bg-gray-100 px-1 rounded">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-green-500 h-full" style={{ width: `${alumni.skillMatchPercentage}%` }}></div>
                        </div>
                        <span className="text-xs font-bold">{alumni.skillMatchPercentage}%</span>
                      </div>
                    </td>
                    <td>{alumni.experience}y</td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => handleConnect(alumni.name)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Users size={16}/></button>
                        <button onClick={() => setSelectedAlumni(alumni)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"><ChevronRight size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Profile Modal */}
      {selectedAlumni && (
        <div className="profile-modal-overlay">
          <div className="profile-modal">
            <div className="profile-modal-header">
              <h2 className="text-xl font-bold">Alumni Details</h2>
              <button onClick={() => setSelectedAlumni(null)} className="text-2xl">&times;</button>
            </div>
            <div className="p-6">
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {selectedAlumni.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{selectedAlumni.name}</h3>
                    <p className="text-gray-600">{selectedAlumni.jobTitle} @ {selectedAlumni.company}</p>
                  </div>
               </div>
               <div className="mb-4">
                  <h4 className="font-semibold mb-2">Technical Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAlumni.skills?.map((s, i) => (
                      <span key={i} className="bg-gray-100 px-3 py-1 rounded-full text-sm">{s}</span>
                    ))}
                  </div>
               </div>
               <p className="text-sm text-gray-500">Experience: {selectedAlumni.experience} years</p>
            </div>
            <div className="profile-modal-footer">
              <button onClick={() => setSelectedAlumni(null)} className="px-4 py-2 text-gray-600">Close</button>
              <button onClick={() => handleConnect(selectedAlumni.name)} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Connect Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendation;