import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import './AdminForms.scss'; 

const UploadMaterial = () => {
  const { API_URL, token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: '',
    fileType: 'PDF', // Default to PDF
    file: null,
    externalUrl: '', 
    subject: '',
    category: '',
    semester: '',
    isDownloadEnabled: false,
  });
  const [subjects, setSubjects] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [subjectsError, setSubjectsError] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      setSubjectsLoading(true);
      setSubjectsError(null);
      try {
        const res = await axios.get(`${API_URL}/subjects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setSubjects(res.data.data);
        } else {
          setSubjectsError(res.data.message || 'Failed to fetch subjects.');
        }
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setSubjectsError('Failed to load subjects for dropdown.');
      } finally {
        setSubjectsLoading(false);
      }
    };
    if (token) {
      fetchSubjects();
    }
  }, [API_URL, token]);

  const onChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : (type === 'file' ? files[0] : value),
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('fileType', formData.fileType);
    data.append('subject', formData.subject);
    data.append('category', formData.category);
    data.append('semester', formData.semester);
    data.append('isDownloadEnabled', formData.isDownloadEnabled);

    if (formData.fileType === 'URL') {
      data.append('externalUrl', formData.externalUrl);
    } else if (formData.file) {
      data.append('file', formData.file); 
    } else {
      setMessage('Please select a file or provide a URL.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/materials`, data, {
        headers: {
          'Content-Type': 'multipart/form-data', 
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setMessage('Study material uploaded successfully!');
        setMessageType('success');
        setFormData({
          title: '',
          fileType: 'PDF',
          file: null,
          externalUrl: '',
          subject: '',
          category: '',
          semester: '',
          isDownloadEnabled: false,
        });
        const fileInput = document.getElementById('file');
        if (fileInput) fileInput.value = '';
      } else {
        setMessage(res.data.message || 'Failed to upload study material.');
        setMessageType('error');
      }
    } catch (err) {
      console.error('Upload error:', err.response?.data?.message || err.message);
      setMessage(err.response?.data?.message || 'Upload failed. Please check your inputs.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (subjectsLoading) {
    return <LoadingSpinner />;
  }

  if (subjectsError) {
    return <div className="message-box error">{subjectsError}</div>;
  }

  return (
    <div className="admin-form-container">
      <h3>Upload New Study Material</h3>
      {message && <div className={`message-box ${messageType}`}>{message}</div>}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={onChange}
            required
            aria-label="Material Title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="fileType">File Type</label>
          <select
            id="fileType"
            name="fileType"
            value={formData.fileType}
            onChange={onChange}
            required
            aria-label="File Type"
          >
            <option value="PDF">PDF</option>
            <option value="Image">Image</option>
            <option value="URL">URL</option>
          </select>
        </div>

        {formData.fileType === 'URL' ? (
          <div className="form-group">
            <label htmlFor="externalUrl">External URL (e.g., Dropbox link)</label>
            <input
              type="url"
              id="externalUrl"
              name="externalUrl"
              value={formData.externalUrl}
              onChange={onChange}
              required
              aria-label="External URL"
              placeholder="https://example.com/document.pdf"
            />
          </div>
        ) : (
          <div className="form-group">
            <label htmlFor="file">File (PDF only)</label>
            <input
              type="file"
              id="file"
              name="file"
              onChange={onChange}
              required={!formData.externalUrl} 
              aria-label="Upload File"
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="subject">Subject</label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={onChange}
            required
            aria-label="Subject"
          >
            <option value="">Select Subject</option>
            {subjects.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.name} (Sem {sub.semester})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={onChange}
            required
            aria-label="Category"
          >
            <option value="">Select Category</option>
            <option value="Notes">Notes</option>
            <option value="Books">Books</option>
            <option value="PYQs">PYQs</option>
            <option value="Syllabus">Syllabus</option>
          </select>
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

        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="isDownloadEnabled"
            name="isDownloadEnabled"
            checked={formData.isDownloadEnabled}
            onChange={onChange}
            aria-label="Enable Download"
          />
          <label htmlFor="isDownloadEnabled" >Enable Download</label>
        </div>

        <button type="submit" disabled={loading} className='upload-material-btn'>
          {loading ? 'Uploading...' : 'Upload Material'}
        </button>
      </form>
    </div>
  );
};

export default UploadMaterial;
