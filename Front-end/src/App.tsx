import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import Profile from './pages/Profile';
import VideoCall from "./pages/VideoCall";
import WebinarScheduler from './pages/WebinarScheduler';
import type { ReactElement } from 'react';
import './App.css';
import CareerPathVisualizer from './pages/CareerPathVisualizer';
import Recommendation from './pages/Recommendation';

// Admin Route Protection
const AdminRoute = ({ children }: { children: ReactElement }) => {
  const isAdmin = localStorage.getItem('adminAuth') === 'true';
  
  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  
  return children;
};

// User Route Protection
const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-lg font-semibold text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route (redirect if already logged in)
const PublicRoute = ({ children }: { children: ReactElement }) => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Home Page (Landing) */}
          <Route path="/" element={<Home />} />
          
          {/* Public Routes */}
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
         
          {/* Email Verification Route */}
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <Resources />
              </ProtectedRoute>
            }
          />
          <Route path="/videocall/:roomId" element={<VideoCallWrapper />}/>
          <Route
            path="/blogs"
            element={
              <ProtectedRoute>
                <Blogs />
              </ProtectedRoute>
            }
          />
           <Route 
            path="/career-path" 
            element={
              <ProtectedRoute>
                <CareerPathVisualizer />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recommendations" 
            element={
              <ProtectedRoute>
                <Recommendation/>
              </ProtectedRoute>
            } 
          />
          <Route  
            path="/webinar-scheduler" 
            element={
              <ProtectedRoute>
                <WebinarScheduler/>
              </ProtectedRoute>
            } 
          />
          <Route
            path="/blogs/:id"
            element={
              <ProtectedRoute>
                <BlogDetail />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Routes (separate from user auth) */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          
          {/* User Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Profile Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
function VideoCallWrapper() {useParams(); return <VideoCall/>; }
export default App;
