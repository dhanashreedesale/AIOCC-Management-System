import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const categories = [
    { title: 'Computer Courses', icon: '💻', desc: 'MS-CIT, IT Hardware & Network Support' },
    { title: 'Programming', icon: '⚡', desc: 'C, C++, Python & Logic Development' },
    { title: 'Data & Excel', icon: '📊', desc: 'Advanced Excel, VLOOKUP, Power Query' },
    { title: 'Typing', icon: '⌨️', desc: 'Govt. GCC-TBC English & Marathi Typing' },
    { title: 'Accounting', icon: '🧮', desc: 'Advanced Tally Prime with GST & BFSI' },
    { title: 'AI & ML', icon: '🤖', desc: 'Fundamentals of AI & Machine Learning' },
    { title: 'Cyber Security', icon: '🛡️', desc: 'Ethical Hacking & Network Defense' }
  ];

  return (
    <div>
      {/* HERO SECTION */}
      <section className="hero">
        <h1>Empowering Skills. Building Careers.</h1>
        <p>Computer Education, Government Typing and Career-Oriented Training</p>
        <div className="hero-actions">
          <Link to="/courses" className="btn btn-secondary">
            Explore Courses
          </Link>
          <Link to="/login" className="btn btn-primary" style={{ border: '2px solid white' }}>
            Login
          </Link>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        {/* ABOUT SECTION */}
        <section className="card" style={{ marginBottom: '3rem', padding: '2.5rem' }}>
          <h2 style={{ color: 'var(--primary-color)', fontSize: '1.8rem', marginBottom: '1rem' }}>
            About AIOCC
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: '1.7' }}>
            <strong>All In One Computer Center & Govt. Typing Institute (AIOCC)</strong> is a premier technical training institute dedicated to equipping students with industry-relevant computer skills and official government typing certifications. We offer practical, hands-on learning across software development, accounting, office automation, computer hardware, networking, and state-certified typing speed tests.
          </p>
        </section>

        {/* COURSE CATEGORIES */}
        <section>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ color: 'var(--primary-color)', fontSize: '1.8rem' }}>Course Categories</h2>
            <p style={{ color: 'var(--text-muted)' }}>Explore our range of government recognized and career-oriented programs</p>
          </div>

          <div className="grid-3">
            {categories.map((cat, idx) => (
              <div key={idx} className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                <div style={{ fontSize: '2.8rem', marginBottom: '0.75rem' }}>{cat.icon}</div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>{cat.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{cat.desc}</p>
                <div style={{ marginTop: '1.25rem' }}>
                  <Link to={`/courses?track=${encodeURIComponent(cat.title)}`} className="btn btn-sm btn-secondary">
                    View Courses →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
