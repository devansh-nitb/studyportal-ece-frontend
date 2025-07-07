import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { FaBars, FaUserCircle } from 'react-icons/fa'; 
import './Header.scss'; 

const Header = ({ toggleSidebar }) => {
  const { user } = useContext(AuthContext);
  const [showProfileDetails, setShowProfileDetails] = useState(false);

  const handleProfileClick = () => {
    setShowProfileDetails(!showProfileDetails);
  };

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
        <button className="profile-icon-btn" onClick={handleProfileClick} aria-label="User Profile">
          <FaUserCircle className="profile-icon" />
        </button>
        {showProfileDetails && user && (
          <div className="profile-dropdown">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Scholar No:</strong> {user.scholarNumber}</p>
            <p><strong>Section:</strong> {user.section}</p>
            <p><strong>Email:</strong> {user.email}</p>
            {user.isAdmin && <p><strong>Role:</strong> Admin</p>}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
