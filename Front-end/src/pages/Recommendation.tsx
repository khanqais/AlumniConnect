import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Users, 
  Target,
  Star,
  RefreshCw,
  ChevronRight,
  Award,
  CheckCircle,
  Home,
  FileText,
  TrendingUp,
  Map,
  LogOut
} from 'lucide-react';
import './Recommendation.css';

interface AlumniRecommendation {
  alumniId: string;
  name: string;
  currentRole: string;
  company: string;
  skills: string[];
  score: number;
  matchPercent: number;
  reason: string;
  availability?: string;
  experience: number;
  lastActive?: string;
  bio?: string;
}

const Recommendation: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [alumniList, setAlumniList] = useState<AlumniRecommendation[]>([]);
  const [sortBy, setSortBy] = useState<'match' | 'experience' | 'skills'>('match');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniRecommendation | null>(null);

  const user = {
    name: 'John Student',
    role: 'student',
    skills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'AWS']
  };

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    const fetchRecommendations = async () => {
      setLoading(true);
      setTimeout(() => {
        const mockData: AlumniRecommendation[] = [
          {
            alumniId: '1',
            name: 'Sarah Johnson',
            currentRole: 'Senior Software Engineer',
            company: 'Google',
            skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker'],
            score: 95,
            matchPercent: 92,
            reason: 'Strong match in frontend technologies and cloud infrastructure',
            availability: 'Available',
            experience: 8,
            lastActive: '2 days ago',
            bio: 'Passionate about building scalable web applications and mentoring junior developers.'
          },
          {
            alumniId: '2',
            name: 'Michael Chen',
            currentRole: 'Lead Data Scientist',
            company: 'Microsoft',
            skills: ['Python', 'Machine Learning', 'TensorFlow', 'AWS', 'SQL'],
            score: 88,
            matchPercent: 85,
            reason: 'Excellent match in Python and cloud technologies',
            availability: 'Available',
            experience: 10,
            lastActive: '1 week ago',
            bio: 'Data science leader with expertise in ML and AI solutions.'
          },
          {
            alumniId: '3',
            name: 'Emily Rodriguez',
            currentRole: 'Full Stack Developer',
            company: 'Amazon',
            skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'GraphQL'],
            score: 90,
            matchPercent: 88,
            reason: 'Perfect match in full-stack development skills',
            availability: 'Available',
            experience: 6,
            lastActive: '3 days ago',
            bio: 'Full-stack engineer specializing in modern web technologies and microservices.'
          },
          {
            alumniId: '4',
            name: 'David Kim',
            currentRole: 'DevOps Engineer',
            company: 'Netflix',
            skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
            score: 82,
            matchPercent: 78,
            reason: 'Strong match in cloud and infrastructure automation',
            availability: 'Busy',
            experience: 7,
            lastActive: '1 day ago',
            bio: 'DevOps specialist focused on cloud infrastructure and automation.'
          },
          {
            alumniId: '5',
            name: 'Priya Patel',
            currentRole: 'Product Manager',
            company: 'Meta',
            skills: ['Product Strategy', 'Agile', 'User Research', 'Data Analysis'],
            score: 75,
            matchPercent: 70,
            reason: 'Good match for career transition to product management',
            availability: 'Available',
            experience: 9,
            lastActive: '5 days ago',
            bio: 'Product leader with technical background, passionate about user-centric design.'
          }
        ];

        setAlumniList(mockData);
        const allSkills = Array.from(new Set(mockData.flatMap(a => a.skills)));
        setAvailableSkills(['all', ...allSkills]);
        setLoading(false);
      }, 1200);
    };

    fetchRecommendations();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  const handleConnect = (alumniId: string) => {
    alert(`Connection request sent to alumni!`);
  };

  const handleViewProfile = (alumni: AlumniRecommendation) => {
    setSelectedAlumni(alumni);
  };

  const handleCloseProfile = () => {
    setSelectedAlumni(null);
  };

  const sortedAlumni = [...alumniList].sort((a, b) => {
    switch (sortBy) {
      case 'match':
        return b.matchPercent - a.matchPercent;
      case 'experience':
        return b.experience - a.experience;
      case 'skills':
        return b.skills.length - a.skills.length;
      default:
        return 0;
    }
  });

  const filteredAlumni = skillFilter === 'all' 
    ? sortedAlumni 
    : sortedAlumni.filter(alumni => alumni.skills.includes(skillFilter));

  return (
    <div className="recommendation-page">
      {/* Background Effects */}
      <div className="background-effects">
        <div className="effect-circle effect-circle-1"></div>
        <div className="effect-circle effect-circle-2"></div>
      </div>

      {/* Simple Navigation */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {/* Logo/Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                display: 'flex',
                height: '2.5rem',
                width: '2.5rem',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '0.5rem',
                background: 'linear-gradient(to right, #2563eb, #4f46e5)'
              }}>
                <Users style={{ height: '1.5rem', width: '1.5rem', color: 'white' }} />
              </div>
              <span style={{ 
                fontSize: '1.125rem', 
                fontWeight: '700', 
                color: '#111827',
                display: window.innerWidth >= 640 ? 'block' : 'none'
              }}>
                AlumniConnect
              </span>
            </div>

            {/* Navigation Links */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
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
                onClick={() => navigate('/career-paths')}
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
                <Map style={{ width: '1rem', height: '1rem' }} />
                <span style={{ display: window.innerWidth >= 768 ? 'inline' : 'none' }}>Career Paths</span>
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
              <div style={{
                display: 'flex',
                height: '2.5rem',
                width: '2.5rem',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '9999px',
                background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                fontWeight: '700',
                color: 'white'
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ display: window.innerWidth >= 640 ? 'block' : 'none' }}>
                <h2 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>{user.name}</h2>
                <p style={{ fontSize: '0.75rem', textTransform: 'capitalize', color: '#4b5563' }}>{user.role}</p>
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

      {/* Main Content */}
      <main className="recommendation-main">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-title-container">
            <h1 className="page-title">AI-Powered Alumni Recommendations</h1>
            <p className="page-subtitle">
              Smart matches based on your skills, interests, and career goals
            </p>
            <div className="user-skills">
              <span className="skills-label">Your Skills:</span>
              <div className="skills-tags">
                {user.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="page-actions">
            <button onClick={handleRefresh} className="refresh-button">
              <RefreshCw className="refresh-icon" />
              Refresh Matches
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label className="filter-label">Sort By:</label>
            <div className="filter-buttons">
              <button
                onClick={() => setSortBy('match')}
                className={`filter-button ${sortBy === 'match' ? 'active' : ''}`}
              >
                <Target className="filter-button-icon" />
                Match Score
              </button>
              <button
                onClick={() => setSortBy('experience')}
                className={`filter-button ${sortBy === 'experience' ? 'active' : ''}`}
              >
                <Briefcase className="filter-button-icon" />
                Experience
              </button>
              <button
                onClick={() => setSortBy('skills')}
                className={`filter-button ${sortBy === 'skills' ? 'active' : ''}`}
              >
                <Award className="filter-button-icon" />
                Skills Match
              </button>
            </div>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Filter by Skill:</label>
            <select 
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="skill-select"
            >
              {availableSkills.map((skill) => (
                <option key={skill} value={skill}>
                  {skill === 'all' ? 'All Skills' : skill}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Analyzing your profile and finding best matches...</p>
          </div>
        ) : (
          <>
            {/* Recommendations Table */}
            <div className="recommendations-table-container">
              <table className="recommendations-table">
                <thead>
                  <tr>
                    <th className="table-header">Alumni</th>
                    <th className="table-header">Current Role</th>
                    <th className="table-header">Skills Match</th>
                    <th className="table-header">Match Score</th>
                    <th className="table-header">Experience</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlumni.map((alumni) => (
                    <tr key={alumni.alumniId} className="table-row">
                      <td className="table-cell alumni-info-cell">
                        <div className="alumni-info">
                          <div className="alumni-avatar">
                            {alumni.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="alumni-details">
                            <h3 className="alumni-name">{alumni.name}</h3>
                            <p className="alumni-company">{alumni.company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="role-info">
                          <Briefcase className="role-icon" />
                          <span>{alumni.currentRole}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="skills-cell">
                          {alumni.skills.slice(0, 3).map((skill, alumniIdx) => (
                            <span key={alumniIdx} className="skill-badge">
                              {skill}
                            </span>
                          ))}
                          {alumni.skills.length > 3 && (
                            <span className="more-skills">+{alumni.skills.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="match-score-cell">
                          <div className="match-score-bar">
                            <div 
                              className="match-score-fill"
                              style={{ width: `${alumni.matchPercent}%` }}
                            ></div>
                          </div>
                          <span className={`match-percentage ${alumni.matchPercent >= 90 ? 'excellent' : alumni.matchPercent >= 75 ? 'good' : 'average'}`}>
                            {alumni.matchPercent}%
                          </span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="experience-cell">
                          <span className="experience-years">{alumni.experience} years</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="actions-cell">
                          <button 
                            onClick={() => handleConnect(alumni.alumniId)}
                            className="connect-button"
                          >
                            <Users className="connect-icon" />
                            Connect
                          </button>
                          <button 
                            onClick={() => handleViewProfile(alumni)}
                            className="view-button"
                          >
                            View Profile
                            <ChevronRight className="view-icon" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Stats Section */}
            <div className="stats-section">
              <div className="stat-card">
                <div className="stat-icon-container stat-icon-purple">
                  <Target className="stat-icon" />
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">
                    {alumniList.length > 0 
                      ? Math.round(alumniList.reduce((acc, curr) => acc + curr.matchPercent, 0) / alumniList.length)
                      : 0}%
                  </h3>
                  <p className="stat-label">Average Match Score</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon-container stat-icon-blue">
                  <Users className="stat-icon" />
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{alumniList.length}</h3>
                  <p className="stat-label">Recommended Alumni</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon-container stat-icon-green">
                  <Briefcase className="stat-icon" />
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">
                    {alumniList.length > 0 
                      ? Math.round(alumniList.reduce((acc, curr) => acc + curr.experience, 0) / alumniList.length)
                      : 0}
                  </h3>
                  <p className="stat-label">Avg. Experience (years)</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon-container stat-icon-orange">
                  <CheckCircle className="stat-icon" />
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">
                    {alumniList.filter(a => a.availability === 'Available').length}
                  </h3>
                  <p className="stat-label">Currently Available</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* How It Works */}
        <div className="how-it-works">
          <h2 className="how-it-works-title">How Our Matching Works</h2>
          <div className="how-it-works-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Skill Analysis</h3>
              <p className="step-description">
                ML engine analyzes your skills against alumni profiles
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">Career Path Matching</h3>
              <p className="step-description">
                Matches alumni who followed similar career trajectories
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Availability Check</h3>
              <p className="step-description">
                Prioritizes alumni currently available for mentorship
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3 className="step-title">Smart Ranking</h3>
              <p className="step-description">
                Ranks matches by relevance and success probability
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Alumni Profile Modal */}
      {selectedAlumni && (
        <div className="profile-modal-overlay">
          <div className="profile-modal">
            <div className="profile-modal-header">
              <h2 className="profile-modal-title">Alumni Profile</h2>
              <button onClick={handleCloseProfile} className="close-modal-button">
                ×
              </button>
            </div>
            
            <div className="profile-modal-content">
              <div className="profile-header">
                <div className="profile-avatar-large">
                  {selectedAlumni.name.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                  <h3 className="profile-name">{selectedAlumni.name}</h3>
                  <p className="profile-role">{selectedAlumni.currentRole} at {selectedAlumni.company}</p>
                  <div className="profile-match">
                    <span className="match-label">Match Score:</span>
                    <span className="match-value">{selectedAlumni.matchPercent}%</span>
                  </div>
                </div>
              </div>
              
              <div className="profile-section">
                <h4 className="section-title">Bio</h4>
                <p className="section-content">{selectedAlumni.bio}</p>
              </div>
              
              <div className="profile-section">
                <h4 className="section-title">Skills</h4>
                <div className="skills-list">
                  {selectedAlumni.skills.map((skill, index) => (
                    <span key={index} className="skill-tag-large">{skill}</span>
                  ))}
                </div>
              </div>
              
              <div className="profile-section">
                <h4 className="section-title">Details</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Experience:</span>
                    <span className="detail-value">{selectedAlumni.experience} years</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Active:</span>
                    <span className="detail-value">{selectedAlumni.lastActive}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="profile-modal-footer">
              <button onClick={handleCloseProfile} className="modal-secondary-button">
                Close
              </button>
              <button 
                onClick={() => {
                  handleConnect(selectedAlumni.alumniId);
                  handleCloseProfile();
                }}
                className="modal-primary-button"
              >
                <Users className="button-icon" />
                Send Connection Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendation;