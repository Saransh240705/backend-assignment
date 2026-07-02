import React, { useState } from 'react';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { apiCall, setAuthToken } from '../utils/api';

interface LoginFormProps {
  onLoginSuccess: (user: any) => void;
  onToggleForm: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (response.success && response.data) {
      setAuthToken(response.data.token);
      onLoginSuccess(response.data.user);
    } else {
      setError(response.error?.message || 'Login failed. Please check credentials.');
    }
  };

  return (
    <div className="glass-panel auth-card">
      <div className="auth-header">
        <h1 className="auth-logo">Handle Tasks</h1>
        <p className="auth-subtitle">Welcome back! Please login to your account</p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="login-email">Email Address</label>
          <div className="input-wrapper">
            <Mail className="input-icon" size={18} />
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="login-password">Password</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={18} />
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Logging in...' : (
            <>
              <LogIn size={18} />
              <span>Login</span>
            </>
          )}
        </button>
      </form>

      <div className="auth-toggle">
        Don't have an account?{' '}
        <a
          href="#"
          className="auth-toggle-link"
          onClick={(e) => {
            e.preventDefault();
            onToggleForm();
          }}
        >
          Register here
        </a>
      </div>
    </div>
  );
};
export default LoginForm;
