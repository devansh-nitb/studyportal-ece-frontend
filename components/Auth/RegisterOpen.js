import React, { useState, useEffect } from 'react';
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
  const [availableSections, setAvailableSections] = useState([]);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/settings/sections`);
        const result = await response.json();
        if (result.success && result.data && result.data.sections) {
          setAvailableSections(result.data.sections);
          // Set default section if available
          if (result.data.sections.length > 0) {
            setFormData(prev => ({ ...prev, section: result.data.sections[0] }));
          }
        }
      } catch (err) {
        console.error('Error fetching sections:', err);
      }
    };
    fetchSections();
  }, []);

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
            <label htmlFor="section">Section</label>
            <select
              id="section"
              name="section"
              value={section}
              onChange={onChange}
              required
              aria-label="Section"
            >
              {availableSections.length > 0 ? (
                availableSections.map((sec, idx) => (
                  <option key={idx} value={sec}>{sec}</option>
                ))
              ) : (
                <option value="">Loading sections...</option>
              )}
            </select>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
        <p> Contact : nitbfreshers@gmail.com </p>
      </div>
    </div>
  );
};

export default Register;

