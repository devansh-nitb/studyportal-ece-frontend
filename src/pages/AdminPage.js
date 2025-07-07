import React, { useState } from 'react';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import UploadMaterial from '../components/Admin/UploadMaterial';
import ManageSubjects from '../components/Admin/ManageSubjects';
import UserManagement from '../components/Admin/UserManagement';
import AccessLogs from '../components/Admin/AccessLogs';
import ManageAnnouncements from '../components/Admin/ManageAnnouncements';
import './AdminPage.scss'; 

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('upload'); 

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return <UploadMaterial />;
      case 'manageSubjects':
        return <ManageSubjects />;
      case 'userManagement':
        return <UserManagement />;
      case 'accessLogs':
        return <AccessLogs />;
      case 'manageAnnouncements':
        return <ManageAnnouncements />;
      default:
        return <UploadMaterial />;
    }
  };

  return (
    <DashboardLayout>
      <div className="admin-page">
        <h2>Admin Panel</h2>
        <nav className="admin-tabs">
          <button
            className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload Material
          </button>
          <button
            className={`tab-button ${activeTab === 'manageSubjects' ? 'active' : ''}`}
            onClick={() => setActiveTab('manageSubjects')}
          >
            Manage Subjects
          </button>
          <button
            className={`tab-button ${activeTab === 'manageAnnouncements' ? 'active' : ''}`}
            onClick={() => setActiveTab('manageAnnouncements')}
          >
            Manage Announcements
          </button>
          <button
            className={`tab-button ${activeTab === 'userManagement' ? 'active' : ''}`}
            onClick={() => setActiveTab('userManagement')}
          >
            User Management
          </button>
          <button
            className={`tab-button ${activeTab === 'accessLogs' ? 'active' : ''}`}
            onClick={() => setActiveTab('accessLogs')}
          >
            Access Logs
          </button>
        </nav>
        <div className="admin-content">
          {renderContent()}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminPage;
