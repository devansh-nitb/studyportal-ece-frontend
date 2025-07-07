
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import './Announcements.scss'; 

const Announcements = () => {
  const { API_URL } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_URL}/announcements`);
        if (res.data.success) {
          setAnnouncements(res.data.data);
        } else {
          setError(res.data.message || 'Failed to fetch announcements.');
        }
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError('Failed to load announcements. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [API_URL]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="announcements-error message-box error">{error}</div>;
  }

  return (
    <div className="announcements-container">
      <h2>Announcements</h2>
      {announcements.length === 0 ? (
        <p className="no-announcements">No announcements available at the moment.</p>
      ) : (
        <div className="announcements-list">
          {announcements.map((announcement) => (
            <div key={announcement._id} className="announcement-item">
              <h4 className="announcement-title">{announcement.title}</h4>
              <p className="announcement-content">{announcement.content}</p>
              <span className="announcement-meta">
                Posted by {announcement.createdBy?.name || 'Admin'} on {new Date(announcement.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;
