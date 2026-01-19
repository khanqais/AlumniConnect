import React from 'react';
import './home.css';
import { Users, MessageSquare, Briefcase, GraduationCap, Target, Shield } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="hero-title">
                Bridge the Gap Between <span className="text-gradient">Students & Alumni</span>
              </h1>
              <p className="hero-subtitle">
                Creating a structured ecosystem for professional networking within educational institutions.
              </p>
              <div className="hero-buttons">
                <button className="btn-primary">
                  <MessageSquare size={18} className="mr-2" />
                  Join as Student
                </button>
                <button className="btn-secondary">
                  <Users size={18} className="mr-2" />
                  Join as Alumni
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section-container">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="section-title">Our Mission</h2>
          <p className="section-description">
            The objective of this platform is to create a structured ecosystem for professional networking 
            within educational institutions by connecting current students with established alumni. It empowers 
            students with direct industry insights and provides alumni with a verified channel to give back 
            through mentorship and career guidance.
          </p>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="section-container bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="section-title text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <div className="feature-card">
              <div className="feature-icon-wrapper bg-blue-100">
                <GraduationCap className="feature-icon text-blue-600" />
              </div>
              <h3 className="feature-title">For Students</h3>
              <p className="feature-description">
                Gain direct access to industry insights, career guidance, and mentorship from alumni who have walked the same path.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper bg-green-100">
                <Briefcase className="feature-icon text-green-600" />
              </div>
              <h3 className="feature-title">For Alumni</h3>
              <p className="feature-description">
                Give back to your alma mater through a verified channel, share your expertise, and help shape the next generation.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper bg-purple-100">
                <Target className="feature-icon text-purple-600" />
              </div>
              <h3 className="feature-title">Structured Ecosystem</h3>
              <p className="feature-description">
                A well-organized platform that facilitates meaningful connections with clear goals and outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-container">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-title">Why Choose AlumniConnect?</h2>
              <ul className="space-y-6 mt-6">
                <li className="flex items-start">
                  <Shield className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Verified Network</h4>
                    <p className="text-gray-600">All alumni are verified through institutional records ensuring authentic connections.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <MessageSquare className="w-6 h-6 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Structured Mentorship</h4>
                    <p className="text-gray-600">Predefined mentorship programs with clear objectives and timelines.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Briefcase className="w-6 h-6 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Industry-Ready Insights</h4>
                    <p className="text-gray-600">Direct access to current industry trends and requirements from professionals.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="lg:pl-12">
              <div className="stats-card">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Platform Impact</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                    <div className="text-3xl font-bold text-blue-600">500+</div>
                    <div className="text-gray-600 mt-2">Active Alumni</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                    <div className="text-3xl font-bold text-green-600">1200+</div>
                    <div className="text-gray-600 mt-2">Student Members</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                    <div className="text-3xl font-bold text-purple-600">300+</div>
                    <div className="text-gray-600 mt-2">Mentorships</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                    <div className="text-3xl font-bold text-orange-600">85%</div>
                    <div className="text-gray-600 mt-2">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-container bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800">Ready to Bridge the Gap?</h2>
          <p className="text-xl text-gray-600 mt-4">
            Join our growing community of students and alumni building meaningful professional connections.
          </p>
          <div className="mt-8">
            <button className="btn-primary px-8 py-3 text-lg">
              Get Started Today
            </button>
          </div>
          <p className="text-gray-500 mt-6 text-sm">
            Already have an account? <a href="#" className="text-blue-600 font-medium hover:underline">Sign in</a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;