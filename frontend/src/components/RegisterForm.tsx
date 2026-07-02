import React, { useState } from 'react';
import { User, Mail, Lock, UserPlus, AlertCircle, Shield } from 'lucide-react';
import { apiCall, setAuthToken } from '../utils/api';

interface RegisterFormProps {
  onRegisterSuccess: (user: any) => void;
  onToggleForm: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess, onToggleForm }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const response = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });

    setLoading(false);

    if (response.success && response.data) {
      setAuthToken(response.data.token);
      onRegisterSuccess(response.data.user);
    } else {
      setError(response.error?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="glass-panel auth-card">
      <div className="auth-header">
        <h1 className="auth-logo">Handle Tasks</h1>
        <p className="auth-subtitle">Create your account to start managing tasks</p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="register-name">Full Name</label>
          <div className="input-wrapper">
            <User className="input-icon" size={18} />
            <input
              id="register-name"
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="register-email">Email Address</label>
          <div className="input-wrapper">
            <Mail className="input-icon" size={18} />
            <input
              id="register-email"
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
          <label className="form-label" htmlFor="register-password">Password</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={18} />
            <input
              id="register-password"
              type="password"
              className="form-input"
              placeholder="•••••••• (Min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="register-role">Account Role</label>
          <div className="input-wrapper">
            <Shield className="input-icon" size={18} />
            <select
              id="register-role"
              className="form-input form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
            >
              <option value="USER">User (Self-Manage Only)</option>
              <option value="ADMIN">Admin (Full System Access)</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating account...' : (
            <>
              <UserPlus size={18} />
              <span>Register</span>
            </>
          )}
        </button>
      </form>

      <div className="auth-toggle">
        Already have an account?{' '}
        <a
          href="#"
          className="auth-toggle-link"
          onClick={(e) => {
            e.preventDefault();
            onToggleForm();
          }}
        >
          Login here
        </a>
      </div>
    </div>
  );
};
export default RegisterForm;
