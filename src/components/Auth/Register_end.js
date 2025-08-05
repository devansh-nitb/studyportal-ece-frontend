import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './AuthForm.scss';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    scholarNumber: '',
    email: '',
    password: '',
    section: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const { name, scholarNumber, email, password, section } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const res = await register({ name, scholarNumber, email, password, section });
      if (res.success) {
        setMessage(res.message + ' Redirecting to email verification...');
        setMessageType('success');
        setTimeout(() => {
          navigate('/verify-email', { state: { email: email } });
        }, 3000);
      } else {
        setMessage(res.message);
        setMessageType('error');
      }
    } catch (err) {
      console.error(err);
      setMessage('Registration failed. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register</h2>
        {message && <div className={`message-box ${messageType}`}>{message}</div>}
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              required
              aria-label="Name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="scholarNumber">Scholar Number</label>
            <input
              type="text"
              id="scholarNumber"
              name="scholarNumber"
              value={scholarNumber}
              onChange={onChange}
              required
              aria-label="Scholar Number"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              required
              aria-label="Email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              minLength="6"
              aria-label="Password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="section">Section (Enter among ECE-1, ECE-2 or ECE-3)</label>
            <input
              type="text"
              id="section"
              name="section"
              value={section}
              onChange={onChange}
              required
              aria-label="Section"
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
