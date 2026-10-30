import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, role, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        Loading authentication state...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="card" style={{ margin: '2rem', textAlign: 'center', borderColor: 'var(--danger-color)' }}>
        <h3 style={{ color: 'var(--danger-color)' }}>403 — Unauthorized Access</h3>
        <p style={{ marginTop: '0.5rem' }}>
          Your account role (<strong>{role}</strong>) does not have permission to access this route.
        </p>
      </div>
    );
  }

  return <Outlet />;
}
