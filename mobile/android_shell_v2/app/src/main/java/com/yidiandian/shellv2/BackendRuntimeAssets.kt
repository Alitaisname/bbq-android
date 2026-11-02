package com.yidiandian.shellv2

import android.content.Context
import java.io.File
import java.io.FileOutputStream

object BackendRuntimeAssets {
    private const val ASSET_ROOT = "backend_runtime"
    private const val VERSION_FILE = "backend_runtime/VERSION"

    @Synchronized
    fun prepareRuntime(context: Context): File {
        val assets = context.assets
        val runtimeDir = File(context.filesDir, "backend_runtime")
        val persistentDataDir = File(context.filesDir, "backend_data")
        val markerFile = File(runtimeDir, ".payload_version")

        val assetVersion = try {
            assets.open(VERSION_FILE).bufferedReader().use { it.readText().trim() }
        } catch (_: Exception) {
            "dev"
        }
        val expectedMarker = buildRuntimeMarker(context, assetVersion)
        val currentVersion = markerFile.takeIf { it.exists() }?.readText()?.trim().orEmpty()
        if (runtimeDir.exists() && currentVersion == expectedMarker) {
            return runtimeDir
        }

        migrateLegacyRuntimeData(runtimeDir = runtimeDir, persistentDataDir = persistentDataDir)
        runtimeDir.deleteRecursively()
        copyAssetTree(assetsPath = ASSET_ROOT, dest = runtimeDir, context = context)
        markerFile.writeText(expectedMarker)
        return runtimeDir
    }

    private fun migrateLegacyRuntimeData(runtimeDir: File, persistentDataDir: File) {
        if (!runtimeDir.exists()) return
        persistentDataDir.mkdirs()

        val legacyDb = File(runtimeDir, "restaurant.db")
        val targetDb = File(persistentDataDir, "restaurant.db")
        if (legacyDb.exists() && !targetDb.exists()) {
            legacyDb.copyTo(targetDb, overwrite = false)
        }

        val legacyAccountScopes = File(runtimeDir, "account_scopes")
        val targetAccountScopes = File(persistentDataDir, "account_scopes")
        if (legacyAccountScopes.exists() && !targetAccountScopes.exists()) {
            legacyAccountScopes.copyRecursively(targetAccountScopes, overwrite = false)
        }

        val legacyAudioDirs = listOf(
            File(runtimeDir, "audio_uploads"),
            File(runtimeDir, "data/audio_uploads"),
        )
        val targetAudioDir = File(persistentDataDir, "audio_uploads")
        if (!targetAudioDir.exists()) {
            legacyAudioDirs.firstOrNull { it.exists() }?.copyRecursively(targetAudioDir, overwrite = false)
        }
    }

    private fun buildRuntimeMarker(context: Context, assetVersion: String): String {
        val updateStamp = try {
            @Suppress("DEPRECATION")
            context.packageManager.getPackageInfo(context.packageName, 0).lastUpdateTime
        } catch (_: Exception) {
            0L
        }
        return "asset=$assetVersion;apk=$updateStamp"
    }

    private fun copyAssetTree(assetsPath: String, dest: File, context: Context) {
        val children = context.assets.list(assetsPath) ?: emptyArray()
        if (children.isEmpty()) {
            if (dest.name == "__pycache__" || dest.extension == "pyc" || dest.extension == "pyo") {
                return
            }
            dest.parentFile?.mkdirs()
            context.assets.open(assetsPath).use { input ->
                FileOutputStream(dest).use { out ->
                    input.copyTo(out)
                }
            }
            return
        }

        if (!dest.exists()) {
            dest.mkdirs()
        }
        for (child in children) {
            if (child == "__pycache__" || child.endsWith(".pyc") || child.endsWith(".pyo")) {
                continue
            }
            val childAssetPath = "$assetsPath/$child"
            val childDest = File(dest, child)
            copyAssetTree(childAssetPath, childDest, context)
        }
    }
}
