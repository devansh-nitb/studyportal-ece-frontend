import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import './SemesterPrompt.scss';

const SemesterPrompt = ({ onComplete }) => {
  const { user, token, API_URL, login } = useContext(AuthContext);
  const [semester, setSemester] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!semester) {
      setError('Please select a semester');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.put(`${API_URL}/auth/update-semester`, { semester: Number(semester) }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        if (typeof login === 'function') {
           login(res.data.user, res.data.token);
        }
        if (onComplete) onComplete();
      } else {
        setError(res.data.message || 'Failed to set semester');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'An error occurred while saving your semester.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="semester-prompt-overlay">
      <div className="semester-prompt-modal">
        <h2>Welcome to ECE Study Portal!</h2>
        <p>Before you continue, please let us know which semester you are currently in.</p>
        
        {error && <div className="message-box error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="semester-select">Current Semester</label>
            <select 
              id="semester-select"
              value={semester} 
              onChange={(e) => setSemester(e.target.value)}
              required
            >
              <option value="" disabled>Select your semester</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>
          
          <button type="submit" disabled={loading || !semester} className="btn-primary">
            {loading ? 'Saving...' : 'Continue to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SemesterPrompt;
