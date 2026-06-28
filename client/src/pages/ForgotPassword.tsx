import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiArrowLeft, FiCheck, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

type Step = 'email' | 'otp' | 'password';

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Step 1 — Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      toast.success('OTP sent! Check your email.');
      setStep('otp');
      startResendCooldown();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 — Verify OTP
  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      toast.error('Please enter the full 6-digit OTP.');
      return;
    }
    setStep('password');
  };

  // Step 3 — Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await authService.resetPassword({ email, otp: otp.join(''), newPassword });
      login(response.data.token, response.data.user);
      toast.success('Password reset successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password.');
      // If OTP expired, go back to OTP step
      if (error.response?.data?.message?.includes('expired') || error.response?.data?.message?.includes('Invalid')) {
        setStep('otp');
        setOtp(['', '', '', '', '', '']);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      toast.success('New OTP sent to your email!');
      setOtp(['', '', '', '', '', '']);
      startResendCooldown();
    } catch {
      toast.error('Failed to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // OTP input handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const stepInfo = {
    email:    { icon: '📧', title: 'Forgot Password', subtitle: 'Enter your email to receive a reset OTP' },
    otp:      { icon: '🔐', title: 'Enter OTP', subtitle: `We sent a 6-digit code to ${email}` },
    password: { icon: '🔑', title: 'New Password', subtitle: 'Set a strong new password' },
  };

  const currentStep = stepInfo[step];

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ width: '100%', maxWidth: '28rem', padding: '2.5rem' }}
      >
        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {(['email', 'otp', 'password'] as Step[]).map((s, i) => (
            <motion.div
              key={s}
              animate={{
                width: step === s ? '2rem' : '0.5rem',
                background: step === s || (['email', 'otp', 'password'].indexOf(step) > i)
                  ? 'var(--color-accent-primary)'
                  : 'var(--color-border)',
              }}
              style={{ height: '0.5rem', borderRadius: '9999px', transition: 'all 0.3s' }}
            />
          ))}
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <motion.div
            key={step}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}
          >
            {currentStep.icon}
          </motion.div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            {currentStep.title}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            {currentStep.subtitle}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1 — Email */}
          {step === 'email' && (
            <motion.form
              key="email"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              onSubmit={handleSendOTP}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.375rem', display: 'block' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <FiMail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="input-field"
                    style={{ paddingLeft: '2.75rem' }}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="btn-primary"
                style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }}
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </motion.button>
            </motion.form>
          )}

          {/* STEP 2 — OTP */}
          {step === 'otp' && (
            <motion.form
              key="otp"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              onSubmit={handleVerifyOTP}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              {/* OTP boxes */}
              <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'center' }} onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    style={{
                      width: '3rem', height: '3.5rem',
                      textAlign: 'center',
                      fontSize: '1.5rem', fontWeight: 700,
                      background: 'var(--glass-bg)',
                      border: `2px solid ${digit ? 'var(--color-accent-primary)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-text-primary)',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                  />
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }}
              >
                Verify OTP
              </motion.button>

              {/* Resend */}
              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isLoading}
                  style={{
                    background: 'none', border: 'none', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                    color: resendCooldown > 0 ? 'var(--color-text-muted)' : 'var(--color-accent-primary)',
                    fontSize: '0.875rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                  }}
                >
                  <FiRefreshCw size={14} />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setStep('email')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-text-muted)', fontSize: '0.875rem',
                  display: 'flex', alignItems: 'center', gap: '0.375rem', margin: '0 auto',
                }}
              >
                <FiArrowLeft size={14} /> Change email
              </button>
            </motion.form>
          )}

          {/* STEP 3 — New Password */}
          {step === 'password' && (
            <motion.form
              key="password"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              onSubmit={handleResetPassword}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.375rem', display: 'block' }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <FiLock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                    className="input-field"
                    style={{ paddingLeft: '2.75rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.375rem', display: 'block' }}>
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <FiCheck style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: confirmPassword && confirmPassword === newPassword ? '#22c55e' : 'var(--color-text-muted)' }} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    className="input-field"
                    style={{
                      paddingLeft: '2.75rem',
                      borderColor: confirmPassword && confirmPassword !== newPassword ? '#ef4444' : undefined,
                    }}
                  />
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>Passwords do not match</p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="btn-primary"
                style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </motion.button>

              <button
                type="button"
                onClick={() => setStep('otp')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-text-muted)', fontSize: '0.875rem',
                  display: 'flex', alignItems: 'center', gap: '0.375rem', margin: '0 auto',
                }}
              >
                <FiArrowLeft size={14} /> Back to OTP
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Remember your password?{' '}
          <Link to="/login" style={{ color: 'var(--color-accent-primary)', textDecoration: 'none', fontWeight: 600 }}>
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
