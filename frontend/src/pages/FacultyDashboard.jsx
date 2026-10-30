import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../AuthContext';

export default function FacultyDashboard() {
  const { user } = useContext(AuthContext);
  const [batches, setBatches] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacultyData();
  }, []);

  const fetchFacultyData = async () => {
    try {
      const [resB, resE] = await Promise.all([
        API.get('/batches'),
        API.get('/enrollments')
      ]);
      setBatches(resB.data);
      setEnrollments(resE.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-content">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--primary-color)', fontSize: '2rem' }}>Faculty Workspace</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, <strong>{user?.fullName || 'Faculty Instructor'}</strong>!</p>
        </div>

        {/* METRICS */}
        <div className="grid-3" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <span className="stat-title">Assigned Batches</span>
            <div className="stat-number">{loading ? '...' : batches.length}</div>
          </div>
          <div className="stat-card">
            <span className="stat-title">Enrolled Students</span>
            <div className="stat-number">{loading ? '...' : enrollments.length}</div>
          </div>
          <div className="stat-card">
            <span className="stat-title">Active Modules</span>
            <div className="stat-number">3</div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Faculty Actions</h3>
        <div className="grid-3" style={{ marginBottom: '2rem' }}>
          <div className="card">
            <h3>📅 Attendance Module</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0 1rem 0' }}>
              Mark student attendance (PRESENT / ABSENT) and view attendance summary & percentages.
            </p>
            <Link to="/faculty/attendance" className="btn btn-sm btn-primary">Mark Attendance →</Link>
          </div>

          <div className="card">
            <h3>📝 Assessment Grades</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0 1rem 0' }}>
              Record unit test, practical, and final assessment marks for enrolled students.
            </p>
            <Link to="/faculty/grades" className="btn btn-sm btn-primary">Enter Assessment Marks →</Link>
          </div>

          <div className="card">
            <h3>⌨️ Typing Test Record</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0 1rem 0' }}>
              Evaluate speed & accuracy, compute Net WPM, and assign PASS/FAIL results for Govt. Typing courses.
            </p>
            <Link to="/faculty/typing" className="btn btn-sm btn-primary">Record Typing Test →</Link>
          </div>
        </div>

        {/* BATCHES LIST */}
        <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Assigned Batches</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Course Name</th>
                <th>Schedule</th>
                <th>Start Date</th>
                <th>Capacity</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b.id}>
                  <td><strong>Batch #{b.id}</strong></td>
                  <td style={{ fontWeight: 600 }}>{b.courseName}</td>
                  <td>{b.schedule}</td>
                  <td>{b.startDate}</td>
                  <td><span className="badge badge-track">{b.capacity} Seats</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
