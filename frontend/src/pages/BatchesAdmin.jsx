import React, { useState, useEffect } from 'react';
import API from '../api';
import Sidebar from '../components/Sidebar';

export default function BatchesAdmin() {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    courseId: 1,
    facultyId: 2, // Default Faculty ID
    startDate: new Date().toISOString().split('T')[0],
    schedule: 'Mon-Fri 09:00 AM - 11:00 AM',
    capacity: 25
  });

  useEffect(() => {
    fetchBatchesAndCourses();
  }, []);

  const fetchBatchesAndCourses = async () => {
    setLoading(true);
    try {
      const [resB, resC] = await Promise.all([
        API.get('/batches'),
        API.get('/courses')
      ]);
      setBatches(resB.data);
      setCourses(resC.data);
      if (resC.data.length > 0) {
        setFormData(prev => ({ ...prev, courseId: resC.data[0].id }));
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load batches or courses.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const res = await API.post('/batches', formData);
      setMessage(res.data.message || 'Batch created successfully.');
      setIsModalOpen(false);
      fetchBatchesAndCourses();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to create batch.');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ color: 'var(--primary-color)', fontSize: '2rem' }}>Batch Management</h1>
            <p style={{ color: 'var(--text-muted)' }}>Configure course batches and faculty assignments</p>
          </div>

          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            ➕ Create New Batch
          </button>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading batches...</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Course Name</th>
                  <th>Faculty Instructor</th>
                  <th>Start Date</th>
                  <th>Schedule</th>
                  <th>Max Capacity</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.id}>
                    <td><strong>Batch #{b.id}</strong></td>
                    <td style={{ fontWeight: 600 }}>{b.courseName}</td>
                    <td>👨‍🏫 {b.facultyName}</td>
                    <td>{b.startDate}</td>
                    <td>{b.schedule}</td>
                    <td><span className="badge badge-track">{b.capacity} Students</span></td>
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
                <h3>Create New Batch</h3>
                <button onClick={() => setIsModalOpen(false)} className="close-btn">&times;</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Select Course</label>
                  <select
                    className="form-control"
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: parseInt(e.target.value) })}
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.track})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Schedule / Timing</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Max Student Capacity</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 20 })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Batch</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
