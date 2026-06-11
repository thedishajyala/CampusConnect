import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OAuthSuccess from './pages/OAuthSuccess';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import SuperadminDashboard from './pages/SuperadminDashboard';
import EventDetail from './pages/EventDetail';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const RedirectIfAuthenticated = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (user) return <Navigate to={`/${user.role}-dashboard`} replace />;

  return children;
};

const AppLayout = () => {
  const location = useLocation();
  const isDashboard = location.pathname.includes('-dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {!isDashboard && <Navbar />}
      <main className="flex-grow">
          <Routes>
            <Route path="/" element={<RedirectIfAuthenticated><LandingPage /></RedirectIfAuthenticated>} />
            <Route path="/login" element={<RedirectIfAuthenticated><LoginPage /></RedirectIfAuthenticated>} />
            <Route path="/signup" element={<RedirectIfAuthenticated><SignupPage /></RedirectIfAuthenticated>} />
            <Route path="/oauth-success" element={<OAuthSuccess />} />
            
            {/* Student Routes */}
            <Route 
              path="/student-dashboard/*" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Shared Secure Routes */}
            <Route 
              path="/events/:id" 
              element={
                <ProtectedRoute allowedRoles={['student', 'admin', 'superadmin', 'faculty']}>
                  <EventDetail />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin-dashboard/*" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Faculty Routes */}
            <Route 
              path="/faculty-dashboard/*" 
              element={
                <ProtectedRoute allowedRoles={['faculty']}>
                  <FacultyDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Superadmin Routes */}
            <Route 
              path="/superadmin-dashboard/*" 
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <SuperadminDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        <Toaster 
          position="top-right"
          toastOptions={{
            className: 'dark:bg-secondary-800 dark:text-white border border-secondary-100 dark:border-secondary-700 shadow-xl',
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
            }
          }}
        />
      </div>
  );
}

function AppRoutes() {
  return (
    <Router>
       <AppLayout />
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
           <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
