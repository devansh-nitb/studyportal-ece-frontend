// hooks/useNotifications.js
import { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// FIX: Must be a named export to match:
//   import { useNotifications } from '../../hooks/useNotifications'
// If this was accidentally saved as "export default", the build fails with
// "useNotifications is not exported from useNotifications"
export function useNotifications() {
    const { token, API_URL, user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!token || !user) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setNotifications(res.data.data);
                setUnreadCount(res.data.unreadCount);
            }
        } catch (_) {}
        finally { setLoading(false); }
    }, [token, API_URL, user]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markRead = async (id) => {
        try {
            await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(n => n.map(x => x._id === id ? { ...x, isRead: true } : x));
            setUnreadCount(c => Math.max(0, c - 1));
        } catch (_) {}
    };

    const markAllRead = async () => {
        try {
            await axios.put(`${API_URL}/notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(n => n.map(x => ({ ...x, isRead: true })));
            setUnreadCount(0);
        } catch (_) {}
    };

    const deleteNotif = async (id) => {
        try {
            await axios.delete(`${API_URL}/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const removed = notifications.find(x => x._id === id);
            setNotifications(n => n.filter(x => x._id !== id));
            if (removed && !removed.isRead) setUnreadCount(c => Math.max(0, c - 1));
        } catch (_) {}
    };

    return { notifications, unreadCount, loading, fetchNotifications, markRead, markAllRead, deleteNotif };
}
