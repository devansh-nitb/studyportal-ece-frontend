import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import {
  FaPlus, FaThumbsUp, FaCheckCircle, FaThumbtack, FaTrash,
  FaChevronDown, FaChevronUp, FaSearch, FaTimes, FaUserShield
} from 'react-icons/fa';
import './DoubtBoard.scss';

const DoubtBoard = () => {
  const { user, token, API_URL } = useContext(AuthContext);
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResolved, setFilterResolved] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', subject: '' });
  const [answerText, setAnswerText] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [msg, setMsg] = useState('');
  // FIX: Declare posting state that was missing — caused ReferenceError crash on submit
  const [posting, setPosting] = useState(false);

  const fetchDoubts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterResolved !== 'all') params.resolved = filterResolved === 'resolved';
      const res = await axios.get(`${API_URL}/doubts`, {
        headers: { Authorization: `Bearer ${token}` }, params
      });
      if (res.data.success) setDoubts(res.data.data);
    } catch (_) {}
    finally { setLoading(false); }
  }, [API_URL, token, filterResolved]);

  useEffect(() => { fetchDoubts(); }, [fetchDoubts]);

  const filtered = doubts.filter(d =>
    !searchTerm ||
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const postDoubt = async () => {
    if (!form.title.trim() || !form.body.trim() || !form.subject.trim()) return;
    setPosting(true);
    setMsg('');
    try {
      await axios.post(`${API_URL}/doubts`, form, { headers: { Authorization: `Bearer ${token}` } });
      setShowPostModal(false);
      setForm({ title: '', body: '', subject: '' });
      await fetchDoubts();
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed to post doubt.');
    } finally { setPosting(false); }
  };

  const postAnswer = async (doubtId) => {
    const text = answerText[doubtId]?.trim();
    if (!text) return;
    try {
      await axios.post(`${API_URL}/doubts/${doubtId}/answers`, { body: text }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnswerText(a => ({ ...a, [doubtId]: '' }));
      await fetchDoubts();
    } catch (_) {}
  };

  const toggleUpvote = async (id) => {
    try {
      await axios.put(`${API_URL}/doubts/${id}/upvote`, {}, { headers: { Authorization: `Bearer ${token}` } });
      await fetchDoubts();
    } catch (_) {}
  };

  const toggleAnswerUpvote = async (doubtId, answerId) => {
    try {
      await axios.put(`${API_URL}/doubts/${doubtId}/answers/${answerId}/upvote`, {}, { headers: { Authorization: `Bearer ${token}` } });
      await fetchDoubts();
    } catch (_) {}
  };

  const toggleResolve = async (id) => {
    try {
      await axios.put(`${API_URL}/doubts/${id}/resolve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      await fetchDoubts();
    } catch (_) {}
  };

  const togglePin = async (id) => {
    try {
      await axios.put(`${API_URL}/doubts/${id}/pin`, {}, { headers: { Authorization: `Bearer ${token}` } });
      await fetchDoubts();
    } catch (_) {}
  };

  const deleteDoubt = async (id) => {
    if (confirmDelete?.type === 'doubt' && confirmDelete?.doubtId === id) {
      try {
        await axios.delete(`${API_URL}/doubts/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        await fetchDoubts();
      } catch (_) {}
      setConfirmDelete(null);
    } else {
      setConfirmDelete({ type: 'doubt', doubtId: id });
    }
  };

  const deleteAnswer = async (doubtId, answerId) => {
    if (confirmDelete?.type === 'answer' && confirmDelete?.answerId === answerId) {
      try {
        await axios.delete(`${API_URL}/doubts/${doubtId}/answers/${answerId}`, { headers: { Authorization: `Bearer ${token}` } });
        await fetchDoubts();
      } catch (_) {}
      setConfirmDelete(null);
    } else {
      setConfirmDelete({ type: 'answer', doubtId, answerId });
    }
  };

  const hasUpvoted = (arr) => arr?.some(id => id === user?._id || id?.toString() === user?._id);

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="doubt-board">
      {/* Toolbar */}
      <div className="db-toolbar">
        <div className="db-toolbar__left">
          <h2 className="db-toolbar__title">Doubt Board</h2>
          <span className="db-toolbar__count">{doubts.length} doubts</span>
        </div>
        <div className="db-toolbar__right">
          <div className="db-search">
            <FaSearch className="db-search__icon" />
            <input
              className="db-search__input"
              placeholder="Search doubts or subject…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && <FaTimes className="db-search__clear" onClick={() => setSearchTerm('')} />}
          </div>
          <select className="db-filter" value={filterResolved} onChange={e => setFilterResolved(e.target.value)}>
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </select>
          <button className="db-post-btn" onClick={() => { setMsg(''); setShowPostModal(true); }}>
            <FaPlus /> Ask Doubt
          </button>
        </div>
      </div>

      {/* Doubt list */}
      {loading ? (
        <div className="db-loading">Loading doubts…</div>
      ) : filtered.length === 0 ? (
        <div className="db-empty">No doubts found. Be the first to ask!</div>
      ) : (
        <div className="db-list">
          {filtered.map(d => {
            const isExpanded = expandedId === d._id;
            const isOwner = d.postedBy?._id === user?._id || d.postedBy === user?._id;
            const canResolve = isOwner || user?.isAdmin;
            const canDelete = isOwner || user?.isAdmin;
            return (
              <div key={d._id} className={`db-card${d.isResolved ? ' db-card--resolved' : ''}${d.isPinned ? ' db-card--pinned' : ''}`}>
                <div className="db-card__header" onClick={() => setExpandedId(isExpanded ? null : d._id)}>
                  <div className="db-card__meta">
                    {d.isPinned && <span className="db-badge db-badge--pin"><FaThumbtack /> Pinned</span>}
                    {d.isResolved && <span className="db-badge db-badge--resolved"><FaCheckCircle /> Resolved</span>}
                    <span className="db-badge db-badge--subject">{d.subject}</span>
                  </div>
                  <div className="db-card__title">{d.title}</div>
                  <div className="db-card__info">
                    <span>by {d.postedBy?.name}</span>
                    <span className="db-dot">·</span>
                    <span>{timeAgo(d.createdAt)}</span>
                    <span className="db-dot">·</span>
                    <span>{d.answers?.length || 0} answers</span>
                    <span className="db-expand-icon">{isExpanded ? <FaChevronUp /> : <FaChevronDown />}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="db-card__body">
                    <p className="db-card__text">{d.body}</p>

                    <div className="db-card__actions">
                      <button
                        className={`db-action${hasUpvoted(d.upvotes) ? ' db-action--active' : ''}`}
                        onClick={() => toggleUpvote(d._id)}
                      >
                        <FaThumbsUp /> {d.upvotes?.length || 0}
                      </button>
                      {canResolve && (
                        <button className={`db-action${d.isResolved ? ' db-action--resolved' : ''}`} onClick={() => toggleResolve(d._id)}>
                          <FaCheckCircle /> {d.isResolved ? 'Unmark' : 'Mark Resolved'}
                        </button>
                      )}
                      {user?.isAdmin && (
                        <button className={`db-action${d.isPinned ? ' db-action--active' : ''}`} onClick={() => togglePin(d._id)}>
                          <FaThumbtack /> {d.isPinned ? 'Unpin' : 'Pin'}
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className={`db-action db-action--delete${confirmDelete?.type === 'doubt' && confirmDelete?.doubtId === d._id ? ' db-action--confirm' : ''}`}
                          onClick={() => deleteDoubt(d._id)}
                          onBlur={() => setConfirmDelete(null)}
                        >
                          <FaTrash /> {confirmDelete?.type === 'doubt' && confirmDelete?.doubtId === d._id ? 'Confirm?' : 'Delete'}
                        </button>
                      )}
                    </div>

                    <div className="db-answers">
                      <div className="db-answers__heading">{d.answers?.length || 0} Answers</div>
                      {d.answers?.map(ans => {
                        const ansIsOwner = ans.postedBy?._id === user?._id || ans.postedBy === user?._id;
                        const canDelAns = ansIsOwner || user?.isAdmin;
                        return (
                          <div key={ans._id} className={`db-answer${ans.isAdminAnswer ? ' db-answer--admin' : ''}`}>
                            <div className="db-answer__author">
                              {ans.isAdminAnswer && <FaUserShield className="db-answer__admin-icon" title="Admin" />}
                              <strong>{ans.postedBy?.name}</strong>
                              <span className="db-answer__time">{timeAgo(ans.createdAt)}</span>
                            </div>
                            <p className="db-answer__body">{ans.body}</p>
                            <div className="db-answer__footer">
                              <button
                                className={`db-action db-action--sm${hasUpvoted(ans.upvotes) ? ' db-action--active' : ''}`}
                                onClick={() => toggleAnswerUpvote(d._id, ans._id)}
                              >
                                <FaThumbsUp /> {ans.upvotes?.length || 0}
                              </button>
                              {canDelAns && (
                                <button
                                  className={`db-action db-action--sm db-action--delete${confirmDelete?.type === 'answer' && confirmDelete?.answerId === ans._id ? ' db-action--confirm' : ''}`}
                                  onClick={() => deleteAnswer(d._id, ans._id)}
                                  onBlur={() => setConfirmDelete(null)}
                                >
                                  {confirmDelete?.type === 'answer' && confirmDelete?.answerId === ans._id ? 'Confirm?' : <FaTrash />}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="db-answer-box">
                      <textarea
                        className="db-answer-box__input"
                        placeholder="Write your answer…"
                        rows={3}
                        value={answerText[d._id] || ''}
                        onChange={e => setAnswerText(a => ({ ...a, [d._id]: e.target.value }))}
                      />
                      <button
                        className="db-answer-box__btn"
                        onClick={() => postAnswer(d._id)}
                        disabled={!answerText[d._id]?.trim()}
                      >
                        Post Answer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Post Doubt Modal */}
      {showPostModal && (
        <div className="db-modal-overlay" onClick={() => setShowPostModal(false)}>
          <div className="db-modal" onClick={e => e.stopPropagation()}>
            <div className="db-modal__title">Ask a Doubt</div>
            {msg && <div className="db-modal__err">{msg}</div>}
            <label className="db-modal__label">Subject / Topic Tag</label>
            <input className="db-modal__input" placeholder="e.g. DBMS, OS, Maths-III"
              value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
            <label className="db-modal__label">Title</label>
            <input className="db-modal__input" placeholder="Short, clear question title"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <label className="db-modal__label">Description</label>
            <textarea className="db-modal__input db-modal__textarea" rows={5}
              placeholder="Describe your doubt in detail…"
              value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
            <div className="db-modal__actions">
              <button className="db-modal__cancel" onClick={() => setShowPostModal(false)}>Cancel</button>
              <button className="db-modal__submit" onClick={postDoubt} disabled={posting}>
                {posting ? 'Posting…' : 'Post Doubt'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoubtBoard;
