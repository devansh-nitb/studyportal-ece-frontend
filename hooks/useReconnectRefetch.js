// hooks/useReconnectRefetch.js
import { useEffect, useRef } from 'react';

// Re-runs `callback` whenever the browser transitions from offline back to
// online, so screens that fell back to cached/offline data quietly refresh
// themselves with live data — no full page reload needed. The callback
// itself is responsible for being safe to call again (clearing its own
// loading/error state etc.), which all the screens using this already do
// since it's the same function used for the initial fetch.
export function useReconnectRefetch(callback, deps = []) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const handleOnline = () => {
      callbackRef.current();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export default useReconnectRefetch;
