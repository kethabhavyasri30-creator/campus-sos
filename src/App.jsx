import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import StudentSosPage from './pages/StudentSosPage';
import StaffDashboardPage from './pages/StaffDashboardPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { isFirebaseConfigured, missingFirebaseKeys } from './firebase/config';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children, allowedRole }) {
  const { currentUser, userData, loading } = useAuth();
  
  if (loading) return <div className="flex items-center justify-center min-h-screen text-slate-400">Loading your profile...</div>;
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If a role is required, verify they have it
  if (allowedRole && userData && userData.role !== allowedRole) {
    // Redirect based on actual role
    return <Navigate to={userData.role === 'staff' ? '/staff' : '/'} replace />;
  }

  return children;
}

export default function App() {
  const { currentUser, userData } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {!isFirebaseConfigured && (
        <div role="alert" className="bg-red-950/80 border-b border-red-500/50 text-red-200 text-xs px-4 py-2 text-center">
          Emergency network is offline (missing: {missingFirebaseKeys.join(', ')}). Call campus security directly.
        </div>
      )}
      <Navbar />
      <main className="flex-1 relative z-10">
        <Routes>
          <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route path="/signup" element={currentUser ? <Navigate to="/" replace /> : <SignupPage />} />
          
          <Route 
            path="/" 
            element={
              <ProtectedRoute allowedRole="student">
                <StudentSosPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/staff" 
            element={
              <ProtectedRoute allowedRole="staff">
                <StaffDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Campus Emergency Safety Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Campus SOS Network — Rapid Emergency Response System</p>
          <p className="flex items-center gap-1.5 text-slate-400">
            <span className={`w-2 h-2 rounded-full ${isFirebaseConfigured ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
            <span>{isFirebaseConfigured ? 'Cloud Firestore Online' : 'Firebase Offline'}</span>
          </p>
        </div>
      </footer>
    </div>
  );
}