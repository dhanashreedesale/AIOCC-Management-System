import React, { useState, useEffect, useContext } from 'react';
import API from '../api';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../AuthContext';

export default function StudentDashboard() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.username) {
      fetchStudentDashboard(user.username);
    }
  }, [user]);

  const fetchStudentDashboard = async (username) => {
    try {
      const res = await API.get(`/student/dashboard/${username}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError('Could not load student record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-content">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--primary-color)', fontSize: '2rem' }}>Student Academic Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Welcome, <strong>{user?.fullName || user?.username}</strong>! Here is your academic progress report.
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading your academic records...
          </div>
        ) : !data ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <h3>No student record linked to account <strong>{user?.username}</strong>.</h3>
          </div>
        ) : (
          <div>
            {/* STUDENT PROFILE CARD */}
            <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
              <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.75rem' }}>Personal Profile</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.95rem' }}>
                <div><strong>Student Name:</strong> {data.student.name}</div>
                <div><strong>Email:</strong> {data.student.email}</div>
                <div><strong>Contact:</strong> {data.student.contact}</div>
                <div><strong>Stream:</strong> <span className="badge badge-track">{data.student.stream}</span></div>
                <div><strong>Enrollment Date:</strong> {data.student.enrollmentDate}</div>
              </div>
            </div>

            {/* ENROLLED COURSES & ACADEMIC PERFORMANCE */}
            <h2 style={{ color: 'var(--primary-color)', fontSize: '1.4rem', margin: '2rem 0 1rem 0' }}>
              Enrolled Courses & Academic Records
            </h2>

            {data.enrollments.length === 0 ? (
              <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                You are not currently enrolled in any active course batches.
              </div>
            ) : (
              data.enrollments.map((enr, idx) => (
                <div key={idx} className="card" style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ color: 'var(--primary-color)', fontSize: '1.3rem' }}>{enr.courseName}</h3>
                      <span className="badge badge-track">{enr.track}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Enrolled Date</div>
                      <div style={{ fontWeight: 600 }}>{enr.enrolledDate}</div>
                    </div>
                  </div>

                  {/* STATS OVERVIEW */}
                  <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
                    <div className="stat-card" style={{ padding: '1rem' }}>
                      <span className="stat-title">Attendance %</span>
                      <div className="stat-number" style={{ fontSize: '1.8rem', color: enr.attendancePercentage >= 75 ? 'var(--success-color)' : 'var(--danger-color)' }}>
                        {enr.attendancePercentage}%
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {enr.presentClasses} present out of {enr.totalClasses} total classes
                      </div>
                    </div>

                    <div className="stat-card" style={{ padding: '1rem' }}>
                      <span className="stat-title">Assessments Taken</span>
                      <div className="stat-number" style={{ fontSize: '1.8rem' }}>{enr.assessments.length}</div>
                    </div>

                    <div className="stat-card" style={{ padding: '1rem' }}>
                      <span className="stat-title">Typing Test Results</span>
                      <div className="stat-number" style={{ fontSize: '1.8rem' }}>{enr.typingTests.length}</div>
                    </div>
                  </div>

                  {/* ASSESSMENTS TABLE */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Exam & Assessment Marks</h4>
                    {enr.assessments.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No exam marks recorded yet.</p>
                    ) : (
                      <div className="table-container">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Assessment Type</th>
                              <th>Marks Obtained</th>
                              <th>Max Marks</th>
                              <th>Score %</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {enr.assessments.map((a) => {
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

                  {/* TYPING TESTS TABLE */}
                  {enr.typingTests.length > 0 && (
                    <div>
                      <h4 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Typing Speed Test Results</h4>
                      <div className="table-container">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Language</th>
                              <th>Gross WPM</th>
                              <th>Accuracy</th>
                              <th>Net Speed</th>
                              <th>Target</th>
                              <th>Result</th>
                              <th>Test Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {enr.typingTests.map((t) => (
                              <tr key={t.id}>
                                <td>{t.language}</td>
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
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
