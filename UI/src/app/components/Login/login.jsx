import React, { useState } from 'react';
import { Lock, User, AlertCircle } from 'lucide-react';
import './login.css';

export function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      // Logic from original file. 
      // Note: onLogin implementation is passed as prop.
      const success = onLogin(username, password);
      if (!success) {
        setError('Invalid username or password');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="login-container">
      {/* Left Side - Branding */}
      <div className="login-branding">
        <div className="branding-gradient"></div>
        
        {/* Grid Pattern */}
        <div className="grid-pattern">
          <div className="grid-pattern-inner"></div>
        </div>

        <div className="branding-content">
          <div className="branding-header">
            <div className="branding-logo-container">
              <div className="branding-logo-box">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="4" width="28" height="6" fill="white"/>
                  <rect x="2" y="13" width="28" height="6" fill="white"/>
                  <rect x="2" y="22" width="28" height="6" fill="white"/>
                </svg>
              </div>
              <div className="branding-title">
                <h1>JC Bricks Manufacturing</h1>
                <p>Enterprise Management System</p>
              </div>
            </div>
          </div>

          <div className="branding-body">
            <div>
              <h2>
                Invoice Management<br />Made Professional
              </h2>
              <p>
                Comprehensive solution for managing invoices, payments, and customer records
                with real-time analytics and reporting.
              </p>
            </div>

            <div className="branding-features">
              <div className="feature-item">
                <div className="feature-dot"></div>
                <p className="feature-text">Complete invoice lifecycle management</p>
              </div>
              <div className="feature-item">
                <div className="feature-dot"></div>
                <p className="feature-text">Real-time payment tracking and analytics</p>
              </div>
              <div className="feature-item">
                <div className="feature-dot"></div>
                <p className="feature-text">Professional invoice generation and printing</p>
              </div>
              <div className="feature-item">
                <div className="feature-dot"></div>
                <p className="feature-text">Secure admin access control</p>
              </div>
            </div>
          </div>

          <div className="branding-footer">
            <p className="footer-text">
              Village Bisnawda Dhar Road Indore-453001 (M.P.) India
            </p>
            <p className="footer-text-copyright">
              © 2026 JC Bricks Manufacturing. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-form-section">
        <div className="login-form-container">
          <div className="mobile-header">
            <div className="mobile-logo">
              <div className="mobile-logo-box">
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="4" width="28" height="6" fill="white"/>
                  <rect x="2" y="13" width="28" height="6" fill="white"/>
                  <rect x="2" y="22" width="28" height="6" fill="white"/>
                </svg>
              </div>
              <div className="mobile-logo-text">
                <h1>JC Bricks Manufacturing</h1>
              </div>
            </div>
            <h2 className="form-title">Sign In</h2>
            <p className="form-subtitle">Enter your credentials to access the system</p>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle className="error-icon" size={20} />
              <div>
                <p className="error-text">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="submit-button"
            >
              {isLoading ? (
                <span className="loading-spinner">
                  <svg className="spinner-svg" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="demo-credentials">
            <p className="demo-title">Demo Credentials</p>
            <div className="demo-row">
              <span className="demo-label">Username:</span>
              <code className="demo-code">admin</code>
            </div>
            <div className="demo-row">
              <span className="demo-label">Password:</span>
              <code className="demo-code">admin123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
