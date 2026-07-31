import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { FaBell, FaPaperPlane } from 'react-icons/fa';
import './AdminNotifications.scss';

const TYPES = [
  { value: 'general',      label: 'General' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'material',     label: 'New Material' },
];

const AdminNotifications = () => {
  const { token, API_URL } = useContext(AuthContext);
  const [form, setForm] = useState({ title: '', body: '', type: 'general', premiumOnly: false });
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const handleSend = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      setMsg({ text: 'Title and body are required.', type: 'error' });
      return;
    }
    setSending(true);
    setMsg({ text: '', type: '' });
    try {
      const res = await axios.post(
        `${API_URL}/admin/notifications/broadcast`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setMsg({ text: res.data.message, type: 'success' });
        setForm({ title: '', body: '', type: 'general', premiumOnly: false });
      }
    } catch (e) {
      setMsg({ text: e.response?.data?.message || 'Failed to send notification.', type: 'error' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="admin-notif">
      <div className="an-header">
        <FaBell className="an-header__icon" />
        <h3 className="an-header__title">Broadcast Notification</h3>
      </div>

      <p className="an-desc">
        Send an in-app notification to all users or only premium users.
        It will appear in their notification bell instantly on next load.
      </p>

      {msg.text && (
        <div className={`an-msg an-msg--${msg.type}`}>{msg.text}</div>
      )}

      <div className="an-form">
        <label className="an-label">Notification Type</label>
        <select
          className="an-input"
          value={form.type}
          onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
        >
          {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        <label className="an-label">Title</label>
        <input
          className="an-input"
          placeholder="Short notification title"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          maxLength={100}
        />

        <label className="an-label">Message Body</label>
        <textarea
          className="an-input an-textarea"
          placeholder="Notification message…"
          rows={4}
          value={form.body}
          onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
          maxLength={400}
        />

        <div className="an-checkbox-row">
          <input
            type="checkbox"
            id="premiumOnly"
            checked={form.premiumOnly}
            onChange={e => setForm(f => ({ ...f, premiumOnly: e.target.checked }))}
          />
          <label htmlFor="premiumOnly">
            ⭐ Send to premium users only
          </label>
        </div>

        <button
          className="an-send-btn"
          onClick={handleSend}
          disabled={sending}
        >
          <FaPaperPlane /> {sending ? 'Sending…' : 'Send Notification'}
        </button>
      </div>

      {/* Preview */}
      {(form.title || form.body) && (
        <div className="an-preview">
          <div className="an-preview__label">Preview</div>
          <div className="an-preview__card">
            <FaBell className="an-preview__icon" />
            <div>
              <div className="an-preview__title">{form.title || 'Notification title'}</div>
              <div className="an-preview__body">{form.body || 'Notification body…'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
