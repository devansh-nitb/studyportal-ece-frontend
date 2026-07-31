import React from 'react';
import { FaWifi, FaExclamationTriangle } from 'react-icons/fa';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import './OfflineBanner.scss';

// Shown app-wide (mounted in DashboardLayout) whenever the browser loses
// connectivity. We don't block the app — recently viewed study materials
// are still served from the service worker's offline cache (see public/sw.js).
const OfflineBanner = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="offline-banner" role="status">
      <FaExclamationTriangle className="offline-banner__icon" />
      <span>
        You're offline. <strong>Recently viewed materials</strong> are still available — new
        or unopened files won't load until your connection is back.
      </span>
      <FaWifi className="offline-banner__wifi" />
    </div>
  );
};

export default OfflineBanner;
