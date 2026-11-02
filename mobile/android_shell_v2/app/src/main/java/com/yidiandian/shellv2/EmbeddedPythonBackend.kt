package com.yidiandian.shellv2

import android.content.Context
import com.chaquo.python.Python
import com.chaquo.python.android.AndroidPlatform
import java.io.File
import java.net.URI

object EmbeddedPythonBackend {

    @Synchronized
    fun ensureStarted(context: Context, runtimeRoot: File, healthUrl: String): String {
        val (host, port) = parseHostPort(healthUrl)
        if (!Python.isStarted()) {
            Python.start(AndroidPlatform(context))
        }
        val python = Python.getInstance()
        val module = python.getModule("embedded_backend")
        val message = module.callAttr(
            "start_server",
            runtimeRoot.absolutePath,
            host,
            port
        ).toString()
        return message
    }

    private fun parseHostPort(healthUrl: String): Pair<String, Int> {
        return try {
            val uri = URI(healthUrl)
            val host = uri.host?.takeIf { it.isNotBlank() } ?: "127.0.0.1"
            val port = if (uri.port > 0) uri.port else 8000
            Pair(host, port)
        } catch (_: Exception) {
            Pair("127.0.0.1", 8000)
        }
    }
}
