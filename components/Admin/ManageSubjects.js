import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import './AdminForms.scss'; 
import './ManageSubjects.scss';

const ManageSubjects = () => {
  const { API_URL, token } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    _id: null,
    name: '',
    code: '',
    semester: '',
    logoUrl: '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null);

  const fetchSubjects = async () => {
    setListLoading(true);
    setListError(null);
    try {
      const res = await axios.get(`${API_URL}/subjects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setSubjects(res.data.data);
      } else {
        setListError(res.data.message || 'Failed to fetch subjects.');
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setListError('Failed to load subjects.');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSubjects();
    }
  }, [token]); 

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onEditClick = (subject) => {
    setFormData({
      _id: subject._id,
      name: subject.name,
      code: subject.code,
      semester: subject.semester,
      logoUrl: subject.logoUrl,
    });
    setMessage('');
    setMessageType('');
  };

  const onClearForm = () => {
    setFormData({
      _id: null,
      name: '',
      code: '',
      semester: '',
      logoUrl: '',
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
        
        res = await axios.put(`${API_URL}/subjects/${formData._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        res = await axios.post(`${API_URL}/subjects`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (res.data.success) {
        setMessage(`Subject ${formData._id ? 'updated' : 'added'} successfully!`);
        setMessageType('success');
        onClearForm();
        fetchSubjects();
      } else {
        setMessage(res.data.message || `Failed to ${formData._id ? 'update' : 'add'} subject.`);
        setMessageType('error');
      }
    } catch (err) {
      console.error('Subject form error:', err.response?.data?.message || err.message);
      setMessage(err.response?.data?.message || `Failed to ${formData._id ? 'update' : 'add'} subject.`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject? This action cannot be undone.')) {
      setLoading(true);
      setMessage('');
      setMessageType('');
      try {
        const res = await axios.delete(`${API_URL}/subjects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setMessage('Subject deleted successfully!');
          setMessageType('success');
          onClearForm();
          fetchSubjects(); 
        } else {
          setMessage(res.data.message || 'Failed to delete subject.');
          setMessageType('error');
        }
      } catch (err) {
        console.error('Delete error:', err.response?.data?.message || err.message);
        setMessage(err.response?.data?.message || 'Failed to delete subject.');
        setMessageType('error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="admin-section">
      <h3>{formData._id ? 'Edit Subject' : 'Add New Subject'}</h3>
      {message && <div className={`message-box ${messageType}`}>{message}</div>}
      <form onSubmit={onSubmit} className="admin-form">
        <div className="form-group">
          <label htmlFor="name">Subject Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={onChange}
            required
            aria-label="Subject Name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="code">Subject Code (e.g., EC301)</label>
          <input
            type="text"
            id="code"
            name="code"
            value={formData.code}
            onChange={onChange}
            aria-label="Subject Code"
          />
        </div>
        <div className="form-group">
          <label htmlFor="semester">Semester</label>
          <input
            type="number"
            id="semester"
            name="semester"
            value={formData.semester}
            onChange={onChange}
            min="1"
            max="8"
            required
            aria-label="Semester"
          />
        </div>
        <div className="form-group">
          <label htmlFor="logoUrl">Logo URL (Optional)</label>
          <input
            type="url"
            id="logoUrl"
            name="logoUrl"
            value={formData.logoUrl}
            onChange={onChange}
            placeholder="https://example.com/logo.png"
            aria-label="Logo URL"
          />
        </div>
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? (formData._id ? 'Updating...' : 'Adding...') : (formData._id ? 'Update Subject' : 'Add Subject')}
          </button>
          {formData._id && (
            <button type="button" onClick={onClearForm} className="btn-secondary" disabled={loading}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <h3 className="list-heading">Existing Subjects</h3>
      {listLoading ? (
        <LoadingSpinner />
      ) : listError ? (
        <div className="message-box error">{listError}</div>
      ) : subjects.length === 0 ? (
        <p className="no-items-message">No subjects found.</p>
      ) : (
        <div className="subjects-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Semester</th>
                <th>Logo</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject._id}>
                  <td>{subject.name}</td>
                  <td>{subject.code}</td>
                  <td>{subject.semester}</td>
                  <td>
                    <img
                      src={subject.logoUrl || 'https://placehold.co/50x50/CCCCCC/000000?text=Logo'}
                      alt={`${subject.name} Logo`}
                      className="subject-list-logo"
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/50x50/CCCCCC/000000?text=Logo'; }}
                    />
                  </td>
                  <td>
                    <button onClick={() => onEditClick(subject)} className="btn-edit">Edit</button>
                    <button onClick={() => onDelete(subject._id)} className="btn-delete">Delete</button>
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

export default ManageSubjects;
