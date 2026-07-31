import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom'; 
import useAuth from '../../hooks/useAuth';
import './AuthForm.scss';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail, forgotPassword } = useAuth(); 
  const initialEmail = location.state?.email || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (initialEmail && !message) {
      setMessage('An OTP has been sent to your email.');
      setMessageType('info');
      setCountdown(60); 
    }
  }, [initialEmail, message]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer); 
  }, [countdown]);


  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    if (!email || !otp) {
      setMessage('Please enter both email and OTP.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const res = await verifyEmail(email, otp);
      if (res.success) {
        setMessage(res.message + ' Redirecting to dashboard...');
        setMessageType('success');
        setTimeout(() => {
          navigate('/dashboard'); 
        }, 1500);
      } else {
        setMessage(res.message);
        setMessageType('error');
      }
    } catch (err) {
      console.error(err);
      setMessage('Email verification failed. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setMessage('');
    setMessageType('');

    if (!email) {
      setMessage('Please enter your email to resend OTP.');
      setMessageType('error');
      setResendLoading(false);
      return;
    }

    try {
      const res = await forgotPassword(email); 
      if (res.success) {
        setMessage(res.message);
        setMessageType('success');
        setCountdown(60); 
      } else {
        setMessage(res.message);
        setMessageType('error');
      }
    } catch (err) {
      console.error(err);
      setMessage('Failed to resend OTP. Please try again.');
      setMessageType('error');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verify Your Email</h2>
        {message && <div className={`message-box ${messageType}`}>{message}</div>}
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email"
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="otp">OTP</label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              minLength="6"
              maxLength="6"
              aria-label="OTP"
              inputMode="numeric" 
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
        <button
          onClick={handleResendOtp}
          disabled={resendLoading || countdown > 0}
          className="resend-button"
        >
          {resendLoading
            ? 'Resending...'
            : countdown > 0
            ? `Resend OTP in ${countdown}s`
            : 'Resend OTP'}
        </button>
        <p className="auth-link">
          Remembered your password? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
