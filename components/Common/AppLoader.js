import React, { useState, useEffect, useRef } from 'react';
import './AppLoader.scss';

const LOG_STEPS = [
  { delay: 120,  tag: 'run',  msg: 'Booting Spark CSE Portal v1.0.0',              pct: 8,   label: 'Loading config…'       },
  { delay: 300,  tag: 'info', msg: 'Loading environment config',                    pct: 8,   label: 'Loading config…'       },
  { delay: 350,  tag: 'ok',   msg: 'Environment variables loaded',                  pct: 22,  label: 'Starting React…'       },
  { delay: 320,  tag: 'info', msg: 'Initializing React runtime',                    pct: 38,  label: 'Loading modules…'      },
  { delay: 350,  tag: 'ok',   msg: 'React 18 ready',                               pct: 38,  label: 'Loading modules…'      },
  { delay: 600,  tag: 'info', msg: 'Connecting to API — sparkcse-backend.onrender.com', pct: 55, label: 'Connecting to API…' },
  { delay: 400,  tag: 'ok',   msg: 'API reachable',                                pct: 72,  label: 'Checking session…'     },
  { delay: 500,  tag: 'info', msg: 'Checking auth session',                         pct: 85,  label: 'Loading dashboard…'   },
  { delay: 600,  tag: 'ok',   msg: 'Session verified',                              pct: 100, label: 'Ready!'                },
];

// Adjust last line based on whether user is logged in or not
const getLastLine = (hasToken) =>
  hasToken
    ? { delay: 400, tag: 'ok',  msg: 'Welcome back · Launching dashboard', pct: 100, label: 'Ready!' }
    : { delay: 400, tag: 'info', msg: 'No session found · Loading login',   pct: 100, label: 'Ready!' };

const TAG_COLORS = {
  ok:   'tag-ok',
  info: 'tag-info',
  warn: 'tag-warn',
  run:  'tag-run',
};

const AppLoader = () => {
  const [lines, setLines] = useState([]);
  const [pct, setPct] = useState(0);
  const [barLabel, setBarLabel] = useState('Initializing…');
  const [done, setDone] = useState(false);
  const logRef = useRef(null);

  useEffect(() => {
    const hasToken = !!localStorage.getItem('token');
    const steps = [
      ...LOG_STEPS.slice(0, -1),
      getLastLine(hasToken),
    ];

    let elapsed = 400; // initial pause
    const timers = [];

    steps.forEach((step, i) => {
      elapsed += step.delay;
      timers.push(
        setTimeout(() => {
          setLines(prev => [...prev, {
            id: i,
            ts: (elapsed / 1000).toFixed(1).padStart(5, '0'),
            tag: step.tag,
            msg: step.msg,
            isCursor: i === steps.length - 1,
          }]);
          setPct(step.pct);
          setBarLabel(step.label);
          if (i === steps.length - 1) setDone(true);
        }, elapsed)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="app-boot-loader">
      <div className="abl-card">

        {/* Logo */}
        <div className="abl-logo-row">
          <div className="abl-logo-icon">SP</div>
          <div>
            <div className="abl-logo-name">SPARKCSE PORTAL</div>
            <div className="abl-logo-sub">NITBFreshers · CSE Study Hub</div>
          </div>
        </div>

        {/* Log output */}
        <div className="abl-log" ref={logRef}>
          {lines.map(line => (
            <div key={line.id} className="abl-log-line">
              <span className="abl-ts">[{line.ts}]</span>
              <span className={`abl-tag ${TAG_COLORS[line.tag]}`}>
                [{line.tag.toUpperCase()}]
              </span>
              <span className="abl-msg">{line.msg}</span>
              {line.isCursor && <span className="abl-cursor" />}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="abl-bar-wrap">
          <div className="abl-bar-labels">
            <span className="abl-bar-label">{barLabel}</span>
            <span className="abl-bar-pct">{pct}%</span>
          </div>
          <div className="abl-bar-track">
            <div className="abl-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Status dot */}
        <div className="abl-status-row">
          <div className={`abl-dot ${done ? 'done' : ''}`} />
          <span className="abl-status-text">
            {done ? 'Portal loaded successfully' : 'Starting up'}
          </span>
        </div>

      </div>
    </div>
  );
};

export default AppLoader;
