import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { FaSave, FaTable, FaChevronDown } from 'react-icons/fa';
import './AdminTimetable.scss';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

// FIX: Kept in sync with the backend (models/Timetable.js, controllers/timetableController.js)
// and the student-facing sidebar view (components/Dashboard/TimetableView.js).
// Previously this file used 8 generic periods and a free-text "section" field
// (capped at 3 characters, so typing "CSE-1" was silently truncated to "CSE"),
// which meant saves from this screen almost never matched what the sidebar
// timetable expected (section enum: 'CSE-1' | 'CSE-2' | 'CSE-3', 7 periods).
const PERIODS = [1, 2, 3, 4, 5, 6, 7];
const PERIOD_TIMES = {
  1: '9:00–10:00', 2: '10:00–11:00', 3: '11:00–12:00', 4: '12:00–1:00',
  5: '2:30–3:30',  6: '3:30–4:30',   7: '4:30–5:30',
};
const TYPES = ['Lecture','Lab','Tutorial','Free'];
const SECTIONS = ['CSE-1', 'CSE-2', 'CSE-3'];

function emptySchedule() {
  return DAYS.map(day => ({
    day,
    slots: PERIODS.map(p => ({ period: p, subject: '', faculty: '', room: '', type: '' }))
  }));
}

const AdminTimetable = () => {
  const { token, API_URL } = useContext(AuthContext);
  const [section,  setSection]  = useState(SECTIONS[0]);
  const [semester, setSemester] = useState(3);
  const [schedule, setSchedule] = useState(emptySchedule());
  const [loading,  setLoading]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState({ text: '', type: '' });
  const [expanded, setExpanded] = useState({}); // { 'Monday-1': true }

  const fetchTimetable = async () => {
    setLoading(true);
    setMsg({ text: '', type: '' });
    try {
      const res = await axios.get(`${API_URL}/timetable`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { section, semester },
      });
      if (res.data.success) {
        const raw = res.data.data.schedule;
        // Merge with empty template so all days/slots always exist
        const merged = emptySchedule().map(empty => {
          const found = raw.find(d => d.day === empty.day);
          if (!found) return empty;
          return {
            ...empty,
            slots: empty.slots.map(es => {
              const fs = found.slots.find(s => s.period === es.period);
              return fs ? { ...es, ...fs } : es;
            })
          };
        });
        setSchedule(merged);
      } else {
        setMsg({ text: 'Failed to load timetable.', type: 'error' });
      }
    } catch {
      setMsg({ text: 'Failed to load timetable.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTimetable(); }, [section, semester]); // eslint-disable-line

  const updateSlot = (day, period, field, value) => {
    setSchedule(prev => prev.map(d => d.day !== day ? d : {
      ...d,
      slots: d.slots.map(s => s.period !== period ? s : { ...s, [field]: value })
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg({ text: '', type: '' });
    try {
      const res = await axios.put(`${API_URL}/admin/timetable`,
        { section, semester, schedule },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setMsg({ text: 'Timetable saved successfully!', type: 'success' });
      } else {
        setMsg({ text: res.data.message || 'Failed to save timetable.', type: 'error' });
      }
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Failed to save timetable.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const toggleExpand = (day, period) => {
    const key = `${day}-${period}`;
    setExpanded(e => ({ ...e, [key]: !e[key] }));
  };

  return (
    <div className="admin-timetable">
      <div className="att-header">
        <FaTable className="att-header__icon" />
        <h3 className="att-header__title">Manage Timetable</h3>
      </div>
      <p style={{ color: 'var(--secondary-color)', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
        This editor saves to the same timetable students see in the sidebar — pick the
        section and semester exactly as they appear there.
      </p>

      {/* Section / Semester selector */}
      <div className="att-controls">
        <label className="att-label">
          Section
          <select className="att-input" value={section} onChange={e => setSection(e.target.value)}>
            {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="att-label">
          Semester
          <select className="att-input" value={semester} onChange={e => setSemester(Number(e.target.value))}>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <button className="att-load-btn" onClick={fetchTimetable} disabled={loading}>
          {loading ? 'Loading…' : 'Reload'}
        </button>
      </div>

      {msg.text && (
        <div className={`att-msg att-msg--${msg.type}`}>{msg.text}</div>
      )}

      {/* Grid editor */}
      <div className="att-grid-wrap">
        <table className="att-grid">
          <thead>
            <tr>
              <th className="att-grid__th att-grid__th--period">Period / Time</th>
              {DAYS.map(d => <th key={d} className="att-grid__th">{d.slice(0,3)}</th>)}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map(p => (
              <tr key={p}>
                <td className="att-grid__period">
                  <div className="att-period-num">{p}</div>
                  <div className="att-period-time">{PERIOD_TIMES[p]}</div>
                </td>
                {DAYS.map(day => {
                  const slot    = schedule.find(d => d.day === day)?.slots.find(s => s.period === p) || {};
                  const key     = `${day}-${p}`;
                  const isOpen  = expanded[key];
                  const hasData = slot.subject || slot.faculty || slot.room;
                  return (
                    <td key={day} className="att-grid__cell">
                      <div
                        className={`att-slot-header${hasData ? ' att-slot-header--filled' : ''}`}
                        onClick={() => toggleExpand(day, p)}
                      >
                        <span className="att-slot-subject">{slot.subject || <em>—</em>}</span>
                        <FaChevronDown className={`att-slot-chevron${isOpen ? ' att-slot-chevron--open' : ''}`} />
                      </div>

                      {isOpen && (
                        <div className="att-slot-form">
                          <input
                            className="att-field"
                            placeholder="Subject code/name"
                            value={slot.subject || ''}
                            onChange={e => updateSlot(day, p, 'subject', e.target.value)}
                          />
                          <select
                            className="att-field"
                            value={slot.type || ''}
                            onChange={e => updateSlot(day, p, 'type', e.target.value)}
                          >
                            <option value="">Type…</option>
                            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <input
                            className="att-field"
                            placeholder="Faculty name"
                            value={slot.faculty || ''}
                            onChange={e => updateSlot(day, p, 'faculty', e.target.value)}
                          />
                          <input
                            className="att-field"
                            placeholder="Room / Lab"
                            value={slot.room || ''}
                            onChange={e => updateSlot(day, p, 'room', e.target.value)}
                          />
                          <button
                            className="att-clear-btn"
                            onClick={() => {
                              updateSlot(day, p, 'subject', '');
                              updateSlot(day, p, 'faculty', '');
                              updateSlot(day, p, 'room', '');
                              updateSlot(day, p, 'type', '');
                              setExpanded(e => ({ ...e, [key]: false }));
                            }}
                          >Clear</button>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="att-save-btn" onClick={handleSave} disabled={saving}>
        <FaSave /> {saving ? 'Saving…' : 'Save Timetable'}
      </button>
    </div>
  );
};

export default AdminTimetable;
