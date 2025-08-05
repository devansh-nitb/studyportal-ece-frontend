import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'; 
import { AuthContext } from './context/AuthContext';
import { ThemeContext } from './context/ThemeContext';
import ProtectedRoute from './ProtectedRoute';

import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import MaterialDetailPage from './pages/MaterialDetailPage';
import ErrorPage from './pages/ErrorPage';

import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import VerifyEmail from './components/Auth/VerifyEmail';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import HtmlViewer from './components/Common/HtmlViewer';

import './App.scss';
import './styles/global.scss';
function App() {
  const { user, loading, checkAuthStatus } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    const handleKeyDown = (e) => {
      if (
        (e.key === 'F12') ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);


  if (loading) {
    return <div className="app-loading">Loading application...</div>;
  }

  return (
    <Router>
      <div className="registration-closed-container">
      <div className="registration-closed-card">
        <h2>Registration Closed</h2>
        <p>We apologize, but registration for this semester has now ended.</p>
        <p>Please check back later for updates on future registration periods.</p>
        <Link to="/" className="btn btn-primary">Go to Homepage</Link>
      </div>
    </div> 
    </Router>
  );
}
export default App;