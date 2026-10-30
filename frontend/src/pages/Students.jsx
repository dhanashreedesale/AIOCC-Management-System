import React, { useState, useEffect } from 'react';
import API from '../api';
import Sidebar from '../components/Sidebar';
import StudentTable from '../components/StudentTable';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    stream: 'Computer Science',
    enrollmentDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await API.get('/students');
      setStudents(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch students.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      contact: '',
      email: '',
      stream: 'Computer Science',
      enrollmentDate: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      contact: student.contact,
      email: student.email,
      stream: student.stream,
      enrollmentDate: student.enrollmentDate
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete student #${id}?`)) return;

    setMessage(null);
    setError(null);
    try {
      const res = await API.delete(`/students/${id}`);
      setMessage(res.data.message || 'Student deleted successfully.');
      fetchStudents();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to delete student.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    // Basic Validation
    if (!formData.name.trim()) {
      setError('Student name cannot be empty.');
      return;
    }
    if (!formData.contact.trim()) {
      setError('Contact number cannot be empty.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    try {
      if (editingStudent) {
        // UPDATE
        const res = await API.put(`/students/${editingStudent.id}`, formData);
        setMessage(res.data.message || 'Student updated successfully.');
      } else {
        // CREATE
        const res = await API.post('/students', formData);
        setMessage(res.data.message || 'Student added successfully.');
      }
      setIsModalOpen(false);
      fetchStudents();
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
            <h1 style={{ color: 'var(--primary-color)', fontSize: '2rem' }}>Student Management</h1>
            <p style={{ color: 'var(--text-muted)' }}>Admin Student Records CRUD</p>
          </div>

          <button onClick={handleOpenAddModal} className="btn btn-primary">
            ➕ Add New Student
          </button>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading student records...</div>
        ) : (
          <StudentTable
            students={students}
            onEdit={handleOpenEditModal}
            onDelete={handleDelete}
          />
        )}

        {/* CREATE / EDIT STUDENT MODAL */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h3>{editingStudent ? `Edit Student #${editingStudent.id}` : 'Add New Student'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="close-btn">&times;</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Ramesh Patil"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Contact Number *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 9876543210"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g. ramesh@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Stream / Field</label>
                  <select
                    className="form-control"
                    value={formData.stream}
                    onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Science">Science</option>
                    <option value="Arts">Arts</option>
                    <option value="Engineering">Engineering</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Enrollment Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.enrollmentDate}
                    onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingStudent ? 'Update Student' : 'Create Student'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
