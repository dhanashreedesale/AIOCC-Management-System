import React from 'react';

export default function StudentTable({ students, onEdit, onDelete }) {
  if (!students || students.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No student records found. Click "Add New Student" to add one.
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Stream</th>
            <th>Enrollment Date</th>
            {onEdit && onDelete && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td><strong>#{student.id}</strong></td>
              <td style={{ fontWeight: 600 }}>{student.name}</td>
              <td>{student.contact}</td>
              <td>{student.email}</td>
              <td>
                <span className="badge badge-track">{student.stream}</span>
              </td>
              <td>{student.enrollmentDate}</td>
              {onEdit && onDelete && (
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => onEdit(student)}
                      className="btn btn-sm btn-secondary"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => onDelete(student.id)}
                      className="btn btn-sm btn-danger"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
