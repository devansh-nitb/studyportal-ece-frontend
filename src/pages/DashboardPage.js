// frontend/src/pages/DashboardPage.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import SubjectCard from '../components/Dashboard/SubjectCard';
import FolderList from '../components/Dashboard/FolderList';
import FileList from '../components/Dashboard/FileList';
import Announcements from '../components/Dashboard/Announcements';
import FeedbackForm from '../components/Common/FeedbackForm';
import LoadingSpinner from '../components/Common/LoadingSpinner';
// HtmlViewer is no longer rendered directly here, but in its own routes
import { AuthContext } from '../context/AuthContext';
import './DashboardPage.scss'; // Page-specific styles

const DashboardPage = () => {
  const { user, API_URL, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentSemester, setCurrentSemester] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('announcements'); // Default to showing announcements

  const resetStudyMaterialView = useCallback(() => {
    setSelectedSubject(null);
    setSelectedCategory(null);
  }, []);

  // Effect to fetch initial dashboard data (semester and subjects)
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const semesterRes = await axios.get(`${API_URL}/settings/current-semester`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const fetchedSemester = semesterRes.data.data.currentSemester || 3;
        setCurrentSemester(fetchedSemester);

        const subjectsRes = await axios.get(`${API_URL}/subjects?semester=${fetchedSemester}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (subjectsRes.data.success) {
          setSubjects(subjectsRes.data.data);
        } else {
          setError(subjectsRes.data.message || 'Failed to fetch subjects.');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user && token) {
      fetchDashboardData();
    }
  }, [user, API_URL, token]);

  // Effect to restore previous view from navigation state
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

  // Fetch materials for selected subject and category
  useEffect(() => {
    const fetchMaterials = async () => {
      if (selectedSubject && selectedCategory) {
        setLoading(true);
        setError(null);
        try {
          const res = await axios.get(
            `${API_URL}/materials?subjectId=${selectedSubject._id}&category=${selectedCategory}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          if (res.data.success) {
            setMaterials(res.data.data);
          } else {
            setError(res.data.message || 'Failed to fetch materials.');
          }
        } catch (err) {
          console.error('Error fetching materials:', err);
          setError('Failed to load materials. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };

    if (currentView === 'materials') {
      fetchMaterials();
    }
  }, [selectedSubject, selectedCategory, API_URL, token, currentView]);


  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setSelectedCategory(null);
    setCurrentView('materials');
  };

  const handleSelectFolder = (category) => {
    setSelectedCategory(category);
    setCurrentView('materials');
  };

  const handleSelectFile = (file) => {
    navigate(`/materials/${file._id}`, {
      state: {
        previousView: currentView,
        subject: selectedSubject,
        category: selectedCategory,
      }
    });
  };

  const handleBackToFolders = () => {
    setSelectedCategory(null);
  };

  const handleShowStudyMaterials = useCallback(() => {
    setCurrentView('materials');
    resetStudyMaterialView();
  }, [resetStudyMaterialView]);

  const handleShowAnnouncements = useCallback(() => {
    setCurrentView('announcements');
    resetStudyMaterialView();
  }, [resetStudyMaterialView]);

  const handleShowFeedback = useCallback(() => {
    setCurrentView('feedback');
    resetStudyMaterialView();
  }, [resetStudyMaterialView]);

  // Removed handleShowSyllabusHtml and handleShowGuidelinesHtml from here

  if (loading) {
    return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  }

  if (error) {
    return <DashboardLayout><div className="dashboard-error message-box error">{error}</div></DashboardLayout>;
  }

  return (
    <DashboardLayout
      handleShowStudyMaterials={handleShowStudyMaterials}
      handleShowAnnouncements={handleShowAnnouncements}
      handleShowFeedback={handleShowFeedback}
      // Removed handleShowSyllabusHtml and handleShowGuidelinesHtml from props
    >
      <div className="dashboard-page">
        {currentView === 'announcements' && <Announcements />}
        {currentView === 'feedback' && <FeedbackForm />}
        {/* Removed HtmlViewer rendering from here */}

        {currentView === 'materials' && (
          <>
            {/* Removed static-content-buttons from here */}

            {/* Navigation Header with Back Button */}
            {selectedSubject && (
              <div className="navigation-header">
                {selectedCategory ? (
                  <button onClick={handleBackToFolders} className="back-button">&larr; Back to Categories</button>
                ) : (
                  <button onClick={() => setSelectedSubject(null)} className="back-button">&larr; Back to Subjects</button>
                )}
                {selectedCategory && <h3 className="current-category-title">{selectedCategory} Materials</h3>}
                {!selectedCategory && selectedSubject && <h3 className="current-subject-title">{selectedSubject.name}</h3>}
              </div>
            )}

            {!selectedSubject ? (
              <div className="semester-section">
                <h2>Current Semester: Semester {currentSemester}</h2>
                <div className="subjects-grid">
                  {subjects.length === 0 ? (
                    <p className="no-subjects-message">No subjects found for this semester yet.</p>
                  ) : (
                    subjects.map((subject) => (
                      <SubjectCard key={subject._id} subject={subject} onClick={handleSubjectClick} />
                    ))
                  )}
                </div>
              </div>
            ) : (
              <>
                {!selectedCategory ? (
                  <FolderList onSelectFolder={handleSelectFolder} />
                ) : (
                  <FileList
                    files={materials}
                    onSelectFile={handleSelectFile}
                    selectedCategory={selectedCategory}
                    selectedSubject={selectedSubject}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
