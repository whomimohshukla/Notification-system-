import React from 'react';
import NotificationBell from './NotificationBell.jsx';

export default function Navbar({ token, user, onLogout }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #eee' }}>
      <div style={{ fontWeight: 'bold' }}>MyApp</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <NotificationBell token={token} />
        <div style={{ color: '#666' }}>{user?.email}</div>
        <button onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}
