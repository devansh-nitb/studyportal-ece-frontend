import React, { useState, useContext, useMemo } from 'react';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import { AuthContext } from '../context/AuthContext';
import UploadMaterial from '../components/Admin/UploadMaterial';
import ManageMaterials from '../components/Admin/ManageMaterials';
import ManageSubjects from '../components/Admin/ManageSubjects';
import UserManagement from '../components/Admin/UserManagement';
import AccessLogs from '../components/Admin/AccessLogs';
import ManageAnnouncements from '../components/Admin/ManageAnnouncements';
import ManageContributions from '../components/Admin/ManageContributions';
import AdminSupportPanel from '../components/Admin/AdminSupportPanel';
import PremiumSettings from '../components/Admin/PremiumSettings';
import AdminTimetable from '../components/Admin/AdminTimetable';
import AdminNotifications from '../components/Admin/AdminNotifications';
import ManageSections from '../components/Admin/ManageSections';
import './AdminPage.scss';

// Tabs available to moderators (the subset requested: upload/manage
// materials, contributions, announcements, access logs, timetable,
// notifications). Full admins see every tab defined below this list.
const MODERATOR_TAB_KEYS = [
  'upload', 'manageMaterials', 'contributions', 'manageAnnouncements',
  'accessLogs', 'timetable', 'notifications', 'sections'
];

const AdminPage = () => {
  const { user } = useContext(AuthContext);
  const isFullAdmin = !!user?.isAdmin;
  const [activeTab, setActiveTab] = useState('upload');

  const allTabs = [
    { key: 'upload',         label: 'Upload Material' },
    { key: 'manageMaterials',label: 'Manage Materials' },
    { key: 'contributions',  label: 'Contributions' },
    { key: 'support',        label: 'Support Chats' },
    { key: 'manageSubjects', label: 'Manage Subjects' },
    { key: 'manageAnnouncements', label: 'Announcements' },
    { key: 'userManagement', label: 'User Management' },
    { key: 'accessLogs',     label: 'Access Logs' },
    { key: 'timetable',      label: '📅 Timetable' },
    { key: 'notifications',  label: '🔔 Notifications' },
    { key: 'sections',       label: '🏫 Sections' },
    { key: 'premiumSettings',label: '⭐ Premium' },
  ];

  // Moderators (non-admins) only see their permitted subset. This mirrors
  // the backend's moderatorProtect vs. adminProtect route split in
  // routes/adminRoutes.js — this is a UI convenience, not the real
  // security boundary, which lives on the server.
  const tabs = useMemo(
    () => isFullAdmin ? allTabs : allTabs.filter(t => MODERATOR_TAB_KEYS.includes(t.key)),
    [isFullAdmin] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':              return <UploadMaterial />;
      case 'manageMaterials':     return <ManageMaterials />;
      case 'contributions':       return <ManageContributions />;
      case 'support':             return isFullAdmin ? <AdminSupportPanel /> : null;
      case 'manageSubjects':      return isFullAdmin ? <ManageSubjects /> : null;
      case 'userManagement':      return isFullAdmin ? <UserManagement /> : null;
      case 'accessLogs':          return <AccessLogs />;
      case 'manageAnnouncements': return <ManageAnnouncements />;
      case 'premiumSettings':     return isFullAdmin ? <PremiumSettings /> : null;
      case 'timetable':           return <AdminTimetable />;
      case 'notifications':       return <AdminNotifications />;
      case 'sections':            return <ManageSections />;
      default:                    return <UploadMaterial />;
    }
  };

  return (
    <DashboardLayout>
      <div className="admin-page">
        <h2>{isFullAdmin ? 'Admin Panel' : 'Moderator Panel'}</h2>
        <nav className="admin-tabs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="admin-content">
          {renderContent()}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminPage;
