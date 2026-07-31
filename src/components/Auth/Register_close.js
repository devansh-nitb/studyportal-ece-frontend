import React from 'react'; 
import { Link } from 'react-router-dom';
import './AuthForm.scss';

const Register = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Registration Closed</h2>
        <p>The portal registration for the current semester has ended.</p>
        <p>Please check back later for updates on future registration periods.</p>
        <Link to="/" className="btn btn-primary">Go to Homepage</Link>
        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

