import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { FaTrash, FaPlus, FaSave } from 'react-icons/fa';
import './AdminForms.scss';

const ManageSections = () => {
  const { token, API_URL } = useContext(AuthContext);
  const [sections, setSections] = useState([]);
  const [newSection, setNewSection] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/settings/sections`);
      if (res.data.success && res.data.data.sections) {
        setSections(res.data.data.sections);
      }
    } catch (err) {
      console.error('Failed to load sections', err);
      setMessage({ text: 'Failed to load sections', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleAddSection = () => {
    if (!newSection.trim()) return;
    const formattedSection = newSection.trim();
    if (sections.includes(formattedSection)) {
      setMessage({ text: 'Section already exists', type: 'error' });
      return;
    }
    setSections([...sections, formattedSection]);
    setNewSection('');
    setMessage({ text: 'Section added locally. Please save.', type: 'success' });
  };

  const handleRemoveSection = (sectionToRemove) => {
    setSections(sections.filter(sec => sec !== sectionToRemove));
    setMessage({ text: 'Section removed locally. Please save.', type: 'success' });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await axios.put(
        `${API_URL}/admin/settings/sections`,
        { sections },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setMessage({ text: 'Sections updated successfully!', type: 'success' });
      } else {
        setMessage({ text: res.data.message || 'Failed to update sections.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to update sections.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-form-container">
      <h3>Manage Sections</h3>
      <p className="admin-help-text">
        Add or remove available sections. Users will select from these sections during registration, and they are used for Timetables.
      </p>

      {message.text && (
        <div className={`admin-message ${message.type}`}>{message.text}</div>
      )}

      {loading ? (
        <p>Loading sections...</p>
      ) : (
        <div className="sections-manager">
          <div className="add-section-form" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
              type="text"
              value={newSection}
              onChange={(e) => setNewSection(e.target.value)}
              placeholder="e.g. ECE-1"
              style={{ padding: '8px', flex: 1, border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <button onClick={handleAddSection} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FaPlus /> Add Section
            </button>
          </div>

          <ul className="sections-list" style={{ listStyle: 'none', padding: 0 }}>
            {sections.length === 0 ? (
              <li>No sections available. Add some above.</li>
            ) : (
              sections.map((sec, idx) => (
                <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f9f9f9', borderBottom: '1px solid #eee', borderRadius: '4px', marginBottom: '5px' }}>
                  <span>{sec}</span>
                  <button
                    onClick={() => handleRemoveSection(sec)}
                    style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', padding: '5px' }}
                    title="Remove Section"
                  >
                    <FaTrash />
                  </button>
                </li>
              ))
            )}
          </ul>

          <div style={{ marginTop: '20px' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#4caf50' }}
            >
              <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSections;
