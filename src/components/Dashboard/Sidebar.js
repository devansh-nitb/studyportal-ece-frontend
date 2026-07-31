import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import {
  FaHome, FaBook, FaBullhorn, FaSignOutAlt,
  FaSun, FaMoon, FaUserShield, FaGraduationCap, FaLightbulb,
  FaUpload, FaHeadset, FaCalendarAlt, FaQuestionCircle, FaClock
} from 'react-icons/fa';
import './Sidebar.scss';

const Sidebar = ({
  isOpen,
  toggleSidebar,
  handleShowStudyMaterials,
  handleShowAnnouncements,
  handleShowFeedback,
  handleShowContribute,
  handleShowSupport,
  handleShowCalendar,
  handleShowDoubts,
  handleShowTimetable,
}) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const go = (handler) => {
    handler();
    toggleSidebar();
    navigate('/dashboard');
  };

  const onAdminPanelClick     = () => { toggleSidebar(); navigate('/admin'); };
  const onSyllabusViewClick   = () => { toggleSidebar(); navigate('/syllabus-view',   { state: { previousView: 'announcements' } }); };
  const onGuidelinesViewClick = () => { toggleSidebar(); navigate('/guidelines-view', { state: { previousView: 'announcements' } }); };

  const showCalendar = !!user;

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <center><h3>SPARK CSE</h3></center>
        <button className="close-btn" onClick={toggleSidebar}>&times;</button>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link to="/dashboard" onClick={() => go(handleShowStudyMaterials)}>
              <FaHome className="nav-icon" /> Home
            </Link>
          </li>
          <li>
            <Link to="/dashboard" onClick={() => go(handleShowStudyMaterials)}>
              <FaBook className="nav-icon" /> Study Materials
            </Link>
          </li>
          <li>
            <Link to="/dashboard" onClick={() => go(handleShowAnnouncements)}>
              <FaBullhorn className="nav-icon" /> Announcements
            </Link>
          </li>
          <li>
            <Link to="/dashboard" onClick={() => go(handleShowDoubts)}>
              <FaQuestionCircle className="nav-icon" /> Doubt Board
            </Link>
          </li>
          <li>
            <Link to="/dashboard" onClick={() => go(handleShowTimetable)}>
              <FaClock className="nav-icon" /> Timetable
            </Link>
          </li>
          <li>
            <Link to="/dashboard" onClick={() => go(handleShowContribute)}>
              <FaUpload className="nav-icon" /> Contribute
            </Link>
          </li>
          <li>
            <Link to="/dashboard" onClick={() => go(handleShowSupport)}>
              <FaHeadset className="nav-icon" /> Support
            </Link>
          </li>

          {showCalendar && (
            <li>
              <Link to="/dashboard" onClick={() => go(handleShowCalendar)}>
                <FaCalendarAlt className="nav-icon" />
                Academic Calendar
              </Link>
            </li>
          )}

          {(user?.isAdmin || user?.isModerator) && (
            <li>
              <Link to="/admin" onClick={onAdminPanelClick}>
                <FaUserShield className="nav-icon" /> Admin Panel
              </Link>
            </li>
          )}
          // <li>
            // <Link to="/syllabus-view" onClick={onSyllabusViewClick}>
              // <FaGraduationCap className="nav-icon" /> Syllabus
            // </Link>
          // </li>
          // <li>
          //   <Link to="/guidelines-view" onClick={onGuidelinesViewClick}>
          //     <FaLightbulb className="nav-icon" /> Academic Guidelines
          //   </Link>
          // </li>
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
