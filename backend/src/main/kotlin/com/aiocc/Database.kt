package com.aiocc

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.ktor.server.config.*
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.slf4j.LoggerFactory

object DatabaseFactory {
    private val logger = LoggerFactory.getLogger(DatabaseFactory::class.java)

    fun init(config: ApplicationConfig) {
        val dbUrl = config.property("db.url").getString()
        val dbDriver = config.property("db.driver").getString()
        val dbUser = config.property("db.user").getString()
        val dbPassword = config.property("db.password").getString()

        logger.info("Connecting to database: url=$dbUrl driver=$dbDriver user=$dbUser")

        val hikariConfig = HikariConfig().apply {
            driverClassName = dbDriver
            jdbcUrl = dbUrl
            username = dbUser
            password = dbPassword
            maximumPoolSize = 10
            isAutoCommit = false
            transactionIsolation = "TRANSACTION_REPEATABLE_READ"
            validate()
        }

        try {
            val dataSource = HikariDataSource(hikariConfig)
            Database.connect(dataSource)
            logger.info("Connected to MySQL database successfully")
        } catch (e: Exception) {
            logger.error("Failed to connect to database", e)
            throw IllegalStateException(
                "Database initialization failed. Check db.url, db.user, db.password in application.conf", e
            )
        }
    }

    suspend fun <T> dbQuery(block: suspend () -> T): T =
        newSuspendedTransaction { block() }
}