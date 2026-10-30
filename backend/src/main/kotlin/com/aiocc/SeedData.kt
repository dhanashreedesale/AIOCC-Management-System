package com.aiocc

import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.slf4j.LoggerFactory

object SeedData {
    private val logger = LoggerFactory.getLogger(SeedData::class.java)

    fun initializeDatabaseAndSeed() {
        transaction {
            // Create tables if they do not exist
            SchemaUtils.createMissingTablesAndColumns(
                Users,
                Students,
                Courses,
                Batches,
                Enrollments,
                Attendance,
                Assessments,
                TypingTests,
                Certificates
            )

            // Seed only if empty
            if (Users.selectAll().count() == 0L) {
                logger.info("Seeding initial database records for AIOCC...")

                // 1. Users
                val adminId = Users.insert {
                    it[username] = "admin"
                    it[password] = PasswordHasher.hash("admin123")
                    it[role] = "ADMIN"
                    it[fullName] = "System Administrator"
                } get Users.id

                val facultyId = Users.insert {
                    it[username] = "faculty1"
                    it[password] = PasswordHasher.hash("faculty123")
                    it[role] = "FACULTY"
                    it[fullName] = "Prof. Rajesh Verma"
                } get Users.id

                val studentUserId = Users.insert {
                    it[username] = "student1"
                    it[password] = PasswordHasher.hash("student123")
                    it[role] = "STUDENT"
                    it[fullName] = "Rahul Sharma"
                } get Users.id

                // 2. Students
                val s1 = Students.insert {
                    it[name] = "Rahul Sharma"
                    it[contact] = "9876543210"
                    it[email] = "rahul.sharma@example.com"
                    it[stream] = "Science"
                    it[enrollmentDate] = "2026-01-15"
                } get Students.id

                val s2 = Students.insert {
                    it[name] = "Priya Patel"
                    it[contact] = "9876543211"
                    it[email] = "priya.patel@example.com"
                    it[stream] = "Commerce"
                    it[enrollmentDate] = "2026-01-20"
                } get Students.id

                val s3 = Students.insert {
                    it[name] = "Amit Kumar"
                    it[contact] = "9876543212"
                    it[email] = "amit.kumar@example.com"
                    it[stream] = "Arts"
                    it[enrollmentDate] = "2026-02-01"
                } get Students.id

                val s4 = Students.insert {
                    it[name] = "Sneha Kulkarni"
                    it[contact] = "9876543213"
                    it[email] = "sneha.k@example.com"
                    it[stream] = "Computer Science"
                    it[enrollmentDate] = "2026-02-05"
                } get Students.id

                val s5 = Students.insert {
                    it[name] = "Vikram Singh"
                    it[contact] = "9876543214"
                    it[email] = "vikram.singh@example.com"
                    it[stream] = "Engineering"
                    it[enrollmentDate] = "2026-02-10"
                } get Students.id

                // 3. Courses (All 13 courses)
                val c1 = Courses.insert {
                    it[name] = "MS-CIT"
                    it[track] = "Computer Courses"
                    it[durationHours] = 120
                    it[durationMonths] = 3
                    it[level] = "Beginner"
                    it[languages] = "English, Marathi, Hindi"
                    it[isNew] = false
                    it[description] = "Maharashtra State Certificate in Information Technology covering fundamentals, MS Office, and Internet literacy."
                } get Courses.id

                val c2 = Courses.insert {
                    it[name] = "Advanced Tally Prime"
                    it[track] = "Accounting"
                    it[durationHours] = 80
                    it[durationMonths] = 2
                    it[level] = "Intermediate"
                    it[languages] = "English, Hindi"
                    it[isNew] = true
                    it[description] = "Comprehensive GST accounting, inventory management, e-way bills, and payroll processing in Tally Prime."
                } get Courses.id

                val c3 = Courses.insert {
                    it[name] = "Govt. English Typing"
                    it[track] = "Typing"
                    it[durationHours] = 60
                    it[durationMonths] = 3
                    it[level] = "All Levels"
                    it[languages] = "English"
                    it[isNew] = false
                    it[description] = "Government recognized typing speed and accuracy course for GCC-TBC examinations (30 wpm & 40 wpm)."
                } get Courses.id

                val c4 = Courses.insert {
                    it[name] = "Govt. Marathi Typing"
                    it[track] = "Typing"
                    it[durationHours] = 60
                    it[durationMonths] = 3
                    it[level] = "All Levels"
                    it[languages] = "Marathi"
                    it[isNew] = false
                    it[description] = "Government recognized Marathi typing course using ISM keyboard layout for official state exams."
                } get Courses.id

                val c5 = Courses.insert {
                    it[name] = "C Programming"
                    it[track] = "Programming"
                    it[durationHours] = 50
                    it[durationMonths] = 2
                    it[level] = "Beginner"
                    it[languages] = "English"
                    it[isNew] = false
                    it[description] = "Core logic building, pointers, structures, memory management, and file handling in C language."
                } get Courses.id

                val c6 = Courses.insert {
                    it[name] = "C++ Programming"
                    it[track] = "Programming"
                    it[durationHours] = 60
                    it[durationMonths] = 2
                    it[level] = "Intermediate"
                    it[languages] = "English"
                    it[isNew] = false
                    it[description] = "Object Oriented Programming (OOP) concepts, classes, inheritance, polymorphism, and STL in C++."
                } get Courses.id

                val c7 = Courses.insert {
                    it[name] = "Python Programming"
                    it[track] = "Programming"
                    it[durationHours] = 80
                    it[durationMonths] = 2
                    it[level] = "Beginner to Advanced"
                    it[languages] = "English"
                    it[isNew] = true
                    it[description] = "Modern Python 3 development, data structures, automation scripts, OOP, and popular libraries."
                } get Courses.id

                val c8 = Courses.insert {
                    it[name] = "Advanced Excel"
                    it[track] = "Data & Excel"
                    it[durationHours] = 40
                    it[durationMonths] = 1
                    it[level] = "Intermediate"
                    it[languages] = "English, Hindi"
                    it[isNew] = false
                    it[description] = "VLOOKUP/XLOOKUP, Pivot tables, Power Query, Financial formulas, and VBA macro automation."
                } get Courses.id

                val c9 = Courses.insert {
                    it[name] = "BFSI"
                    it[track] = "Accounting"
                    it[durationHours] = 100
                    it[durationMonths] = 3
                    it[level] = "Intermediate"
                    it[languages] = "English"
                    it[isNew] = false
                    it[description] = "Banking, Financial Services, and Insurance fundamentals, compliance, and financial accounting."
                } get Courses.id

                val c10 = Courses.insert {
                    it[name] = "IT Hardware Support"
                    it[track] = "Computer Courses"
                    it[durationHours] = 90
                    it[durationMonths] = 3
                    it[level] = "Beginner"
                    it[languages] = "English, Hindi"
                    it[isNew] = false
                    it[description] = "Computer assembly, troubleshooting, OS installation, motherboard diagnostics, and device repair."
                } get Courses.id

                val c11 = Courses.insert {
                    it[name] = "IT Network Support"
                    it[track] = "Computer Courses"
                    it[durationHours] = 90
                    it[durationMonths] = 3
                    it[level] = "Intermediate"
                    it[languages] = "English"
                    it[isNew] = false
                    it[description] = "TCP/IP networking, router configuration, LAN/WAN setup, switches, and network security basics."
                } get Courses.id

                val c12 = Courses.insert {
                    it[name] = "Cyber Security"
                    it[track] = "Cyber Security"
                    it[durationHours] = 100
                    it[durationMonths] = 3
                    it[level] = "Intermediate"
                    it[languages] = "English"
                    it[isNew] = true
                    it[description] = "Ethical hacking concepts, network defense, web application security, cryptography, and digital forensics."
                } get Courses.id

                val c13 = Courses.insert {
                    it[name] = "AI-ML Basics"
                    it[track] = "AI & ML"
                    it[durationHours] = 80
                    it[durationMonths] = 2
                    it[level] = "Intermediate"
                    it[languages] = "English"
                    it[isNew] = true
                    it[description] = "Introductory Artificial Intelligence, Machine Learning algorithms, predictive modeling, and Scikit-Learn."
                } get Courses.id

                // 4. Batches
                val b1 = Batches.insert {
                    it[Batches.courseId] = c1 // MS-CIT
                    it[Batches.facultyId] = facultyId
                    it[Batches.startDate] = "2026-02-01"
                    it[Batches.schedule] = "Mon-Fri 09:00 AM - 11:00 AM"
                    it[Batches.capacity] = 30
                } get Batches.id

                val b2 = Batches.insert {
                    it[Batches.courseId] = c3 // Govt English Typing
                    it[Batches.facultyId] = facultyId
                    it[Batches.startDate] = "2026-02-01"
                    it[Batches.schedule] = "Mon-Sat 11:30 AM - 01:00 PM"
                    it[Batches.capacity] = 25
                } get Batches.id

                val b3 = Batches.insert {
                    it[Batches.courseId] = c7 // Python Programming
                    it[Batches.facultyId] = facultyId
                    it[Batches.startDate] = "2026-02-15"
                    it[Batches.schedule] = "Mon-Fri 04:00 PM - 06:00 PM"
                    it[Batches.capacity] = 20
                } get Batches.id

                // 5. Enrollments
                val e1 = Enrollments.insert {
                    it[studentId] = s1 // Rahul Sharma
                    it[batchId] = b1   // MS-CIT Batch
                    it[enrolledDate] = "2026-01-16"
                    it[status] = "ACTIVE"
                } get Enrollments.id

                val e2 = Enrollments.insert {
                    it[studentId] = s1 // Rahul Sharma
                    it[batchId] = b2   // Typing Batch
                    it[enrolledDate] = "2026-01-16"
                    it[status] = "ACTIVE"
                } get Enrollments.id

                val e3 = Enrollments.insert {
                    it[studentId] = s2 // Priya Patel
                    it[batchId] = b1   // MS-CIT Batch
                    it[enrolledDate] = "2026-01-21"
                    it[status] = "ACTIVE"
                } get Enrollments.id

                val e4 = Enrollments.insert {
                    it[studentId] = s3 // Amit Kumar
                    it[batchId] = b3   // Python Batch
                    it[enrolledDate] = "2026-02-02"
                    it[status] = "ACTIVE"
                } get Enrollments.id

                // 6. Attendance records for Rahul (e1 & e2)
                val dates = listOf("2026-02-02", "2026-02-03", "2026-02-04", "2026-02-05", "2026-02-06", "2026-02-09", "2026-02-10", "2026-02-11", "2026-02-12", "2026-02-13")
                dates.forEachIndexed { index, date ->
                    Attendance.insert {
                        it[enrollmentId] = e1
                        it[Attendance.date] = date
                        it[status] = if (index % 4 == 3) "ABSENT" else "PRESENT"
                    }
                    Attendance.insert {
                        it[enrollmentId] = e2
                        it[Attendance.date] = date
                        it[status] = "PRESENT"
                    }
                }

                // 7. Assessments for Rahul
                Assessments.insert {
                    it[enrollmentId] = e1
                    it[assessmentType] = "Unit Test 1"
                    it[marksObtained] = 45.0
                    it[maxMarks] = 50.0
                    it[assessedOn] = "2026-02-10"
                }

                Assessments.insert {
                    it[enrollmentId] = e1
                    it[assessmentType] = "Practical Assessment"
                    it[marksObtained] = 48.0
                    it[maxMarks] = 50.0
                    it[assessedOn] = "2026-02-14"
                }

                // 8. Typing Test for Rahul
                TypingTests.insert {
                    it[enrollmentId] = e2
                    it[language] = "English"
                    it[grossWpm] = 42.0
                    it[accuracy] = 95.0
                    it[netWpm] = 39.9
                    it[targetWpm] = 30.0
                    it[result] = "PASS"
                    it[testedOn] = "2026-02-12"
                }

                logger.info("Successfully seeded AIOCC database with demo users, courses, students, and records!")
            }
        }
    }
}
