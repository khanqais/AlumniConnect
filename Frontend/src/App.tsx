import { Suspense, lazy, type ReactElement } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Resources = lazy(() => import('./pages/Resources'));
const Blogs = lazy(() => import('./pages/Blogs'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const VideoCall = lazy(() => import('./pages/VideoCall'));
const WebinarScheduler = lazy(() => import('./pages/WebinarScheduler'));
const WebinarList = lazy(() => import('./pages/WebinarList'));
const Community = lazy(() => import('./pages/Community'));
const QuestionDetail = lazy(() => import('./pages/QuestionDetail'));
const Chat = lazy(() => import('./pages/Chat'));
const CareerPathVisualizer = lazy(() => import('./pages/CareerPathVisualizer'));
const Recommendation = lazy(() => import('./pages/Recommendation'));
const Quiz = lazy(() => import('./pages/Quiz'));
const Referrals = lazy(() => import('./pages/Referrals'));
const GroupInvites = lazy(() => import('./pages/GroupInvites'));

const RouteLoader = () => (
  <div className="flex h-screen items-center justify-center bg-gray-100">
    <div className="text-center">
      <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
      <p className="mt-4 text-lg font-semibold text-gray-700">Loading...</p>
    </div>
  </div>
);


const AdminRoute = ({ children }: { children: ReactElement }) => {
  const isAdmin = localStorage.getItem('adminAuth') === 'true';
  
  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  
  return children;
};


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
        <Suspense fallback={<RouteLoader />}>
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
          <Route
            path="/referrals"
            element={
              <ProtectedRoute>
                <Referrals />
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
          path="/quiz"
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          }
          />
          <Route
          path="/quiz/ai"
          element={
            <ProtectedRoute>
              <Quiz />
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
            path="/webinar-scheduler/:eventId" 
            element={
              <ProtectedRoute>
                <WebinarScheduler/>
              </ProtectedRoute>
            } 
          />
          <Route
            path="/webinars"
            element={
              <ProtectedRoute>
                <WebinarList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community"
            element={
              <ProtectedRoute>
                <Community />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community/:id"
            element={
              <ProtectedRoute>
                <QuestionDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:userId"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/invites"
            element={
              <ProtectedRoute>
                <GroupInvites />
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

          {/* Referrals */}
          <Route
            path="/referrals"
            element={
              <ProtectedRoute>
                <Referrals />
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
        </Suspense>
      </AuthProvider>
    </Router>
  );
}
function VideoCallWrapper() {useParams(); return <VideoCall/>; }
export default App;
