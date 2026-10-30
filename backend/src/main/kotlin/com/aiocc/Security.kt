package com.aiocc

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import io.ktor.server.config.*
import org.mindrot.jbcrypt.BCrypt
import java.util.*

object PasswordHasher {
    fun hash(password: String): String {
        return BCrypt.hashpw(password, BCrypt.gensalt(10))
    }

    fun verify(password: String, hashed: String): Boolean {
        return try {
            BCrypt.checkpw(password, hashed)
        } catch (e: Exception) {
            false
        }
    }
}

class JwtConfig(config: ApplicationConfig) {
    val secret = config.propertyOrNull("jwt.secret")?.getString() ?: UUID.randomUUID().toString()
    val issuer = config.propertyOrNull("jwt.issuer")?.getString() ?: "http://localhost:8080/"
    val audience = config.propertyOrNull("jwt.audience")?.getString() ?: "http://localhost:8080/api"
    val realm = config.propertyOrNull("jwt.realm")?.getString() ?: "AIOCC Management System"

    val algorithm: Algorithm = Algorithm.HMAC256(secret)

    fun generateToken(username: String, role: String, fullName: String, userId: Int): String {
        val expirationTime = Date(System.currentTimeMillis() + 86400000) // 24 hours
        return JWT.create()
            .withSubject("Authentication")
            .withIssuer(issuer)
            .withAudience(audience)
            .withClaim("username", username)
            .withClaim("role", role)
            .withClaim("fullName", fullName)
            .withClaim("userId", userId)
            .withExpiresAt(expirationTime)
            .sign(algorithm)
    }
}
