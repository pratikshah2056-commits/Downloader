import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShield, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

const VerifyOTP: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60); // 60s cooldown for resend
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve registered email from route state
  const email = location.state?.email || localStorage.getItem('umd_verify_email');

  useEffect(() => {
    if (!email) {
      toast.error('No email found to verify. Please register first.');
      navigate('/register');
      return;
    }
    // Save email locally in case they refresh
    localStorage.setItem('umd_verify_email', email);
  }, [email, navigate]);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.verifyOTP(email, otp);
      localStorage.removeItem('umd_verify_email');
      login(response.data.token, response.data.user);
      toast.success('Email verified successfully! Welcome!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resendLoading) return;

    setResendLoading(true);
    try {
      await authService.resendOTP(email);
      toast.success('A new verification code has been sent!');
      setTimer(60); // Reset timer
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

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
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            style={{
              width: '3.5rem', height: '3.5rem',
              background: 'var(--gradient-primary)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
              color: 'white', fontSize: '1.5rem',
            }}
          >
            <FiShield />
          </motion.div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Verify Your Email
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            We've sent a 6-digit verification code to <br />
            <strong style={{ color: 'var(--color-text-primary)' }}>{email}</strong>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem', display: 'block', textAlign: 'center' }}>
              Verification Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Numeric only
              placeholder="000000"
              required
              className="input-field"
              style={{
                textAlign: 'center',
                fontSize: '1.75rem',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.5rem',
                padding: '0.75rem',
              }}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="btn-primary"
            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }}
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </motion.button>
        </form>

        {/* Resend Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
          <button
            onClick={() => navigate('/register')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.25rem',
              background: 'transparent', border: 'none',
              color: 'var(--color-text-muted)', cursor: 'pointer',
            }}
          >
            <FiArrowLeft /> Back to register
          </button>

          <button
            onClick={handleResend}
            disabled={timer > 0 || resendLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              background: 'transparent', border: 'none',
              color: timer > 0 ? 'var(--color-text-muted)' : 'var(--color-accent-primary)',
              cursor: timer > 0 ? 'not-allowed' : 'pointer',
              fontWeight: 600,
            }}
          >
            <FiRefreshCw className={resendLoading ? 'animate-spin' : ''} />
            {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
