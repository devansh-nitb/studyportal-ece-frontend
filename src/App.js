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
import AppLoader from './components/Common/AppLoader';
// FIX: Removed duplicate import of global.scss (already imported in index.js)

function App() {
  // FIX: Removed duplicate checkAuthStatus() call — AuthContext already runs it on mount
  // FIX: Removed duplicate document.body.className setter — ThemeContext already handles it
  // FIX: Removed unused `user` destructure — only `loading` is needed here
  const { loading } = useContext(AuthContext);

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
    return <AppLoader />;
  }

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

const AppContent = () => {
  const { user } = useContext(AuthContext);
  // FIX: Moved useContext call to top level — hooks cannot be called inside JSX expressions
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleHtmlViewerBack = () => {
    navigate('/dashboard', { state: { previousView: 'announcements' } });
  };

  return (
    // FIX: Now uses the `theme` variable declared at the top of the component
    <div className={`app-container ${theme}`}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/materials/:id" element={<ProtectedRoute><MaterialDetailPage /></ProtectedRoute>} />

        <Route
          path="/syllabus-view"
          element={
            <ProtectedRoute>
              <HtmlViewer
                title="CSE 2nd Year Syllabus"
                src={`${process.env.PUBLIC_URL}/syllabus.html`}
                onBack={handleHtmlViewerBack}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guidelines-view"
          element={
            <ProtectedRoute>
              <HtmlViewer
                title="Subject Guidelines"
                src={`${process.env.PUBLIC_URL}/subject-guidelines.html`}
                onBack={handleHtmlViewerBack}
              />
            </ProtectedRoute>
          }
        />

      <Route path="/admin" element={<ProtectedRoute staffOnly={true}><AdminPage /></ProtectedRoute>} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </div>
  );
};

export default App;
