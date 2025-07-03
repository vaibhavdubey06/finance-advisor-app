import React from 'react';
import ChatAdvisor from './ChatAdvisor';
import Dashboard from './Dashboard';
import { AuthProvider, useAuth } from './AuthProvider';
import LandingPage from './LandingPage';
import './App.css';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

function MainApp() {
  const { user } = useAuth();
  const location = useLocation();

  if (user === undefined) {
    return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</div>;
  }

  return (
    <Routes>
      {/* Public landing page always at / */}
      <Route path="/" element={<LandingPage />} />
      {/* Main app (protected) */}
      <Route
        path="/app"
        element={user ? (
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', background: '#f9f9f9', padding: '2rem 0' }}>
            <div style={{ width: '100%', maxWidth: 600, margin: '0 auto', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', borderRadius: 10, background: '#fff', marginBottom: 32 }}>
              <Dashboard />
            </div>
         
          </div>
        ) : (
          <Navigate to="/" state={{ from: location }} replace />
        )}
      />
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
