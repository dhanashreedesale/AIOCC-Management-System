import React, { useState, useEffect } from 'react';
import API from '../api';
import Sidebar from '../components/Sidebar';

export default function Grades() {
  const [enrollments, setEnrollments] = useState([]);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState('');
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Form state
  const [assessmentType, setAssessmentType] = useState('Unit Test 1');
  const [marksObtained, setMarksObtained] = useState('');
  const [maxMarks, setMaxMarks] = useState('50');
  const [assessedOn, setAssessedOn] = useState(new Date().toISOString().split('T')[0]);

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
        fetchAssessments(firstId);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load enrollments.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssessments = async (eId) => {
    if (!eId) return;
    try {
      const res = await API.get(`/grades/enrollment/${eId}/assessments`);
      setAssessments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnrollmentChange = (e) => {
    const eId = e.target.value;
    setSelectedEnrollmentId(eId);
    fetchAssessments(eId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEnrollmentId) return;

    setMessage(null);
    setError(null);

    const marks = parseFloat(marksObtained);
    const maxM = parseFloat(maxMarks);

    if (isNaN(marks) || isNaN(maxM) || marks < 0 || maxM <= 0) {
      setError('Please enter valid numeric marks.');
      return;
    }
    if (marks > maxM) {
      setError('Marks obtained cannot exceed maximum marks.');
      return;
    }

    try {
      const payload = {
        enrollmentId: parseInt(selectedEnrollmentId),
        assessmentType,
        marksObtained: marks,
        maxMarks: maxM,
        assessedOn
      };
      const res = await API.post('/grades/assessment', payload);
      setMessage(res.data.message || 'Assessment grade saved successfully.');
      setMarksObtained('');
      fetchAssessments(selectedEnrollmentId);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to save grade.');
    }
  };

  const selectedEnrollment = enrollments.find(e => e.id === parseInt(selectedEnrollmentId));

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-content">
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ color: 'var(--primary-color)', fontSize: '2rem' }}>Assessment Grades Module</h1>
          <p style={{ color: 'var(--text-muted)' }}>Enter and review student test & exam marks</p>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
          {/* GRADE FORM */}
          <div className="card">
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Enter Assessment Marks</h3>
            <form onSubmit={handleSubmit}>
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
                <label>Assessment Type</label>
                <select
                  className="form-control"
                  value={assessmentType}
                  onChange={(e) => setAssessmentType(e.target.value)}
                >
                  <option value="Unit Test 1">Unit Test 1</option>
                  <option value="Unit Test 2">Unit Test 2</option>
                  <option value="Midterm Exam">Midterm Exam</option>
                  <option value="Practical Exam">Practical Exam</option>
                  <option value="Final Project">Final Project</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Marks Obtained *</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-control"
                    placeholder="e.g. 45"
                    value={marksObtained}
                    onChange={(e) => setMarksObtained(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Max Marks *</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g. 50"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Assessment Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={assessedOn}
                  onChange={(e) => setAssessedOn(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                Save Marks to Database
              </button>
            </form>
          </div>

          {/* GRADES HISTORY */}
          <div className="card">
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
              Grade Records — {selectedEnrollment ? selectedEnrollment.studentName : ''}
            </h3>

            {assessments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No assessment records entered yet for this student.</p>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Assessment Type</th>
                      <th>Marks Obtained</th>
                      <th>Max Marks</th>
                      <th>Percentage</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.map((a) => {
                      const pct = ((a.marksObtained / a.maxMarks) * 100).toFixed(1);
                      return (
                        <tr key={a.id}>
                          <td style={{ fontWeight: 600 }}>{a.assessmentType}</td>
                          <td><strong>{a.marksObtained}</strong></td>
                          <td>{a.maxMarks}</td>
                          <td>
                            <span className={`badge ${pct >= 50 ? 'badge-success' : 'badge-danger'}`}>
                              {pct}%
                            </span>
                          </td>
                          <td>{a.assessedOn}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
