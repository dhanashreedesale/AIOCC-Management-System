import React, { useState, useEffect } from 'react';
import API from '../api';
import Sidebar from '../components/Sidebar';

export default function TypingTest() {
  const [enrollments, setEnrollments] = useState([]);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState('');
  const [typingTests, setTypingTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Form state
  const [language, setLanguage] = useState('English');
  const [grossWpm, setGrossWpm] = useState('40');
  const [accuracy, setAccuracy] = useState('95');
  const [targetWpm, setTargetWpm] = useState('30');
  const [testedOn, setTestedOn] = useState(new Date().toISOString().split('T')[0]);

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
        fetchTypingTests(firstId);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load student enrollments.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTypingTests = async (eId) => {
    if (!eId) return;
    try {
      const res = await API.get(`/grades/enrollment/${eId}/typing`);
      setTypingTests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnrollmentChange = (e) => {
    const eId = e.target.value;
    setSelectedEnrollmentId(eId);
    fetchTypingTests(eId);
  };

  // Live calculation preview
  const gross = parseFloat(grossWpm) || 0;
  const acc = parseFloat(accuracy) || 0;
  const target = parseFloat(targetWpm) || 0;
  const previewNetWpm = ((gross * acc) / 100).toFixed(2);
  const previewResult = parseFloat(previewNetWpm) >= target ? 'PASS' : 'FAIL';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEnrollmentId) return;

    setMessage(null);
    setError(null);

    if (acc < 0 || acc > 100) {
      setError('Accuracy percentage must be between 0% and 100%.');
      return;
    }
    if (gross < 0) {
      setError('Gross WPM cannot be negative.');
      return;
    }

    try {
      const payload = {
        enrollmentId: parseInt(selectedEnrollmentId),
        language,
        grossWpm: gross,
        accuracy: acc,
        targetWpm: target,
        testedOn
      };

      const res = await API.post('/grades/typing-test', payload);
      setMessage(res.data.message || 'Typing test result saved.');
      fetchTypingTests(selectedEnrollmentId);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to record typing test.');
    }
  };

  const selectedEnrollment = enrollments.find(e => e.id === parseInt(selectedEnrollmentId));

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-content">
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ color: 'var(--primary-color)', fontSize: '2rem' }}>Govt. Typing Test Evaluation Module</h1>
          <p style={{ color: 'var(--text-muted)' }}>Calculate Net WPM speed, accuracy, and certified PASS/FAIL status</p>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
          {/* RECORD TYPING FORM */}
          <div className="card">
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Record Typing Test</h3>
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
                <label>Typing Language</label>
                <select
                  className="form-control"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="English">GCC-TBC English Typing</option>
                  <option value="Marathi">GCC-TBC Marathi Typing</option>
                  <option value="Hindi">GCC-TBC Hindi Typing</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Gross WPM *</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    placeholder="e.g. 42"
                    value={grossWpm}
                    onChange={(e) => setGrossWpm(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Accuracy (%) *</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    placeholder="e.g. 95"
                    value={accuracy}
                    onChange={(e) => setAccuracy(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Target WPM Requirement</label>
                <select
                  className="form-control"
                  value={targetWpm}
                  onChange={(e) => setTargetWpm(e.target.value)}
                >
                  <option value="30">30 WPM (Standard Certification)</option>
                  <option value="40">40 WPM (Advanced Certification)</option>
                  <option value="50">50 WPM (Expert Speed)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Test Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={testedOn}
                  onChange={(e) => setTestedOn(e.target.value)}
                  required
                />
              </div>

              {/* LIVE PREVIEW BOX */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', margin: '1rem 0', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Formula: <code>Net WPM = Gross WPM × Accuracy / 100</code></div>
                <div style={{ marginTop: '6px', fontSize: '1rem' }}>
                  Calculated Net WPM: <strong>{previewNetWpm} WPM</strong>
                </div>
                <div>
                  Evaluation Result: <span className={`badge ${previewResult === 'PASS' ? 'badge-success' : 'badge-danger'}`}>{previewResult}</span>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Save Test Result to MySQL
              </button>
            </form>
          </div>

          {/* TYPING TEST HISTORY TABLE */}
          <div className="card">
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
              Typing Performance Records — {selectedEnrollment ? selectedEnrollment.studentName : ''}
            </h3>

            {typingTests.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No typing test records recorded yet for this student.</p>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Language</th>
                      <th>Gross WPM</th>
                      <th>Accuracy</th>
                      <th>Net WPM</th>
                      <th>Target</th>
                      <th>Result</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {typingTests.map((t) => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: 600 }}>{t.language}</td>
                        <td>{t.grossWpm} WPM</td>
                        <td>{t.accuracy}%</td>
                        <td><strong>{t.netWpm} WPM</strong></td>
                        <td>{t.targetWpm} WPM</td>
                        <td>
                          <span className={`badge ${t.result === 'PASS' ? 'badge-success' : 'badge-danger'}`}>
                            {t.result}
                          </span>
                        </td>
                        <td>{t.testedOn}</td>
                      </tr>
                    ))}
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
