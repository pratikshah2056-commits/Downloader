import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Profile from './pages/Profile';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Upcoming from './pages/Upcoming';

import AdminDashboard from './pages/AdminDashboard';

// Google OAuth Client ID config (fallback to dummy for dev testing)
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '340196864705-9cjpo5bcjqoeq16e88qanr6ohse2aafc.apps.googleusercontent.com';

// Guard for administrator-only routes
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, token, isLoading } = useAuth();

  if (isLoading) {
    return null; // Let the global state loader manage it
  }

  if (!isAuthenticated || user?.role !== 'admin' || token === 'mock-bypass-token') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
              <Navbar />

              <main style={{ flex: 1 }}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  <Route path="/about" element={<About />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/upcoming" element={<Upcoming />} />

                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute><Dashboard /></ProtectedRoute>
                  } />
                  <Route path="/history" element={
                    <ProtectedRoute><History /></ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute><Profile /></ProtectedRoute>
                  } />

                  {/* Admin Only Routes */}
                  <Route path="/admin" element={
                    <AdminRoute><AdminDashboard /></AdminRoute>
                  } />
                </Routes>
              </main>

              <Footer />
            </div>

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--glass-bg)',
                  backdropFilter: 'var(--glass-blur)',
                  WebkitBackdropFilter: 'var(--glass-blur)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--color-text-primary)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  boxShadow: 'var(--shadow-lg)',
                },
                success: {
                  iconTheme: {
                    primary: '#6366f1',
                    secondary: 'white',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: 'white',
                  },
                },
              }}
            />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
