import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Courses from './pages/Courses';
import Login from './pages/Login';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import Students from './pages/Students';
import CoursesAdmin from './pages/CoursesAdmin';
import BatchesAdmin from './pages/BatchesAdmin';
import EnrollmentsAdmin from './pages/EnrollmentsAdmin';

// Faculty Pages
import FacultyDashboard from './pages/FacultyDashboard';
import Attendance from './pages/Attendance';
import Grades from './pages/Grades';
import TypingTest from './pages/TypingTest';


export default function App() {
  return (
    <div className="app-container">
      <Navbar />

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/login" element={<Login />} />

        {/* ADMIN PROTECTED ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<Students />} />
          <Route path="/admin/courses" element={<CoursesAdmin />} />
          <Route path="/admin/batches" element={<BatchesAdmin />} />
          <Route path="/admin/enrollments" element={<EnrollmentsAdmin />} />
        </Route>

        {/* FACULTY PROTECTED ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']} />}>
          <Route path="/faculty" element={<FacultyDashboard />} />
          <Route path="/faculty/attendance" element={<Attendance />} />
          <Route path="/faculty/grades" element={<Grades />} />
          <Route path="/faculty/typing" element={<TypingTest />} />
        </Route>

        {/* FALLBACK CATCH-ALL */}
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}
