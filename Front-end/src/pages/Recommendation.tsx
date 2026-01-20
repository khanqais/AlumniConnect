import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  Home, 
  Briefcase, 
  Users, 
  BookOpen, 
  FileText,
  TrendingUp,
  Target,
  Star,
  Download,
  RefreshCw,
  ChevronRight,
  Award,
  CheckCircle
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
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/recommendations/mentorship');
        const data: AlumniRecommendation[] = await res.json();

        setAlumniList(data);

        const allSkills = Array.from(new Set(data.flatMap(a => a.skills)));
        setAvailableSkills(['all', ...allSkills]);

      } catch (err) {
        console.error(err);
        alert('Failed to fetch recommendations');
      }
      setLoading(false);
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

  const handleLogout = () => {
    navigate('/login');
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

      {/* Updated Header */}
      <header className="recommendation-header">
        <div className="header-container">
          <div className="flex items-center gap-6">
            {/* Logo/Brand */}
            <Link to="/" className="logo-link">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700">
                <Users className="h-6 w-6 text-white" />
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
                onClick={() => navigate('/community')}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center gap-1"
              >
                <Users className="w-4 h-4" />
                Community
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center gap-1"
              >
                <User className="w-4 h-4" />
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
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <h2 className="text-sm font-semibold text-gray-900">{user.name}</h2>
                <p className="text-xs capitalize text-gray-600">{user.role}</p>
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