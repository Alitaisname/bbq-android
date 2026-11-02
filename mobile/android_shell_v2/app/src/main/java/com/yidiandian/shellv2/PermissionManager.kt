package com.yidiandian.shellv2

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat

class PermissionManager(private val activity: ComponentActivity) {

    private val micLauncher = activity.registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { /* no-op: page-side handles voice error feedback */ }

    private val notificationLauncher = activity.registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { /* no-op: KLS inbox still works without notification permission */ }

    fun ensureMicrophonePermission() {
        val granted = ContextCompat.checkSelfPermission(
            activity,
            Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED
        if (!granted) {
            micLauncher.launch(Manifest.permission.RECORD_AUDIO)
        }
    }

    fun ensureNotificationPermission() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return
        val granted = ContextCompat.checkSelfPermission(
            activity,
            Manifest.permission.POST_NOTIFICATIONS
        ) == PackageManager.PERMISSION_GRANTED
        if (!granted) {
            notificationLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }
}
