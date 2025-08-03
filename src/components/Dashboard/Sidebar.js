import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import {
  FaHome, FaBook, FaUpload, FaBullhorn, FaCommentDots, FaSignOutAlt, FaSun, FaMoon, FaUserShield, FaGraduationCap, FaLightbulb
} from 'react-icons/fa'; 
import './Sidebar.scss'; 

const Sidebar = ({ isOpen, toggleSidebar, handleShowStudyMaterials, handleShowAnnouncements, handleShowFeedback }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const onStudyMaterialsClick = () => {
    handleShowStudyMaterials();
    toggleSidebar();
    navigate('/dashboard');
  };

  const onAnnouncementsClick = () => {
    handleShowAnnouncements();
    toggleSidebar();
    navigate('/dashboard');
  };

  const onFeedbackClick = () => {
    handleShowFeedback();
    toggleSidebar();
    navigate('/dashboard');
  };

  const onAdminPanelClick = () => {
    toggleSidebar();
    navigate('/admin');
  };

  const onSyllabusViewClick = () => {
    toggleSidebar();
    navigate('/syllabus-view', { state: { previousView: 'announcements' } }); 
  };

  const onGuidelinesViewClick = () => {
    toggleSidebar();
    navigate('/guidelines-view', { state: { previousView: 'announcements' } }); 
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h3>ECE Study Portal</h3>
        <button className="close-btn" onClick={toggleSidebar}>&times;</button>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link to="/dashboard" onClick={onStudyMaterialsClick}>
              <FaHome className="nav-icon" /> Home
            </Link>
          </li>
          <li>
            <Link to="/dashboard" onClick={onStudyMaterialsClick}>
              <FaBook className="nav-icon" /> Study Materials
            </Link>
          </li>
          {user && user.isAdmin && (
            <li>
              <Link to="/admin" onClick={onAdminPanelClick}>
                <FaUserShield className="nav-icon" /> Admin Panel
              </Link>
            </li>
          )}
          <li>
            <Link to="/dashboard" onClick={onAnnouncementsClick}>
              <FaBullhorn className="nav-icon" /> Announcements
            </Link>
          </li>
         
          <li> 
            <Link to="/syllabus-view" onClick={onSyllabusViewClick}>
              <FaGraduationCap className="nav-icon" /> Syllabus
            </Link>
          </li>
          <li> 
            <Link to="/guidelines-view" onClick={onGuidelinesViewClick}>
              <FaLightbulb className="nav-icon" /> Academic Guidelines
            </Link>
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <div className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? <FaMoon className="theme-icon" /> : <FaSun className="theme-icon" />}
          <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <FaSignOutAlt className="nav-icon" /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;


