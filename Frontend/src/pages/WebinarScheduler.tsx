import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { 
  Calendar, 
  Users, 
  Video,
  FileText,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Globe,
  X,
  CheckCircle,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import './WebinarScheduler.css';
import { useAuth } from '../context/AuthContext';

interface WebinarFormData {
  alumniName: string;
  alumniId: string;
  webinarName: string;
  date: string;
  time: string;
  duration: string;
  description: string;
  platform: string;
  maxParticipants: number;
  skillsCovered: string[];
  skillInput: string;
  recordingAllowed: boolean;
  prerequisites: string;
}

const WebinarScheduler: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<WebinarFormData>({
    alumniName: '',
    alumniId: '',
    webinarName: '',
    date: '',
    time: '',
    duration: '60',
    description: '', 
    platform: 'google-meet',
    maxParticipants: 100,
    skillsCovered: [],
    skillInput: '',
    recordingAllowed: true,
    prerequisites: ''
  });

  // Auto-assign the webinar speaker to the currently logged-in alumni.
  useEffect(() => {
    if (!user) return;

    setFormData(prev => ({
      ...prev,
      alumniName: user.name,
      alumniId: user._id
    }));
  }, [user]);

  // Platform options
  const platformOptions = [
    { id: 'google-meet', name: 'Google Meet', icon: '📹' },
    { id: 'zoom', name: 'Zoom', icon: '🎥' },
    { id: 'teams', name: 'Microsoft Teams', icon: '💼' },
    { id: 'custom', name: 'Custom Link', icon: '🔗' }
  ];

  // Duration options
  const durationOptions = [
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' }, 
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSkillAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && formData.skillInput.trim()) {
      e.preventDefault();
      setFormData(prev => ({
        ...prev,
        skillsCovered: [...prev.skillsCovered, prev.skillInput.trim()],
        skillInput: ''
      }));
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skillsCovered: prev.skillsCovered.filter(skill => skill !== skillToRemove)
    }));
  };
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await fetch(
      "/webinars/schedule",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          webinarName: formData.webinarName,
          date: formData.date,
          time: formData.time,
          duration: formData.duration,
          description: formData.description,
          maxParticipants: formData.maxParticipants,
          skillsCovered: formData.skillsCovered,
          recordingAllowed: formData.recordingAllowed,
          prerequisites: formData.prerequisites,
          // ❌ alumniName & platform intentionally NOT sent
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to schedule webinar");

    console.log("✅ Webinar scheduled:", data.webinar);
    setSuccess(true);

    // ✅ redirect to video room
    navigate(`/videocall/${data.webinar.roomId}`);
  } catch (err: any) {
    console.error(err);
    alert(err.message || "Error scheduling webinar");
  } finally {
    setLoading(false);
  }
};

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);
    
  //   // Simulate API call
  //   setTimeout(() => {
  //     console.log('Webinar scheduled:', formData);
  //     setLoading(false);
  //     setSuccess(true);
      
  //     // Reset form after successful submission
  //     setTimeout(() => {
  //       setFormData({
  //         alumniName: '',
  //         webinarName: '',
  //         date: '',
  //         time: '',
  //         duration: '60',
  //         description: '',
  //         platform: 'google-meet',
  //         maxParticipants: 100,
  //         skillsCovered: [],
  //         skillInput: '',
  //         recordingAllowed: true,
  //         prerequisites: ''
  //       });
  //       setSuccess(false);
  //     }, 3000);
  //   }, 1500);
  // };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="webinar-container">
      {/* Background Effects */}
      <div className="background-effects">
        <div className="background-blur bg-blue-100"></div>
        <div className="background-blur bg-indigo-100"></div>
        <div className="background-grid"></div>
        <div className="background-noise"></div>
      </div>

      <Navigation />

      {/* Main Content */}
      <main className="webinar-main">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-title-container">
            <h1 className="page-title">Schedule a Webinar</h1>
            <p className="page-subtitle">
              Organize knowledge-sharing sessions with alumni experts
            </p>
          </div>
          <div className="page-actions">
            <button 
              onClick={() => navigate('/webinars/list')}
              className="view-webinars-btn"
            >
              <Calendar className="btn-icon" />
              View Scheduled Webinars
            </button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="success-message">
            <CheckCircle className="success-icon" />
            <div>
              <h3 className="success-title">Webinar Scheduled Successfully!</h3>
              <p className="success-text">Your webinar has been scheduled and notifications have been sent.</p>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="webinar-form-container">
          <form onSubmit={handleSubmit} className="webinar-form">
            <div className="form-grid">
              {/* Left Column */}
              <div className="form-column">
                {/* Alumni Selection */}
                <div className="form-section">
                  <div className="section-header">
                    <Users className="section-icon" />
                    <h2 className="section-title">Alumni Speaker</h2>
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Speaker Name
                    </label>
                    <input
                      type="text"
                      name="alumniName"
                      value={formData.alumniName}
                      className="form-input"
                      readOnly
                    />
                    <p className="form-hint">
                      The logged-in alumni account is automatically assigned as speaker
                    </p>
                  </div>
                </div>

                {/* Webinar Details */}
                <div className="form-section">
                  <div className="section-header">
                    <Video className="section-icon" />
                    <h2 className="section-title">Webinar Details</h2>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      Webinar Name *
                    </label>
                    <input
                      type="text"
                      name="webinarName"
                      value={formData.webinarName}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="e.g., Advanced React Patterns for Enterprise"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="form-textarea"
                      placeholder="What will this webinar cover? Topics, key takeaways, and learning objectives..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Prerequisites
                    </label>
                    <input
                      type="text"
                      name="prerequisites"
                      value={formData.prerequisites}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="e.g., Basic knowledge of React, Experience with TypeScript"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="form-column">
                {/* Schedule Details */}
                <div className="form-section">
                  <div className="section-header">
                    <CalendarIcon className="section-icon" />
                    <h2 className="section-title">Schedule</h2>
                  </div>
                  
                  <div className="schedule-grid">
                    <div className="form-group">
                      <label className="form-label">
                        Date *
                      </label>
                      <div className="date-input-wrapper">
                        <CalendarIcon className="input-icon" />
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          required
                          min={getMinDate()}
                          className="form-input"
                        />
                      </div>
                      <p className="form-hint">
                        Select a future date for the webinar
                      </p>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Time *
                      </label>
                      <div className="time-input-wrapper">
                        <ClockIcon className="input-icon" />
                        <input
                          type="time"
                          name="time"
                          value={formData.time}
                          onChange={handleInputChange}
                          required
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Duration *
                    </label>
                    <div className="duration-buttons">
                      {durationOptions.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          className={`duration-btn ${formData.duration === option.value ? 'active' : ''}`}
                          onClick={() => setFormData(prev => ({ ...prev, duration: option.value }))}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Platform & Capacity */}
                <div className="form-section">
                  <div className="section-header">
                    <Globe className="section-icon" />
                    <h2 className="section-title">Platform & Capacity</h2>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      Platform *
                    </label>
                    <div className="platform-grid">
                      {platformOptions.map(platform => (
                        <button
                          key={platform.id}
                          type="button"
                          className={`platform-btn ${formData.platform === platform.id ? 'active' : ''}`}
                          onClick={() => setFormData(prev => ({ ...prev, platform: platform.id }))}
                        >
                          <span className="platform-icon">{platform.icon}</span>
                          <span className="platform-name">{platform.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Maximum Participants
                    </label>
                    <div className="participants-input-wrapper">
                      <Users className="input-icon" />
                      <input
                        type="number"
                        name="maxParticipants"
                        value={formData.maxParticipants}
                        onChange={handleInputChange}
                        min="1"
                        max="1000"
                        className="form-input"
                      />
                    </div>
                    <p className="form-hint">
                      Maximum number of students who can join
                    </p>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="recordingAllowed"
                        checked={formData.recordingAllowed}
                        onChange={handleInputChange}
                        className="checkbox-input"
                      />
                      <span className="checkbox-custom"></span>
                      Allow recording
                    </label>
                    <p className="form-hint">
                      Recorded session will be available in resource library
                    </p>
                  </div>
                </div>

                {/* Skills Covered */}
                <div className="form-section">
                  <div className="section-header">
                    <FileText className="section-icon" />
                    <h2 className="section-title">Skills Covered</h2>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      Add Skills/Topics
                    </label>
                    <div className="skills-input-wrapper">
                      <input
                        type="text"
                        value={formData.skillInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, skillInput: e.target.value }))}
                        onKeyDown={handleSkillAdd}
                        className="form-input"
                        placeholder="Type a skill and press Enter..."
                      />
                      <span className="skills-hint">Press Enter to add</span>
                    </div>
                    
                    {formData.skillsCovered.length > 0 && (
                      <div className="skills-tags">
                        {formData.skillsCovered.map((skill, index) => (
                          <span key={index} className="skill-tag">
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleSkillRemove(skill)}
                              className="skill-remove-btn"
                            >
                              <X className="skill-remove-icon" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/webinars')}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="submit-btn"
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Calendar className="btn-icon" />
                    Schedule Webinar
                    <ChevronRight className="btn-icon" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Guidelines Section */}
        <div className="guidelines-section">
          <h2 className="guidelines-title">
            <AlertCircle className="guidelines-icon" />
            Webinar Guidelines
          </h2>
          <div className="guidelines-grid">
            <div className="guideline-card">
              <div className="guideline-number">1</div>
              <h3 className="guideline-title">Speaker Preparation</h3>
              <p className="guideline-text">
                Alumni should prepare slides and share them 24 hours before the webinar
              </p>
            </div>
            <div className="guideline-card">
              <div className="guideline-number">2</div>
              <h3 className="guideline-title">Technical Check</h3>
              <p className="guideline-text">
                Test audio/video setup and platform compatibility before the session
              </p>
            </div>
            <div className="guideline-card">
              <div className="guideline-number">3</div>
              <h3 className="guideline-title">Student Engagement</h3>
              <p className="guideline-text">
                Include Q&A sessions and interactive activities for better engagement
              </p>
            </div>
            <div className="guideline-card">
              <div className="guideline-number">4</div>
              <h3 className="guideline-title">Follow-up Materials</h3>
              <p className="guideline-text">
                Share resources, code samples, and recording link after the session
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WebinarScheduler;