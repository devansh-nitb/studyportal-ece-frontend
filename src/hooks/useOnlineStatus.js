// hooks/useOnlineStatus.js
import { useState, useEffect } from 'react';

// Tracks navigator.onLine and keeps it updated via the 'online'/'offline'
// window events. Note: navigator.onLine only reflects network-adapter
// connectivity (e.g. Wi-Fi/ethernet up), not whether the API server is
// actually reachable — that's fine for our purposes here, since we just
// want to warn the user and let cached materials take over.
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return isOnline;
}

export default useOnlineStatus;
