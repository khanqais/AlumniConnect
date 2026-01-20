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

// interface AlumniRecommendation {
//   alumniId: string;
//   name: string;
//   currentRole: string;
//   company: string;
//   skills: string[];
//   matchPercent: number;
//   experience: number;
//   availability: string;
//   lastActive: string;
//   bio: string;
//   profileImage?: string;
// }
interface AlumniRecommendation {
  alumniId: string;      // backend alumniId
  name: string;
  currentRole: string;
  company: string;
  skills: string[];
  score: number;         // number of matched skills
  matchPercent: number;  // 0.xxx from backend
  reason: string;
  availability?: string;
  experience: number;   // optional
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

  // Mock user data
  const user = {
    name: 'John Student',
    role: 'student',
    skills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'AWS']
  };

  // Fetch alumni recommendations (mock data)
  // useEffect(() => {
  //   const fetchRecommendations = async () => {
  //     setLoading(true);
  //     // Simulate API call
  //     setTimeout(() => {
  //       const mockAlumni: AlumniRecommendation[] = [
  //         {
  //           alumniId: '1',
  //           name: 'Sarah Johnson',
  //           currentRole: 'Senior Software Engineer',
  //           company: 'Google',
  //           skills: ['React', 'TypeScript', 'Next.js', 'GraphQL', 'AWS'],
  //           matchPercent: 95,
  //           experience: 8,
  //           availability: 'Available',
  //           lastActive: '2 days ago',
  //           bio: 'Passionate about mentoring students and helping them land their first tech job.'
  //         },
  //         {
  //           alumniId: '2',
  //           name: 'Michael Chen',
  //           currentRole: 'Lead Frontend Developer',
  //           company: 'Microsoft',
  //           skills: ['React', 'TypeScript', 'Redux', 'Jest', 'Webpack'],
  //           matchPercent: 88,
  //           experience: 6,
  //           availability: 'Limited',
  //           lastActive: '1 week ago',
  //           bio: 'Expert in frontend architecture and performance optimization.'
  //         },
  //         {
  //           alumniId: '3',
  //           name: 'Emma Wilson',
  //           currentRole: 'Full Stack Developer',
  //           company: 'Amazon',
  //           skills: ['Node.js', 'Express', 'MongoDB', 'Docker', 'AWS'],
  //           matchPercent: 82,
  //           experience: 5,
  //           availability: 'Available',
  //           lastActive: '3 days ago',
  //           bio: 'Loves working on scalable backend systems and mentoring new developers.'
  //         },
  //         {
  //           alumniId: '4',
  //           name: 'DavalumniId Lee',
  //           currentRole: 'DevOps Engineer',
  //           company: 'Netflix',
  //           skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Python'],
  //           matchPercent: 75,
  //           experience: 7,
  //           availability: 'Busy',
  //           lastActive: '2 weeks ago',
  //           bio: 'Infrastructure specialist focused on cloud-native applications.'
  //         },
  //         {
  //           alumniId: '5',
  //           name: 'Lisa Taylor',
  //           currentRole: 'Product Manager',
  //           company: 'Meta',
  //           skills: ['Product Strategy', 'Agile', 'Data Analysis', 'User Research'],
  //           matchPercent: 65,
  //           experience: 9,
  //           availability: 'Available',
  //           lastActive: '4 days ago',
  //           bio: 'Helps teams build successful products through user-centric design.'
  //         }
  //       ];

  //       setAlumniList(mockAlumni);
        
  //       // Extract all unique skills
  //       const allSkills = Array.from(new Set(
  //         mockAlumni.flatMap(alumni => alumni.skills)
  //       ));
  //       setAvailableSkills(['all', ...allSkills]);
        
  //       setLoading(false);
  //     }, 1000);
  //   };

  //   fetchRecommendations();
  // }, []);
useEffect(() => {
  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recommendations/mentorship'); // new API
      const data: AlumniRecommendation[] = await res.json();

      setAlumniList(data);

      // Extract skills from backend
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

  // const handleConnect = (alumniId: string) => {
  //   alert(`Connection request sent to alumni!`);
  // };

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

      {/* Header Navigation */}
      <header className="recommendation-header">
        <div className="header-container">
          <div className="header-left">
            <Link to="/" className="logo-link">
              <div className="logo-icon-container">
                <Users className="logo-icon" />
              </div>
              <span className="logo-text">AlumniConnect</span>
            </Link>
            
            <nav className="nav-links">
              <button onClick={() => navigate('/dashboard')} className="nav-button">
                <Home className="nav-button-icon" />
                <span>Dashboard</span>
              </button>
              <button onClick={() => navigate('/resources')} className="nav-button">
                <FileText className="nav-button-icon" />
                <span>Resources</span>
              </button>
              <button onClick={() => navigate('/recommendations')} className="nav-button active">
                <TrendingUp className="nav-button-icon" />
                <span>Recommendations</span>
              </button>
              <button onClick={() => navigate('/community')} className="nav-button">
                <Users className="nav-button-icon" />
                <span>Community</span>
              </button>
              <button onClick={() => navigate('/profile')} className="nav-button">
                <User className="nav-button-icon" />
                <span>Profile</span>
              </button>
            </nav>
          </div>

          <div className="header-right">
            <div className="user-profile" onClick={() => navigate('/profile')}>
              <div className="user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <h2 className="user-name">{user.name}</h2>
                <p className="user-role">{user.role}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="logout-button">
              <LogOut className="logout-icon" />
              <span>Logout</span>
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
                    {/* <th className="table-header">Availability</th> */}
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
                      {/* <td className="table-cell">
                        <div className={`availability-cell ${alumni.availability.toLowerCase()}`}>
                          <div className="availability-dot"></div>
                          <span>{alumni.availability}</span>
                        </div>
                      </td> */}
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
          <div className="how-it-works-gralumniId">
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
                <div className="details-gralumniId">
                  <div className="detail-item">
                    <span className="detail-label">Experience:</span>
                    <span className="detail-value">{selectedAlumni.experience} years</span>
                  </div>
                  {/* <div className="detail-item">
                    <span className="detail-label">Availability:</span>
                    <span className={`detail-value ${selectedAlumni.availability.toLowerCase()}`}>
                      {selectedAlumni.availability}
                    </span>
                  </div> */}
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