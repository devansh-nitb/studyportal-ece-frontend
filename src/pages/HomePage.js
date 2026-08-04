import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';
import './HomePage.scss';

const HomePage = () => {
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="homepage-container">
      <div className="theme-toggle-button" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === 'light' ? <FaMoon /> : <FaSun />}
      </div>
      <div className="homepage-content">
        <h1>Welcome to ECE Study Portal</h1>
        <p className="subtitle">Your dedicated resource for ECE 2nd Year studies at NIT Bhopal.</p>
        <p className="description">
          Access notes, books, previous year questions (PYQs), and syllabi for your current semester subjects.
          Stay organized and excel in your academics!
        </p>
        <div className="auth-buttons">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary">Login</Link>
              <Link to="/register" className="btn btn-secondary">Register</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
