import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import SubjectCard from '../components/Dashboard/SubjectCard';
import FolderList from '../components/Dashboard/FolderList';
import FileList from '../components/Dashboard/FileList';
import Announcements from '../components/Dashboard/Announcements';
import FeedbackForm from '../components/Common/FeedbackForm';
import ContributeForm from '../components/Dashboard/ContributeForm';
import SupportChat from '../components/Dashboard/SupportChat';
import AcademicCalendar from '../components/Dashboard/AcademicCalendar';
import DoubtBoard from '../components/Dashboard/DoubtBoard';
import TimetableView from '../components/Dashboard/TimetableView';
import SemesterPrompt from '../components/Dashboard/SemesterPrompt';
import { SubjectsGridSkeleton, FileListSkeleton } from '../components/Common/Skeleton';
import { AuthContext } from '../context/AuthContext';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useReconnectRefetch } from '../hooks/useReconnectRefetch';
import './DashboardPage.scss';

const DashboardPage = () => {
  const { user, API_URL, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardOfflineUncached, setDashboardOfflineUncached] = useState(false);
  const [materialsOfflineUncached, setMaterialsOfflineUncached] = useState(false);
  const [currentView, setCurrentView] = useState('announcements');

  // Activate push notification subscription for logged-in user
  usePushNotifications();

  const resetStudyMaterialView = useCallback(() => {
    setSelectedSubject(null);
    setSelectedCategory(null);
  }, []);

  const fetchDashboardData = useCallback(async (opts = {}) => {
    const { silent = false } = opts;
    if (!silent) setLoadingDashboard(true);
    setError(null);
    setDashboardOfflineUncached(false);
    
    // If the user hasn't set their semester yet, don't try to fetch subjects.
    if (!user || !user.semester) {
      setLoadingDashboard(false);
      return;
    }

    try {
      const subjectsRes = await axios.get(`${API_URL}/subjects?semester=${user.semester}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (subjectsRes.data.success) {
        setSubjects(subjectsRes.data.data);
      } else {
        setError(subjectsRes.data.message || 'Failed to fetch subjects.');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      if (!navigator.onLine) {
        setDashboardOfflineUncached(true);
      } else {
        setError('Failed to load dashboard data. Please try again.');
      }
    } finally {
      setLoadingDashboard(false);
    }
  }, [API_URL, token, user]);

  useEffect(() => {
    if (user && token && user.semester) fetchDashboardData();
  }, [user, token, fetchDashboardData]);

  useReconnectRefetch(() => {
    if (user && token && user.semester) fetchDashboardData({ silent: true });
  }, [user, token, fetchDashboardData]);

  useEffect(() => {
    if (location.state && location.state.previousView) {
      setCurrentView(location.state.previousView);
      if (location.state.previousView === 'materials') {
        setSelectedSubject(location.state.subject || null);
        setSelectedCategory(location.state.category || null);
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const fetchMaterials = useCallback(async (opts = {}) => {
    const { silent = false } = opts;
    if (!selectedSubject || !selectedCategory) return;
    if (!silent) setLoadingMaterials(true);
    setError(null);
    setMaterialsOfflineUncached(false);
    try {
      const res = await axios.get(
        `${API_URL}/materials?subjectId=${selectedSubject._id}&category=${selectedCategory}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setMaterials(res.data.data);
      } else {
        setError(res.data.message || 'Failed to fetch materials.');
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
      if (!navigator.onLine) {
        setMaterialsOfflineUncached(true);
      } else {
        setError('Failed to load materials. Please try again.');
      }
    } finally {
      setLoadingMaterials(false);
    }
  }, [selectedSubject, selectedCategory, API_URL, token]);

  useEffect(() => {
    if (currentView === 'materials') fetchMaterials();
  }, [currentView, fetchMaterials]);

  useReconnectRefetch(() => {
    if (currentView === 'materials') fetchMaterials({ silent: true });
  }, [currentView, fetchMaterials]);

  const handleSubjectClick   = (subject)  => { setSelectedSubject(subject); setSelectedCategory(null); setCurrentView('materials'); };
  const handleSelectFolder   = (category) => { setSelectedCategory(category); setCurrentView('materials'); };
  const handleSelectFile     = (file)     => {
    navigate(`/materials/${file._id}`, { state: { previousView: currentView, subject: selectedSubject, category: selectedCategory } });
  };
  const handleBackToFolders  = () => setSelectedCategory(null);

  const handleShowStudyMaterials = useCallback(() => { setCurrentView('materials');     resetStudyMaterialView(); }, [resetStudyMaterialView]);
  const handleShowAnnouncements  = useCallback(() => { setCurrentView('announcements'); resetStudyMaterialView(); }, [resetStudyMaterialView]);
  const handleShowFeedback       = useCallback(() => { setCurrentView('feedback');      resetStudyMaterialView(); }, [resetStudyMaterialView]);
  const handleShowContribute     = useCallback(() => { setCurrentView('contribute');    resetStudyMaterialView(); }, [resetStudyMaterialView]);
  const handleShowSupport        = useCallback(() => { setCurrentView('support');       resetStudyMaterialView(); }, [resetStudyMaterialView]);
  const handleShowCalendar       = useCallback(() => { setCurrentView('calendar');      resetStudyMaterialView(); }, [resetStudyMaterialView]);
  const handleShowDoubts         = useCallback(() => { setCurrentView('doubts');        resetStudyMaterialView(); }, [resetStudyMaterialView]);
  const handleShowTimetable      = useCallback(() => { setCurrentView('timetable');     resetStudyMaterialView(); }, [resetStudyMaterialView]);

  if (error) {
    return (
      <DashboardLayout>
        <div className="dashboard-error message-box error">{error}</div>
      </DashboardLayout>
    );
  }

  if (dashboardOfflineUncached) {
    return (
      <DashboardLayout>
        <div className="dashboard-error message-box warning">
          You're offline and this hasn't been loaded on this device before, so it isn't
          available yet. It'll load automatically as soon as you're back online.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      {user && !user.semester && <SemesterPrompt />}
      <DashboardLayout
        handleShowStudyMaterials={handleShowStudyMaterials}
        handleShowAnnouncements={handleShowAnnouncements}
        handleShowFeedback={handleShowFeedback}
        handleShowContribute={handleShowContribute}
        handleShowSupport={handleShowSupport}
        handleShowCalendar={handleShowCalendar}
        handleShowDoubts={handleShowDoubts}
        handleShowTimetable={handleShowTimetable}
      >
        <div className="dashboard-page">
          {currentView === 'announcements' && <Announcements />}
          {currentView === 'feedback'      && <FeedbackForm />}
          {currentView === 'contribute'    && <ContributeForm />}
          {currentView === 'support'       && <SupportChat />}
          {currentView === 'calendar'      && <AcademicCalendar />}
          {currentView === 'doubts'        && <DoubtBoard />}
          {currentView === 'timetable'     && <TimetableView />}

          {currentView === 'materials' && (
            <>
              {selectedSubject && (
                <div className="navigation-header">
                  {selectedCategory ? (
                    <button onClick={handleBackToFolders} className="back-button">&larr; Back to Categories</button>
                  ) : (
                    <button onClick={() => setSelectedSubject(null)} className="back-button">&larr; Back to Subjects</button>
                  )}
                  {selectedCategory  && <h3 className="current-category-title">{selectedCategory} Materials</h3>}
                  {!selectedCategory && <h3 className="current-subject-title">{selectedSubject.name}</h3>}
                </div>
              )}

              {!selectedSubject ? (
                loadingDashboard ? (
                  <SubjectsGridSkeleton count={6} />
                ) : (
                  <div className="home-view">
                    <div className="semester-section">
                      <h2>Your Subjects (Semester {user?.semester})</h2>
                      <div className="subjects-grid">
                        {subjects.length === 0 ? (
                          <p className="no-subjects-message">No subjects found for your semester yet.</p>
                        ) : (
                          subjects.map((subject) => (
                            <SubjectCard key={subject._id} subject={subject} onClick={handleSubjectClick} />
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                )
              ) : (
                <>
                  {!selectedCategory ? (
                    <FolderList onSelectFolder={handleSelectFolder} />
                  ) : loadingMaterials ? (
                    <FileListSkeleton count={5} />
                  ) : materialsOfflineUncached ? (
                    <div className="dashboard-error message-box warning">
                      You're offline and this folder hasn't been opened on this device
                      before, so it isn't cached yet. It'll load automatically once
                      you're back online.
                    </div>
                  ) : error ? (
                    <div className="dashboard-error message-box error">{error}</div>
                  ) : (
                    <FileList
                      files={materials}
                      onSelectFile={handleSelectFile}
                      selectedCategory={selectedCategory}
                      selectedSubject={selectedSubject}
                      apiUrl={API_URL}
                      token={token}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </DashboardLayout>
    </>
  );
};

export default DashboardPage;
