import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

export default function Sidebar() {
  const { user, role, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div>
        <div style={{ marginBottom: '1.5rem', paddingLeft: '8px' }}>
          <h4 style={{ color: 'var(--primary-color)', fontSize: '1.1rem' }}>AIOCC Portal</h4>
          <span className="user-role-badge">{role} CONTROL</span>
        </div>

        <ul className="sidebar-menu">
          {/* ADMIN LINKS */}
          {role === 'ADMIN' && (
            <>
              <li>
                <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'active' : '')}>
                  📊 Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/students" className={({ isActive }) => (isActive ? 'active' : '')}>
                  👨‍🎓 Student Management
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/courses" className={({ isActive }) => (isActive ? 'active' : '')}>
                  📚 Course Management
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/batches" className={({ isActive }) => (isActive ? 'active' : '')}>
                  👥 Batch Management
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/enrollments" className={({ isActive }) => (isActive ? 'active' : '')}>
                  📝 Enrollments
                </NavLink>
              </li>
            </>
          )}

          {/* FACULTY LINKS */}
          {role === 'FACULTY' && (
            <>
              <li>
                <NavLink to="/faculty" end className={({ isActive }) => (isActive ? 'active' : '')}>
                  📊 Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/faculty/attendance" className={({ isActive }) => (isActive ? 'active' : '')}>
                  📅 Attendance Module
                </NavLink>
              </li>
              <li>
                <NavLink to="/faculty/grades" className={({ isActive }) => (isActive ? 'active' : '')}>
                  📝 Assessment Grades
                </NavLink>
              </li>
              <li>
                <NavLink to="/faculty/typing" className={({ isActive }) => (isActive ? 'active' : '')}>
                  ⌨️ Typing Test Module
                </NavLink>
              </li>
            </>
          )}

        </ul>
      </div>

      <div className="user-profile-widget">
        <div className="user-info-text">
          <div style={{ fontWeight: 600 }}>{user?.fullName || user?.username}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{user?.username}</div>
        </div>
        <button onClick={handleLogout} className="btn btn-sm btn-danger" title="Logout">
          🚪
        </button>
      </div>
    </aside>
  );
}
