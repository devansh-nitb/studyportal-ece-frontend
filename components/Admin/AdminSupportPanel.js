import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const AdminSupportPanel = () => {
  const { API_URL, token } = useContext(AuthContext);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const fetchChats = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/support`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setChats(res.data.data);
        if (selectedChat) {
          const updated = res.data.data.find(c => c.user._id === selectedChat.user._id);
          if (updated) setSelectedChat(updated);
        }
      }
    } catch (err) {
      console.error('Failed to load chats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedChat) return;
    setSending(true);
    try {
      const res = await axios.post(
        `${API_URL}/admin/support/${selectedChat.user._id}/reply`,
        { text: replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setSelectedChat(res.data.data);
        setReplyText('');
        fetchChats();
      }
    } catch (err) {
      console.error('Reply failed', err);
    } finally {
      setSending(false);
    }
  };

  const handleClose = async (userId) => {
    try {
      await axios.put(`${API_URL}/admin/support/${userId}/close`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchChats();
      if (selectedChat?.user._id === userId) {
        setSelectedChat(prev => ({ ...prev, status: 'closed' }));
      }
    } catch (err) {
      console.error('Close failed', err);
    }
  };

  const handleReopen = async (userId) => {
    try {
      const res = await axios.put(`${API_URL}/admin/support/${userId}/reopen`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        fetchChats();
        if (selectedChat?.user._id === userId) {
          setSelectedChat(prev => ({ ...prev, status: 'open' }));
        }
      }
    } catch (err) {
      console.error('Reopen failed', err);
    }
  };

  const formatTime = (date) =>
    new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, height: '70vh' }}>

      {/* Chat list */}
      <div style={{
        border: '0.5px solid var(--border-color)',
        borderRadius: 12,
        overflowY: 'auto',
        background: 'var(--card-background)'
      }}>
        <div style={{
          padding: '12px 16px',
          borderBottom: '0.5px solid var(--border-color)',
          fontWeight: 500,
          color: 'var(--text-color)'
        }}>
          Support Chats ({chats.length})
        </div>
        {loading ? (
          <p style={{ padding: '1rem', color: 'var(--secondary-color)', fontSize: 13 }}>Loading...</p>
        ) : chats.length === 0 ? (
          <p style={{ padding: '1rem', color: 'var(--secondary-color)', fontSize: 13 }}>No chats yet.</p>
        ) : (
          chats.map(chat => (
            <div
              key={chat._id}
              onClick={() => setSelectedChat(chat)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderBottom: '0.5px solid var(--border-color)',
                background: selectedChat?._id === chat._id ? 'var(--success-color)' : 'transparent',
                transition: 'background 0.15s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, fontWeight: 500, fontSize: 13, color: 'var(--text-color)' }}>
                  {chat.user?.name}
                </p>
                <span style={{
                  fontSize: 10, padding: '1px 6px', borderRadius: 10,
                  background: chat.status === 'open' ? 'var(--success-color)' : 'var(--input-background)',
                  color: chat.status === 'open' ? 'var(--success-text)' : 'var(--secondary-color)'
                }}>
                  {chat.status}
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--secondary-color)' }}>
                {chat.user?.scholarNumber}
              </p>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--secondary-color)', opacity: 0.7 }}>
                {chat.messages.length > 0
                  ? chat.messages[chat.messages.length - 1].text.slice(0, 35) + '...'
                  : 'No messages'}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Chat window */}
      {selectedChat ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          border: '0.5px solid var(--border-color)',
          borderRadius: 12,
          background: 'var(--card-background)'
        }}>
          {/* Chat header */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '0.5px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-color)' }}>
                {selectedChat.user?.name}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--secondary-color)' }}>
                {selectedChat.user?.email}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {selectedChat.status === 'open' ? (
                <button
                  onClick={() => handleClose(selectedChat.user._id)}
                  style={{
                    fontSize: 12, padding: '5px 12px', borderRadius: 6,
                    border: '0.5px solid var(--delete-button-background)',
                    color: 'var(--delete-button-background)',
                    background: 'transparent', cursor: 'pointer'
                  }}
                >
                  Close Chat
                </button>
              ) : (
                <button
                  onClick={() => handleReopen(selectedChat.user._id)}
                  style={{
                    fontSize: 12, padding: '5px 12px', borderRadius: 6,
                    border: '0.5px solid #1D9E75',
                    color: '#1D9E75',
                    background: 'transparent', cursor: 'pointer'
                  }}
                >
                  Reopen Chat
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '1rem',
            display: 'flex', flexDirection: 'column', gap: 10
          }}>
            {selectedChat.messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column',
                alignItems: msg.sender === 'admin' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '75%', padding: '8px 14px', fontSize: 13, lineHeight: 1.5,
                  borderRadius: msg.sender === 'admin' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: msg.sender === 'admin' ? '#1D9E75' : 'var(--input-background)',
                  color: msg.sender === 'admin' ? '#fff' : 'var(--text-color)',
                  border: msg.sender === 'user' ? '0.5px solid var(--border-color)' : 'none'
                }}>
                  {msg.text}
                </div>
                <span style={{ fontSize: 11, color: 'var(--secondary-color)', marginTop: 2 }}>
                  {msg.sender === 'user' ? selectedChat.user?.name + ' · ' : 'You · '}{formatTime(msg.createdAt)}
                </span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Reply or closed notice */}
          {selectedChat.status === 'closed' ? (
            <div style={{
              padding: '12px 16px',
              borderTop: '0.5px solid var(--border-color)',
              fontSize: 13,
              color: 'var(--secondary-color)',
              textAlign: 'center',
              background: 'var(--input-background)',
              borderRadius: '0 0 12px 12px'
            }}>
              This chat is closed. Click <strong>Reopen Chat</strong> to resume the conversation.
            </div>
          ) : (
            <form onSubmit={handleReply} style={{
              display: 'flex', gap: 8, padding: '12px 16px',
              borderTop: '0.5px solid var(--border-color)'
            }}>
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 8,
                  border: '0.5px solid var(--input-border)',
                  fontSize: 13,
                  background: 'var(--input-background)',
                  color: 'var(--text-color)',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={sending || !replyText.trim()}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: 'none',
                  background: '#1D9E75', color: '#fff', cursor: 'pointer', fontSize: 13,
                  opacity: (sending || !replyText.trim()) ? 0.6 : 1
                }}
              >
                {sending ? '...' : 'Reply'}
              </button>
            </form>
          )}
        </div>
      ) : (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '0.5px solid var(--border-color)', borderRadius: 12,
          color: 'var(--secondary-color)', fontSize: 14,
          background: 'var(--card-background)'
        }}>
          Select a chat to view messages
        </div>
      )}
    </div>
  );
};

export default AdminSupportPanel;
