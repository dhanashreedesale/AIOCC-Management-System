# All In One Computer Center & Govt. Typing Institute (AIOCC) Management System
> **Complete Web & Mobile Development (WMD) College Project**

The **AIOCC Student & Course Management System** is a full-stack educational institute management platform built for WMD practical experiments and viva demonstration. It features a React SPA frontend, a Kotlin Ktor REST API backend, Exposed ORM database mapping, BCrypt password security, JWT authentication, and persistent MySQL storage.

---

## 🚀 Quick Start Guide

### Prerequisites
Ensure the following tools are installed on your machine:
- **Java JDK 17+**
- **Node.js v18+ & npm**

---

### 1. Database Setup
The backend runs with a persistent local H2 database by default. It creates `backend/data/aiocc_db.mv.db` automatically, so MySQL is not required for local development. The file is resolved from the backend project location (not the terminal's current directory), so launching the app from the repository root or `backend` uses the same database. Demo records are added only when the users table is empty; later launches do not reset saved records.

To use MySQL instead, set these environment variables before starting the backend. Use credentials for a MySQL account that can access the `aiocc_db` database; do not put real passwords in source files:

```powershell
$env:DB_URL = "jdbc:mysql://localhost:3306/aiocc_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:DB_DRIVER = "com.mysql.cj.jdbc.Driver"
$env:DB_USER = "your-mysql-user"
$env:DB_PASSWORD = "your-mysql-password"
$env:JWT_SECRET = "your-random-secret-at-least-32-characters-long"
```

If `JWT_SECRET` is not set, the backend generates a random signing secret at startup; tokens will become invalid after a restart. Set a stable secret for persistent sessions.

The backend automatically creates all 9 required tables and seeds sample initial records on first launch. If a configured database cannot be reached, backend startup fails with a database initialization error rather than switching to a temporary database.

---

### 2. Backend Setup (Kotlin & Ktor)

Open a terminal window and navigate to the `backend` folder:

```powershell
cd backend
.\gradlew.bat run
```

The Ktor server will compile, connect to the local H2 database (or the database configured through the environment variables above), seed demo data on first launch, and run on:
👉 **`http://localhost:8080`**

---

### 3. Frontend Setup (React & Vite)

Open a second terminal window and navigate to the `frontend` folder:

```powershell
cd frontend
npm install
npm run dev
```

The React Vite development server will launch on:
👉 **`http://localhost:5173`**

---

## 🔑 Demo Login Credentials

Test accounts are seeded into MySQL with BCrypt-hashed passwords. Quick-fill buttons are also available on the `/login` page:

| Role | Username | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin` | `admin123` | Full system control, Student & Course CRUD, Batches & Enrollments |
| **FACULTY** | `faculty1` | `faculty123` | View assigned batches, Mark Attendance, Enter Assessment Grades, Record Typing Tests |
| **STUDENT** | `student1` | `student123` | View personal enrolled courses, attendance summary %, exam marks, and typing test scores |

---

## 🛠️ Technology Stack & Architecture

```
React Frontend (Vite)  ──[ Axios + JWT Header ]──>  Kotlin Ktor REST API
                                                            │
                                                     Exposed ORM (HikariCP)
                                                            │
                                                     MySQL Database (`aiocc_db`)
```

- **Frontend**: React 18, Vite, React Router v6, Axios, Vanilla CSS (Color palette: `#0d47a1` primary, `#f4f6fa` background).
- **Backend**: Kotlin 1.9, Ktor 2.3 (Netty), ContentNegotiation (JSON), CORS, BCrypt, JWT Authentication.
- **Database**: Exposed ORM 0.45, HikariCP pool, MySQL 8.0.

---

## 📋 WMD Practical Experiment Mapping

This project is specifically structured to demonstrate your WMD practical experiments:

### 1. Experiments 2–3 — React Frontend Development
- **Demonstrated through**:
  - Reusable React components (`Navbar`, `Sidebar`, `CourseCard`, `StudentTable`, `ProtectedRoute`).
  - React Props and State (`useState`, `useEffect`).
  - Dynamic route rendering (`react-router-dom`).
  - Declarative form inputs and conditional rendering.
  - Interactive course filtering by track, level, and language using `map()`.

### 2. Experiment 6 — Backend Development with Kotlin & Ktor
- **Demonstrated through**:
  - Embedded Netty server setup in `Application.kt`.
  - Ktor routing DSL for REST endpoints in `Routes.kt`.
  - JSON serialization via ContentNegotiation.
  - StatusPages error handling returning HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`).

### 3. Experiment 7 — Database Integration & ORM
- **Demonstrated through**:
  - Relational database schema mapping with Exposed ORM (`Users`, `Students`, `Courses`, `Batches`, `Enrollments`, `Attendance`, `Assessments`, `TypingTests`, `Certificates`).
  - Persistent CRUD operations ensuring data persists across page refreshes.
  - Connection pooling with HikariCP.

### 4. Experiment 8 — Authentication & Authorization
- **Demonstrated through**:
  - Secure password hashing using BCrypt (`BCrypt.hashpw`).
  - Stateless JWT token issuing containing username, role, and fullName claims.
  - Role-based route protection on frontend (`ProtectedRoute`) AND role verification on backend REST endpoints.

### 5. Experiment 9 — Complete End-to-End System Integration
- **Demonstrated through**:
  - Seamless full-stack integration: React UI trigger -> Axios HTTP request with JWT token -> Ktor route -> Exposed SQL query -> MySQL database persistence -> JSON response -> React UI state update.

---

## 📑 REST API Endpoint Summary

### Public Endpoints
- `GET /api/public/courses` — Get list of public courses with filters (`track`, `level`, `language`)
- `GET /api/public/courses/tracks` — Get list of course category tracks

### Authentication
- `POST /api/auth/login` — Authenticate user, returns JWT token and role
- `POST /api/auth/register` — Register new user account

### Admin & Student Management
- `GET /api/admin/stats` — Admin dashboard summary counts
- `GET /api/students` — List all students
- `GET /api/students/{id}` — Get student details
- `POST /api/students` — Create new student
- `PUT /api/students/{id}` — Update student info
- `DELETE /api/students/{id}` — Delete student

### Course Management
- `GET /api/courses` — Get all courses
- `POST /api/courses` — Add new course
- `PUT /api/courses/{id}` — Edit course
- `DELETE /api/courses/{id}` — Delete course

### Attendance Module
- `POST /api/attendance/mark` — Mark attendance (PRESENT / ABSENT)
- `GET /api/attendance/enrollment/{id}` — Get student attendance history
- `GET /api/attendance/enrollment/{id}/summary` — Get attendance percentage summary `(present/total) * 100`

### Grades & Assessment Module
- `POST /api/grades/assessment` — Enter exam/assessment marks
- `GET /api/grades/enrollment/{id}/assessments` — List student assessment marks

### Typing Test Module
- `POST /api/grades/typing-test` — Calculate `Net WPM = Gross WPM * Accuracy / 100` and record PASS/FAIL
- `GET /api/grades/enrollment/{id}/typing` — Get student typing performance history

### Batches & Enrollments
- `GET /api/batches` — List batches
- `POST /api/batches` — Create batch
- `GET /api/enrollments` — List enrollments
- `POST /api/enrollments` — Enroll student in batch
- `GET /api/student/dashboard/{username}` — Fetch student personal dashboard data

---

## 🎓 Viva Explanation Guide

If asked by your examiner to explain how data flows in the system:
1. **User Action**: The admin submits a new student form in React (`Students.jsx`).
2. **State & API**: React `useState` captures form data. An Axios POST call is dispatched to `http://localhost:8080/api/students` with the stored JWT Bearer token in the HTTP `Authorization` header.
3. **Backend Middleware**: Ktor receives the request, verifies the JWT token signature using HMAC256, and extracts the user's `ADMIN` role claim.
4. **ORM & MySQL Execution**: In `Routes.kt`, the handler invokes `DatabaseFactory.dbQuery`. Exposed ORM builds an `INSERT INTO students (...) VALUES (...)` SQL statement executed against MySQL database `aiocc_db`.
5. **Response & Render**: MySQL returns the auto-generated primary key ID. Ktor returns a `201 Created` JSON payload. React receives the HTTP response, updates its `students` state array, and triggers a re-render showing the updated table.
