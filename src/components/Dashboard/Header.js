import React, { useContext, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { FaBars, FaUserCircle, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import NotificationBell from './NotificationBell';
import './Header.scss';

const Header = ({ toggleSidebar }) => {
  const { user, token, API_URL, checkAuthStatus } = useContext(AuthContext);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [isEditingSem, setIsEditingSem] = useState(false);
  const [newSemester, setNewSemester] = useState(user?.semester || '');
  const [updateLoading, setUpdateLoading] = useState(false);

  const handleSemesterUpdate = async () => {
    if (!newSemester) return;
    setUpdateLoading(true);
    try {
      const res = await axios.put(`${API_URL}/auth/update-semester`, { semester: Number(newSemester) }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        if (typeof checkAuthStatus === 'function') {
           await checkAuthStatus();
        } else {
           window.location.reload();
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update semester.');
    } finally {
      setUpdateLoading(false);
      setIsEditingSem(false);
    }
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
        <NotificationBell />
        <button className="profile-icon-btn" onClick={() => setShowProfileDetails(s => !s)} aria-label="User Profile">
          <FaUserCircle className="profile-icon" />
        </button>
        {showProfileDetails && user && (
          <div className="profile-dropdown">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Scholar No:</strong> {user.scholarNumber}</p>
            <p><strong>Section:</strong> {user.section}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <strong>Semester:</strong>
              <span>{user.semester ? `Semester ${user.semester}` : 'Not set'}</span>
            </div>
            <p><strong>Email:</strong> {user.email}</p>
            {user.isAdmin && <p><strong>Role:</strong> Admin</p>}
            {!user.isAdmin && user.isModerator && <p><strong>Role:</strong> Moderator</p>}
            {user.isPremium && <p><strong>Plan:</strong> ⭐ Premium</p>}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
