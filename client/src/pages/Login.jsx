import React, { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function Login({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const { data } = await axios.post(`${API_URL}/api/auth/login`, { email, password });
        onAuth(data.token, data.user);
      } else {
        const { data } = await axios.post(`${API_URL}/api/auth/register`, { name, email, password });
        onAuth(data.token, data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <form onSubmit={submit} style={{ width: 360, border: '1px solid #ddd', padding: 24, borderRadius: 8 }}>
        <h2 style={{ marginTop: 0 }}>{mode === 'login' ? 'Login' : 'Register'}</h2>
        {mode === 'register' && (
          <div style={{ marginBottom: 12 }}>
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%' }} />
          </div>
        )}
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%' }} />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'}
        </button>
        <div style={{ marginTop: 12, fontSize: 14 }}>
          {mode === 'login' ? (
            <span>Don't have an account? <button type="button" onClick={() => setMode('register')}>Register</button></span>
          ) : (
            <span>Already have an account? <button type="button" onClick={() => setMode('login')}>Login</button></span>
          )}
        </div>
      </form>
    </div>
  );
}
