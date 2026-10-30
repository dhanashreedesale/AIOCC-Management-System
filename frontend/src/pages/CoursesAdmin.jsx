import React, { useState, useEffect } from 'react';
import API from '../api';
import Sidebar from '../components/Sidebar';

export default function CoursesAdmin() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    track: 'Computer Courses',
    durationHours: 60,
    durationMonths: 2,
    level: 'Beginner',
    languages: 'English, Marathi',
    isNew: false,
    description: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await API.get('/courses');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingCourse(null);
    setFormData({
      name: '',
      track: 'Computer Courses',
      durationHours: 60,
      durationMonths: 2,
      level: 'Beginner',
      languages: 'English, Marathi',
      isNew: false,
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      track: course.track,
      durationHours: course.durationHours,
      durationMonths: course.durationMonths,
      level: course.level,
      languages: course.languages,
      isNew: course.isNew,
      description: course.description
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete course #${id}?`)) return;

    setMessage(null);
    setError(null);
    try {
      const res = await API.delete(`/courses/${id}`);
      setMessage(res.data.message || 'Course deleted successfully.');
      fetchCourses();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to delete course.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!formData.name.trim()) {
      setError('Course name cannot be empty.');
      return;
    }

    try {
      if (editingCourse) {
        const res = await API.put(`/courses/${editingCourse.id}`, formData);
        setMessage(res.data.message || 'Course updated successfully.');
      } else {
        const res = await API.post('/courses', formData);
        setMessage(res.data.message || 'Course created successfully.');
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Operation failed.');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ color: 'var(--primary-color)', fontSize: '2rem' }}>Course Management</h1>
            <p style={{ color: 'var(--text-muted)' }}>Admin Course CRUD Interface</p>
          </div>

          <button onClick={handleOpenAddModal} className="btn btn-primary">
            ➕ Add New Course
          </button>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading course catalogue...</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Course Name</th>
                  <th>Track</th>
                  <th>Duration</th>
                  <th>Level</th>
                  <th>Languages</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td><strong>#{course.id}</strong></td>
                    <td style={{ fontWeight: 600 }}>{course.name}</td>
                    <td><span className="badge badge-track">{course.track}</span></td>
                    <td>{course.durationHours}h ({course.durationMonths}m)</td>
                    <td>{course.level}</td>
                    <td>{course.languages}</td>
                    <td>{course.isNew ? <span className="badge badge-new">NEW</span> : 'Standard'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleOpenEditModal(course)} className="btn btn-sm btn-secondary">
                          ✏️ Edit
                        </button>
                        <button onClick={() => handleDelete(course.id)} className="btn btn-sm btn-danger">
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MODAL */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h3>{editingCourse ? `Edit Course #${editingCourse.id}` : 'Add New Course'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="close-btn">&times;</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Course Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Advanced Tally Prime"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Track / Category</label>
                  <select
                    className="form-control"
                    value={formData.track}
                    onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                  >
                    <option value="Computer Courses">Computer Courses</option>
                    <option value="Programming">Programming</option>
                    <option value="Data & Excel">Data & Excel</option>
                    <option value="Typing">Typing</option>
                    <option value="Accounting">Accounting</option>
                    <option value="AI & ML">AI & ML</option>
                    <option value="Cyber Security">Cyber Security</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Duration (Hours)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.durationHours}
                      onChange={(e) => setFormData({ ...formData, durationHours: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Duration (Months)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.durationMonths}
                      onChange={(e) => setFormData({ ...formData, durationMonths: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Level</label>
                  <select
                    className="form-control"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="All Levels">All Levels</option>
                    <option value="Beginner to Advanced">Beginner to Advanced</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Languages (comma-separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.languages}
                    onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="isNew"
                    checked={formData.isNew}
                    onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                  />
                  <label htmlFor="isNew" style={{ marginBottom: 0 }}>Mark as NEW Course Badge</label>
                </div>

                <div className="form-group">
                  <label>Course Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  ></textarea>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingCourse ? 'Update Course' : 'Create Course'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
