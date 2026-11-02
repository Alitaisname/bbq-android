package com.yidiandian.shellv2

import android.Manifest
import android.annotation.SuppressLint
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.webkit.JavascriptInterface
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat

class NativeAppBridge(
    context: Context,
) {
    private val appContext = context.applicationContext
    private val prefs = appContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    @JavascriptInterface
    fun getPersistedAuthState(): String {
        return prefs.getString(KEY_AUTH_STATE, "") ?: ""
    }

    @JavascriptInterface
    fun setPersistedAuthState(raw: String?) {
        prefs.edit().putString(KEY_AUTH_STATE, raw?.trim().orEmpty()).apply()
    }

    @JavascriptInterface
    fun clearPersistedAuthState() {
        prefs.edit().remove(KEY_AUTH_STATE).apply()
    }

    @SuppressLint("MissingPermission")
    @JavascriptInterface
    fun showLocalNotification(title: String?, message: String?, notificationKey: String?) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            appContext.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) {
            return
        }
        ensureNotificationChannel()
        val launchIntent = appContext.packageManager.getLaunchIntentForPackage(appContext.packageName)
        val pendingIntent = PendingIntent.getActivity(
            appContext,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val safeTitle = title?.trim().takeUnless { it.isNullOrEmpty() } ?: "易点点通知"
        val safeMessage = message?.trim().orEmpty()
        val notification = NotificationCompat.Builder(appContext, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(safeTitle)
            .setContentText(safeMessage.ifBlank { safeTitle })
            .setStyle(NotificationCompat.BigTextStyle().bigText(safeMessage.ifBlank { safeTitle }))
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .build()
        val notificationId = (notificationKey?.trim().takeUnless { it.isNullOrEmpty() } ?: safeTitle).hashCode()
        NotificationManagerCompat.from(appContext).notify(notificationId, notification)
    }

    @JavascriptInterface
    fun getVoiceCaptureMode(): String {
        return normalizeVoiceCaptureMode(prefs.getString(KEY_VOICE_CAPTURE_MODE, "") ?: "")
    }

    @JavascriptInterface
    fun setVoiceCaptureMode(raw: String?) {
        prefs.edit().putString(KEY_VOICE_CAPTURE_MODE, normalizeVoiceCaptureMode(raw)).apply()
    }

    @JavascriptInterface
    fun getAppDisplayLanguage(): String {
        return normalizeAppDisplayLanguage(prefs.getString(KEY_APP_DISPLAY_LANGUAGE, "") ?: "")
    }

    @JavascriptInterface
    fun setAppDisplayLanguage(raw: String?) {
        prefs.edit().putString(KEY_APP_DISPLAY_LANGUAGE, normalizeAppDisplayLanguage(raw)).apply()
    }

    @JavascriptInterface
    fun openExternalUrl(rawUrl: String?): Boolean {
        val safeUrl = rawUrl?.trim().orEmpty()
        if (safeUrl.isBlank()) return false
        val lower = safeUrl.lowercase()
        if (!lower.startsWith("http://") && !lower.startsWith("https://")) {
            return false
        }
        return try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(safeUrl)).apply {
                addCategory(Intent.CATEGORY_BROWSABLE)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            appContext.startActivity(intent)
            true
        } catch (_: Exception) {
            false
        }
    }

    private fun normalizeVoiceCaptureMode(raw: String?): String {
        return when (raw?.trim()?.lowercase()) {
            "hold" -> "hold"
            else -> "toggle"
        }
    }

    private fun normalizeAppDisplayLanguage(raw: String?): String {
        return when (raw?.trim()?.lowercase()) {
            "ug_cn" -> "ug_cn"
            else -> "zh_cn"
        }
    }

    private fun ensureNotificationChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager = appContext.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager ?: return
        if (manager.getNotificationChannel(CHANNEL_ID) != null) return
        val channel = NotificationChannel(CHANNEL_ID, "易点点通知", NotificationManager.IMPORTANCE_DEFAULT)
        manager.createNotificationChannel(channel)
    }

    companion object {
        private const val PREFS_NAME = "bbq_native_runtime"
        private const val KEY_AUTH_STATE = "persisted_auth_state"
        private const val KEY_VOICE_CAPTURE_MODE = "voice_capture_mode"
        private const val KEY_APP_DISPLAY_LANGUAGE = "app_display_language"
        private const val CHANNEL_ID = "bbq_kls_notifications"
    }
}
