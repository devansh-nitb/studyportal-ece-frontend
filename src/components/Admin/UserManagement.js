import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import './AdminForms.scss'; 
import './UserManagement.scss'; 

const UserManagement = () => {
  const { API_URL, token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null); 

  const fetchUsers = async () => {
    setLoading(true);
    setMessage('');
    setMessageType('');
    try {
      const res = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setUsers(res.data.data);
      } else {
        setMessage(res.data.message || 'Failed to fetch users.');
        setMessageType('error');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setMessage('Failed to load users. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const handleEditClick = (user) => {
    setEditUser({ ...user }); 
    setMessage('');
    setMessageType('');
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditUser({
      ...editUser,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const res = await axios.put(`${API_URL}/admin/users/${editUser._id}`, editUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setMessage('User updated successfully!');
        setMessageType('success');
        setEditUser(null); 
        fetchUsers(); 
      } else {
        setMessage(res.data.message || 'Failed to update user.');
        setMessageType('error');
      }
    } catch (err) {
      console.error('Update user error:', err.response?.data?.message || err.message);
      setMessage(err.response?.data?.message || 'Failed to update user.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setLoading(true);
      setMessage('');
      setMessageType('');
      try {
        const res = await axios.delete(`${API_URL}/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setMessage('User deleted successfully!');
          setMessageType('success');
          fetchUsers(); 
        } else {
          setMessage(res.data.message || 'Failed to delete user.');
          setMessageType('error');
        }
      } catch (err) {
        console.error('Delete user error:', err.response?.data?.message || err.message);
        setMessage(err.response?.data?.message || 'Failed to delete user.');
        setMessageType('error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="admin-section">
      <h3>User Management</h3>
      {message && <div className={`message-box ${messageType}`}>{message}</div>}

      {editUser && (
        <div className="edit-user-modal">
          <div className="modal-content">
            <h4>Edit User: {editUser.name}</h4>
            <form onSubmit={handleUpdateUser} className="admin-form">
              <div className="form-group">
                <label htmlFor="editName">Name</label>
                <input
                  type="text"
                  id="editName"
                  name="name"
                  value={editUser.name}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="editScholarNumber">Scholar Number</label>
                <input
                  type="text"
                  id="editScholarNumber"
                  name="scholarNumber"
                  value={editUser.scholarNumber}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="editEmail">Email</label>
                <input
                  type="email"
                  id="editEmail"
                  name="email"
                  value={editUser.email}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="editSection">Section</label>
                <input
                  type="text"
                  id="editSection"
                  name="section"
                  value={editUser.section}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="editIsVerified"
                  name="isVerified"
                  checked={editUser.isVerified}
                  onChange={handleEditChange}
                />
                <label htmlFor="editIsVerified">Verified</label>
              </div>
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="editIsAdmin"
                  name="isAdmin"
                  checked={editUser.isAdmin}
                  onChange={handleEditChange}
                />
                <label htmlFor="editIsAdmin">Admin</label>
              </div>
              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditUser(null)} className="btn-secondary" disabled={loading}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && !editUser ? ( 
        <LoadingSpinner />
      ) : users.length === 0 ? (
        <p className="no-items-message">No users registered yet.</p>
      ) : (
        <div className="users-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Scholar No.</th>
                <th>Email</th>
                <th>Section</th>
                <th>Verified</th>
                <th>Admin</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((userItem) => (
                <tr key={userItem._id}>
                  <td>{userItem.name}</td>
                  <td>{userItem.scholarNumber}</td>
                  <td>{userItem.email}</td>
                  <td>{userItem.section}</td>
                  <td>{userItem.isVerified ? 'Yes' : 'No'}</td>
                  <td>{userItem.isAdmin ? 'Yes' : 'No'}</td>
                  <td>
                    <button onClick={() => handleEditClick(userItem)} className="btn-edit">Edit</button>
                    <button onClick={() => handleDeleteUser(userItem._id)} className="btn-delete">Delete</button>
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

export default UserManagement;
