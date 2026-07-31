import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { FaClock, FaChalkboardTeacher, FaDoorOpen, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import './TimetableView.scss';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// FIX: Correct period times as specified
const PERIODS = [1, 2, 3, 4, 5, 6, 7];
const PERIOD_TIMES = {
  1: '9:00–10:00 AM',
  2: '10:00–11:00 AM',
  3: '11:00–12:00 PM',
  4: '12:00–1:00 PM',
  5: '2:30–3:30 PM',
  6: '3:30–4:30 PM',
  7: '4:30–5:30 PM',
};
const PERIOD_TIMES_SHORT = {
  1: '9–10 AM',
  2: '10–11 AM',
  3: '11–12 PM',
  4: '12–1 PM',
  5: '2:30–3:30',
  6: '3:30–4:30',
  7: '4:30–5:30',
};

// Section is now available directly on user profile

const TYPE_COLOR = {
  Lecture: '#0a84ff', Lab: '#30d158', Tutorial: '#ff9f0a', Free: '', '': '',
};

const TYPE_OPTIONS = ['Lecture', 'Lab', 'Tutorial', 'Free', ''];

function emptySchedule() {
  return DAYS.map(day => ({
    day,
    slots: PERIODS.map(p => ({ period: p, subject: '', faculty: '', room: '', type: '' }))
  }));
}

const TimetableView = () => {
  const { user, token, API_URL } = useContext(AuthContext);

  // FIX: Derive user's section directly from user profile
  const userSection = user?.section || 'ECE-1';

  const [availableSections, setAvailableSections] = useState([]);
  const [activeSection, setActiveSection] = useState(userSection);
  const [schedule, setSchedule]   = useState(null);
  const [semester, setSemester]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  // Admin edit state
  const [editing, setEditing]     = useState(false);
  const [editSchedule, setEditSchedule] = useState(null);
  const [saving, setSaving]       = useState(false);
  const [saveMsg, setSaveMsg]     = useState('');

  const isAdmin = user?.isAdmin;
  const todayName = DAYS[new Date().getDay() - 1] || null;

  const fetchTimetable = async (section, sem) => {
    setLoading(true);
    setError('');
    try {
      const ttRes = await axios.get(`${API_URL}/timetable`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { section, semester: sem },
      });
      if (ttRes.data.success) {
        setSchedule(ttRes.data.data.schedule);
      } else {
        setError('Could not load timetable.');
      }
    } catch {
      setError('Could not load timetable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !token) return;
    const fetchAll = async () => {
      try {
        const semRes = await axios.get(`${API_URL}/settings/current-semester`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const currentSemester = semRes.data?.data?.currentSemester || 3;
        setSemester(currentSemester);
        
        const secRes = await axios.get(`${API_URL}/settings/sections`);
        let sectionsList = [];
        if (secRes.data?.success && secRes.data?.data?.sections) {
          sectionsList = secRes.data.data.sections;
          setAvailableSections(sectionsList);
        }

        const fetchSec = activeSection || userSection || (sectionsList.length > 0 ? sectionsList[0] : 'ECE-1');
        if (!activeSection) setActiveSection(fetchSec);

        await fetchTimetable(fetchSec, currentSemester);
      } catch {
        setError('Could not load timetable.');
        setLoading(false);
      }
    };
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token, API_URL, activeSection]);

  // ── Admin edit helpers ───────────────────────────────────────────────────
  const startEdit = () => {
    setEditSchedule(JSON.parse(JSON.stringify(schedule || emptySchedule())));
    setEditing(true);
    setSaveMsg('');
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditSchedule(null);
    setSaveMsg('');
  };

  const updateSlot = (dayIndex, periodIndex, field, value) => {
    setEditSchedule(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[dayIndex].slots[periodIndex][field] = value;
      return next;
    });
  };

  const saveEdit = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await axios.put(
        `${API_URL}/admin/timetable`,
        { section: activeSection, semester, schedule: editSchedule },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setSchedule(editSchedule);
        setEditing(false);
        setEditSchedule(null);
        setSaveMsg('Saved!');
        setTimeout(() => setSaveMsg(''), 3000);
      } else {
        setSaveMsg('Save failed.');
      }
    } catch {
      setSaveMsg('Save failed.');
    } finally {
      setSaving(false);
    }
  };

  // ── Render states ────────────────────────────────────────────────────────
  if (loading) return <div className="tt-loading">Loading timetable…</div>;
  if (error)   return <div className="tt-error">{error}</div>;

  const isEmpty = !schedule || schedule.every(d => d.slots.every(s => !s.subject));
  const todaySchedule = schedule?.find(d => d.day === todayName);
  const displaySchedule = editing ? editSchedule : schedule;

  return (
    <div className="timetable-view">

      {/* Header */}
      <div className="tt-header">
        <div className="tt-header__left">
          <h2 className="tt-header__title"><FaClock /> Timetable</h2>
          <span className="tt-header__meta">Sem {semester}</span>
        </div>
        <div className="tt-header__right">
          {/* FIX: Section tabs — admin sees all, student locked to their section */}
          <div className="tt-section-tabs">
            {(isAdmin && availableSections.length > 0 ? availableSections : [userSection]).map(sec => (
              <button
                key={sec}
                className={`tt-section-tab${activeSection === sec ? ' tt-section-tab--active' : ''}`}
                onClick={() => { if (!editing) setActiveSection(sec); }}
                disabled={editing}
              >
                {sec}
              </button>
            ))}
          </div>
          {isAdmin && !editing && (
            <button className="tt-edit-btn" onClick={startEdit}>
              <FaEdit /> Edit
            </button>
          )}
          {isAdmin && editing && (
            <div className="tt-edit-actions">
              <button className="tt-save-btn" onClick={saveEdit} disabled={saving}>
                <FaSave /> {saving ? 'Saving…' : 'Save'}
              </button>
              <button className="tt-cancel-btn" onClick={cancelEdit}>
                <FaTimes /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>
      {saveMsg && <div className={`tt-save-msg${saveMsg === 'Saved!' ? ' tt-save-msg--ok' : ' tt-save-msg--err'}`}>{saveMsg}</div>}

      {/* Empty state (non-edit) */}
      {isEmpty && !editing && (
        <div className="tt-empty">
          <FaClock className="tt-empty__icon" />
          <p>No timetable uploaded yet for {activeSection}.</p>
          {isAdmin && <span>Click Edit to add one.</span>}
          {!isAdmin && <span>Ask your admin to upload the schedule.</span>}
        </div>
      )}

      {/* Today strip (view mode only) */}
      {!editing && !isEmpty && todaySchedule && (
        <div className="tt-today">
          <div className="tt-today__label">Today — {todayName}</div>
          <div className="tt-today__slots">
            {todaySchedule.slots
              .filter(s => s.subject)
              .map(s => (
                <div key={s.period} className="tt-today__slot"
                  style={{ borderLeftColor: TYPE_COLOR[s.type] || 'var(--primary-color)' }}>
                  <div className="tt-today__time">{PERIOD_TIMES[s.period]}</div>
                  <div className="tt-today__subject">{s.subject}</div>
                  <div className="tt-today__detail">
                    {s.type && <span className="tt-type-pill" style={{
                      background: TYPE_COLOR[s.type] ? `${TYPE_COLOR[s.type]}22` : 'transparent',
                      color: TYPE_COLOR[s.type] || 'var(--secondary-color)'
                    }}>{s.type}</span>}
                    {s.faculty && <span><FaChalkboardTeacher /> {s.faculty}</span>}
                    {s.room    && <span><FaDoorOpen /> {s.room}</span>}
                  </div>
                </div>
              ))}
            {todaySchedule.slots.every(s => !s.subject) && (
              <div className="tt-today__free">No classes today 🎉</div>
            )}
          </div>
        </div>
      )}

      {/* Full week grid — view mode */}
      {!editing && !isEmpty && (
        <div className="tt-grid-wrap">
          <table className="tt-grid">
            <thead>
              <tr>
                <th className="tt-grid__period-head">Period</th>
                {DAYS.map(d => (
                  <th key={d} className={`tt-grid__day-head${d === todayName ? ' tt-grid__day-head--today' : ''}`}>
                    {d.slice(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map(p => (
                <tr key={p}>
                  <td className="tt-grid__period-cell">
                    <div className="tt-period-num">{p}</div>
                    <div className="tt-period-time">{PERIOD_TIMES_SHORT[p]}</div>
                  </td>
                  {DAYS.map(day => {
                    const dayData = displaySchedule?.find(d => d.day === day);
                    const slot = dayData?.slots.find(s => s.period === p);
                    const isToday = day === todayName;
                    return (
                      <td key={day} className={`tt-grid__cell${isToday ? ' tt-grid__cell--today' : ''}`}>
                        {slot?.subject ? (
                          <div className="tt-slot"
                            style={{ borderTopColor: TYPE_COLOR[slot.type] || 'var(--primary-color)' }}>
                            <div className="tt-slot__subject">{slot.subject}</div>
                            {slot.type && (
                              <span className="tt-slot__type"
                                style={{ color: TYPE_COLOR[slot.type] || 'var(--secondary-color)' }}>
                                {slot.type}
                              </span>
                            )}
                            {slot.faculty && <div className="tt-slot__detail"><FaChalkboardTeacher /> {slot.faculty}</div>}
                            {slot.room    && <div className="tt-slot__detail"><FaDoorOpen /> {slot.room}</div>}
                          </div>
                        ) : (
                          <div className="tt-slot tt-slot--free" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Admin edit grid ────────────────────────────────────────────────── */}
      {editing && editSchedule && (
        <div className="tt-edit-grid-wrap">
          <p className="tt-edit-hint">Editing <strong>{activeSection}</strong> — Sem {semester}. Fill in subject, faculty, room and type for each slot.</p>
          <div className="tt-edit-grid">
            {editSchedule.map((dayObj, di) => (
              <div key={dayObj.day} className="tt-edit-day">
                <div className="tt-edit-day__label">{dayObj.day}</div>
                {dayObj.slots.map((slot, si) => (
                  <div key={slot.period} className="tt-edit-slot">
                    <div className="tt-edit-slot__time">{PERIOD_TIMES_SHORT[slot.period]}</div>
                    <input
                      className="tt-edit-input"
                      placeholder="Subject"
                      value={slot.subject}
                      onChange={e => updateSlot(di, si, 'subject', e.target.value)}
                    />
                    <input
                      className="tt-edit-input"
                      placeholder="Faculty"
                      value={slot.faculty}
                      onChange={e => updateSlot(di, si, 'faculty', e.target.value)}
                    />
                    <input
                      className="tt-edit-input"
                      placeholder="Room"
                      value={slot.room}
                      onChange={e => updateSlot(di, si, 'room', e.target.value)}
                    />
                    <select
                      className="tt-edit-select"
                      value={slot.type}
                      onChange={e => updateSlot(di, si, 'type', e.target.value)}
                    >
                      {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t || '—'}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableView;
