package com.yidiandian.shellv2

import android.content.Context
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

enum class BackendBootMode {
    ATTACH_EXISTING,
    SPAWN_COMMAND,
    EMBEDDED_PYTHON,
}

data class BootstrapReport(
    val mode: BackendBootMode,
    val started: Boolean,
    val healthy: Boolean,
    val message: String,
)

class LocalServiceBootstrap {

    companion object {
        private var backendProcess: Process? = null
    }

    @Synchronized
    fun ensureStarted(context: Context): BootstrapReport {
        val mode = parseMode(AppConfig.BACKEND_BOOT_MODE)
        if (probeHealth()) {
            return BootstrapReport(
                mode = mode,
                started = false,
                healthy = true,
                message = "backend already healthy",
            )
        }
        return when (mode) {
            BackendBootMode.ATTACH_EXISTING -> {
                BootstrapReport(
                    mode = mode,
                    started = false,
                    healthy = false,
                    message = "attach-existing mode: waiting external backend",
                )
            }

            BackendBootMode.SPAWN_COMMAND -> {
                val cmd = parseCommand(AppConfig.BACKEND_START_COMMAND)
                if (cmd.isEmpty()) {
                    return BootstrapReport(
                        mode = mode,
                        started = false,
                        healthy = false,
                        message = "spawn-command mode but BACKEND_START_COMMAND is empty",
                    )
                }
                val workDir = resolveWorkDir(context, AppConfig.BACKEND_WORK_DIR)
                try {
                    val existing = backendProcess
                    if (existing != null && existing.isAlive) {
                        return BootstrapReport(
                            mode = mode,
                            started = false,
                            healthy = false,
                            message = "backend process is already running",
                        )
                    }
                    val process = ProcessBuilder(cmd)
                        .directory(workDir)
                        .redirectErrorStream(true)
                        .start()
                    backendProcess = process
                    pumpBackendLog(context, process)
                    BootstrapReport(
                        mode = mode,
                        started = true,
                        healthy = false,
                        message = "backend start command launched in ${workDir.absolutePath}",
                    )
                } catch (error: Exception) {
                    BootstrapReport(
                        mode = mode,
                        started = false,
                        healthy = false,
                        message = "backend start command failed: ${error.message}",
                    )
                }
            }

            BackendBootMode.EMBEDDED_PYTHON -> {
                try {
                    val runtimeRoot = BackendRuntimeAssets.prepareRuntime(context)
                    val pyMessage = EmbeddedPythonBackend.ensureStarted(
                        context = context,
                        runtimeRoot = runtimeRoot,
                        healthUrl = AppConfig.LOCAL_HEALTH_URL,
                    )
                    BootstrapReport(
                        mode = mode,
                        started = pyMessage.startsWith("ok:"),
                        healthy = false,
                        message = "embedded-python mode: $pyMessage",
                    )
                } catch (error: Exception) {
                    BootstrapReport(
                        mode = mode,
                        started = false,
                        healthy = false,
                        message = "embedded-python mode failed: ${error.message}",
                    )
                }
            }
        }
    }

    fun waitUntilHealthy(
        timeoutMs: Long = AppConfig.BACKEND_HEALTH_TIMEOUT_MS.toLong(),
        intervalMs: Long = AppConfig.BACKEND_HEALTH_POLL_INTERVAL_MS.toLong(),
    ): Boolean {
        val deadline = System.currentTimeMillis() + timeoutMs
        while (System.currentTimeMillis() < deadline) {
            if (probeHealth()) return true
            Thread.sleep(intervalMs)
        }
        return false
    }

    private fun parseMode(raw: String): BackendBootMode {
        val value = raw.trim().uppercase()
        return when (value) {
            BackendBootMode.SPAWN_COMMAND.name -> BackendBootMode.SPAWN_COMMAND
            BackendBootMode.EMBEDDED_PYTHON.name -> BackendBootMode.EMBEDDED_PYTHON
            else -> BackendBootMode.ATTACH_EXISTING
        }
    }

    private fun resolveWorkDir(context: Context, configured: String): File {
        val candidate = configured.trim()
        if (candidate.isNotEmpty()) {
            return File(candidate)
        }
        return context.filesDir
    }

    // Minimal parser: supports quoted segments and whitespace splitting.
    private fun parseCommand(raw: String): List<String> {
        val input = raw.trim()
        if (input.isEmpty()) return emptyList()
        val parts = mutableListOf<String>()
        val buffer = StringBuilder()
        var quote: Char? = null
        input.forEach { ch ->
            if (quote == null) {
                when {
                    ch == '"' || ch == '\'' -> quote = ch
                    ch.isWhitespace() -> {
                        if (buffer.isNotEmpty()) {
                            parts += buffer.toString()
                            buffer.clear()
                        }
                    }

                    else -> buffer.append(ch)
                }
            } else {
                if (ch == quote) {
                    quote = null
                } else {
                    buffer.append(ch)
                }
            }
        }
        if (buffer.isNotEmpty()) {
            parts += buffer.toString()
        }
        return parts
    }

    private fun pumpBackendLog(context: Context, process: Process) {
        val logFile = File(context.filesDir, "backend.log")
        Thread {
            try {
                process.inputStream.bufferedReader().useLines { lines ->
                    FileOutputStream(logFile, true).bufferedWriter().use { writer ->
                        lines.forEach { line ->
                            val ts = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.US).format(Date())
                            writer.append("[").append(ts).append("] ").append(line).appendLine()
                            writer.flush()
                        }
                    }
                }
            } catch (_: Exception) {
                // Ignore logging failures: bootstrap behavior should not change.
            }
        }.start()
    }

    private fun probeHealth(): Boolean {
        return try {
            val conn = URL(AppConfig.LOCAL_HEALTH_URL).openConnection() as HttpURLConnection
            conn.requestMethod = "GET"
            conn.connectTimeout = 1200
            conn.readTimeout = 1200
            conn.instanceFollowRedirects = false
            conn.connect()
            val ok = conn.responseCode in 200..299
            conn.disconnect()
            ok
        } catch (_: Exception) {
            false
        }
    }
}
