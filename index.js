import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext'; 
import { ThemeProvider } from './context/ThemeContext'; 
import './styles/global.scss'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
        <ThemeProvider>
           <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);

// FIX: Register the service worker as soon as the app loads, independent of
// push-notification permission (usePushNotifications.js also registers it,
// but only after login + permission — too late for offline material caching
// to kick in on the very first view). Registering here means the SW's fetch
// handler is already controlling the page for subsequent navigations.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err.message);
    });
  });
}
