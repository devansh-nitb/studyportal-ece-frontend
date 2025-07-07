import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './AuthForm.scss';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); 
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    if (!email) {
      setMessage('Please enter your email.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const res = await forgotPassword(email);
      if (res.success) {
        setMessage(res.message + ' Redirecting to reset password page...');
        setMessageType('success');
        setTimeout(() => {
          navigate('/reset-password', { state: { email: email } }); 
        }, 3000);
      } else {
        setMessage(res.message);
        setMessageType('error');
      }
    } catch (err) {
      console.error(err);
      setMessage('Failed to send password reset email. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
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
          <button type="submit" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send Reset OTP'}
          </button>
        </form>
        <p className="auth-link">
          Remembered your password? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
