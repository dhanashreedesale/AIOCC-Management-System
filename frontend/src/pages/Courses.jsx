import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../api';
import CourseCard from '../components/CourseCard';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [selectedTrack, setSelectedTrack] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  const location = useLocation();

  useEffect(() => {
    // Read query string if present e.g. ?track=Typing
    const params = new URLSearchParams(location.search);
    const initialTrack = params.get('track');
    if (initialTrack) {
      setSelectedTrack(initialTrack);
    }
  }, [location.search]);

  useEffect(() => {
    fetchCourses();
  }, [selectedTrack, selectedLevel, selectedLanguage]);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedTrack !== 'All') params.track = selectedTrack;
      if (selectedLevel !== 'All') params.level = selectedLevel;
      if (selectedLanguage !== 'All') params.language = selectedLanguage;

      const res = await API.get('/public/courses', { params });
      setCourses(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load courses from backend server.');
    } finally {
      setLoading(false);
    }
  };

  const tracksList = ['All', 'Computer Courses', 'Programming', 'Data & Excel', 'Typing', 'Accounting', 'AI & ML', 'Cyber Security'];
  const levelsList = ['All', 'Beginner', 'Intermediate', 'All Levels', 'Beginner to Advanced'];
  const languagesList = ['All', 'English', 'Marathi', 'Hindi'];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ color: 'var(--primary-color)', fontSize: '2.2rem' }}>AIOCC Course Catalogue</h1>
        <p style={{ color: 'var(--text-muted)' }}>Browse our certified training courses and skill programs</p>
      </div>

      {/* FILTERS CARD */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>Filter Courses</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <div className="form-group">
            <label>Track / Category:</label>
            <select
              className="form-control"
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
            >
              {tracksList.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Skill Level:</label>
            <select
              className="form-control"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              {levelsList.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Medium / Language:</label>
            <select
              className="form-control"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              {languagesList.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* COURSE CARDS GRID */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading course catalogue...</div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : courses.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>No courses match the selected filters.</h3>
          <button
            onClick={() => { setSelectedTrack('All'); setSelectedLevel('All'); setSelectedLanguage('All'); }}
            className="btn btn-secondary"
            style={{ marginTop: '1rem' }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
