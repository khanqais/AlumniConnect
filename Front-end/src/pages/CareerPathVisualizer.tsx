import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  Home, 
  Briefcase, 
  Users, 
  Target,
  TrendingUp,
  Map,
  GitBranch,
  CheckCircle,
  ArrowRight,
  Star,
  Award,
  Zap,
  Clock,
  Building,
  GraduationCap,
  ExternalLink,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import './CareerPathVisualizer.css';

interface CareerPath {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  skills: string[];
  alumniCount: number;
  avgSalary: string;
  growth: 'High' | 'Medium' | 'Low';
}

interface AlumniPath {
  id: string;
  name: string;
  currentRole: string;
  company: string;
  path: string[];
  yearsToCurrent: number;
  skills: string[];
  matchScore: number;
  education: string;
  previousRoles: string[];
  achievements: string[];
}

const CareerPathVisualizer: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedPath, setSelectedPath] = useState<string>('software-engineer');
  const [alumniPaths, setAlumniPaths] = useState<AlumniPath[]>([]);
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'timeline' | 'network'>('timeline');

  // Mock user data
  const user = {
    name: 'John Student',
    role: 'student',
    skills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'AWS', 'Python']
  };

  // Career paths data
  const careerPaths: CareerPath[] = [
    {
      id: 'software-engineer',
      title: 'Software Engineer',
      description: 'From Junior Developer to Senior Engineer at top tech companies',
      difficulty: 'Intermediate',
      duration: '3-5 years',
      skills: ['Programming', 'System Design', 'Algorithms', 'Debugging'],
      alumniCount: 45,
      avgSalary: '$150K - $300K',
      growth: 'High'
    },
    {
      id: 'data-scientist',
      title: 'Data Scientist',
      description: 'Data analysis to machine learning engineering',
      difficulty: 'Advanced',
      duration: '4-6 years',
      skills: ['Python', 'ML', 'Statistics', 'Data Visualization'],
      alumniCount: 28,
      avgSalary: '$140K - $250K',
      growth: 'High'
    },
    {
      id: 'product-manager',
      title: 'Product Manager',
      description: 'From Associate PM to Director of Product',
      difficulty: 'Intermediate',
      duration: '5-7 years',
      skills: ['Product Strategy', 'User Research', 'Data Analysis', 'Leadership'],
      alumniCount: 22,
      avgSalary: '$130K - $280K',
      growth: 'Medium'
    },
    {
      id: 'devops-engineer',
      title: 'DevOps Engineer',
      description: 'Infrastructure and deployment automation specialist',
      difficulty: 'Advanced',
      duration: '3-5 years',
      skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
      alumniCount: 18,
      avgSalary: '$130K - $220K',
      growth: 'High'
    }
  ];

  // Fetch alumni paths (mock data)
  useEffect(() => {
    const fetchAlumniPaths = async () => {
      setLoading(true);
      setTimeout(() => {
        const mockPaths: AlumniPath[] = [
          {
            id: '1',
            name: 'Sarah Johnson',
            currentRole: 'Senior Software Engineer',
            company: 'Google',
            path: ['Intern', 'Software Engineer I', 'Software Engineer II', 'Senior Software Engineer'],
            yearsToCurrent: 6,
            skills: ['React', 'TypeScript', 'Next.js', 'GraphQL', 'AWS'],
            matchScore: 92,
            education: 'B.Tech Computer Science',
            previousRoles: ['Software Engineer at Microsoft', 'Full Stack Developer at Startup'],
            achievements: ['Promoted within 2 years', 'Led team of 5 engineers']
          },
          {
            id: '2',
            name: 'Michael Chen',
            currentRole: 'Lead Frontend Developer',
            company: 'Microsoft',
            path: ['Junior Developer', 'Frontend Developer', 'Senior Frontend Developer', 'Lead Frontend Developer'],
            yearsToCurrent: 7,
            skills: ['React', 'TypeScript', 'Redux', 'Jest', 'Webpack'],
            matchScore: 88,
            education: 'M.S. Computer Science',
            previousRoles: ['Frontend Developer at Amazon', 'UI Developer'],
            achievements: ['Built enterprise-scale applications', 'Open source contributor']
          },
          {
            id: '3',
            name: 'Emma Wilson',
            currentRole: 'Data Science Manager',
            company: 'Amazon',
            path: ['Data Analyst', 'Data Scientist', 'Senior Data Scientist', 'Data Science Manager'],
            yearsToCurrent: 8,
            skills: ['Python', 'ML', 'TensorFlow', 'SQL', 'Statistics'],
            matchScore: 75,
            education: 'PhD in Machine Learning',
            previousRoles: ['Data Scientist at IBM', 'Research Assistant'],
            achievements: ['Published research papers', 'Patented ML algorithms']
          },
          {
            id: '4',
            name: 'David Lee',
            currentRole: 'Principal Engineer',
            company: 'Netflix',
            path: ['Software Engineer', 'Senior Engineer', 'Staff Engineer', 'Principal Engineer'],
            yearsToCurrent: 10,
            skills: ['System Design', 'Java', 'Microservices', 'AWS', 'Kafka'],
            matchScore: 82,
            education: 'B.E. Computer Engineering',
            previousRoles: ['Senior Engineer at Uber', 'Backend Developer'],
            achievements: ['Built scalable systems', 'Mentored 20+ engineers']
          }
        ];
        setAlumniPaths(mockPaths);
        setLoading(false);
      }, 1200);
    };

    fetchAlumniPaths();
  }, []);

  const handleLogout = () => {
    navigate('/login');
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  const handleViewAlumni = (alumniId: string) => {
    alert(`Opening detailed profile for alumni ${alumniId}`);
  };

  const filteredAlumniPaths = alumniPaths.filter(alumni => {
    const matchesPath = selectedPath === 'all' || 
      alumni.skills.some(skill => 
        careerPaths.find(p => p.id === selectedPath)?.skills.includes(skill)
      );
    const matchesSearch = searchQuery === '' || 
      alumni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alumni.currentRole.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPath && matchesSearch;
  });

  const getSelectedPath = () => careerPaths.find(p => p.id === selectedPath);

  return (
    <div className="career-path-page">
      {/* Background Effects */}
      <div className="background-effects">
        <div className="effect-circle effect-circle-1"></div>
        <div className="effect-circle effect-circle-2"></div>
      </div>

      {/* Header Navigation */}
      <header className="career-path-header">
        <div className="header-container">
          <div className="header-left">
            <Link to="/" className="logo-link">
              <div className="logo-icon-container">
                <Map className="logo-icon" />
              </div>
              <span className="logo-text">AlumniConnect</span>
            </Link>
            
            <nav className="nav-links">
              <button onClick={() => navigate('/dashboard')} className="nav-button">
                <Home className="nav-button-icon" />
                <span>Dashboard</span>
              </button>
              <button onClick={() => navigate('/recommendations')} className="nav-button">
                <TrendingUp className="nav-button-icon" />
                <span>Recommendations</span>
              </button>
              <button onClick={() => navigate('/career-paths')} className="nav-button active">
                <Map className="nav-button-icon" />
                <span>Career Paths</span>
              </button>
              <button onClick={() => navigate('/resources')} className="nav-button">
                <Briefcase className="nav-button-icon" />
                <span>Resources</span>
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
      <main className="career-path-main">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-title-container">
            <h1 className="page-title">Career Path Visualizer</h1>
            <p className="page-subtitle">
              Explore real career trajectories of alumni who match your skill set
            </p>
          </div>
          <div className="page-actions">
            <button onClick={handleRefresh} className="refresh-button">
              <RefreshCw className="refresh-icon" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* User Skills */}
        <div className="user-skills-section">
          <div className="skills-header">
            <Target className="skills-icon" />
            <h3 className="skills-title">Your Skill Profile</h3>
          </div>
          <div className="skills-container">
            {user.skills.map((skill, index) => (
              <div key={index} className="skill-pill">
                <Zap className="skill-icon" />
                <span>{skill}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Career Path Selection */}
        <div className="career-paths-section">
          <div className="section-header">
            <h2 className="section-title">Choose Your Career Path</h2>
            <p className="section-subtitle">Select a path to see alumni who followed similar trajectories</p>
          </div>
          
          <div className="career-paths-grid">
            {careerPaths.map((path) => (
              <div
                key={path.id}
                className={`career-path-card ${selectedPath === path.id ? 'selected' : ''}`}
                onClick={() => setSelectedPath(path.id)}
              >
                <div className="path-header">
                  <div className="path-icon">
                    <Briefcase className="path-icon-svg" />
                  </div>
                  <div className="path-meta">
                    <span className={`difficulty-badge difficulty-${path.difficulty.toLowerCase()}`}>
                      {path.difficulty}
                    </span>
                    <span className="alumni-count">
                      <Users className="alumni-count-icon" />
                      {path.alumniCount} alumni
                    </span>
                  </div>
                </div>
                
                <h3 className="path-title">{path.title}</h3>
                <p className="path-description">{path.description}</p>
                
                <div className="path-stats">
                  <div className="stat">
                    <Clock className="stat-icon" />
                    <div>
                      <div className="stat-value">{path.duration}</div>
                      <div className="stat-label">Duration</div>
                    </div>
                  </div>
                  <div className="stat">
                    <TrendingUp className="stat-icon" />
                    <div>
                      <div className="stat-value">{path.avgSalary}</div>
                      <div className="stat-label">Avg. Salary</div>
                    </div>
                  </div>
                </div>
                
                <div className="path-skills">
                  {path.skills.map((skill, idx) => (
                    <span key={idx} className="path-skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search alumni by name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="view-toggle">
            <button
              onClick={() => setViewMode('timeline')}
              className={`view-button ${viewMode === 'timeline' ? 'active' : ''}`}
            >
              <GitBranch className="view-button-icon" />
              Timeline View
            </button>
            <button
              onClick={() => setViewMode('network')}
              className={`view-button ${viewMode === 'network' ? 'active' : ''}`}
            >
              <Map className="view-button-icon" />
              Network View
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Analyzing career paths and matching alumni...</p>
          </div>
        ) : (
          <>
            {/* Selected Path Info */}
            {getSelectedPath() && (
              <div className="selected-path-info">
                <div className="selected-path-header">
                  <h2 className="selected-path-title">
                    {getSelectedPath()?.title} Career Path
                    <span className="match-badge">
                      <CheckCircle className="match-icon" />
                      {filteredAlumniPaths.length} Matching Alumni
                    </span>
                  </h2>
                  <div className="path-growth">
                    <span className={`growth-indicator growth-${getSelectedPath()?.growth.toLowerCase()}`}>
                      {getSelectedPath()?.growth} Growth
                    </span>
                  </div>
                </div>
                
                <div className="path-details">
                  <div className="detail-card">
                    <div className="detail-icon">
                      <Users className="detail-icon-svg" />
                    </div>
                    <div className="detail-content">
                      <div className="detail-value">{getSelectedPath()?.alumniCount}</div>
                      <div className="detail-label">Total Alumni</div>
                    </div>
                  </div>
                  
                  <div className="detail-card">
                    <div className="detail-icon">
                      <Clock className="detail-icon-svg" />
                    </div>
                    <div className="detail-content">
                      <div className="detail-value">{getSelectedPath()?.duration}</div>
                      <div className="detail-label">Typical Timeline</div>
                    </div>
                  </div>
                  
                  <div className="detail-card">
                    <div className="detail-icon">
                      <TrendingUp className="detail-icon-svg" />
                    </div>
                    <div className="detail-content">
                      <div className="detail-value">{getSelectedPath()?.avgSalary}</div>
                      <div className="detail-label">Salary Range</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Alumni Career Paths */}
            <div className="alumni-paths-section">
              <div className="section-header">
                <h2 className="section-title">Alumni Career Trajectories</h2>
                <p className="section-subtitle">
                  Real paths taken by alumni with similar skills to yours
                </p>
              </div>
              
              {filteredAlumniPaths.length === 0 ? (
                <div className="empty-state">
                  <Map className="empty-icon" />
                  <h3 className="empty-title">No matching alumni found</h3>
                  <p className="empty-message">
                    Try selecting a different career path or adjusting your search
                  </p>
                </div>
              ) : (
                <div className="alumni-paths-container">
                  {filteredAlumniPaths.map((alumni) => (
                    <div key={alumni.id} className="alumni-path-card">
                      <div className="alumni-header">
                        <div className="alumni-avatar">
                          {alumni.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="alumni-info">
                          <h3 className="alumni-name">{alumni.name}</h3>
                          <div className="alumni-role">
                            <Building className="role-icon" />
                            <span>{alumni.currentRole} at {alumni.company}</span>
                          </div>
                          <div className="alumni-match">
                            <Star className="match-icon" />
                            <span className="match-score">{alumni.matchScore}% Skill Match</span>
                          </div>
                        </div>
                        <div className="alumni-meta">
                          <div className="meta-item">
                            <Clock className="meta-icon" />
                            <span>{alumni.yearsToCurrent} years</span>
                          </div>
                          <div className="meta-item">
                            <GraduationCap className="meta-icon" />
                            <span>{alumni.education}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Career Timeline */}
                      <div className="career-timeline">
                        <div className="timeline-title">
                          <GitBranch className="timeline-icon" />
                          <span>Career Progression</span>
                        </div>
                        <div className="timeline-path">
                          {alumni.path.map((step, index) => (
                            <div key={index} className="timeline-step">
                              <div className="step-dot"></div>
                              <div className="step-content">
                                <div className="step-title">{step}</div>
                                {index < alumni.path.length - 1 && (
                                  <ArrowRight className="step-arrow" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Skills & Achievements */}
                      <div className="alumni-details">
                        <div className="details-column">
                          <h4 className="details-title">Key Skills</h4>
                          <div className="skills-list">
                            {alumni.skills.map((skill, idx) => (
                              <span key={idx} className="skill-badge">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="details-column">
                          <h4 className="details-title">Achievements</h4>
                          <ul className="achievements-list">
                            {alumni.achievements.map((achievement, idx) => (
                              <li key={idx} className="achievement-item">
                                <Award className="achievement-icon" />
                                <span>{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="alumni-actions">
                        <button 
                          onClick={() => handleViewAlumni(alumni.id)}
                          className="view-profile-button"
                        >
                          <ExternalLink className="button-icon" />
                          View Full Profile
                        </button>
                        <button className="connect-button">
                          <Users className="button-icon" />
                          Request Guidance
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Insights Section */}
            <div className="insights-section">
              <h2 className="insights-title">Career Path Insights</h2>
              <div className="insights-grid">
                <div className="insight-card">
                  <div className="insight-icon insight-icon-blue">
                    <TrendingUp className="insight-icon-svg" />
                  </div>
                  <h3 className="insight-title">Average Time to Senior Role</h3>
                  <p className="insight-value">
                    {filteredAlumniPaths.length > 0
                      ? Math.round(filteredAlumniPaths.reduce((acc, curr) => acc + curr.yearsToCurrent, 0) / filteredAlumniPaths.length)
                      : 0} years
                  </p>
                </div>
                
                <div className="insight-card">
                  <div className="insight-icon insight-icon-purple">
                    <Building className="insight-icon-svg" />
                  </div>
                  <h3 className="insight-title">Top Companies</h3>
                  <p className="insight-value">
                    Google, Microsoft, Amazon, Netflix
                  </p>
                </div>
                
                <div className="insight-card">
                  <div className="insight-icon insight-icon-green">
                    <Zap className="insight-icon-svg" />
                  </div>
                  <h3 className="insight-title">Most Valuable Skills</h3>
                  <p className="insight-value">
                    System Design, Leadership, Cloud
                  </p>
                </div>
                
                <div className="insight-card">
                  <div className="insight-icon insight-icon-orange">
                    <Award className="insight-icon-svg" />
                  </div>
                  <h3 className="insight-title">Common Milestones</h3>
                  <p className="insight-value">
                    Promotion within 2-3 years, Technical leadership
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default CareerPathVisualizer;