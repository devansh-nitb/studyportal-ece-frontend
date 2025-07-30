import React, { useState, useContext } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { ThemeContext } from '../../context/ThemeContext';
import './DashboardLayout.scss'; 

const DashboardLayout = ({ children, handleShowStudyMaterials, handleShowAnnouncements, handleShowFeedback }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme } = useContext(ThemeContext);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`dashboard-layout ${theme}`}>
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        handleShowStudyMaterials={handleShowStudyMaterials}
        handleShowAnnouncements={handleShowAnnouncements}
        handleShowFeedback={handleShowFeedback}
      />
      <div className={`main-content ${isSidebarOpen ? 'shifted' : ''}`}>
        <Header toggleSidebar={toggleSidebar} />
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
