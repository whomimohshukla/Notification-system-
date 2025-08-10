import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from './api.js';
import Login from './pages/Login.jsx';
import Navbar from './components/Navbar.jsx';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  if (!token) {
    return <Login onAuth={(t, u) => { setToken(t); setUser(u); }} />;
  }

  return (
    <div>
      <Navbar token={token} user={user} onLogout={() => { setToken(null); setUser(null); }} />
      <div style={{ padding: 24 }}>
        <h2>Welcome{user ? `, ${user.name}` : ''}!</h2>
        <p>This is a demo home page. Trigger notifications from server or another user.</p>
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button
            onClick={async () => {
              // Create a notification for yourself for demo
              await axios.post(
                `${API_URL}/api/notifications`,
                { userId: user.id, title: 'Hello!', body: 'This is a test notification.' },
                { headers: { Authorization: `Bearer ${token}` } }
              );
            }}
          >
            Send test notification to me
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
