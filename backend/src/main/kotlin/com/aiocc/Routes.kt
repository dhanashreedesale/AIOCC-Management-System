package com.aiocc

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq

fun Routing.configureRoutes(jwtConfig: JwtConfig) {

    get("/") {
        call.respond(HttpStatusCode.OK, mapOf("status" to "ok", "service" to "aiocc-backend"))
    }

    route("/api") {
        get("/health") {
            call.respond(HttpStatusCode.OK, mapOf("status" to "ok", "service" to "aiocc-backend"))
        }
    }

    // ==========================================
    // PUBLIC ROUTES (No JWT required)
    // ==========================================
    route("/api/public") {
        // GET /api/public/courses
        get("/courses") {
            val trackFilter = call.request.queryParameters["track"]
            val levelFilter = call.request.queryParameters["level"]
            val langFilter = call.request.queryParameters["language"]

            val coursesList = DatabaseFactory.dbQuery {
                val query = Courses.selectAll()
                trackFilter?.takeIf { it.isNotBlank() && it != "All" }?.let { t ->
                    query.andWhere { Courses.track eq t }
                }
                levelFilter?.takeIf { it.isNotBlank() && it != "All" }?.let { l ->
                    query.andWhere { Courses.level eq l }
                }
                langFilter?.takeIf { it.isNotBlank() && it != "All" }?.let { lang ->
                    query.andWhere { Courses.languages like "%$lang%" }
                }

                query.map { row ->
                    CourseDto(
                        id = row[Courses.id],
                        name = row[Courses.name],
                        track = row[Courses.track],
                        durationHours = row[Courses.durationHours],
                        durationMonths = row[Courses.durationMonths],
                        level = row[Courses.level],
                        languages = row[Courses.languages],
                        isNew = row[Courses.isNew],
                        description = row[Courses.description]
                    )
                }
            }
            call.respond(HttpStatusCode.OK, coursesList)
        }

        // GET /api/public/courses/tracks
        get("/courses/tracks") {
            val tracks = DatabaseFactory.dbQuery {
                Courses.slice(Courses.track).selectAll().withDistinct().map { it[Courses.track] }
            }
            call.respond(HttpStatusCode.OK, tracks)
        }
    }

    // AUTH ROUTES
    route("/api/auth") {
        // POST /api/auth/login
        post("/login") {
            val req = call.receive<LoginRequest>()
            if (req.username.isBlank() || req.password.isBlank()) {
                call.respond(HttpStatusCode.BadRequest, ErrorResponse("Username and password are required."))
                return@post
            }

            val userRow = DatabaseFactory.dbQuery {
                Users.select { Users.username eq req.username }.singleOrNull()
            }

            if (userRow == null) {
                call.respond(HttpStatusCode.Unauthorized, ErrorResponse("Invalid username or password."))
                return@post
            }

            val storedHash = userRow[Users.password]
            if (!PasswordHasher.verify(req.password, storedHash)) {
                call.respond(HttpStatusCode.Unauthorized, ErrorResponse("Invalid username or password."))
                return@post
            }

            val userId = userRow[Users.id]
            val username = userRow[Users.username]
            val role = userRow[Users.role]
            val fullName = userRow[Users.fullName]

            // Find matching student ID if user is STUDENT
            val studentId = if (role == "STUDENT") {
                DatabaseFactory.dbQuery {
                    Students.select { Students.name eq fullName }.singleOrNull()?.get(Students.id)
                }
            } else null

            val token = jwtConfig.generateToken(username, role, fullName, userId)
            call.respond(HttpStatusCode.OK, LoginResponse(token, role, fullName, userId, studentId))
        }

        // POST /api/auth/register
        post("/register") {
            val req = call.receive<RegisterRequest>()
            val existing = DatabaseFactory.dbQuery {
                Users.select { Users.username eq req.username }.singleOrNull()
            }
            if (existing != null) {
                call.respond(HttpStatusCode.BadRequest, ErrorResponse("Username already exists."))
                return@post
            }

            val newId = DatabaseFactory.dbQuery {
                Users.insert {
                    it[username] = req.username
                    it[password] = PasswordHasher.hash(req.password)
                    it[role] = req.role.uppercase()
                    it[fullName] = req.fullName
                } get Users.id
            }

            call.respond(HttpStatusCode.Created, MessageResponse("User registered successfully with ID: $newId"))
        }
    }

    // ==========================================
    // PROTECTED ROUTES (JWT required)
    // ==========================================
    authenticate("auth-jwt") {

        // ADMIN STATS
        get("/api/admin/stats") {
            val principal = call.principal<JWTPrincipal>()
            val role = principal?.payload?.getClaim("role")?.asString()
            if (role != "ADMIN") {
                call.respond(HttpStatusCode.Forbidden, ErrorResponse("Admin access required."))
                return@get
            }

            val stats = DatabaseFactory.dbQuery {
                AdminDashboardStats(
                    totalStudents = Students.selectAll().count(),
                    totalCourses = Courses.selectAll().count(),
                    totalBatches = Batches.selectAll().count(),
                    totalEnrollments = Enrollments.selectAll().count()
                )
            }
            call.respond(HttpStatusCode.OK, stats)
        }

        // STUDENTS CRUD
        route("/api/students") {
            // GET /api/students
            get {
                val studentsList = DatabaseFactory.dbQuery {
                    Students.selectAll().map {
                        StudentDto(
                            id = it[Students.id],
                            name = it[Students.name],
                            contact = it[Students.contact],
                            email = it[Students.email],
                            stream = it[Students.stream],
                            enrollmentDate = it[Students.enrollmentDate]
                        )
                    }
                }
                call.respond(HttpStatusCode.OK, studentsList)
            }

            // GET /api/students/{id}
            get("/{id}") {
                val id = call.parameters["id"]?.toIntOrNull()
                if (id == null) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid Student ID"))
                    return@get
                }
                val student = DatabaseFactory.dbQuery {
                    Students.select { Students.id eq id }.singleOrNull()?.let {
                        StudentDto(
                            id = it[Students.id],
                            name = it[Students.name],
                            contact = it[Students.contact],
                            email = it[Students.email],
                            stream = it[Students.stream],
                            enrollmentDate = it[Students.enrollmentDate]
                        )
                    }
                }
                if (student == null) {
                    call.respond(HttpStatusCode.NotFound, ErrorResponse("Student not found"))
                } else {
                    call.respond(HttpStatusCode.OK, student)
                }
            }

            // POST /api/students
            post {
                val principal = call.principal<JWTPrincipal>()
                val role = principal?.payload?.getClaim("role")?.asString()
                if (role != "ADMIN") {
                    call.respond(HttpStatusCode.Forbidden, ErrorResponse("Only ADMIN can create students."))
                    return@post
                }

                val req = call.receive<StudentRequest>()
                if (req.name.isBlank() || req.contact.isBlank() || req.email.isBlank()) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Name, Contact, and Email cannot be empty."))
                    return@post
                }

                val newId = DatabaseFactory.dbQuery {
                    Students.insert {
                        it[name] = req.name
                        it[contact] = req.contact
                        it[email] = req.email
                        it[stream] = req.stream
                        it[enrollmentDate] = req.enrollmentDate
                    } get Students.id
                }

                call.respond(HttpStatusCode.Created, MessageResponse("Student created successfully with ID: $newId"))
            }

            // PUT /api/students/{id}
            put("/{id}") {
                val principal = call.principal<JWTPrincipal>()
                val role = principal?.payload?.getClaim("role")?.asString()
                if (role != "ADMIN") {
                    call.respond(HttpStatusCode.Forbidden, ErrorResponse("Only ADMIN can update students."))
                    return@put
                }

                val id = call.parameters["id"]?.toIntOrNull()
                if (id == null) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid Student ID"))
                    return@put
                }

                val req = call.receive<StudentRequest>()
                val updated = DatabaseFactory.dbQuery {
                    Students.update({ Students.id eq id }) {
                        it[name] = req.name
                        it[contact] = req.contact
                        it[email] = req.email
                        it[stream] = req.stream
                        it[enrollmentDate] = req.enrollmentDate
                    }
                }

                if (updated > 0) {
                    call.respond(HttpStatusCode.OK, MessageResponse("Student updated successfully."))
                } else {
                    call.respond(HttpStatusCode.NotFound, ErrorResponse("Student not found."))
                }
            }

            // DELETE /api/students/{id}
            delete("/{id}") {
                val principal = call.principal<JWTPrincipal>()
                val role = principal?.payload?.getClaim("role")?.asString()
                if (role != "ADMIN") {
                    call.respond(HttpStatusCode.Forbidden, ErrorResponse("Only ADMIN can delete students."))
                    return@delete
                }

                val id = call.parameters["id"]?.toIntOrNull()
                if (id == null) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid Student ID"))
                    return@delete
                }

                val deleted = DatabaseFactory.dbQuery {
                    Students.deleteWhere { Students.id eq id }
                }

                if (deleted > 0) {
                    call.respond(HttpStatusCode.OK, MessageResponse("Student deleted successfully."))
                } else {
                    call.respond(HttpStatusCode.NotFound, ErrorResponse("Student not found."))
                }
            }
        }

        // COURSES CRUD
        route("/api/courses") {
            // GET /api/courses
            get {
                val coursesList = DatabaseFactory.dbQuery {
                    Courses.selectAll().map {
                        CourseDto(
                            id = it[Courses.id],
                            name = it[Courses.name],
                            track = it[Courses.track],
                            durationHours = it[Courses.durationHours],
                            durationMonths = it[Courses.durationMonths],
                            level = it[Courses.level],
                            languages = it[Courses.languages],
                            isNew = it[Courses.isNew],
                            description = it[Courses.description]
                        )
                    }
                }
                call.respond(HttpStatusCode.OK, coursesList)
            }

            // POST /api/courses
            post {
                val principal = call.principal<JWTPrincipal>()
                val role = principal?.payload?.getClaim("role")?.asString()
                if (role != "ADMIN") {
                    call.respond(HttpStatusCode.Forbidden, ErrorResponse("Only ADMIN can add courses."))
                    return@post
                }

                val req = call.receive<CourseRequest>()
                if (req.name.isBlank()) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Course name cannot be empty."))
                    return@post
                }

                val newId = DatabaseFactory.dbQuery {
                    Courses.insert {
                        it[name] = req.name
                        it[track] = req.track
                        it[durationHours] = req.durationHours
                        it[durationMonths] = req.durationMonths
                        it[level] = req.level
                        it[languages] = req.languages
                        it[isNew] = req.isNew
                        it[description] = req.description
                    } get Courses.id
                }

                call.respond(HttpStatusCode.Created, MessageResponse("Course created successfully with ID: $newId"))
            }

            // PUT /api/courses/{id}
            put("/{id}") {
                val principal = call.principal<JWTPrincipal>()
                val role = principal?.payload?.getClaim("role")?.asString()
                if (role != "ADMIN") {
                    call.respond(HttpStatusCode.Forbidden, ErrorResponse("Only ADMIN can edit courses."))
                    return@put
                }

                val id = call.parameters["id"]?.toIntOrNull()
                if (id == null) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid Course ID"))
                    return@put
                }

                val req = call.receive<CourseRequest>()
                val updated = DatabaseFactory.dbQuery {
                    Courses.update({ Courses.id eq id }) {
                        it[name] = req.name
                        it[track] = req.track
                        it[durationHours] = req.durationHours
                        it[durationMonths] = req.durationMonths
                        it[level] = req.level
                        it[languages] = req.languages
                        it[isNew] = req.isNew
                        it[description] = req.description
                    }
                }

                if (updated > 0) {
                    call.respond(HttpStatusCode.OK, MessageResponse("Course updated successfully."))
                } else {
                    call.respond(HttpStatusCode.NotFound, ErrorResponse("Course not found."))
                }
            }

            // DELETE /api/courses/{id}
            delete("/{id}") {
                val principal = call.principal<JWTPrincipal>()
                val role = principal?.payload?.getClaim("role")?.asString()
                if (role != "ADMIN") {
                    call.respond(HttpStatusCode.Forbidden, ErrorResponse("Only ADMIN can delete courses."))
                    return@delete
                }

                val id = call.parameters["id"]?.toIntOrNull()
                if (id == null) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid Course ID"))
                    return@delete
                }

                val deleted = DatabaseFactory.dbQuery {
                    Courses.deleteWhere { Courses.id eq id }
                }

                if (deleted > 0) {
                    call.respond(HttpStatusCode.OK, MessageResponse("Course deleted successfully."))
                } else {
                    call.respond(HttpStatusCode.NotFound, ErrorResponse("Course not found."))
                }
            }
        }

        // BATCHES CRUD
        route("/api/batches") {
            get {
                val batches = DatabaseFactory.dbQuery {
                    (Batches innerJoin Courses innerJoin Users)
                        .selectAll()
                        .map {
                            BatchDto(
                                id = it[Batches.id],
                                courseId = it[Batches.courseId],
                                courseName = it[Courses.name],
                                facultyId = it[Batches.facultyId],
                                facultyName = it[Users.fullName],
                                startDate = it[Batches.startDate],
                                schedule = it[Batches.schedule],
                                capacity = it[Batches.capacity]
                            )
                        }
                }
                call.respond(HttpStatusCode.OK, batches)
            }

            post {
                val principal = call.principal<JWTPrincipal>()
                val role = principal?.payload?.getClaim("role")?.asString()
                if (role != "ADMIN") {
                    call.respond(HttpStatusCode.Forbidden, ErrorResponse("Only ADMIN can create batches."))
                    return@post
                }

                val req = call.receive<BatchRequest>()
                val newId = DatabaseFactory.dbQuery {
                    Batches.insert {
                        it[courseId] = req.courseId
                        it[facultyId] = req.facultyId
                        it[startDate] = req.startDate
                        it[schedule] = req.schedule
                        it[capacity] = req.capacity
                    } get Batches.id
                }
                call.respond(HttpStatusCode.Created, MessageResponse("Batch created successfully with ID: $newId"))
            }
        }

        // ENROLLMENTS
        route("/api/enrollments") {
            get {
                val list = DatabaseFactory.dbQuery {
                    (Enrollments innerJoin Students innerJoin Batches innerJoin Courses)
                        .selectAll()
                        .map {
                            EnrollmentDto(
                                id = it[Enrollments.id],
                                studentId = it[Enrollments.studentId],
                                studentName = it[Students.name],
                                batchId = it[Enrollments.batchId],
                                courseName = it[Courses.name],
                                enrolledDate = it[Enrollments.enrolledDate],
                                status = it[Enrollments.status]
                            )
                        }
                }
                call.respond(HttpStatusCode.OK, list)
            }

            post {
                val principal = call.principal<JWTPrincipal>()
                val role = principal?.payload?.getClaim("role")?.asString()
                if (role != "ADMIN") {
                    call.respond(HttpStatusCode.Forbidden, ErrorResponse("Only ADMIN can enroll students."))
                    return@post
                }

                val req = call.receive<EnrollmentRequest>()
                val newId = DatabaseFactory.dbQuery {
                    Enrollments.insert {
                        it[studentId] = req.studentId
                        it[batchId] = req.batchId
                        it[enrolledDate] = req.enrolledDate
                        it[status] = req.status
                    } get Enrollments.id
                }
                call.respond(HttpStatusCode.Created, MessageResponse("Student enrolled successfully with ID: $newId"))
            }
        }

        // ATTENDANCE MODULE
        route("/api/attendance") {
            // POST /api/attendance/mark
            post("/mark") {
                val principal = call.principal<JWTPrincipal>()
                val role = principal?.payload?.getClaim("role")?.asString()
                if (role != "ADMIN" && role != "FACULTY") {
                    call.respond(HttpStatusCode.Forbidden, ErrorResponse("Only Faculty or Admin can mark attendance."))
                    return@post
                }

                val req = call.receive<AttendanceRequest>()
                val newId = DatabaseFactory.dbQuery {
                    Attendance.insert {
                        it[enrollmentId] = req.enrollmentId
                        it[date] = req.date
                        it[status] = req.status.uppercase()
                    } get Attendance.id
                }
                call.respond(HttpStatusCode.Created, MessageResponse("Attendance marked successfully."))
            }

            // GET /api/attendance/enrollment/{id}
            get("/enrollment/{id}") {
                val enrollmentId = call.parameters["id"]?.toIntOrNull()
                if (enrollmentId == null) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid Enrollment ID"))
                    return@get
                }

                val history = DatabaseFactory.dbQuery {
                    (Attendance innerJoin Enrollments innerJoin Students)
                        .select { Attendance.enrollmentId eq enrollmentId }
                        .map {
                            AttendanceDto(
                                id = it[Attendance.id],
                                enrollmentId = it[Attendance.enrollmentId],
                                studentName = it[Students.name],
                                date = it[Attendance.date],
                                status = it[Attendance.status]
                            )
                        }
                }
                call.respond(HttpStatusCode.OK, history)
            }

            // GET /api/attendance/enrollment/{id}/summary
            get("/enrollment/{id}/summary") {
                val enrollmentId = call.parameters["id"]?.toIntOrNull()
                if (enrollmentId == null) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid Enrollment ID"))
                    return@get
                }

                val summary = DatabaseFactory.dbQuery {
                    val rows = (Attendance innerJoin Enrollments innerJoin Students)
                        .select { Attendance.enrollmentId eq enrollmentId }
                        .map {
                            AttendanceDto(
                                id = it[Attendance.id],
                                enrollmentId = it[Attendance.enrollmentId],
                                studentName = it[Students.name],
                                date = it[Attendance.date],
                                status = it[Attendance.status]
                            )
                        }

                    val total = rows.size
                    val present = rows.count { it.status == "PRESENT" }
                    val percentage = if (total > 0) (present.toDouble() / total.toDouble()) * 100.0 else 0.0

                    AttendanceSummaryDto(
                        enrollmentId = enrollmentId,
                        totalClasses = total,
                        presentClasses = present,
                        attendancePercentage = String.format("%.2f", percentage).toDouble(),
                        history = rows
                    )
                }
                call.respond(HttpStatusCode.OK, summary)
            }
        }

        // GRADES & ASSESSMENTS MODULE
        route("/api/grades") {
            // POST /api/grades/assessment
            post("/assessment") {
                val principal = call.principal<JWTPrincipal>()
                val role = principal?.payload?.getClaim("role")?.asString()
                if (role != "ADMIN" && role != "FACULTY") {
                    call.respond(HttpStatusCode.Forbidden, ErrorResponse("Only Faculty or Admin can enter grades."))
                    return@post
                }

                val req = call.receive<AssessmentRequest>()
                if (req.marksObtained > req.maxMarks) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Marks obtained cannot exceed maximum marks."))
                    return@post
                }

                val newId = DatabaseFactory.dbQuery {
                    Assessments.insert {
                        it[enrollmentId] = req.enrollmentId
                        it[assessmentType] = req.assessmentType
                        it[marksObtained] = req.marksObtained
                        it[maxMarks] = req.maxMarks
                        it[assessedOn] = req.assessedOn
                    } get Assessments.id
                }

                call.respond(HttpStatusCode.Created, MessageResponse("Assessment grade entered successfully with ID: $newId"))
            }

            // GET /api/grades/enrollment/{id}/assessments
            get("/enrollment/{id}/assessments") {
                val enrollmentId = call.parameters["id"]?.toIntOrNull()
                if (enrollmentId == null) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid Enrollment ID"))
                    return@get
                }

                val list = DatabaseFactory.dbQuery {
                    Assessments.select { Assessments.enrollmentId eq enrollmentId }.map {
                        AssessmentDto(
                            id = it[Assessments.id],
                            enrollmentId = it[Assessments.enrollmentId],
                            assessmentType = it[Assessments.assessmentType],
                            marksObtained = it[Assessments.marksObtained],
                            maxMarks = it[Assessments.maxMarks],
                            assessedOn = it[Assessments.assessedOn]
                        )
                    }
                }
                call.respond(HttpStatusCode.OK, list)
            }

            // POST /api/grades/typing-test
            post("/typing-test") {
                val principal = call.principal<JWTPrincipal>()
                val role = principal?.payload?.getClaim("role")?.asString()
                if (role != "ADMIN" && role != "FACULTY") {
                    call.respond(HttpStatusCode.Forbidden, ErrorResponse("Only Faculty or Admin can record typing tests."))
                    return@post
                }

                val req = call.receive<TypingTestRequest>()
                if (req.accuracy < 0 || req.accuracy > 100) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Accuracy must be between 0% and 100%."))
                    return@post
                }
                if (req.grossWpm < 0) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Gross WPM cannot be negative."))
                    return@post
                }

                // Calculation: Net WPM = Gross WPM * Accuracy / 100
                val calculatedNetWpm = String.format("%.2f", (req.grossWpm * req.accuracy) / 100.0).toDouble()
                val resultStatus = if (calculatedNetWpm >= req.targetWpm) "PASS" else "FAIL"

                val newId = DatabaseFactory.dbQuery {
                    TypingTests.insert {
                        it[enrollmentId] = req.enrollmentId
                        it[language] = req.language
                        it[grossWpm] = req.grossWpm
                        it[accuracy] = req.accuracy
                        it[netWpm] = calculatedNetWpm
                        it[targetWpm] = req.targetWpm
                        it[result] = resultStatus
                        it[testedOn] = req.testedOn
                    } get TypingTests.id
                }

                call.respond(HttpStatusCode.Created, MessageResponse("Typing test recorded successfully. Result: $resultStatus (Net WPM: $calculatedNetWpm)"))
            }

            // GET /api/grades/enrollment/{id}/typing
            get("/enrollment/{id}/typing") {
                val enrollmentId = call.parameters["id"]?.toIntOrNull()
                if (enrollmentId == null) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid Enrollment ID"))
                    return@get
                }

                val list = DatabaseFactory.dbQuery {
                    TypingTests.select { TypingTests.enrollmentId eq enrollmentId }.map {
                        TypingTestDto(
                            id = it[TypingTests.id],
                            enrollmentId = it[TypingTests.enrollmentId],
                            language = it[TypingTests.language],
                            grossWpm = it[TypingTests.grossWpm],
                            accuracy = it[TypingTests.accuracy],
                            netWpm = it[TypingTests.netWpm],
                            targetWpm = it[TypingTests.targetWpm],
                            result = it[TypingTests.result],
                            testedOn = it[TypingTests.testedOn]
                        )
                    }
                }
                call.respond(HttpStatusCode.OK, list)
            }
        }

        // STUDENT DASHBOARD DATA
        get("/api/student/dashboard/{username}") {
            val username = call.parameters["username"] ?: run {
                call.respond(HttpStatusCode.BadRequest, ErrorResponse("Username is required."))
                return@get
            }
            val principal = call.principal<JWTPrincipal>()
            val authUser = principal?.payload?.getClaim("username")?.asString()

            if (username != authUser && principal?.payload?.getClaim("role")?.asString() != "ADMIN") {
                call.respond(HttpStatusCode.Forbidden, ErrorResponse("You can only view your own student academic dashboard."))
                return@get
            }

            val studentData = DatabaseFactory.dbQuery {
                val userRow = Users.select { Users.username eq username }.singleOrNull()
                if (userRow == null) return@dbQuery null

                val fullName = userRow[Users.fullName]
                val studentRow = Students.select { Students.name eq fullName }.singleOrNull()
                    ?: return@dbQuery null

                val studentId = studentRow[Students.id]

                // Find enrollments
                val enrollments = (Enrollments innerJoin Batches innerJoin Courses)
                    .select { Enrollments.studentId eq studentId }
                    .map {
                        val eId = it[Enrollments.id]
                        val courseName = it[Courses.name]
                        val track = it[Courses.track]
                        val enrolledDate = it[Enrollments.enrolledDate]

                        // Attendance calculation
                        val attRows = Attendance.select { Attendance.enrollmentId eq eId }
                        val totalAtt = attRows.count()
                        val presentAtt = attRows.count { a -> a[Attendance.status] == "PRESENT" }
                        val attPct = if (totalAtt > 0) (presentAtt.toDouble() / totalAtt.toDouble()) * 100.0 else 0.0

                        // Assessments
                        val assessmentsList = Assessments.select { Assessments.enrollmentId eq eId }.map { a ->
                            AssessmentDto(
                                id = a[Assessments.id],
                                enrollmentId = a[Assessments.enrollmentId],
                                assessmentType = a[Assessments.assessmentType],
                                marksObtained = a[Assessments.marksObtained],
                                maxMarks = a[Assessments.maxMarks],
                                assessedOn = a[Assessments.assessedOn]
                            )
                        }

                        // Typing tests
                        val typingList = TypingTests.select { TypingTests.enrollmentId eq eId }.map { t ->
                            TypingTestDto(
                                id = t[TypingTests.id],
                                enrollmentId = t[TypingTests.enrollmentId],
                                language = t[TypingTests.language],
                                grossWpm = t[TypingTests.grossWpm],
                                accuracy = t[TypingTests.accuracy],
                                netWpm = t[TypingTests.netWpm],
                                targetWpm = t[TypingTests.targetWpm],
                                result = t[TypingTests.result],
                                testedOn = t[TypingTests.testedOn]
                            )
                        }

                        mapOf(
                            "enrollmentId" to eId,
                            "courseName" to courseName,
                            "track" to track,
                            "enrolledDate" to enrolledDate,
                            "attendancePercentage" to String.format("%.2f", attPct).toDouble(),
                            "totalClasses" to totalAtt,
                            "presentClasses" to presentAtt,
                            "assessments" to assessmentsList,
                            "typingTests" to typingList
                        )
                    }

                mapOf(
                    "student" to StudentDto(
                        id = studentRow[Students.id],
                        name = studentRow[Students.name],
                        contact = studentRow[Students.contact],
                        email = studentRow[Students.email],
                        stream = studentRow[Students.stream],
                        enrollmentDate = studentRow[Students.enrollmentDate]
                    ),
                    "enrollments" to enrollments
                )
            }

            if (studentData == null) {
                call.respond(HttpStatusCode.NotFound, ErrorResponse("Student record not found for username $username"))
            } else {
                call.respond(HttpStatusCode.OK, studentData)
            }
        }
    }
}
