import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FileViewer from '../components/Dashboard/FileViewer';
import { MaterialDetailSkeleton } from '../components/Common/Skeleton';
import { AuthContext } from '../context/AuthContext';
import { useReconnectRefetch } from '../hooks/useReconnectRefetch';
import './MaterialDetailPage.scss';

const MaterialDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { API_URL, token } = useContext(AuthContext);
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offlineUncached, setOfflineUncached] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const fetchMaterial = useCallback(async (opts = {}) => {
    const { silent = false } = opts;
    if (!silent) {
      setLoading(true);
      setRevealed(false);
    }
    setError(null);
    setOfflineUncached(false);
    try {
      const res = await axios.get(`${API_URL}/materials/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setMaterial(res.data.data);
      } else {
        setError(res.data.message || 'Failed to fetch material.');
      }
    } catch (err) {
      console.error('Error fetching material:', err);
      if (!navigator.onLine) {
        setOfflineUncached(true);
      } else {
        setError('Failed to load material. It might not exist or you do not have access.');
      }
    } finally {
      setLoading(false);
    }
  }, [API_URL, id, token]);

  useEffect(() => {
    if (id && token) fetchMaterial();
  }, [id, token, fetchMaterial]);

  // Quietly retry once connectivity returns, instead of leaving the user
  // stuck on the offline error until they manually reload the page.
  useReconnectRefetch(() => {
    if (id && token) fetchMaterial({ silent: true });
  }, [id, token, fetchMaterial]);

  // Cross-fade: once material is ready, trigger reveal on next paint
  useEffect(() => {
    if (!loading && material) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setRevealed(true));
      });
    }
  }, [loading, material]);

  const handleClose = () => {
    if (material) {
      navigate('/dashboard', {
        state: {
          previousView: 'materials',
          subject: material.subject,
          category: material.category,
        }
      });
    } else {
      navigate('/dashboard');
    }
  };

  if (error) {
    return (
      <div className="material-detail-page">
        <div className="material-detail-page-error message-box error">{error}</div>
      </div>
    );
  }

  if (offlineUncached) {
    return (
      <div className="material-detail-page">
        <div className="material-detail-page-error message-box warning">
          You're offline and this file hasn't been opened on this device before, so it
          isn't available yet. It'll load automatically once you're back online.
        </div>
      </div>
    );
  }

  return (
    <div className="material-detail-page">

      {/* Skeleton layer — real header, shimmer body, fades out on reveal */}
      <div
        className="mdp-layer"
        style={{
          opacity: revealed ? 0 : 1,
          transition: 'opacity 0.35s ease',
          pointerEvents: revealed ? 'none' : 'auto',
        }}
      >
        <MaterialDetailSkeleton
          title={material?.title || ''}
          type={material?.fileType === 'Image' ? 'image' : 'pdf'}
          onClose={handleClose}
        />
      </div>

      {/* FileViewer layer — fades in on reveal */}
      {material && (
        <div
          className="mdp-layer"
          style={{
            opacity: revealed ? 1 : 0,
            transition: 'opacity 0.35s ease',
            pointerEvents: revealed ? 'auto' : 'none',
          }}
        >
          <FileViewer
            file={material}
            onClose={handleClose}
            apiUrl={API_URL}
            token={token}
          />
        </div>
      )}

    </div>
  );
};

export default MaterialDetailPage;
