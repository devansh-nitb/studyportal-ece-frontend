import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import './AdminForms.scss'; 
import './ManageAnnouncements.scss'; 

const ManageAnnouncements = () => {
  const { API_URL, token } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState({
    _id: null, 
    title: '',
    content: '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null);

  const fetchAnnouncements = async () => {
    setListLoading(true);
    setListError(null);
    try {
      
      const res = await axios.get(`${API_URL}/announcements`);
      if (res.data.success) {
        setAnnouncements(res.data.data);
      } else {
        setListError(res.data.message || 'Failed to fetch announcements.');
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setListError('Failed to load announcements.');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAnnouncements();
    }
  }, [token]);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onEditClick = (announcement) => {
    setFormData({
      _id: announcement._id,
      title: announcement.title,
      content: announcement.content,
    });
    setMessage('');
    setMessageType('');
  };

  const onClearForm = () => {
    setFormData({
      _id: null,
      title: '',
      content: '',
    });
    setMessage('');
    setMessageType('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      let res;
      if (formData._id) {
        res = await axios.put(`${API_URL}/announcements/${formData._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        res = await axios.post(`${API_URL}/announcements`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (res.data.success) {
        setMessage(`Announcement ${formData._id ? 'updated' : 'created'} successfully!`);
        setMessageType('success');
        onClearForm();
        fetchAnnouncements();
      } else {
        setMessage(res.data.message || `Failed to ${formData._id ? 'update' : 'create'} announcement.`);
        setMessageType('error');
      }
    } catch (err) {
      console.error('Announcement form error:', err.response?.data?.message || err.message);
      setMessage(err.response?.data?.message || `Failed to ${formData._id ? 'update' : 'create'} announcement.`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      setLoading(true);
      setMessage('');
      setMessageType('');
      try {
        const res = await axios.delete(`${API_URL}/announcements/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setMessage('Announcement deleted successfully!');
          setMessageType('success');
          onClearForm();
          fetchAnnouncements();
        } else {
          setMessage(res.data.message || 'Failed to delete announcement.');
          setMessageType('error');
        }
      } catch (err) {
        console.error('Delete error:', err.response?.data?.message || err.message);
        setMessage(err.response?.data?.message || 'Failed to delete announcement.');
        setMessageType('error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="admin-section">
      <h3>{formData._id ? 'Edit Announcement' : 'Create New Announcement'}</h3>
      {message && <div className={`message-box ${messageType}`}>{message}</div>}
      <form onSubmit={onSubmit} className="admin-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={onChange}
            required
            aria-label="Announcement Title"
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={onChange}
            rows="5"
            required
            aria-label="Announcement Content"
          ></textarea>
        </div>
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? (formData._id ? 'Updating...' : 'Creating...') : (formData._id ? 'Update Announcement' : 'Create Announcement')}
          </button>
          {formData._id && (
            <button type="button" onClick={onClearForm} className="btn-secondary" disabled={loading}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <h3 className="list-heading">Existing Announcements</h3>
      {listLoading ? (
        <LoadingSpinner />
      ) : listError ? (
        <div className="message-box error">{listError}</div>
      ) : announcements.length === 0 ? (
        <p className="no-items-message">No announcements found.</p>
      ) : (
        <div className="announcements-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Content</th>
                <th>Posted By</th>
                <th>Posted At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((announcement) => (
                <tr key={announcement._id}>
                  <td>{announcement.title}</td>
                  <td>{announcement.content}</td>
                  <td>{announcement.createdBy?.name || 'Unknown'}</td>
                  <td>{new Date(announcement.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => onEditClick(announcement)} className="btn-edit">Edit</button>
                    <button onClick={() => onDelete(announcement._id)} className="btn-delete">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageAnnouncements;
