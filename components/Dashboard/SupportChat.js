import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const SupportChat = () => {
  const { API_URL, token } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('open');
  const bottomRef = useRef(null);

  const fetchChat = async () => {
    try {
      const res = await axios.get(`${API_URL}/support`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setMessages(res.data.data.messages);
        setStatus(res.data.data.status);
      }
    } catch (err) {
      console.error('Failed to load chat', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChat();
    const interval = setInterval(fetchChat, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await axios.post(`${API_URL}/support/message`, { text }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setMessages(res.data.data.messages);
        setStatus(res.data.data.status);
        setText('');
      }
    } catch (err) {
      console.error('Failed to send', err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  if (loading) return (
    <p style={{ padding: '1rem', color: 'var(--secondary-color)' }}>Loading chat...</p>
  );

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', height: '70vh' }}>

      <div style={{ marginBottom: '0.75rem' }}>
        <h3 style={{ margin: 0, color: 'var(--text-color)' }}>Support Chat</h3>
        <p style={{ fontSize: 13, color: 'var(--secondary-color)', margin: '4px 0 0' }}>
          Send a message to the admin. We typically reply within 24 hours.
          {status === 'closed' && (
            <span style={{ color: 'var(--error-text)', marginLeft: 8 }}>· Chat closed by admin</span>
          )}
        </p>
      </div>

      {status === 'closed' && (
        <div style={{
          padding: '10px 14px',
          borderRadius: 8,
          marginBottom: '0.75rem',
          background: 'var(--error-color)',
          color: 'var(--error-text)',
          fontSize: 13,
          textAlign: 'center'
        }}>
          This chat has been closed by the admin. Send a new message to reopen it.
        </div>
      )}

      <div style={{
        flex: 1,
        overflowY: 'auto',
        border: '0.5px solid var(--border-color)',
        borderRadius: 12,
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        background: 'var(--card-background)'
      }}>
        {messages.length === 0 && (
          <p style={{ color: 'var(--secondary-color)', fontSize: 13, textAlign: 'center', marginTop: '2rem' }}>
            No messages yet. Start the conversation below.
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
          }}>
            <div style={{
              maxWidth: '75%',
              padding: '8px 14px',
              borderRadius: msg.sender === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              background: msg.sender === 'user' ? '#1D9E75' : 'var(--input-background)',
              color: msg.sender === 'user' ? '#fff' : 'var(--text-color)',
              border: msg.sender === 'admin' ? '0.5px solid var(--border-color)' : 'none',
              fontSize: 14,
              lineHeight: 1.5
            }}>
              {msg.text}
            </div>
            <span style={{ fontSize: 11, color: 'var(--secondary-color)', marginTop: 2 }}>
              {msg.sender === 'admin' ? 'Admin · ' : ''}{formatTime(msg.createdAt)}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={status === 'closed' ? 'Send a message to reopen chat...' : 'Type your message...'}
          disabled={sending}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 8,
            border: '0.5px solid var(--input-border)',
            fontSize: 14,
            background: 'var(--input-background)',
            color: 'var(--text-color)',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          style={{
            padding: '10px 18px',
            borderRadius: 8,
            border: 'none',
            background: '#1D9E75',
            color: '#fff',
            fontSize: 14,
            cursor: 'pointer',
            fontWeight: 500,
            opacity: (sending || !text.trim()) ? 0.6 : 1
          }}
        >
          {sending ? '...' : status === 'closed' ? 'Reopen & Send' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default SupportChat;
