// hooks/usePushNotifications.js
// FIX: Registers Service Worker, fetches VAPID key, subscribes to push,
//      and posts subscription to backend so push notifications work.
import { useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export function usePushNotifications() {
    const { token, API_URL, user } = useContext(AuthContext);
    const registered = useRef(false);

    useEffect(() => {
        if (!token || !user || registered.current) return;
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

        const register = async () => {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');

                const keyRes = await axios.get(`${API_URL}/push/vapid-public-key`);
                if (!keyRes.data.success || !keyRes.data.publicKey) return;
                const applicationServerKey = urlBase64ToUint8Array(keyRes.data.publicKey);

                const sub = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey,
                });

                await axios.post(
                    `${API_URL}/push/subscribe`,
                    sub.toJSON(),
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                registered.current = true;
            } catch (err) {
                if (err.name !== 'NotAllowedError') {
                    console.warn('Push registration failed:', err.message);
                }
            }
        };

        register();
    }, [token, API_URL, user]);
}
