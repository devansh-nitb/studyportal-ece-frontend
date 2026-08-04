import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import './AdminForms.scss';

const CATEGORIES = ['Notes', 'Books', 'PYQs', 'Assignments'];

const ManageMaterials = () => {
  const { API_URL, token } = useContext(AuthContext);

  const [materials, setMaterials] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null);

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [busyId, setBusyId] = useState(null); // material currently being updated/deleted

  // Inline edit state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSemester, setEditSemester] = useState('');
  
  const [subjects, setSubjects] = useState([]);

  // Filters
  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchMaterials = async () => {
    setListLoading(true);
    setListError(null);
    try {
      const res = await axios.get(`${API_URL}/admin/materials`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setMaterials(res.data.data);
      } else {
        setListError(res.data.message || 'Failed to fetch study materials.');
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
      setListError(err.response?.data?.message || 'Failed to load study materials.');
    } finally {
      setListLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${API_URL}/subjects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setSubjects(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMaterials();
      fetchSubjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const flash = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => { setMessage(''); setMessageType(''); }, 3000);
  };

  const patchMaterial = async (id, payload, successText) => {
    setBusyId(id);
    try {
      const res = await axios.put(`${API_URL}/admin/materials/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setMaterials(prev => prev.map(m => (m._id === id ? res.data.data : m)));
        flash(successText, 'success');
      } else {
        flash(res.data.message || 'Update failed.', 'error');
      }
    } catch (err) {
      flash(err.response?.data?.message || 'Update failed.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const startEdit = (material) => {
    setEditingId(material._id);
    setEditTitle(material.title);
    setEditSubject(material.subject?._id || '');
    setEditCategory(material.category || '');
    setEditSemester(material.semester || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditSubject('');
    setEditCategory('');
    setEditSemester('');
  };

  const submitEdit = async (id) => {
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      flash('Title cannot be empty.', 'error');
      return;
    }
    await patchMaterial(id, { 
      title: trimmedTitle, 
      subject: editSubject, 
      category: editCategory, 
      semester: editSemester 
    }, 'Material updated successfully!');
    
    // We need to fetch materials again because subject population might change
    fetchMaterials();
    cancelEdit();
  };

  const togglePremium = (material) => {
    patchMaterial(
      material._id,
      { isPremium: !material.isPremium },
      !material.isPremium ? 'Marked as premium.' : 'Removed premium flag.'
    );
  };

  const toggleDownload = (material) => {
    patchMaterial(
      material._id,
      { isDownloadEnabled: !material.isDownloadEnabled },
      !material.isDownloadEnabled ? 'Download enabled.' : 'Download disabled.'
    );
  };

  const onDelete = async (material) => {
    if (!window.confirm(`Delete "${material.title}"? This action cannot be undone.`)) return;
    setBusyId(material._id);
    try {
      const res = await axios.delete(`${API_URL}/admin/materials/${material._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setMaterials(prev => prev.filter(m => m._id !== material._id));
        flash('Material removed.', 'success');
      } else {
        flash(res.data.message || 'Delete failed.', 'error');
      }
    } catch (err) {
      flash(err.response?.data?.message || 'Delete failed.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (semesterFilter && String(m.semester) !== String(semesterFilter)) return false;
      if (categoryFilter && m.category !== categoryFilter) return false;
      return true;
    });
  }, [materials, search, semesterFilter, categoryFilter]);

  return (
    <div className="admin-section">
      <h3>Manage Study Materials</h3>
      {message && <div className={`message-box ${messageType}`}>{message}</div>}

      <div className="admin-form" style={{ marginBottom: '1rem' }}>
        <div className="form-group" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by title…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: '2 1 200px' }}
            aria-label="Search materials"
          />
          <select
            value={semesterFilter}
            onChange={e => setSemesterFilter(e.target.value)}
            style={{ flex: '1 1 120px' }}
            aria-label="Filter by semester"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
          </select>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={{ flex: '1 1 150px' }}
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {listLoading ? (
        <LoadingSpinner />
      ) : listError ? (
        <div className="message-box error">{listError}</div>
      ) : filteredMaterials.length === 0 ? (
        <p className="no-items-message">No study materials found.</p>
      ) : (
        <div className="subjects-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Subject</th>
                <th>Category</th>
                <th>Sem</th>
                <th>Type</th>
                <th>Premium</th>
                <th>Download</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.map(material => {
                const isBusy = busyId === material._id;
                return (
                  <tr key={material._id}>
                    <td>
                      {editingId === material._id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          autoFocus
                          aria-label="Edit title"
                          onKeyDown={e => {
                            if (e.key === 'Enter') submitEdit(material._id);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                        />
                      ) : (
                        material.title
                      )}
                    </td>
                    <td>
                      {editingId === material._id ? (
                        <select
                          value={editSubject}
                          onChange={e => {
                            const newSubjectId = e.target.value;
                            setEditSubject(newSubjectId);
                            const selectedSub = subjects.find(s => s._id === newSubjectId);
                            if (selectedSub) {
                              setEditSemester(selectedSub.semesters ? selectedSub.semesters[0] : selectedSub.semester);
                            }
                          }}
                        >
                          <option value="">Select Subject</option>
                          {subjects.map(s => (
                            <option key={s._id} value={s._id}>{s.name}</option>
                          ))}
                        </select>
                      ) : (
                        material.subject?.name || '—'
                      )}
                    </td>
                    <td>
                      {editingId === material._id ? (
                        <select value={editCategory} onChange={e => setEditCategory(e.target.value)}>
                          <option value="">Select Category</option>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      ) : (
                        material.category
                      )}
                    </td>
                    <td>
                      {editingId === material._id ? (
                        <select value={editSemester} onChange={e => setEditSemester(e.target.value)}>
                          {(() => {
                            const selectedSub = subjects.find(s => s._id === editSubject);
                            if (!selectedSub) return <option value="">—</option>;
                            const sems = selectedSub.semesters || [selectedSub.semester];
                            return sems.map(s => <option key={s} value={s}>{s}</option>);
                          })()}
                        </select>
                      ) : (
                        material.semester
                      )}
                    </td>
                    <td>{material.fileType}</td>
                    <td>
                      <button
                        className="btn-edit"
                        disabled={isBusy}
                        onClick={() => togglePremium(material)}
                        title={material.isPremium ? 'Remove premium' : 'Mark as premium'}
                      >
                        {material.isPremium ? '⭐ Premium' : 'Make Premium'}
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn-edit"
                        disabled={isBusy}
                        onClick={() => toggleDownload(material)}
                        title={material.isDownloadEnabled ? 'Disable download' : 'Enable download'}
                      >
                        {material.isDownloadEnabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </td>
                    <td>
                      {editingId === material._id ? (
                        <>
                          <button className="btn-edit" disabled={isBusy} onClick={() => submitEdit(material._id)}>Save</button>
                          <button className="btn-delete" disabled={isBusy} onClick={cancelEdit}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button className="btn-edit" disabled={isBusy} onClick={() => startEdit(material)}>Edit</button>
                          <button className="btn-delete" disabled={isBusy} onClick={() => onDelete(material)}>
                            {isBusy ? '...' : 'Delete'}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageMaterials;
