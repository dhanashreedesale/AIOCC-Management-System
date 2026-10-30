package com.aiocc

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.Table

// ==========================================
// EXPOSED DATABASE TABLE DEFINITIONS
// ==========================================

object Users : Table("users") {
    val id = integer("id").autoIncrement()
    val username = varchar("username", 50).uniqueIndex()
    val password = varchar("password", 255)
    val role = varchar("role", 20) // ADMIN, FACULTY, STUDENT
    val fullName = varchar("full_name", 100)

    override val primaryKey = PrimaryKey(id)
}

object Students : Table("students") {
    val id = integer("id").autoIncrement()
    val name = varchar("name", 100)
    val contact = varchar("contact", 20)
    val email = varchar("email", 100)
    val stream = varchar("stream", 50)
    val enrollmentDate = varchar("enrollment_date", 20)

    override val primaryKey = PrimaryKey(id)
}

object Courses : Table("courses") {
    val id = integer("id").autoIncrement()
    val name = varchar("name", 150)
    val track = varchar("track", 100)
    val durationHours = integer("duration_hours")
    val durationMonths = integer("duration_months")
    val level = varchar("level", 50)
    val languages = varchar("languages", 100)
    val isNew = bool("is_new").default(false)
    val description = text("description")

    override val primaryKey = PrimaryKey(id)
}

object Batches : Table("batches") {
    val id = integer("id").autoIncrement()
    val courseId = integer("course_id").references(Courses.id)
    val facultyId = integer("faculty_id").references(Users.id)
    val startDate = varchar("start_date", 20)
    val schedule = varchar("schedule", 100)
    val capacity = integer("capacity")

    override val primaryKey = PrimaryKey(id)
}

object Enrollments : Table("enrollments") {
    val id = integer("id").autoIncrement()
    val studentId = integer("student_id").references(Students.id)
    val batchId = integer("batch_id").references(Batches.id)
    val enrolledDate = varchar("enrolled_date", 20)
    val status = varchar("status", 20) // ACTIVE, COMPLETED, DROPPED

    override val primaryKey = PrimaryKey(id)
}

object Attendance : Table("attendance") {
    val id = integer("id").autoIncrement()
    val enrollmentId = integer("enrollment_id").references(Enrollments.id)
    val date = varchar("date", 20)
    val status = varchar("status", 20) // PRESENT, ABSENT

    override val primaryKey = PrimaryKey(id)
}

object Assessments : Table("assessments") {
    val id = integer("id").autoIncrement()
    val enrollmentId = integer("enrollment_id").references(Enrollments.id)
    val assessmentType = varchar("assessment_type", 50) // MIDTERM, FINAL, PRACTICAL, QUIZ
    val marksObtained = double("marks_obtained")
    val maxMarks = double("max_marks")
    val assessedOn = varchar("assessed_on", 20)

    override val primaryKey = PrimaryKey(id)
}

object TypingTests : Table("typing_tests") {
    val id = integer("id").autoIncrement()
    val enrollmentId = integer("enrollment_id").references(Enrollments.id)
    val language = varchar("language", 50) // English, Marathi
    val grossWpm = double("gross_wpm")
    val accuracy = double("accuracy")
    val netWpm = double("net_wpm")
    val targetWpm = double("target_wpm")
    val result = varchar("result", 10) // PASS, FAIL
    val testedOn = varchar("tested_on", 20)

    override val primaryKey = PrimaryKey(id)
}

object Certificates : Table("certificates") {
    val id = integer("id").autoIncrement()
    val studentId = integer("student_id").references(Students.id)
    val courseId = integer("course_id").references(Courses.id)
    val issuedDate = varchar("issued_date", 20)
    val certificateNumber = varchar("certificate_number", 50)

    override val primaryKey = PrimaryKey(id)
}

// ==========================================
// KOTLIN SERIALIZABLE DATA TRANSFER OBJECTS (DTOs)
// ==========================================

@Serializable
data class LoginRequest(
    val username: String,
    val password: String
)

@Serializable
data class LoginResponse(
    val token: String,
    val role: String,
    val fullName: String,
    val userId: Int,
    val studentId: Int? = null
)

@Serializable
data class RegisterRequest(
    val username: String,
    val password: String,
    val role: String,
    val fullName: String
)

@Serializable
data class UserDto(
    val id: Int,
    val username: String,
    val role: String,
    val fullName: String
)

@Serializable
data class StudentDto(
    val id: Int,
    val name: String,
    val contact: String,
    val email: String,
    val stream: String,
    val enrollmentDate: String
)

@Serializable
data class StudentRequest(
    val name: String,
    val contact: String,
    val email: String,
    val stream: String,
    val enrollmentDate: String
)

@Serializable
data class CourseDto(
    val id: Int,
    val name: String,
    val track: String,
    val durationHours: Int,
    val durationMonths: Int,
    val level: String,
    val languages: String,
    val isNew: Boolean,
    val description: String
)

@Serializable
data class CourseRequest(
    val name: String,
    val track: String,
    val durationHours: Int,
    val durationMonths: Int,
    val level: String,
    val languages: String,
    val isNew: Boolean = false,
    val description: String
)

@Serializable
data class BatchDto(
    val id: Int,
    val courseId: Int,
    val courseName: String = "",
    val facultyId: Int,
    val facultyName: String = "",
    val startDate: String,
    val schedule: String,
    val capacity: Int
)

@Serializable
data class BatchRequest(
    val courseId: Int,
    val facultyId: Int,
    val startDate: String,
    val schedule: String,
    val capacity: Int
)

@Serializable
data class EnrollmentDto(
    val id: Int,
    val studentId: Int,
    val studentName: String = "",
    val batchId: Int,
    val courseName: String = "",
    val enrolledDate: String,
    val status: String
)

@Serializable
data class EnrollmentRequest(
    val studentId: Int,
    val batchId: Int,
    val enrolledDate: String,
    val status: String = "ACTIVE"
)

@Serializable
data class AttendanceDto(
    val id: Int,
    val enrollmentId: Int,
    val studentName: String = "",
    val date: String,
    val status: String
)

@Serializable
data class AttendanceRequest(
    val enrollmentId: Int,
    val date: String,
    val status: String // PRESENT or ABSENT
)

@Serializable
data class AttendanceSummaryDto(
    val enrollmentId: Int,
    val totalClasses: Int,
    val presentClasses: Int,
    val attendancePercentage: Double,
    val history: List<AttendanceDto>
)

@Serializable
data class AssessmentDto(
    val id: Int,
    val enrollmentId: Int,
    val assessmentType: String,
    val marksObtained: Double,
    val maxMarks: Double,
    val assessedOn: String
)

@Serializable
data class AssessmentRequest(
    val enrollmentId: Int,
    val assessmentType: String,
    val marksObtained: Double,
    val maxMarks: Double,
    val assessedOn: String
)

@Serializable
data class TypingTestDto(
    val id: Int,
    val enrollmentId: Int,
    val language: String,
    val grossWpm: Double,
    val accuracy: Double,
    val netWpm: Double,
    val targetWpm: Double,
    val result: String,
    val testedOn: String
)

@Serializable
data class TypingTestRequest(
    val enrollmentId: Int,
    val language: String,
    val grossWpm: Double,
    val accuracy: Double,
    val targetWpm: Double,
    val testedOn: String
)

@Serializable
data class CertificateDto(
    val id: Int,
    val studentId: Int,
    val studentName: String = "",
    val courseId: Int,
    val courseName: String = "",
    val issuedDate: String,
    val certificateNumber: String
)

@Serializable
data class CertificateRequest(
    val studentId: Int,
    val courseId: Int,
    val issuedDate: String,
    val certificateNumber: String
)

@Serializable
data class AdminDashboardStats(
    val totalStudents: Long,
    val totalCourses: Long,
    val totalBatches: Long,
    val totalEnrollments: Long
)

@Serializable
data class MessageResponse(
    val message: String
)

@Serializable
data class ErrorResponse(
    val error: String
)
