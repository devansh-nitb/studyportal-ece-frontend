import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { FaBars, FaUserCircle } from 'react-icons/fa';
import NotificationBell from './NotificationBell';
import './Header.scss';
const Header = ({ toggleSidebar }) => {
  const { user } = useContext(AuthContext);
  const [showProfileDetails, setShowProfileDetails] = useState(false);

  return (
    <header className="dashboard-header">
      <button className="menu-toggle-btn" onClick={toggleSidebar} aria-label="Toggle Sidebar">
        <FaBars />
      </button>
      <div className="welcome-section">
        {user ? (
          <>
            <h1 className="welcome-text">Welcome, {user.name}</h1>
            <span className="scholar-number">Scholar No: {user.scholarNumber}</span>
          </>
        ) : (
          <h1 className="welcome-text">Welcome</h1>
        )}
      </div>
      <div className="user-profile-section">
        <NotificationBell />
        <button className="profile-icon-btn" onClick={() => setShowProfileDetails(s => !s)} aria-label="User Profile">
          <FaUserCircle className="profile-icon" />
        </button>
        {showProfileDetails && user && (
          <div className="profile-dropdown">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Scholar No:</strong> {user.scholarNumber}</p>
            <p><strong>Section:</strong> {user.section}</p>
            <p><strong>Email:</strong> {user.email}</p>
            {user.isAdmin && <p><strong>Role:</strong> Admin</p>}
            {user.isPremium && <p><strong>Plan:</strong> ⭐ Premium</p>}
          </div>
        )}

{user.isAdmin && <p><strong>Role:</strong> Admin</p>}
            {!user.isAdmin && user.isModerator && <p><strong>Role:</strong> Moderator</p>}
      </div>
    </header>
  );
};

export default Header;
