import React, { useState } from 'react';
import { Lock, User, AlertCircle, MapPin, Phone, Mail, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import { settingsAPI } from '../../../services/api';
import './login.css';
import logo from "../../../assets/Gemini_Generated_Image_98lfx498lfx498lf.png";
export function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password flow states
  const [view, setView] = useState('login'); // 'login' | 'forgot-request' | 'forgot-verify' | 'forgot-reset' | 'forgot-success'
  const [otp, setOtp] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cooldown, setCooldown] = useState(0);

  React.useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(async () => {
      const success = await onLogin(username, password);
      if (!success) {
        setError('Invalid username or password');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await settingsAPI.forgotPassword();
      if (res.data && res.data.success) {
        setMaskedEmail(res.data.maskedEmail);
        setView('forgot-verify');
        setCooldown(60);
      } else {
        setError(res.data?.message || 'Failed to send OTP.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await settingsAPI.verifyOtp({ otp });
      if (res.data && res.data.success) {
        setResetToken(res.data.resetToken);
        setView('forgot-reset');
      } else {
        setError(res.data?.message || 'Failed to verify OTP.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (!newPassword || !confirmPassword) {
      setError('Both fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await settingsAPI.resetPassword({ resetToken, newPassword });
      if (res.data && res.data.success) {
        setView('forgot-success');
        setOtp('');
        setResetToken('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(res.data?.message || 'Failed to reset password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetFlow = () => {
    setView('login');
    setError('');
    setOtp('');
    setMaskedEmail('');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const companyInfo = JSON.parse(localStorage.getItem('companySettings') || '{}');
  const compName = companyInfo.name || 'JC Bricks Manufacturing';
  const compAddress = companyInfo.address || 'Village Bisnawda Dhar Road Indore-453001 (M.P.) India';
  const compPhone = companyInfo.phone || '9826305085, 9926777485';
  const compWhatsapp = companyInfo.whatsapp || '9977175856';
  const compEmail = companyInfo.email || 'jcbricksmanufacturing@gmail.com';

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
                <img src={logo} alt="logo" className="logo-img" />
              </div>
              <div className="branding-title">
                <h1>{compName}</h1>
                <p>Enterprise Management System</p>
              </div>
            </div>
          </div>

          <div className="branding-body">
            <div>
              <h2>
                Invoice Management System
              </h2>
              <p>
                JC Bricks manufactures the best quality Fresh Bricks, Fly Ash Bricks, Country Bricks and many other products.
              </p>
            </div>

            <div className="branding-features">
              <div className="feature-item" style={{ alignItems: 'flex-start' }}>
                <MapPin size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: '4px' }} />
                <p className="feature-text"><strong>Address:</strong> {compAddress}</p>
              </div>
              <div className="feature-item" style={{ alignItems: 'flex-start' }}>
                <Phone size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: '4px' }} />
                <p className="feature-text"><strong>Mobile No.:</strong> {compPhone}{compWhatsapp ? `, ${compWhatsapp}` : ''}</p>
              </div>
              {compEmail && (
                <div className="feature-item" style={{ alignItems: 'flex-start' }}>
                  <Mail size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: '4px' }} />
                  <p className="feature-text"><strong>Email ID:</strong> {compEmail}</p>
                </div>
              )}
            </div>
          </div>

          <div className="branding-footer">
            <p className="footer-text">
              {compAddress}
            </p>
            <p className="footer-text-copyright">
              © {new Date().getFullYear()} {compName}. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-form-section">
        <div className="login-form-container">
          {/* Header depending on view */}
          {view === 'login' && (
            <div className="mobile-header">
              <div className="mobile-logo">
                <div className="mobile-logo-box">
                  <img src={logo} alt="mob-logo" className='mob-logo' />
                </div>
                <div className="mobile-logo-text">
                  <h1>{compName}</h1>
                </div>
              </div>
              <h2 className="form-title">Sign In</h2>
              <p className="form-subtitle">Enter your credentials to access the system</p>
            </div>
          )}

          {view === 'forgot-request' && (
            <div className="mobile-header">
              <h2 className="form-title">Reset Password</h2>
              <p className="form-subtitle">Verify your identity using the company's registered email address.</p>
            </div>
          )}

          {view === 'forgot-verify' && (
            <div className="mobile-header">
              <h2 className="form-title">Verify OTP</h2>
              <p className="form-subtitle">We have sent a verification code to your email.</p>
            </div>
          )}

          {view === 'forgot-reset' && (
            <div className="mobile-header">
              <h2 className="form-title">New Password</h2>
              <p className="form-subtitle">Please set a secure new password for your admin account.</p>
            </div>
          )}

          {view === 'forgot-success' && (
            <div className="mobile-header" style={{ textAlign: 'center' }}>
              <div className="success-icon-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <CheckCircle2 size={56} style={{ color: '#10b981' }} />
              </div>
              <h2 className="form-title">Reset Successful</h2>
              <p className="form-subtitle">Your password has been successfully updated.</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <AlertCircle className="error-icon" size={20} />
              <div>
                <p className="error-text">{error}</p>
              </div>
            </div>
          )}

          {/* ────────────────── VIEW: LOGIN ────────────────── */}
          {view === 'login' && (
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

              <div className="forgot-password-link-container">
                <button
                  type="button"
                  onClick={() => setView('forgot-request')}
                  className="forgot-link-btn"
                >
                  Forgot Password?
                </button>
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
          )}

          {/* ────────────────── VIEW: FORGOT REQUEST ────────────────── */}
          {view === 'forgot-request' && (
            <form onSubmit={handleRequestOtp}>
              <div className="forgot-instruction-card">
                <Mail size={32} className="forgot-card-icon" />
                <p className="forgot-card-text">
                  To protect your account security, we will send a 6-digit One-Time Password (OTP) verification code to your registered company email ID.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="submit-button"
              >
                {isLoading ? 'Sending OTP...' : 'Send Verification OTP'}
              </button>

              <button
                type="button"
                onClick={resetFlow}
                className="back-to-login-btn"
              >
                <ArrowLeft size={16} /> Back to Sign In
              </button>
            </form>
          )}

          {/* ────────────────── VIEW: FORGOT VERIFY ────────────────── */}
          {view === 'forgot-verify' && (
            <form onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <label htmlFor="otp" className="form-label" style={{ textAlign: 'center' }}>
                  Verification Code (OTP)
                </label>
                <div className="input-wrapper">
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="form-input otp-input"
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoFocus
                  />
                </div>
                <p className="otp-help-text">
                  We've sent the OTP to: <strong>{maskedEmail}</strong>
                </p>
              </div>

              <div className="otp-resend-container">
                {cooldown > 0 ? (
                  <span className="cooldown-text">Resend code in {cooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={isLoading}
                    className="resend-link-btn"
                  >
                    Resend verification code
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="submit-button"
              >
                {isLoading ? 'Verifying...' : 'Verify & Proceed'}
              </button>

              <button
                type="button"
                onClick={resetFlow}
                className="back-to-login-btn"
              >
                <ArrowLeft size={16} /> Back to Sign In
              </button>
            </form>
          )}

          {/* ────────────────── VIEW: FORGOT RESET ────────────────── */}
          {view === 'forgot-reset' && (
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">
                  New Password
                </label>
                <div className="input-wrapper">
                  <KeyRound className="input-icon" size={18} />
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                    placeholder="Enter new password"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    placeholder="Re-enter new password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="submit-button"
              >
                {isLoading ? 'Updating Password...' : 'Reset Password'}
              </button>
            </form>
          )}

          {/* ────────────────── VIEW: FORGOT SUCCESS ────────────────── */}
          {view === 'forgot-success' && (
            <div className="success-flow-actions" style={{ marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={resetFlow}
                className="submit-button"
              >
                Go to Sign In
              </button>
            </div>
          )}


        </div>
      </div>
    </div>
  );
}
