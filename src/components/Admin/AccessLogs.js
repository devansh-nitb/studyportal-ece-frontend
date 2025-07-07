import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import './AdminForms.scss';
import './AccessLogs.scss';

const AccessLogs = () => {
  const { API_URL, token } = useContext(AuthContext);
  const [accessLogs, setAccessLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAccessLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_URL}/admin/access-logs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setAccessLogs(res.data.data);
        } else {
          setError(res.data.message || 'Failed to fetch access logs.');
        }
      } catch (err) {
        console.error('Error fetching access logs:', err);
        setError('Failed to load access logs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAccessLogs();
    }
  }, [token]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="message-box error">{error}</div>;
  }

  return (
    <div className="admin-section">
      <h3>Study Material Access Logs</h3>
      {accessLogs.length === 0 ? (
        <p className="no-items-message">No access logs found yet.</p>
      ) : (
        <div className="access-logs-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Scholar No.</th>
                <th>Material Title</th> 
                <th>Subject</th> 
                <th>Category</th>
                <th>Accessed At</th>
              </tr>
            </thead>
            <tbody>
              {accessLogs.map((log) => (
                <tr key={log._id}>
                  <td>{log.userId ? log.userId.name : 'N/A'}</td>
                  <td>{log.userId ? log.userId.scholarNumber : 'N/A'}</td>
                  <td>{log.materialTitle || 'N/A'}</td> 
                  <td>{log.subjectName || 'N/A'}</td> 
                  <td>{log.materialId ? log.materialId.category : 'N/A'}</td>
                  <td>{new Date(log.accessedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AccessLogs;
