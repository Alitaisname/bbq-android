package com.yidiandian.shellv2

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.provider.OpenableColumns
import android.util.Base64
import android.webkit.JavascriptInterface
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean

class NativeMediaBridge(
    private val activity: AppCompatActivity,
    private val emitScript: (String) -> Unit,
) {
    private val io = Executors.newSingleThreadExecutor { runnable ->
        Thread(runnable, "native-media-bridge").apply { isDaemon = true }
    }
    private val inFlight = AtomicBoolean(false)

    private val cameraLauncher = activity.registerForActivityResult(
        ActivityResultContracts.TakePicturePreview()
    ) { bitmap ->
        if (!inFlight.getAndSet(false)) {
            return@registerForActivityResult
        }
        if (bitmap == null) {
            emitEvent(
                type = "cancelled",
                payload = mapOf("source" to "camera"),
            )
            return@registerForActivityResult
        }
        io.execute {
            processBitmap(
                bitmap = bitmap,
                source = "camera",
                fileName = "menu-camera-${System.currentTimeMillis()}.jpg",
            )
        }
    }

    private val galleryLauncher = activity.registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri ->
        if (!inFlight.getAndSet(false)) {
            return@registerForActivityResult
        }
        if (uri == null) {
            emitEvent(
                type = "cancelled",
                payload = mapOf("source" to "gallery"),
            )
            return@registerForActivityResult
        }
        io.execute {
            try {
                val bitmap = decodeBitmapFromUri(uri, maxEdge = 1600)
                    ?: throw IllegalStateException("selected image decode failed")
                processBitmap(
                    bitmap = bitmap,
                    source = "gallery",
                    fileName = queryDisplayName(uri),
                )
            } catch (error: Exception) {
                emitEvent(
                    type = "error",
                    payload = mapOf(
                        "code" to "gallery_decode_failed",
                        "message" to (error.message ?: "gallery image decode failed"),
                    ),
                )
            }
        }
    }

    @JavascriptInterface
    fun isAvailable(): Boolean = true

    @JavascriptInterface
    fun captureMenuImage(): Boolean {
        if (!inFlight.compareAndSet(false, true)) {
            emitEvent(
                type = "error",
                payload = mapOf(
                    "code" to "busy",
                    "message" to "native media capture busy",
                ),
            )
            return false
        }
        emitEvent(
            type = "started",
            payload = mapOf("source" to "camera"),
        )
        activity.runOnUiThread {
            try {
                cameraLauncher.launch(null)
            } catch (error: Exception) {
                inFlight.set(false)
                emitEvent(
                    type = "error",
                    payload = mapOf(
                        "code" to "camera_launch_failed",
                        "message" to (error.message ?: "camera launch failed"),
                    ),
                )
            }
        }
        return true
    }

    @JavascriptInterface
    fun pickMenuImage(): Boolean {
        if (!inFlight.compareAndSet(false, true)) {
            emitEvent(
                type = "error",
                payload = mapOf(
                    "code" to "busy",
                    "message" to "native media capture busy",
                ),
            )
            return false
        }
        emitEvent(
            type = "started",
            payload = mapOf("source" to "gallery"),
        )
        activity.runOnUiThread {
            try {
                galleryLauncher.launch("image/*")
            } catch (error: Exception) {
                inFlight.set(false)
                emitEvent(
                    type = "error",
                    payload = mapOf(
                        "code" to "gallery_launch_failed",
                        "message" to (error.message ?: "gallery launch failed"),
                    ),
                )
            }
        }
        return true
    }

    fun destroy() {
        inFlight.set(false)
        io.shutdownNow()
    }

    private fun processBitmap(bitmap: Bitmap, source: String, fileName: String) {
        try {
            val normalized = scaleDownBitmap(bitmap, maxEdge = 1280)
            val output = ByteArrayOutputStream()
            normalized.compress(Bitmap.CompressFormat.JPEG, 86, output)
            val bytes = output.toByteArray()
            val b64 = Base64.encodeToString(bytes, Base64.NO_WRAP)
            emitEvent(
                type = "image",
                payload = mapOf(
                    "source" to source,
                    "file_name" to (fileName.ifBlank { "menu-image-${System.currentTimeMillis()}.jpg" }),
                    "mime_type" to "image/jpeg",
                    "image_base64" to b64,
                    "byte_size" to bytes.size,
                    "width" to normalized.width,
                    "height" to normalized.height,
                ),
            )
            if (normalized !== bitmap && !normalized.isRecycled) {
                normalized.recycle()
            }
            if (!bitmap.isRecycled) {
                bitmap.recycle()
            }
        } catch (error: Exception) {
            emitEvent(
                type = "error",
                payload = mapOf(
                    "code" to "bitmap_process_failed",
                    "message" to (error.message ?: "native image process failed"),
                ),
            )
        }
    }

    private fun decodeBitmapFromUri(uri: Uri, maxEdge: Int): Bitmap? {
        val resolver = activity.contentResolver
        val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        resolver.openInputStream(uri).use { stream ->
            if (stream == null) return null
            BitmapFactory.decodeStream(stream, null, bounds)
        }
        var sample = 1
        while (bounds.outWidth / sample > maxEdge || bounds.outHeight / sample > maxEdge) {
            sample *= 2
        }
        val opts = BitmapFactory.Options().apply {
            inSampleSize = sample.coerceAtLeast(1)
            inPreferredConfig = Bitmap.Config.ARGB_8888
        }
        return resolver.openInputStream(uri).use { stream ->
            if (stream == null) null else BitmapFactory.decodeStream(stream, null, opts)
        }
    }

    private fun scaleDownBitmap(bitmap: Bitmap, maxEdge: Int): Bitmap {
        val width = bitmap.width.coerceAtLeast(1)
        val height = bitmap.height.coerceAtLeast(1)
        val currentMax = maxOf(width, height)
        if (currentMax <= maxEdge) return bitmap
        val scale = maxEdge.toFloat() / currentMax.toFloat()
        val targetWidth = (width * scale).toInt().coerceAtLeast(1)
        val targetHeight = (height * scale).toInt().coerceAtLeast(1)
        return Bitmap.createScaledBitmap(bitmap, targetWidth, targetHeight, true)
    }

    private fun queryDisplayName(uri: Uri): String {
        try {
            activity.contentResolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { cursor ->
                if (cursor.moveToFirst()) {
                    val index = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                    if (index >= 0) {
                        val value = cursor.getString(index)
                        if (!value.isNullOrBlank()) return value
                    }
                }
            }
        } catch (_: Exception) {
        }
        return "menu-image-${System.currentTimeMillis()}.jpg"
    }

    private fun emitEvent(type: String, payload: Map<String, Any?> = emptyMap()) {
        val obj = JSONObject()
        obj.put("type", type)
        for ((key, value) in payload) {
            obj.put(key, value)
        }
        val encoded = JSONObject.quote(obj.toString())
        emitScript("window.__nativeMediaBridge&&window.__nativeMediaBridge.onEvent(JSON.parse($encoded));")
    }
}
