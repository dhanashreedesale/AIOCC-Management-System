import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await API.post('/auth/login', { username, password });
      const { token, role, fullName, userId, studentId } = res.data;

      // Update auth context & localStorage
      login({ username, role, fullName, userId, studentId }, token);

      // Redirect based on role
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'FACULTY') navigate('/faculty');
      else if (role === 'STUDENT') navigate('/student');
      else navigate('/');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Login failed. Please check backend server connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div style={{ maxWidth: '440px', margin: '3rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: 'var(--primary-color)', fontSize: '1.8rem' }}>Portal Login</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sign in to AIOCC Institute Management</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* DEMO ACCOUNTS HELPER */}
        <div className="demo-accounts-box">
          <strong style={{ color: 'var(--primary-color)' }}>Demo Test Accounts (Click to Fill):</strong>
          <div
            className="demo-account-item"
            onClick={() => setDemoCredentials('admin', 'admin123')}
          >
            <span>👨‍💼 <strong>ADMIN:</strong> admin</span>
            <span style={{ color: 'var(--text-muted)' }}>admin123</span>
          </div>
          <div
            className="demo-account-item"
            onClick={() => setDemoCredentials('faculty1', 'faculty123')}
          >
            <span>👨‍🏫 <strong>FACULTY:</strong> faculty1</span>
            <span style={{ color: 'var(--text-muted)' }}>faculty123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
