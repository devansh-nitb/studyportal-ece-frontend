import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaTrash, FaCheckDouble, FaBullhorn, FaCommentDots, FaCheckCircle, FaBook } from 'react-icons/fa';
import { useNotifications } from '../../hooks/useNotifications';
import './NotificationBell.scss';

const TYPE_ICON = {
    announcement: <FaBullhorn />,
    doubt_answer: <FaCommentDots />,
    doubt_resolved: <FaCheckCircle />,
    material: <FaBook />,
    general: <FaBell />,
};

const NotificationBell = () => {
    const { notifications, unreadCount, markRead, markAllRead, deleteNotif } = useNotifications();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleOpen = () => {
        setOpen(o => !o);
    };

    const handleClick = async (n) => {
        if (!n.isRead) await markRead(n._id);
    };

    const timeAgo = (date) => {
        const diff = Date.now() - new Date(date).getTime();
        const m = Math.floor(diff / 60000);
        if (m < 1) return 'just now';
        if (m < 60) return `${m}m ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h}h ago`;
        return `${Math.floor(h / 24)}d ago`;
    };

    return (
        <div className="notif-bell" ref={ref}>
            <button className="notif-bell__btn" onClick={handleOpen} aria-label="Notifications">
                <FaBell />
                {unreadCount > 0 && (
                    <span className="notif-bell__badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>

            {open && (
                <div className="notif-panel">
                    <div className="notif-panel__header">
                        <span className="notif-panel__title">Notifications</span>
                        {unreadCount > 0 && (
                            <button className="notif-panel__read-all" onClick={markAllRead}>
                                <FaCheckDouble /> Mark all read
                            </button>
                        )}
                    </div>

                    <div className="notif-panel__list">
                        {notifications.length === 0 && (
                            <div className="notif-panel__empty">No notifications yet.</div>
                        )}
                        {notifications.map(n => (
                            <div
                                key={n._id}
                                className={`notif-item${n.isRead ? '' : ' notif-item--unread'}`}
                                onClick={() => handleClick(n)}
                            >
                                <span className="notif-item__icon">{TYPE_ICON[n.type] || <FaBell />}</span>
                                <div className="notif-item__body">
                                    <div className="notif-item__title">{n.title}</div>
                                    <div className="notif-item__text">{n.body}</div>
                                    <div className="notif-item__time">{timeAgo(n.createdAt)}</div>
                                </div>
                                <button
                                    className="notif-item__del"
                                    onClick={e => { e.stopPropagation(); deleteNotif(n._id); }}
                                    title="Dismiss"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
