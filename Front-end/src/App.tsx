import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import StudentSignup from './pages/StudentSignup';
import AlumniSignup from './pages/AlumniSignup';
import ForgotPassword from './pages/ForgotPassword';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes with Footer */}
        <Route path="/" element={
          <div className="min-h-screen flex flex-col">
            <main className="flex-grow">
              <Home />
            </main>
            <Footer />
          </div>
        } />
        
        {/* Routes without Footer */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup/student" element={<StudentSignup />} />
        <Route path="/signup/alumni" element={<AlumniSignup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Catch-all for other routes */}
        <Route path="*" element={
          <div className="min-h-screen flex flex-col">
            <main className="flex-grow">
              404 - Page Not Found
            </main>
            <Footer />
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;