import React, { useState, useEffect } from 'react';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { Dashboard } from './components/Dashboard';
import { apiCall, getAuthToken, removeAuthToken } from './utils/api';
import './styles/main.css';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [appReady, setAppReady] = useState(false);

  // Restore session on page load
  useEffect(() => {
    const restoreSession = async () => {
      const token = getAuthToken();
      if (token) {
        const response = await apiCall('/auth/me');
        if (response.success && response.data) {
          setCurrentUser(response.data);
        } else {
          // Token expired or invalid, clear local cache
          removeAuthToken();
        }
      }
      setAppReady(true);
    };

    restoreSession();
  }, []);

  if (!appReady) {
    return (
      <div className="auth-container">
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>Restoring Session...</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Checking credentials...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="auth-split-layout">
        {/* Left Side: Brand Panel */}
        <div className="auth-brand-side">
          <div className="brand-glow-orb"></div>
          <div className="brand-content">
            <span className="brand-tagline">Antigravity Workspace</span>
            <h1 className="brand-hero-title">
              Complete your projects with absolute control.
            </h1>
            <p className="brand-hero-desc">
              Experience task management designed for speed, security, and aesthetic excellence.
            </p>
            
            <div className="brand-features">
              <div className="brand-feature-item">
                <span className="feature-dot"></span>
                <span>Role-Based Access Control</span>
              </div>
              <div className="brand-feature-item">
                <span className="feature-dot"></span>
                <span>Stateless JWT Session Management</span>
              </div>
              <div className="brand-feature-item">
                <span className="feature-dot"></span>
                <span>Responsive Bento Grid Workspaces</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form Container */}
        <div className="auth-form-side">
          {showRegister ? (
            <RegisterForm
              onRegisterSuccess={(user) => setCurrentUser(user)}
              onToggleForm={() => setShowRegister(false)}
            />
          ) : (
            <LoginForm
              onLoginSuccess={(user) => setCurrentUser(user)}
              onToggleForm={() => setShowRegister(true)}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <Dashboard
      currentUser={currentUser}
      onLogout={() => setCurrentUser(null)}
    />
  );
};

export default App;
