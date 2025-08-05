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
        
  );
};

export default Register;


