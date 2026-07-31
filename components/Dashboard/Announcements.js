import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useReconnectRefetch } from '../../hooks/useReconnectRefetch';
import '../Common/Skeleton.scss';
import './Announcements.scss';
import ExamCountdown from './ExamCountdown';

// Skeleton for a single announcement card — mirrors the real .announcement-item layout
const AnnouncementSkeleton = () => (
  <div style={{
    background: 'var(--input-background)',
    border: '1px solid var(--border-color)',
    borderRadius: 10,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  }}>
    {/* Title line */}
    <div className="skeleton-block" style={{ height: 18, width: '55%' }} />
    {/* Content lines */}
    <div className="skeleton-block" style={{ height: 14, width: '100%' }} />
    <div className="skeleton-block" style={{ height: 14, width: '85%' }} />
    <div className="skeleton-block" style={{ height: 14, width: '70%' }} />
    {/* Meta line */}
    <div className="skeleton-block" style={{ height: 12, width: '40%', alignSelf: 'flex-end' }} />
  </div>
);

const AnnouncementsSkeleton = () => (
  <div style={{
    borderRadius: 12,
    border: '1px solid var(--border-color)',
    background: 'var(--card-background)',
    padding: '32px'
  }}>
    {/* "Announcements" heading placeholder */}
    <div className="skeleton-block" style={{ height: 28, width: 200, margin: '0 auto 28px' }} />
    <div style={{ display: 'grid', gap: 20 }}>
      {[1, 2, 3].map(i => <AnnouncementSkeleton key={i} />)}
    </div>
  </div>
);

const Announcements = () => {
  const { API_URL } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Distinguishes "we're offline and this was never cached" (expected,
  // shown as a soft notice) from a genuine fetch failure (shown as an error).
  const [offlineUncached, setOfflineUncached] = useState(false);

  const fetchAnnouncements = useCallback(async (opts = {}) => {
    const { silent = false } = opts;
    if (!silent) setLoading(true);
    setError(null);
    setOfflineUncached(false);
    try {
      const res = await axios.get(`${API_URL}/announcements`);
      if (res.data.success) {
        setAnnouncements(res.data.data);
      } else {
        setError(res.data.message || 'Failed to fetch announcements.');
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
      if (!navigator.onLine) {
        setOfflineUncached(true);
      } else {
        setError('Failed to load announcements. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // When the connection comes back, quietly re-fetch in the background
  // instead of requiring a full page reload — `silent` keeps the existing
  // (possibly cached/offline) list on screen while the refresh happens.
  useReconnectRefetch(() => fetchAnnouncements({ silent: true }), [fetchAnnouncements]);

  if (loading) return <AnnouncementsSkeleton />;

  if (error) {
    return <div className="announcements-error message-box error">{error}</div>;
  }

  if (offlineUncached) {
    return (
      <div className="announcements-error message-box warning">
        You're offline and announcements haven't been loaded on this device yet.
        They'll appear once you're back online.
      </div>
    );
  }

  return (
    <div className="announcements-container">
      <ExamCountdown />
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
                Posted by {announcement.createdBy?.name || 'Admin'} on{' '}
                {new Date(announcement.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;
