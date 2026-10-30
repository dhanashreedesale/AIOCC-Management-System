import React from 'react';

export default function CourseCard({ course }) {
  return (
    <div className="course-card">
      <div>
        <div className="course-card-header">
          <h3 className="course-title">{course.name}</h3>
          {course.isNew && <span className="badge badge-new">NEW</span>}
        </div>

        <div className="course-meta">
          <span className="badge badge-track">{course.track}</span>
          <span>⏱️ {course.durationHours} hrs ({course.durationMonths} months)</span>
          <span>📊 {course.level}</span>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          {course.description}
        </p>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>🌐 Languages: <strong>{course.languages}</strong></span>
      </div>
    </div>
  );
}
