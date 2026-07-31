import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import './AdminForms.scss';

const PremiumSettings = () => {
  const { API_URL, token, premiumEnabled, checkAuthStatus } = useContext(AuthContext);
  const [enabled, setEnabled] = useState(premiumEnabled);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Sync with context whenever it changes
  useEffect(() => {
    setEnabled(premiumEnabled);
  }, [premiumEnabled]);

  const handleToggle = async () => {
    const newValue = !enabled;
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.put(
        `${API_URL}/admin/settings/premium-enabled`,
        { enabled: newValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setEnabled(newValue);
        setMessage(`Premium feature ${newValue ? 'enabled' : 'disabled'} successfully.`);
        setMessageType('success');
        // Refresh auth context so premiumEnabled is up-to-date globally
        await checkAuthStatus();
      } else {
        setMessage(res.data.message || 'Failed to update setting.');
        setMessageType('error');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update setting.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-section">
      <h3>Premium Feature Settings</h3>
      <p style={{ color: 'var(--secondary-color)', marginBottom: '1.2rem', fontSize: '0.92rem' }}>
        When premium is <strong>disabled</strong>, premium materials are hidden from all non-admin users and
        the download lock in the viewer is invisible. Only admins can see premium content in this state.
        When <strong>enabled</strong>, premium materials and the download lock become visible — premium users
        get full access, free users see the lock.
      </p>

      {message && (
        <div className={`message-box ${messageType}`} style={{ marginBottom: '1rem' }}>
          {message}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.95rem', color: 'var(--text-color)' }}>
          Premium is currently:{' '}
          <strong style={{ color: enabled ? '#f6c90e' : 'var(--secondary-color)' }}>
            {enabled ? '⭐ Enabled' : '○ Disabled'}
          </strong>
        </span>
        <button
          onClick={handleToggle}
          disabled={loading}
          className="btn-edit"
          style={{
            background: enabled
              ? 'transparent'
              : 'linear-gradient(135deg, #f6c90e, #e0a800)',
            color: enabled ? 'var(--secondary-color)' : '#1a1a1a',
            border: enabled ? '1px solid var(--border-color)' : 'none',
            padding: '8px 20px',
            borderRadius: '8px',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Saving…' : enabled ? 'Disable Premium' : 'Enable Premium'}
        </button>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color, #333)', fontSize: '0.88rem', color: 'var(--secondary-color)' }}>
        <strong>Reminder:</strong> To grant or revoke premium for individual users, go to the <em>User Management</em> tab and use the Premium toggle next to each user.
      </div>
    </div>
  );
};

export default PremiumSettings;
