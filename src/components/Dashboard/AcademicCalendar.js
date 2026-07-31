import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import {
  FaChevronLeft, FaChevronRight, FaCalendarAlt,
  FaGraduationCap, FaUmbrellaBeach, FaFlask, FaClipboardList, FaInfoCircle, FaUser, FaPlus
} from 'react-icons/fa';
import './AcademicCalendar.scss';

// ── Seed data from images ──────────────────────────────────────────────────
export const SEED_HOLIDAYS = [
  { name: 'Republic Day', date: '2026-01-26', day: 'Monday' },
  { name: 'Holi', date: '2026-03-04', day: 'Wednesday' },
  { name: 'Eid-Ul-Fitar', date: '2026-03-21', day: 'Saturday' },
  { name: 'Mahavir Jayanti', date: '2026-03-31', day: 'Tuesday' },
  { name: 'Good Friday', date: '2026-04-03', day: 'Friday' },
  { name: 'Buddha Purnima', date: '2026-05-01', day: 'Friday' },
  { name: 'Eid-Ul-Juha (Bakreed)', date: '2026-05-27', day: 'Wednesday' },
  { name: 'Muharram', date: '2026-06-26', day: 'Friday' },
  { name: 'Independence Day', date: '2026-08-15', day: 'Saturday' },
  { name: 'Milad-Un-Navi / Eid-E-Milad', date: '2026-08-26', day: 'Wednesday' },
  { name: 'Janmasthmi', date: '2026-09-04', day: 'Friday' },
  { name: 'Ganesh Chaturthi / Vinayaka Chaturthi', date: '2026-09-14', day: 'Monday' },
  { name: 'Mahatma Gandhi Jayanti', date: '2026-10-02', day: 'Friday' },
  { name: 'Dashahra (Vijaydashmi)', date: '2026-10-20', day: 'Tuesday' },
  { name: 'Diwali (Deepavali)', date: '2026-11-08', day: 'Sunday' },
  { name: 'Guru Nanak Jayanti', date: '2026-11-24', day: 'Tuesday' },
  { name: 'Christmas', date: '2026-12-25', day: 'Friday' },
  { name: 'Holi', date: '2027-03-22', day: 'Sunday' },
];

export const SEED_EVENTS = [
  // Odd Semester 2026
  { title: 'Commencement of UG, PG and Ph.D. classes', startDate: '2026-07-13', endDate: '2026-07-13', type: 'academic' },
  { title: 'Desk Registration for Ph.D. students (2nd Semester onwards)', startDate: '2026-07-23', endDate: '2026-07-24', type: 'academic' },
  { title: 'Due Date of completion of Academic Audit', startDate: '2026-07-31', endDate: '2026-07-31', type: 'academic' },
  { title: 'Display of Attendance', startDate: '2026-08-14', endDate: '2026-08-14', type: 'academic' },
  { title: 'Senate Meeting', startDate: '2026-08-01', endDate: '2026-08-31', type: 'academic' },
  { title: 'Mini Test', startDate: '2026-08-17', endDate: '2026-08-21', type: 'exam' },
  { title: 'Inter College Hindi Festival (Tooryanaad – 2026)', startDate: '2026-09-12', endDate: '2026-09-14', type: 'event' },
  { title: 'Display of Attendance', startDate: '2026-09-18', endDate: '2026-09-18', type: 'academic' },
  { title: 'Mid Term Examination / Mid-term PG Thesis Evaluation', startDate: '2026-09-21', endDate: '2026-09-26', type: 'exam' },
  { title: 'Ph.D. Seminar I or II', startDate: '2026-09-01', endDate: '2026-09-30', type: 'academic' },
  { title: 'M.Tech/M.Plan. Seminar / Dissertation Evaluation (III/IV Semester)', startDate: '2026-09-28', endDate: '2026-10-01', type: 'exam' },
  { title: 'Last date of showing answer booklets & display of Mid Term Exam Marks', startDate: '2026-10-08', endDate: '2026-10-08', type: 'academic' },
  { title: 'Online filling of End Term Examination forms (Regular & Supplementary)', startDate: '2026-10-05', endDate: '2026-10-09', type: 'academic' },
  { title: 'Online filling of End Term Examination forms with late fee', startDate: '2026-10-12', endDate: '2026-10-14', type: 'academic' },
  { title: 'Inter Departmental Sports Event', startDate: '2026-10-16', endDate: '2026-10-18', type: 'event' },
  { title: 'Mid Semester Break (Dussehra)', startDate: '2026-10-19', endDate: '2026-10-23', type: 'holiday' },
  { title: 'Student Feedback Form filling (UG, PG & Ph.D.)', startDate: '2026-10-28', endDate: '2026-10-30', type: 'academic' },
  { title: 'Sporto Mania', startDate: '2026-10-31', endDate: '2026-11-01', type: 'event' },
  { title: 'Senate Meeting', startDate: '2026-11-01', endDate: '2026-11-30', type: 'academic' },
  { title: 'End Term Theory Examination (Regular + Supplementary + Improvement + Evaluation) – ODD Semester', startDate: '2026-11-09', endDate: '2026-11-18', type: 'exam' },
  { title: 'Display of Attendance & Final Detention list', startDate: '2026-11-09', endDate: '2026-11-09', type: 'academic' },
  { title: 'End Term Practical and Project Examinations – ODD Semester', startDate: '2026-11-19', endDate: '2026-11-25', type: 'exam' },
  { title: "Student's choice filling of Elective subjects / Open Elective for forthcoming semester", startDate: '2026-11-16', endDate: '2026-11-25', type: 'academic' },
  { title: 'Ph.D. Seminar', startDate: '2026-11-01', endDate: '2026-11-30', type: 'academic' },
  { title: '23rd Convocation (Tentative)', startDate: '2026-11-01', endDate: '2026-11-30', type: 'event' },
  { title: 'Last date of showing answer booklets & display of End Term Examinations', startDate: '2026-12-03', endDate: '2026-12-03', type: 'academic' },
  { title: 'Last date of on-line submission of marks with grades for End Term Exam', startDate: '2026-12-10', endDate: '2026-12-10', type: 'academic' },
  { title: 'Supplementary Examinations Theory for Even Semester', startDate: '2026-11-30', endDate: '2026-12-04', type: 'exam' },
  { title: 'Last date of showing answer booklets & display of Supplementary Examinations', startDate: '2026-12-09', endDate: '2026-12-09', type: 'academic' },
  { title: 'Last date of declaration of all Results (including supplementary)', startDate: '2026-12-17', endDate: '2026-12-17', type: 'academic' },
  { title: 'Research Scholar Day', startDate: '2026-12-01', endDate: '2026-12-31', type: 'event' },
  { title: 'Vacations for U.G. students / Industrial Visits', startDate: '2026-12-01', endDate: '2026-12-31', type: 'holiday' },
  { title: 'Vacations for Faculty', startDate: '2026-12-16', endDate: '2026-12-31', type: 'holiday' },

  // Even Semester 2027
  { title: 'Commencement of UG, PG and Ph.D. classes', startDate: '2027-01-04', endDate: '2027-01-04', type: 'academic' },
  { title: 'Desk Registration for Ph.D. students (2nd Semester onwards)', startDate: '2027-01-21', endDate: '2027-01-22', type: 'academic' },
  { title: 'Display of Attendance', startDate: '2027-02-05', endDate: '2027-02-05', type: 'academic' },
  { title: 'Senate Meeting', startDate: '2027-02-01', endDate: '2027-02-28', type: 'academic' },
  { title: 'Mini Test', startDate: '2027-02-08', endDate: '2027-02-12', type: 'exam' },
  { title: 'E-summit 2027', startDate: '2027-02-12', endDate: '2027-02-14', type: 'event' },
  { title: 'Display of Attendance', startDate: '2027-03-12', endDate: '2027-03-12', type: 'academic' },
  { title: 'Mid Term Examination / Mid-term PG Thesis Evaluation', startDate: '2027-03-15', endDate: '2027-03-20', type: 'exam' },
  { title: 'Ph.D. Seminar I or II', startDate: '2027-03-01', endDate: '2027-03-31', type: 'academic' },
  { title: 'M.Tech/M.Plan. Seminar / Dissertation Evaluation', startDate: '2027-03-16', endDate: '2027-03-19', type: 'exam' },
  { title: 'Last date of showing answer booklets & display of Mid Term Exam Marks', startDate: '2027-03-30', endDate: '2027-03-30', type: 'academic' },
  { title: 'Online filling of End Term Examination forms (Regular & Supplementary)', startDate: '2027-03-26', endDate: '2027-03-31', type: 'academic' },
  { title: 'Online filling of End Term Examination forms with late fee', startDate: '2027-04-01', endDate: '2027-04-03', type: 'academic' },
  { title: 'Mid Semester Break (Holi is on 22nd March 2027)', startDate: '2027-03-22', endDate: '2027-03-26', type: 'holiday' },
  { title: 'Student Feedback Form filling (UG, PG & Ph.D.)', startDate: '2027-04-12', endDate: '2027-04-16', type: 'academic' },
  { title: 'End Term Theory Examination (Regular + Supplementary + Improvement + Evaluation) – EVEN Semester', startDate: '2027-04-19', endDate: '2027-04-29', type: 'exam' },
  { title: 'Display of Attendance & Final Detention list', startDate: '2027-04-16', endDate: '2027-04-16', type: 'academic' },
  { title: "Student's choice filling of Elective subjects", startDate: '2027-04-26', endDate: '2027-05-05', type: 'academic' },
  { title: 'End Term Practical and Project Examinations – EVEN Semester', startDate: '2027-04-30', endDate: '2027-05-07', type: 'exam' },
  { title: 'Senate Meeting', startDate: '2027-05-01', endDate: '2027-05-31', type: 'academic' },
  { title: 'Last date of showing answer booklets & display of End Term Examinations', startDate: '2027-05-10', endDate: '2027-05-10', type: 'academic' },
  { title: 'Supplementary Examinations Theory for Odd Semester', startDate: '2027-05-10', endDate: '2027-05-14', type: 'exam' },
  { title: 'Ph.D. Seminar', startDate: '2027-05-01', endDate: '2027-05-31', type: 'academic' },
  { title: 'Last date of on-line submission of marks for End Term Exam', startDate: '2027-05-17', endDate: '2027-05-17', type: 'academic' },
  { title: 'Last date of showing answer booklets & display of Supplementary Examinations', startDate: '2027-05-18', endDate: '2027-05-18', type: 'academic' },
  { title: 'Last date of declaration of all Results (including supplementary)', startDate: '2027-05-20', endDate: '2027-05-20', type: 'academic' },
  { title: 'Submission of PG Thesis (Spiral Bound)', startDate: '2027-05-01', endDate: '2027-06-30', type: 'academic' },
  { title: 'Last date of P.G. Thesis Final Presentation / Viva Voce Examination', startDate: '2027-07-20', endDate: '2027-07-20', type: 'exam' },
  { title: 'Vacations for U.G. students / Industrial Visits', startDate: '2027-05-10', endDate: '2027-06-30', type: 'holiday' },
  { title: 'Vacations for Faculty', startDate: '2027-05-21', endDate: '2027-06-30', type: 'holiday' },
];

// ── Helpers ─────────────────────────────────────────────────────────────────
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// Use component references, NOT JSX elements, at module level
// JSX at module scope fails in CRA production builds (React not in scope)
const TYPE_META = {
  holiday:  { label: 'Closed Holiday',  color: '#ff453a', Icon: FaUmbrellaBeach },
  exam:     { label: 'Examination',     color: '#ff9f0a', Icon: FaFlask },
  academic: { label: 'Academic Event',  color: '#0a84ff', Icon: FaClipboardList },
  event:    { label: 'Cultural/Sports', color: '#30d158', Icon: FaGraduationCap },
  personal: { label: 'My Event',        color: '#bf5af2', Icon: FaUser },
};

function parseDate(str) { return new Date(str + 'T00:00:00'); }

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function inRange(date, start, end) {
  return date >= start && date <= end;
}

// ── Main component ───────────────────────────────────────────────────────────
const AcademicCalendar = () => {
  const { user, API_URL, token } = useContext(AuthContext);
  const isAdmin = user?.isAdmin;

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  const [holidays, setHolidays] = useState(SEED_HOLIDAYS);
  const [events, setEvents] = useState(SEED_EVENTS);
  const [personalEvents, setPersonalEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingMsg, setSavingMsg] = useState('');

  // Admin edit modals
  const [showEventModal, setShowEventModal] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [editingPersonal, setEditingPersonal] = useState(null);
  const [eventForm, setEventForm] = useState({ title: '', startDate: '', endDate: '', type: 'academic' });
  const [holidayForm, setHolidayForm] = useState({ name: '', date: '' });
  const [personalForm, setPersonalForm] = useState({ title: '', startDate: '', endDate: '', note: '' });

  // Load from backend (calendar events stored as AppSetting-like or dedicated model)
  const fetchCalendarData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Load admin calendar
      const res = await axios.get(`${API_URL}/settings/calendar`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success && res.data.data) {
        if (res.data.data.events?.length) setEvents(res.data.data.events);
        if (res.data.data.holidays?.length) setHolidays(res.data.data.holidays);
      }
      // Load personal events
      const pRes = await axios.get(`${API_URL}/settings/calendar/personal`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (pRes.data.success && Array.isArray(pRes.data.data)) {
        setPersonalEvents(pRes.data.data);
      }
    } catch (_) {
      // Falls back to seed data silently
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  useEffect(() => { fetchCalendarData(); }, [fetchCalendarData]);

  // ── Navigation ─────────────────────────────────────────────────
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  };
  const goToday = () => { setViewMonth(today.getMonth()); setViewYear(today.getFullYear()); setSelectedDay(null); };

  // ── Calendar grid ────────────────────────────────────────────
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  function getDayData(dayNum) {
    const date = new Date(viewYear, viewMonth, dayNum);
    const dayHolidays = holidays.filter(h => isSameDay(parseDate(h.date), date));
    const dayEvents = events.filter(e =>
      inRange(date, parseDate(e.startDate), parseDate(e.endDate))
    );
    const dayPersonal = personalEvents.filter(e =>
      inRange(date, parseDate(e.startDate), parseDate(e.endDate || e.startDate))
    );
    return { date, holidays: dayHolidays, events: dayEvents, personal: dayPersonal };
  }

  function getDayPillTypes(dayNum) {
    const { holidays: dh, events: de, personal: dp } = getDayData(dayNum);
    const types = new Set();
    dh.forEach(() => types.add('holiday'));
    de.forEach(e => types.add(e.type));
    dp.forEach(() => types.add('personal'));
    return [...types];
  }

  const selectedData = selectedDay ? getDayData(selectedDay) : null;

  // ── Save to backend ──────────────────────────────────────────
  const saveToBackend = async (newEvents, newHolidays) => {
    setSavingMsg('Saving…');
    try {
      await axios.put(`${API_URL}/admin/settings/calendar`,
        { events: newEvents, holidays: newHolidays },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSavingMsg('Saved ✓');
    } catch {
      setSavingMsg('Save failed');
    }
    setTimeout(() => setSavingMsg(''), 2500);
  };

  const savePersonalToBackend = async (updated) => {
    try {
      await axios.put(`${API_URL}/settings/calendar/personal`,
        { events: updated },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch { /* silent */ }
  };

  // ── Personal Event CRUD ──────────────────────────────────────
  const openAddPersonal = (prefillDate) => {
    setEditingPersonal(null);
    const d = prefillDate || '';
    setPersonalForm({ title: '', startDate: d, endDate: d, note: '' });
    setShowPersonalModal(true);
  };
  const openEditPersonal = (ev, idx) => {
    setEditingPersonal(idx);
    setPersonalForm({ title: ev.title, startDate: ev.startDate, endDate: ev.endDate || ev.startDate, note: ev.note || '' });
    setShowPersonalModal(true);
  };
  const submitPersonal = async () => {
    if (!personalForm.title || !personalForm.startDate) return;
    const entry = { ...personalForm, type: 'personal', endDate: personalForm.endDate || personalForm.startDate };
    const updated = editingPersonal !== null
      ? personalEvents.map((e, i) => i === editingPersonal ? entry : e)
      : [...personalEvents, entry];
    setPersonalEvents(updated);
    setShowPersonalModal(false);
    await savePersonalToBackend(updated);
  };
  const deletePersonal = async (idx) => {
    const updated = personalEvents.filter((_, i) => i !== idx);
    setPersonalEvents(updated);
    setShowPersonalModal(false);
    await savePersonalToBackend(updated);
  };

  // ── Event CRUD ───────────────────────────────────────────────
  const openAddEvent = () => {
    setEditingEvent(null);
    setEventForm({ title: '', startDate: '', endDate: '', type: 'academic' });
    setShowEventModal(true);
  };
  const openEditEvent = (ev, idx) => {
    setEditingEvent(idx);
    setEventForm({ ...ev });
    setShowEventModal(true);
  };
  const submitEvent = async () => {
    if (!eventForm.title || !eventForm.startDate) return;
    const updated = editingEvent !== null
      ? events.map((e, i) => i === editingEvent ? eventForm : e)
      : [...events, { ...eventForm, endDate: eventForm.endDate || eventForm.startDate }];
    setEvents(updated);
    setShowEventModal(false);
    await saveToBackend(updated, holidays);
  };
  const deleteEvent = async (idx) => {
    const updated = events.filter((_, i) => i !== idx);
    setEvents(updated);
    setShowEventModal(false);
    await saveToBackend(updated, holidays);
  };

  // ── Holiday CRUD ─────────────────────────────────────────────
  const openAddHoliday = () => {
    setEditingHoliday(null);
    setHolidayForm({ name: '', date: '' });
    setShowHolidayModal(true);
  };
  const openEditHoliday = (h, idx) => {
    setEditingHoliday(idx);
    setHolidayForm({ name: h.name, date: h.date });
    setShowHolidayModal(true);
  };
  const submitHoliday = async () => {
    if (!holidayForm.name || !holidayForm.date) return;
    const day = new Date(holidayForm.date + 'T00:00:00')
      .toLocaleDateString('en-US', { weekday: 'long' });
    const entry = { ...holidayForm, day };
    const updated = editingHoliday !== null
      ? holidays.map((h, i) => i === editingHoliday ? entry : h)
      : [...holidays, entry];
    setHolidays(updated);
    setShowHolidayModal(false);
    await saveToBackend(events, updated);
  };
  const deleteHoliday = async (idx) => {
    const updated = holidays.filter((_, i) => i !== idx);
    setHolidays(updated);
    setShowHolidayModal(false);
    await saveToBackend(events, updated);
  };

  // ── Upcoming events list ─────────────────────────────────────
  const upcoming = [
    ...events,
    ...holidays.map(h => ({ title: h.name, startDate: h.date, endDate: h.date, type: 'holiday' })),
    ...personalEvents.map(e => ({ ...e, type: 'personal' }))
  ]
    .filter(e => parseDate(e.endDate || e.startDate) >= today)
    .sort((a, b) => parseDate(a.startDate) - parseDate(b.startDate))
    .slice(0, 6);

  return (
    <div className="academic-calendar">
      {/* Header */}
      <div className="cal-header">
        <div className="cal-header__title">
          <FaCalendarAlt /> Academic Calendar
          {isAdmin && <span className="cal-header__admin-badge">Admin</span>}
        </div>
        <div className="cal-header__legend">
          {Object.entries(TYPE_META).map(([k, v]) => (
            <span key={k} className="legend-item">
              <span className="legend-dot" style={{ background: v.color }} />
              {v.label}
            </span>
          ))}
        </div>
      </div>

      <div className="cal-body">
        {/* Left: Month view */}
        <div className="cal-main">
          {/* Month nav */}
          <div className="cal-nav">
            <button className="cal-nav__btn" onClick={prevMonth}><FaChevronLeft /></button>
            <div className="cal-nav__label">
              <span className="cal-nav__month">{MONTHS[viewMonth]}</span>
              <span className="cal-nav__year">{viewYear}</span>
            </div>
            <button className="cal-nav__btn" onClick={nextMonth}><FaChevronRight /></button>
            <button className="cal-nav__today" onClick={goToday}>Today</button>
          </div>

          {loading && <div className="cal-loading">Loading calendar…</div>}

          {/* Day headers */}
          <div className="cal-grid">
            {DAYS.map(d => (
              <div key={d} className="cal-grid__day-name">{d}</div>
            ))}

            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="cal-grid__cell cal-grid__cell--empty" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const pillTypes = getDayPillTypes(dayNum);
              const date = new Date(viewYear, viewMonth, dayNum);
              const isToday = isSameDay(date, today);
              const isSunday = date.getDay() === 0;
              const isSelected = selectedDay === dayNum;
              const hasHoliday = pillTypes.includes('holiday');

              return (
                <div
                  key={dayNum}
                  className={[
                    'cal-grid__cell',
                    isToday ? 'cal-grid__cell--today' : '',
                    isSunday ? 'cal-grid__cell--sunday' : '',
                    isSelected ? 'cal-grid__cell--selected' : '',
                    hasHoliday ? 'cal-grid__cell--holiday' : '',
                    pillTypes.length ? 'cal-grid__cell--has-events' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => setSelectedDay(isSelected ? null : dayNum)}
                >
                  <span className="cal-grid__date">{dayNum}</span>
                  <div className="cal-grid__pills">
                    {pillTypes.slice(0, 3).map(t => (
                      <span
                        key={t}
                        className="cal-grid__pill"
                        style={{ background: TYPE_META[t]?.color }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected day detail */}
          {selectedDay && selectedData && (
            <div className="cal-detail">
              <div className="cal-detail__heading">
                {selectedDay} {MONTHS[viewMonth]} {viewYear}
                {new Date(viewYear, viewMonth, selectedDay).getDay() === 0 && (
                  <span className="cal-detail__sunday-label"> — Sunday</span>
                )}
              </div>
              {selectedData.holidays.length === 0 && selectedData.events.length === 0 && selectedData.personal.length === 0 && (
                <p className="cal-detail__empty"><FaInfoCircle /> No events on this day.</p>
              )}
              {selectedData.holidays.map((h, i) => (
                <div key={i} className="cal-detail__item" style={{ borderLeftColor: TYPE_META.holiday.color }}>
                  <span className="cal-detail__type-icon" style={{ color: TYPE_META.holiday.color }}>
                    {React.createElement(TYPE_META.holiday.Icon)}
                  </span>
                  <div>
                    <div className="cal-detail__item-title">{h.name}</div>
                    <div className="cal-detail__item-sub">Closed Holiday · {h.day}</div>
                  </div>
                  {isAdmin && (
                    <button className="cal-detail__edit-btn" onClick={() => openEditHoliday(h, holidays.indexOf(h))}>
                      Edit
                    </button>
                  )}
                </div>
              ))}
              {selectedData.events.map((ev, i) => {
                const meta = TYPE_META[ev.type] || TYPE_META.academic;
                const globalIdx = events.indexOf(ev);
                return (
                  <div key={i} className="cal-detail__item" style={{ borderLeftColor: meta.color }}>
                    <span className="cal-detail__type-icon" style={{ color: meta.color }}>{React.createElement(meta.Icon)}</span>
                    <div>
                      <div className="cal-detail__item-title">{ev.title}</div>
                      <div className="cal-detail__item-sub">
                        {meta.label} · {ev.startDate === ev.endDate
                          ? ev.startDate
                          : `${ev.startDate} → ${ev.endDate}`}
                      </div>
                    </div>
                    {isAdmin && (
                      <button className="cal-detail__edit-btn" onClick={() => openEditEvent(ev, globalIdx)}>
                        Edit
                      </button>
                    )}
                  </div>
                );
              })}
              {/* Personal events — only visible to the user themselves */}
              {selectedData.personal.map((ev, i) => {
                const globalIdx = personalEvents.indexOf(ev);
                return (
                  <div key={`p-${i}`} className="cal-detail__item cal-detail__item--personal" style={{ borderLeftColor: TYPE_META.personal.color }}>
                    <span className="cal-detail__type-icon" style={{ color: TYPE_META.personal.color }}>{React.createElement(TYPE_META.personal.Icon)}</span>
                    <div>
                      <div className="cal-detail__item-title">{ev.title}</div>
                      <div className="cal-detail__item-sub">
                        My Event · {ev.startDate === (ev.endDate || ev.startDate)
                          ? ev.startDate : `${ev.startDate} → ${ev.endDate}`}
                        {ev.note && <span className="cal-detail__note"> — {ev.note}</span>}
                      </div>
                    </div>
                    <button className="cal-detail__edit-btn cal-detail__edit-btn--personal" onClick={() => openEditPersonal(ev, globalIdx)}>
                      Edit
                    </button>
                  </div>
                );
              })}
              {/* Add personal event shortcut on selected day */}
              <button
                className="cal-detail__add-personal"
                onClick={() => {
                  const d = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`;
                  openAddPersonal(d);
                }}
              >
                <FaPlus /> Add my event on this day
              </button>
            </div>
          )}
        </div>

        {/* Right: sidebar */}
        <div className="cal-sidebar">
          {/* Upcoming */}
          <div className="cal-upcoming">
            <div className="cal-upcoming__heading">Upcoming Events</div>
            {upcoming.length === 0 && <p className="cal-upcoming__empty">No upcoming events.</p>}
            {upcoming.map((ev, i) => {
              const meta = TYPE_META[ev.type] || TYPE_META.academic;
              return (
                <div key={i} className="cal-upcoming__item" style={{ borderLeftColor: meta.color }}>
                  <div className="cal-upcoming__dot" style={{ background: meta.color }} />
                  <div>
                    <div className="cal-upcoming__title">{ev.title}</div>
                    <div className="cal-upcoming__date">{ev.startDate}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* My Events sidebar panel */}
          <div className="cal-my-events">
            <div className="cal-my-events__heading"><FaUser /> My Events</div>
            {personalEvents.length === 0 && (
              <p className="cal-upcoming__empty">No personal events yet.</p>
            )}
            {personalEvents
              .sort((a,b) => parseDate(a.startDate) - parseDate(b.startDate))
              .map((ev, i) => (
              <div key={i} className="cal-upcoming__item" style={{ borderLeftColor: TYPE_META.personal.color }}>
                <div className="cal-upcoming__dot" style={{ background: TYPE_META.personal.color }} />
                <div style={{ flex: 1 }}>
                  <div className="cal-upcoming__title">{ev.title}</div>
                  <div className="cal-upcoming__date">{ev.startDate}{ev.note ? ` · ${ev.note}` : ''}</div>
                </div>
                <button className="cal-detail__edit-btn cal-detail__edit-btn--personal" onClick={() => openEditPersonal(ev, i)}>✏️</button>
              </div>
            ))}
            <button className="cal-admin-btn cal-admin-btn--personal" onClick={() => openAddPersonal('')}>
              + Add My Event
            </button>
          </div>

          {/* Admin controls */}
          {isAdmin && (
            <div className="cal-admin-controls">
              <div className="cal-admin-controls__heading">Manage Calendar</div>
              {savingMsg && <div className="cal-admin-controls__msg">{savingMsg}</div>}
              <button className="cal-admin-btn cal-admin-btn--event" onClick={openAddEvent}>
                + Add Academic Event
              </button>
              <button className="cal-admin-btn cal-admin-btn--holiday" onClick={openAddHoliday}>
                + Add Holiday
              </button>

              {/* Holiday list */}
              <div className="cal-admin-list">
                <div className="cal-admin-list__label">Holidays ({holidays.length})</div>
                {holidays.map((h, i) => (
                  <div key={i} className="cal-admin-list__item">
                    <span>{h.name}</span>
                    <span className="cal-admin-list__date">{h.date}</span>
                    <button className="cal-admin-list__edit" onClick={() => openEditHoliday(h, i)}>✏️</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Event Modal ─────────────────────────────────────── */}
      {showEventModal && (
        <div className="cal-modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="cal-modal" onClick={e => e.stopPropagation()}>
            <div className="cal-modal__title">{editingEvent !== null ? 'Edit Event' : 'Add Academic Event'}</div>
            <label className="cal-modal__label">Title</label>
            <input className="cal-modal__input" value={eventForm.title}
              onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))} placeholder="Event title" />
            <label className="cal-modal__label">Type</label>
            <select className="cal-modal__input" value={eventForm.type}
              onChange={e => setEventForm(f => ({ ...f, type: e.target.value }))}>
              <option value="academic">Academic Event</option>
              <option value="exam">Examination</option>
              <option value="event">Cultural / Sports</option>
              <option value="holiday">Holiday / Break</option>
            </select>
            <label className="cal-modal__label">Start Date</label>
            <input className="cal-modal__input" type="date" value={eventForm.startDate}
              onChange={e => setEventForm(f => ({ ...f, startDate: e.target.value }))} />
            <label className="cal-modal__label">End Date (leave blank for single day)</label>
            <input className="cal-modal__input" type="date" value={eventForm.endDate}
              onChange={e => setEventForm(f => ({ ...f, endDate: e.target.value }))} />
            <div className="cal-modal__actions">
              {editingEvent !== null && (
                <button className="cal-modal__delete" onClick={() => deleteEvent(editingEvent)}>Delete</button>
              )}
              <button className="cal-modal__cancel" onClick={() => setShowEventModal(false)}>Cancel</button>
              <button className="cal-modal__save" onClick={submitEvent}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Holiday Modal ────────────────────────────────────── */}
      {showHolidayModal && (
        <div className="cal-modal-overlay" onClick={() => setShowHolidayModal(false)}>
          <div className="cal-modal" onClick={e => e.stopPropagation()}>
            <div className="cal-modal__title">{editingHoliday !== null ? 'Edit Holiday' : 'Add Holiday'}</div>
            <label className="cal-modal__label">Holiday Name</label>
            <input className="cal-modal__input" value={holidayForm.name}
              onChange={e => setHolidayForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Diwali" />
            <label className="cal-modal__label">Date</label>
            <input className="cal-modal__input" type="date" value={holidayForm.date}
              onChange={e => setHolidayForm(f => ({ ...f, date: e.target.value }))} />
            <div className="cal-modal__actions">
              {editingHoliday !== null && (
                <button className="cal-modal__delete" onClick={() => deleteHoliday(editingHoliday)}>Delete</button>
              )}
              <button className="cal-modal__cancel" onClick={() => setShowHolidayModal(false)}>Cancel</button>
              <button className="cal-modal__save" onClick={submitHoliday}>Save</button>
            </div>
          </div>
        </div>
      )}
      {/* ── Personal Event Modal ─────────────────────────────── */}
      {showPersonalModal && (
        <div className="cal-modal-overlay" onClick={() => setShowPersonalModal(false)}>
          <div className="cal-modal" onClick={e => e.stopPropagation()}>
            <div className="cal-modal__title" style={{ color: TYPE_META.personal.color }}>
              <FaUser style={{ marginRight: 6 }} />
              {editingPersonal !== null ? 'Edit My Event' : 'Add My Event'}
            </div>
            <p className="cal-modal__hint">Only you can see this. Admin events cannot be changed here.</p>
            <label className="cal-modal__label">Title</label>
            <input className="cal-modal__input" value={personalForm.title}
              onChange={e => setPersonalForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Submit assignment, Study session…" />
            <label className="cal-modal__label">Start Date</label>
            <input className="cal-modal__input" type="date" value={personalForm.startDate}
              onChange={e => setPersonalForm(f => ({ ...f, startDate: e.target.value }))} />
            <label className="cal-modal__label">End Date (leave blank for single day)</label>
            <input className="cal-modal__input" type="date" value={personalForm.endDate}
              onChange={e => setPersonalForm(f => ({ ...f, endDate: e.target.value }))} />
            <label className="cal-modal__label">Note (optional)</label>
            <input className="cal-modal__input" value={personalForm.note}
              onChange={e => setPersonalForm(f => ({ ...f, note: e.target.value }))}
              placeholder="Any quick note…" />
            <div className="cal-modal__actions">
              {editingPersonal !== null && (
                <button className="cal-modal__delete" onClick={() => deletePersonal(editingPersonal)}>Delete</button>
              )}
              <button className="cal-modal__cancel" onClick={() => setShowPersonalModal(false)}>Cancel</button>
              <button className="cal-modal__save" style={{ background: TYPE_META.personal.color }} onClick={submitPersonal}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicCalendar;
