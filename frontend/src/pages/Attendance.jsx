import React, { useState, useEffect } from 'react';
import API from '../api';
import Sidebar from '../components/Sidebar';

export default function Attendance() {
  const [enrollments, setEnrollments] = useState([]);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState('');
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Form state
  const [markDate, setMarkDate] = useState(new Date().toISOString().split('T')[0]);
  const [markStatus, setMarkStatus] = useState('PRESENT');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const res = await API.get('/enrollments');
      setEnrollments(res.data);
      if (res.data.length > 0) {
        const firstId = res.data[0].id;
        setSelectedEnrollmentId(firstId);
        fetchSummary(firstId);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load student enrollments.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async (eId) => {
    if (!eId) return;
    try {
      const res = await API.get(`/attendance/enrollment/${eId}/summary`);
      setAttendanceSummary(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnrollmentChange = (e) => {
    const eId = e.target.value;
    setSelectedEnrollmentId(eId);
    fetchSummary(eId);
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!selectedEnrollmentId) return;

    setMessage(null);
    setError(null);

    try {
      const payload = {
        enrollmentId: parseInt(selectedEnrollmentId),
        date: markDate,
        status: markStatus
      };
      const res = await API.post('/attendance/mark', payload);
      setMessage(res.data.message || 'Attendance marked successfully.');
      fetchSummary(selectedEnrollmentId);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to mark attendance.');
    }
  };

  const selectedEnrollment = enrollments.find(e => e.id === parseInt(selectedEnrollmentId));

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-content">
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ color: 'var(--primary-color)', fontSize: '2rem' }}>Attendance Module</h1>
          <p style={{ color: 'var(--text-muted)' }}>Mark daily attendance and inspect percentage analytics</p>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
          {/* MARK ATTENDANCE FORM CARD */}
          <div className="card">
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Mark Attendance</h3>
            <form onSubmit={handleMarkAttendance}>
              <div className="form-group">
                <label>Select Student / Enrollment</label>
                <select
                  className="form-control"
                  value={selectedEnrollmentId}
                  onChange={handleEnrollmentChange}
                >
                  {enrollments.map((enr) => (
                    <option key={enr.id} value={enr.id}>
                      Enr #{enr.id} — {enr.studentName} ({enr.courseName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={markDate}
                  onChange={(e) => setMarkDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  className="form-control"
                  value={markStatus}
                  onChange={(e) => setMarkStatus(e.target.value)}
                >
                  <option value="PRESENT">✅ PRESENT</option>
                  <option value="ABSENT">❌ ABSENT</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                Save Attendance Record
              </button>
            </form>
          </div>

          {/* ATTENDANCE SUMMARY & HISTORY CARD */}
          <div>
            {attendanceSummary && (
              <div className="grid-3" style={{ marginBottom: '1rem' }}>
                <div className="stat-card">
                  <span className="stat-title">Total Classes</span>
                  <div className="stat-number">{attendanceSummary.totalClasses}</div>
                </div>
                <div className="stat-card">
                  <span className="stat-title">Present Classes</span>
                  <div className="stat-number" style={{ color: 'var(--success-color)' }}>{attendanceSummary.presentClasses}</div>
                </div>
                <div className="stat-card">
                  <span className="stat-title">Attendance %</span>
                  <div className="stat-number" style={{ color: attendanceSummary.attendancePercentage >= 75 ? 'var(--success-color)' : 'var(--danger-color)' }}>
                    {attendanceSummary.attendancePercentage}%
                  </div>
                </div>
              </div>
            )}

            <div className="card">
              <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
                Attendance History — {selectedEnrollment ? selectedEnrollment.studentName : ''}
              </h3>

              {!attendanceSummary || attendanceSummary.history.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No attendance records marked yet for this enrollment.</p>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Student Name</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceSummary.history.map((att) => (
                        <tr key={att.id}>
                          <td>{att.date}</td>
                          <td>{att.studentName}</td>
                          <td>
                            {att.status === 'PRESENT' ? (
                              <span className="badge badge-success">PRESENT</span>
                            ) : (
                              <span className="badge badge-danger">ABSENT</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
