import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function NotificationBell({ token }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const socket = useMemo(() => {
    if (!token) return null;
    const s = io(API_URL, { auth: { token } });
    return s;
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      const { data } = await axios.get(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    if (!socket) return;
    const onNew = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((c) => c + 1);
    };
    socket.on('notification:new', onNew);
    return () => {
      socket.off('notification:new', onNew);
      socket.close();
    };
  }, [socket]);

  const markAllRead = async () => {
    await axios.post(`${API_URL}/api/notifications/read-all`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const markOneRead = async (id) => {
    await axios.post(`${API_URL}/api/notifications/read/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen((v) => !v)} style={{ position: 'relative' }}>
        <span role="img" aria-label="bell">🔔</span>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: -6,
            right: -6,
            background: 'red',
            color: 'white',
            borderRadius: '50%',
            padding: '2px 6px',
            fontSize: 12,
          }}>{unreadCount}</span>
        )}
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 360, maxHeight: 420, overflow: 'auto', border: '1px solid #ddd', background: 'white', borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid #eee' }}>
            <strong>Notifications</strong>
            <button onClick={markAllRead} disabled={unreadCount === 0}>Mark all read</button>
          </div>
          <div>
            {notifications.length === 0 && (
              <div style={{ padding: 16, color: '#666' }}>No notifications</div>
            )}
            {notifications.map((n) => (
              <div key={n._id} style={{ padding: 12, borderBottom: '1px solid #f3f3f3', background: n.isRead ? 'white' : '#f8fbff' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <div style={{ fontWeight: 'bold' }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{new Date(n.createdAt).toLocaleString()}</div>
                </div>
                {n.body && <div style={{ color: '#444', marginTop: 4 }}>{n.body}</div>}
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  {!n.isRead && <button onClick={() => markOneRead(n._id)}>Mark read</button>}
                  {n.link && (
                    <a href={n.link} target="_blank" rel="noreferrer">Open</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
