import React, { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

export default function Navbar() {
  const { user, role, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardRoute = () => {
    if (role === 'ADMIN') return '/admin';
    if (role === 'FACULTY') return '/faculty';
    if (role === 'STUDENT') return '/student';
    return '/login';
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-badge">AIOCC</span>
        <span>All In One Computer Center</span>
      </Link>

      <ul className="nav-links">
        <li>
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/courses" className={({ isActive }) => (isActive ? 'active' : '')}>
            Courses
          </NavLink>
        </li>

        {user ? (
          <>
            <li>
              <NavLink to={getDashboardRoute()} className={({ isActive }) => (isActive ? 'active' : '')}>
                Dashboard ({role})
              </NavLink>
            </li>
            <li>
              <button onClick={handleLogout} className="btn btn-sm btn-secondary">
                Logout ({user.username})
              </button>
            </li>
          </>
        ) : (
          <li>
            <Link to="/login" className="btn btn-sm btn-login-nav">
              Student Login
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
