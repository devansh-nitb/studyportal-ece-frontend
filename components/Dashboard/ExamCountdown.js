import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { FaFlask, FaCalendarAlt, FaClock, FaCheckCircle } from 'react-icons/fa';
import { SEED_EVENTS } from './AcademicCalendar';
import './ExamCountdown.scss';

// Key exam events to extract from calendar data
const EXAM_KEYWORDS = [
  'mini test', 'mid term', 'midterm', 'mid-term',
  'end term', 'practical', 'supplementary', 'viva', 'seminar', 'dissertation'
];

const isExamEvent = (e) =>
  e.type === 'exam' ||
  EXAM_KEYWORDS.some(k => e.title?.toLowerCase().includes(k));

function daysLeft(dateStr) {
  const target = new Date(dateStr + 'T00:00:00');
  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / 86400000);
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

function urgencyClass(days) {
  if (days < 0)   return 'past';
  if (days === 0) return 'today';
  if (days <= 3)  return 'urgent';
  if (days <= 7)  return 'soon';
  if (days <= 14) return 'upcoming';
  return 'future';
}

function urgencyLabel(days) {
  if (days < 0)   return `${Math.abs(days)}d ago`;
  if (days === 0) return 'Today!';
  if (days === 1) return 'Tomorrow!';
  return `${days} days`;
}

// ── Component ────────────────────────────────────────────────────────────────
const ExamCountdown = () => {
  const { token, API_URL } = useContext(AuthContext);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/settings/calendar`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        let events = [];
        if (res.data.success && res.data.data?.events) {
          events = res.data.data.events;
        } else {
          // Fall back to seed data
          events = SEED_EVENTS || [];
        }

        const examEvents = events
          .filter(isExamEvent)
          .map(e => ({ ...e, _daysLeft: daysLeft(e.startDate) }))
          .filter(e => e._daysLeft >= -1)             // keep events up to 1 day past
          .sort((a, b) => a._daysLeft - b._daysLeft);

        setExams(examEvents);
      } catch {
        setExams([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, API_URL]);

  const visible = showAll ? exams : exams.slice(0, 4);

  if (loading) return <div className="ec-loading">Loading countdowns…</div>;

  if (exams.length === 0) {
    return (
      <div className="exam-countdown ec-empty">
        <FaCheckCircle className="ec-empty__icon" />
        <p>No upcoming exams found.</p>
      </div>
    );
  }

  return (
    <div className="exam-countdown">
      <div className="ec-header">
        <FaFlask className="ec-header__icon" />
        <h3 className="ec-header__title">Exam Countdown</h3>
        <span className="ec-header__sub">{exams.length} upcoming</span>
      </div>

      <div className="ec-list">
        {visible.map((exam, i) => {
          const cls = urgencyClass(exam._daysLeft);
          return (
            <div key={i} className={`ec-card ec-card--${cls}`}>
              <div className="ec-card__left">
                <div className="ec-card__title">{exam.title}</div>
                <div className="ec-card__dates">
                  <FaCalendarAlt />
                  {exam.startDate === exam.endDate || !exam.endDate
                    ? formatDate(exam.startDate)
                    : `${formatDate(exam.startDate)} → ${formatDate(exam.endDate)}`}
                </div>
              </div>
              <div className={`ec-badge ec-badge--${cls}`}>
                <FaClock className="ec-badge__icon" />
                <span className="ec-badge__count">{urgencyLabel(exam._daysLeft)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {exams.length > 4 && (
        <button className="ec-show-more" onClick={() => setShowAll(s => !s)}>
          {showAll ? 'Show less' : `Show ${exams.length - 4} more`}
        </button>
      )}
    </div>
  );
};

export default ExamCountdown;
