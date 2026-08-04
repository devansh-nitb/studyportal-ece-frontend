import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import './AdminForms.scss'; 

const UploadMaterial = () => {
  const { API_URL, token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    fileType: 'PDF', // Default to PDF
    externalUrl: '', 
    title: '', // Only used if URL is selected
    subject: '',
    category: '',
    semester: '',
    isDownloadEnabled: false,
    isPremium: false,
  });
  
  // For bulk file selection
  const [selectedFiles, setSelectedFiles] = useState([]);

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
    const { name, value, type, checked } = e.target;
    const newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    };
    if (name === 'subject') {
      const selectedSub = subjects.find(s => s._id === value);
      if (selectedSub) {
        newFormData.semester = selectedSub.semesters ? selectedSub.semesters[0] : selectedSub.semester;
      } else {
        newFormData.semester = '';
      }
    }
    setFormData(newFormData);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newSelectedFiles = files.map(file => ({
      fileObj: file,
      customTitle: file.name // Default title is the original file name
    }));
    setSelectedFiles(prev => [...prev, ...newSelectedFiles]);
  };

  const handleCustomTitleChange = (index, newTitle) => {
    setSelectedFiles(prev => {
      const updated = [...prev];
      updated[index].customTitle = newTitle;
      return updated;
    });
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    if (formData.fileType === 'URL') {
      if (!formData.title || !formData.externalUrl) {
        setMessage('Please provide a title and external URL.');
        setMessageType('error');
        setLoading(false);
        return;
      }
      
      const data = new FormData();
      data.append('title', formData.title);
      data.append('fileType', formData.fileType);
      data.append('subject', formData.subject);
      data.append('category', formData.category);
      data.append('semester', formData.semester);
      data.append('isDownloadEnabled', formData.isDownloadEnabled);
      data.append('isPremium', formData.isPremium);
      data.append('externalUrl', formData.externalUrl);

      try {
        const res = await axios.post(`${API_URL}/materials`, data, {
          headers: {
            'Content-Type': 'multipart/form-data', 
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.data.success) {
          setMessage('Study material URL uploaded successfully!');
          setMessageType('success');
          setFormData({ ...formData, title: '', externalUrl: '' });
        } else {
          setMessage(res.data.message || 'Failed to upload study material URL.');
          setMessageType('error');
        }
      } catch (err) {
        setMessage(err.response?.data?.message || 'Upload failed.');
        setMessageType('error');
      }
      setLoading(false);
      return;
    }

    if (selectedFiles.length === 0) {
      setMessage('Please select at least one file to upload.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
      const { fileObj, customTitle } = selectedFiles[i];
      const data = new FormData();
      data.append('title', customTitle);
      data.append('fileType', formData.fileType);
      data.append('subject', formData.subject);
      data.append('category', formData.category);
      data.append('semester', formData.semester);
      data.append('isDownloadEnabled', formData.isDownloadEnabled);
      data.append('isPremium', formData.isPremium);
      data.append('file', fileObj); 

      try {
        const res = await axios.post(`${API_URL}/materials`, data, {
          headers: {
            'Content-Type': 'multipart/form-data', 
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.data.success) successCount++;
        else failCount++;
      } catch (err) {
        failCount++;
      }
    }

    if (failCount === 0) {
      setMessage(`Successfully uploaded ${successCount} file(s)!`);
      setMessageType('success');
      setSelectedFiles([]);
      const fileInput = document.getElementById('file');
      if (fileInput) fileInput.value = '';
    } else {
      setMessage(`Uploaded ${successCount} files, but ${failCount} failed.`);
      setMessageType(successCount > 0 ? 'warning' : 'error');
    }
    
    setLoading(false);
  };

  if (subjectsLoading) return <LoadingSpinner />;
  if (subjectsError) return <div className="message-box error">{subjectsError}</div>;

  return (
    <div className="admin-form-container">
      <h3>Upload New Study Material</h3>
      {message && <div className={`message-box ${messageType}`}>{message}</div>}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="fileType">File Type</label>
          <select
            id="fileType"
            name="fileType"
            value={formData.fileType}
            onChange={onChange}
            required
          >
            <option value="PDF">PDF</option>
            <option value="Image">Image</option>
            <option value="URL">URL</option>
          </select>
        </div>

        {formData.fileType === 'URL' ? (
          <>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={onChange}
                required
                placeholder="Title for the URL"
              />
            </div>
            <div className="form-group">
              <label htmlFor="externalUrl">External URL (e.g., Dropbox link)</label>
              <input
                type="url"
                id="externalUrl"
                name="externalUrl"
                value={formData.externalUrl}
                onChange={onChange}
                required
                placeholder="https://example.com/document.pdf"
              />
            </div>
          </>
        ) : (
          <div className="form-group">
            <label htmlFor="file">Select Files ({formData.fileType} only)</label>
            <input
              type="file"
              id="file"
              name="file"
              multiple // Allow bulk selection
              onChange={handleFileSelect}
              accept={formData.fileType === 'PDF' ? '.pdf' : 'image/*'}
            />
          </div>
        )}

        {/* Display selected files for bulk upload */}
        {formData.fileType !== 'URL' && selectedFiles.length > 0 && (
          <div className="selected-files-list">
            <h4>Selected Files ({selectedFiles.length})</h4>
            {selectedFiles.map((fileData, index) => (
              <div key={index} className="selected-file-row" style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                <span style={{flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                  {fileData.fileObj.name}
                </span>
                <input
                  type="text"
                  value={fileData.customTitle}
                  onChange={(e) => handleCustomTitleChange(index, e.target.value)}
                  placeholder="Custom Name (Optional)"
                  style={{ flex: 1, padding: '5px' }}
                  required
                />
                <button type="button" onClick={() => removeSelectedFile(index)} style={{ padding: '5px 10px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  X
                </button>
              </div>
            ))}
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
          >
            <option value="">Select Subject</option>
            {subjects.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.name} (Sem {sub.semesters ? sub.semesters.join(', ') : sub.semester})
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
          >
            <option value="">Select Category</option>
            <option value="Notes">Notes</option>
            <option value="Books">Books</option>
            <option value="PYQs">PYQs</option>
            <option value="Assignments">Assignments</option>
          </select>
        </div>



        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="isDownloadEnabled"
            name="isDownloadEnabled"
            checked={formData.isDownloadEnabled}
            onChange={onChange}
          />
          <label htmlFor="isDownloadEnabled" >Enable Download</label>
        </div>

        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="isPremium"
            name="isPremium"
            checked={formData.isPremium}
            onChange={onChange}
          />
          <label htmlFor="isPremium">⭐ Premium Only</label>
        </div>

        <button type="submit" disabled={loading} className='upload-material-btn'>
          {loading ? 'Uploading...' : `Upload ${selectedFiles.length > 0 ? selectedFiles.length : ''} Material(s)`}
        </button>
      </form>
    </div>
  );
};

export default UploadMaterial;
