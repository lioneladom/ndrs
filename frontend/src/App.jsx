import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import CitizenApp from './pages/CitizenApp.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import SuperAdminPanel from './pages/SuperAdminPanel.jsx';

function ProtectedRoute({ children, requireAdmin = false, requireSuper = false }) {
  const { isAuthenticated, isAdmin, isSuperAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        minHeight: '100vh', flexDirection: 'column', gap: 16 }}>
        <div style={{
          width: 24, height: 24,
          border: '2px solid #cbd5e1',
          borderTopColor: 'var(--ndrs-blue)',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite'
        }} />
        <span style={{ color: 'var(--ndrs-muted)', fontSize: 14 }}>Loading NDRS…</span>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireSuper && !isSuperAdmin) return <Navigate to="/admin" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/app" replace />;
  return children;
}

function RootRedirect() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return <Navigate to="/app" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route path="/app" element={
        <ProtectedRoute>
          <CitizenApp />
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute requireAdmin>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      <Route path="/admin/users" element={
        <ProtectedRoute requireSuper>
          <SuperAdminPanel />
        </ProtectedRoute>
      } />

      <Route path="/dashboard" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
