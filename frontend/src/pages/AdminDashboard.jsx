import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import Sidebar from '../components/Sidebar';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalBatches: 0,
    totalEnrollments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-content">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--primary-color)', fontSize: '2rem' }}>Admin Control Center</h1>
          <p style={{ color: 'var(--text-muted)' }}>System overview and academic management</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* METRICS STATS CARDS */}
        <div className="grid-4">
          <div className="stat-card">
            <span className="stat-title">Total Students</span>
            <div className="stat-number">{loading ? '...' : stats.totalStudents}</div>
          </div>
          <div className="stat-card">
            <span className="stat-title">Total Courses</span>
            <div className="stat-number">{loading ? '...' : stats.totalCourses}</div>
          </div>
          <div className="stat-card">
            <span className="stat-title">Total Batches</span>
            <div className="stat-number">{loading ? '...' : stats.totalBatches}</div>
          </div>
          <div className="stat-card">
            <span className="stat-title">Total Enrollments</span>
            <div className="stat-number">{loading ? '...' : stats.totalEnrollments}</div>
          </div>
        </div>

        {/* QUICK SHORTCUT CARDS */}
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
            Quick Management Actions
          </h3>
          <div className="grid-3">
            <div className="card">
              <h3>👨‍🎓 Student Management</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0 1rem 0' }}>
                Add, view, edit or delete student academic records in MySQL.
              </p>
              <Link to="/admin/students" className="btn btn-sm btn-primary">Manage Students →</Link>
            </div>

            <div className="card">
              <h3>📚 Course Catalogue</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0 1rem 0' }}>
                Add new computer & typing courses, configure track, hours and level.
              </p>
              <Link to="/admin/courses" className="btn btn-sm btn-primary">Manage Courses →</Link>
            </div>

            <div className="card">
              <h3>👥 Batches & Enrollments</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0 1rem 0' }}>
                Assign faculty to batches and enroll registered students.
              </p>
              <Link to="/admin/batches" className="btn btn-sm btn-primary">Manage Batches →</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
