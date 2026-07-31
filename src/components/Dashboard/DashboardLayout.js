import React, { useState, useContext } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import OfflineBanner from '../Common/OfflineBanner';
import { ThemeContext } from '../../context/ThemeContext';
import './DashboardLayout.scss';

const DashboardLayout = ({
  children,
  handleShowStudyMaterials,
  handleShowAnnouncements,
  handleShowFeedback,
  handleShowContribute,
  handleShowSupport,
  handleShowCalendar,
  handleShowDoubts,
  handleShowTimetable,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme } = useContext(ThemeContext);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className={`dashboard-layout ${theme}`}>
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        handleShowStudyMaterials={handleShowStudyMaterials}
        handleShowAnnouncements={handleShowAnnouncements}
        handleShowFeedback={handleShowFeedback}
        handleShowContribute={handleShowContribute}
        handleShowSupport={handleShowSupport}
        handleShowCalendar={handleShowCalendar}
        handleShowDoubts={handleShowDoubts}
        handleShowTimetable={handleShowTimetable}
      />
      <div className={`main-content ${isSidebarOpen ? 'shifted' : ''}`}>
        <Header toggleSidebar={toggleSidebar} />
        <OfflineBanner />
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
