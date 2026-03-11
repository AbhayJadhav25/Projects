import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendOTP, register } from '../utils/api';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email+pw, 2: otp
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', otp: '' });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSendOTP = async () => {
    setError('');
    if (!form.email) return setError('Please enter your email');
    if (!form.email.includes('@gmail.com') && !form.email.includes('@')) return setError('Please enter a valid email');
    if (!form.password || form.password.length < 6) return setError('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (!agreed) return setError('Please accept the Terms & Conditions');

    setOtpLoading(true);
    try {
      await sendOTP(form.email);
      setOtpSent(true);
      setStep(2);
      setSuccess('OTP sent to your email. Please check your inbox.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.otp) return setError('Please enter the OTP');

    setLoading(true);
    try {
      const { data } = await register({ email: form.email, password: form.password, otp: form.otp });
      setSuccess(data.message);
      setTimeout(() => navigate('/login'), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      <div className="auth-card">
        <div className="auth-logo">
          <span>Lightning</span>
          <span className="gradient-text">SkillSwap</span>
        </div>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-sub">Join the skill exchange community</p>

        {/* Step indicator */}
        <div className="auth-steps">
          <div className={`auth-step ${step >= 1 ? 'done' : ''}`}>
            <span>1</span> Details
          </div>
          <div className="auth-step-line" />
          <div className={`auth-step ${step >= 2 ? 'done' : ''}`}>
            <span>2</span> Verify OTP
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleSendOTP(); } : handleSubmit}>
          {step === 1 && (
            <>
              <div className="form-group">
                <label className="form-label">Gmail Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="your@gmail.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="terms-check">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <label htmlFor="terms">
                  I agree to the <Link to="/terms" className="auth-link">Terms & Conditions</Link> and{' '}
                  <Link to="/privacy" className="auth-link">Privacy Policy</Link>
                </label>
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={otpLoading}>
                {otpLoading ? 'Sending OTP...' : 'Send OTP & Continue →'}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="otp-info">
                Email OTP sent to <strong>{form.email}</strong>
              </div>
              <div className="form-group">
                <label className="form-label">Enter OTP</label>
                <input
                  type="text"
                  name="otp"
                  className="form-input otp-input"
                  placeholder="6-digit OTP"
                  value={form.otp}
                  onChange={handleChange}
                  maxLength={6}
                  required
                />
              </div>
              <div className="otp-note">
                Clock Note: After verification, your account will be created within <strong>10-15 minutes</strong>.
                You'll receive a welcome email.
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? 'Creating Account...' : 'Verify & Create Account'}
              </button>
              <button type="button" className="btn btn-ghost w-full mt-4" onClick={() => setStep(1)}>
                ← Back
              </button>
            </>
          )}
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
