import React, { useState, useEffect } from 'react';
import API from '../api';
import Sidebar from '../components/Sidebar';

export default function EnrollmentsAdmin() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: 1,
    batchId: 1,
    enrolledDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE'
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [resE, resS, resB] = await Promise.all([
        API.get('/enrollments'),
        API.get('/students'),
        API.get('/batches')
      ]);
      setEnrollments(resE.data);
      setStudents(resS.data);
      setBatches(resB.data);
      if (resS.data.length > 0) setFormData(prev => ({ ...prev, studentId: resS.data[0].id }));
      if (resB.data.length > 0) setFormData(prev => ({ ...prev, batchId: resB.data[0].id }));
    } catch (err) {
      console.error(err);
      setError('Failed to load enrollments.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const res = await API.post('/enrollments', formData);
      setMessage(res.data.message || 'Student enrolled successfully.');
      setIsModalOpen(false);
      fetchInitialData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to enroll student.');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ color: 'var(--primary-color)', fontSize: '2rem' }}>Student Enrollments</h1>
            <p style={{ color: 'var(--text-muted)' }}>Enroll students into specific course batches</p>
          </div>

          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            ➕ New Student Enrollment
          </button>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading enrollments...</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Enrollment ID</th>
                  <th>Student Name</th>
                  <th>Course / Batch</th>
                  <th>Enrolled Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => (
                  <tr key={e.id}>
                    <td><strong>Enr #{e.id}</strong></td>
                    <td style={{ fontWeight: 600 }}>🎓 {e.studentName}</td>
                    <td>{e.courseName} (Batch #{e.batchId})</td>
                    <td>{e.enrolledDate}</td>
                    <td><span className="badge badge-success">{e.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h3>Enroll Student in Batch</h3>
                <button onClick={() => setIsModalOpen(false)} className="close-btn">&times;</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Select Student</label>
                  <select
                    className="form-control"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: parseInt(e.target.value) })}
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>#{s.id} - {s.name} ({s.stream})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Select Batch</label>
                  <select
                    className="form-control"
                    value={formData.batchId}
                    onChange={(e) => setFormData({ ...formData, batchId: parseInt(e.target.value) })}
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>Batch #{b.id} - {b.courseName} ({b.schedule})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Enrollment Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.enrolledDate}
                    onChange={(e) => setFormData({ ...formData, enrolledDate: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Enrollment</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
