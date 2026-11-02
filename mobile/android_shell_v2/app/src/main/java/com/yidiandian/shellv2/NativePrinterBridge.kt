package com.yidiandian.shellv2

import android.Manifest
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothSocket
import android.os.Build
import android.util.Base64
import android.webkit.JavascriptInterface
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.util.UUID
import java.util.concurrent.ExecutionException
import java.util.concurrent.Executors
import java.util.concurrent.Future
import java.util.concurrent.TimeUnit
import java.util.concurrent.TimeoutException

class NativePrinterBridge(
    private val activity: AppCompatActivity,
    private val emitScript: (String) -> Unit,
) {
    private val io = Executors.newSingleThreadExecutor { runnable ->
        Thread(runnable, "native-printer-bridge").apply { isDaemon = true }
    }
    private val connectExecutor = Executors.newCachedThreadPool { runnable ->
        Thread(runnable, "native-printer-connect").apply { isDaemon = true }
    }
    private val connectLock = Any()
    @Volatile
    private var pendingConnectFuture: Future<*>? = null
    @Volatile
    private var pendingConnectSocket: BluetoothSocket? = null
    @Volatile
    private var connectedSocket: BluetoothSocket? = null
    @Volatile
    private var connectedAddress: String = ""
    @Volatile
    private var connectedName: String = ""
    @Volatile
    private var permissionRequestId: String = ""
    private val sppUuid: UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB")
    private val connectTimeoutMs: Long = 12_000L

    private val permissionLauncher = activity.registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { result ->
        val granted = result.values.all { it }
        val reqId = permissionRequestId
        permissionRequestId = ""
        emitResult(
            requestId = reqId,
            action = "permissions",
            success = granted,
            data = JSONObject()
                .put("granted", granted)
                .put(
                    "permissions",
                    JSONObject().apply {
                        result.forEach { (key, value) ->
                            put(safeText(key), value == true)
                        }
                    }
                ),
            errorCode = if (granted) null else "permission_denied",
            message = if (granted) null else "bluetooth permission denied",
        )
    }

    @JavascriptInterface
    fun isAvailable(): Boolean = true

    @JavascriptInterface
    fun requestPermissions(requestId: String?): Boolean {
        val perms = requiredPermissions()
        if (perms.isEmpty()) {
            emitResult(
                requestId = requestId,
                action = "permissions",
                success = true,
                data = JSONObject().put("granted", true),
            )
            return true
        }
        activity.runOnUiThread {
            try {
                permissionRequestId = safeText(requestId)
                permissionLauncher.launch(perms)
            } catch (error: Exception) {
                emitResult(
                    requestId = requestId,
                    action = "permissions",
                    success = false,
                    errorCode = "permission_request_failed",
                    message = error.message ?: "permission request failed",
                )
            }
        }
        return true
    }

    @JavascriptInterface
    fun listBondedDevices(requestId: String?): Boolean {
        io.execute {
            if (!hasBluetoothConnectPermission()) {
                emitResult(
                    requestId = requestId,
                    action = "list_bonded",
                    success = false,
                    errorCode = "permission_denied",
                    message = "bluetooth connect permission denied",
                )
                return@execute
            }
            val adapter = BluetoothAdapter.getDefaultAdapter()
            if (adapter == null) {
                emitResult(
                    requestId = requestId,
                    action = "list_bonded",
                    success = false,
                    errorCode = "bluetooth_unavailable",
                    message = "bluetooth adapter unavailable",
                )
                return@execute
            }
            if (!adapter.isEnabled) {
                emitResult(
                    requestId = requestId,
                    action = "list_bonded",
                    success = false,
                    errorCode = "bluetooth_disabled",
                    message = "bluetooth is disabled",
                )
                return@execute
            }
            val devices = JSONArray()
            adapter.bondedDevices?.forEach { device ->
                devices.put(
                    JSONObject()
                        .put("name", safeText(device.name))
                        .put("address", safeText(device.address))
                        .put("bond_state", device.bondState)
                        .put("type", device.type)
                )
            }
            emitResult(
                requestId = requestId,
                action = "list_bonded",
                success = true,
                data = JSONObject().put("devices", devices),
            )
        }
        return true
    }

    @JavascriptInterface
    fun connect(address: String?, requestId: String?): Boolean {
        val targetAddress = safeText(address)
        if (targetAddress.isBlank()) {
            emitResult(
                requestId = requestId,
                action = "connect",
                success = false,
                errorCode = "invalid_address",
                message = "printer address is empty",
            )
            return false
        }
        cancelOngoingConnect()
        io.execute {
            if (!hasBluetoothConnectPermission()) {
                emitResult(
                    requestId = requestId,
                    action = "connect",
                    success = false,
                    errorCode = "permission_denied",
                    message = "bluetooth connect permission denied",
                )
                return@execute
            }
            val adapter = BluetoothAdapter.getDefaultAdapter()
            if (adapter == null) {
                emitResult(
                    requestId = requestId,
                    action = "connect",
                    success = false,
                    errorCode = "bluetooth_unavailable",
                    message = "bluetooth adapter unavailable",
                )
                return@execute
            }
            if (!adapter.isEnabled) {
                emitResult(
                    requestId = requestId,
                    action = "connect",
                    success = false,
                    errorCode = "bluetooth_disabled",
                    message = "bluetooth is disabled",
                )
                return@execute
            }
            try {
                closeCurrentSocket()
                val device = adapter.getRemoteDevice(targetAddress)
                adapter.cancelDiscovery()
                val socket = openSocket(device)
                connectedSocket = socket
                connectedAddress = safeText(device.address)
                connectedName = safeText(device.name)
                emitState(
                    action = "connection",
                    payload = mapOf(
                        "connected" to true,
                        "address" to connectedAddress,
                        "name" to connectedName,
                    )
                )
                emitResult(
                    requestId = requestId,
                    action = "connect",
                    success = true,
                    data = JSONObject()
                        .put("connected", true)
                        .put("address", connectedAddress)
                        .put("name", connectedName),
                )
            } catch (error: Exception) {
                closeCurrentSocket()
                emitState(
                    action = "connection",
                    payload = mapOf("connected" to false)
                )
                emitResult(
                    requestId = requestId,
                    action = "connect",
                    success = false,
                    errorCode = "connect_failed",
                    message = error.message ?: "bluetooth connect failed",
                )
            }
        }
        return true
    }

    @JavascriptInterface
    fun disconnect(requestId: String?): Boolean {
        cancelOngoingConnect()
        io.execute {
            cancelOngoingConnect()
            closeCurrentSocket()
            emitState(
                action = "connection",
                payload = mapOf("connected" to false)
            )
            emitResult(
                requestId = requestId,
                action = "disconnect",
                success = true,
                data = JSONObject().put("connected", false),
            )
        }
        return true
    }

    @JavascriptInterface
    fun getConnectionState(): String {
        return JSONObject()
            .put("connected", isSocketConnected())
            .put("address", connectedAddress)
            .put("name", connectedName)
            .toString()
    }

    @JavascriptInterface
    fun printTicket(payloadJson: String?, requestId: String?): Boolean {
        io.execute {
            if (!isSocketConnected()) {
                emitResult(
                    requestId = requestId,
                    action = "print_ticket",
                    success = false,
                    errorCode = "not_connected",
                    message = "printer is not connected",
                )
                return@execute
            }
            val payloadText = safeText(payloadJson)
            if (payloadText.isBlank()) {
                emitResult(
                    requestId = requestId,
                    action = "print_ticket",
                    success = false,
                    errorCode = "invalid_payload",
                    message = "print payload is empty",
                )
                return@execute
            }
            val payload = try {
                JSONObject(payloadText)
            } catch (_: Exception) {
                emitResult(
                    requestId = requestId,
                    action = "print_ticket",
                    success = false,
                    errorCode = "invalid_payload",
                    message = "print payload is invalid json",
                )
                return@execute
            }
            try {
                val bytes = EscPosTicketRenderer.render(payload)
                writeToSocket(bytes)
                emitResult(
                    requestId = requestId,
                    action = "print_ticket",
                    success = true,
                    data = JSONObject()
                        .put("bytes", bytes.size)
                        .put("address", connectedAddress),
                )
            } catch (error: Exception) {
                emitResult(
                    requestId = requestId,
                    action = "print_ticket",
                    success = false,
                    errorCode = "print_failed",
                    message = error.message ?: "print ticket failed",
                )
            }
        }
        return true
    }

    @JavascriptInterface
    fun printTicketImage(payloadJson: String?, requestId: String?): Boolean {
        io.execute {
            if (!isSocketConnected()) {
                emitResult(
                    requestId = requestId,
                    action = "print_ticket_image",
                    success = false,
                    errorCode = "not_connected",
                    message = "printer is not connected",
                )
                return@execute
            }
            val payloadText = safeText(payloadJson)
            if (payloadText.isBlank()) {
                emitResult(
                    requestId = requestId,
                    action = "print_ticket_image",
                    success = false,
                    errorCode = "invalid_payload",
                    message = "print payload is empty",
                )
                return@execute
            }
            val payload = try {
                JSONObject(payloadText)
            } catch (_: Exception) {
                emitResult(
                    requestId = requestId,
                    action = "print_ticket_image",
                    success = false,
                    errorCode = "invalid_payload",
                    message = "print payload is invalid json",
                )
                return@execute
            }
            try {
                val bytes = BitmapTicketRenderer.render(payload)
                writeToSocket(bytes)
                emitResult(
                    requestId = requestId,
                    action = "print_ticket_image",
                    success = true,
                    data = JSONObject()
                        .put("bytes", bytes.size)
                        .put("address", connectedAddress),
                )
            } catch (error: Exception) {
                emitResult(
                    requestId = requestId,
                    action = "print_ticket_image",
                    success = false,
                    errorCode = "print_image_failed",
                    message = error.message ?: "print image ticket failed",
                )
            }
        }
        return true
    }

    @JavascriptInterface
    fun printSelfTest(widthMm: Int, requestId: String?): Boolean {
        val payload = JSONObject()
            .put("title", "打印链路自检")
            .put("store_name", "易点点 Android")
            .put("order_no", "SELF-${System.currentTimeMillis()}")
            .put("table_no", "TEST")
            .put("width_mm", if (widthMm >= 76) 80 else 58)
            .put("remark", "无设备模型依赖，兼容 ESC/POS SPP")
            .put("footer", "自检完成")
            .put("items", JSONArray().apply {
                put(JSONObject().put("name", "示例羊肉串").put("qty", 2).put("price_cents", 300))
                put(JSONObject().put("name", "示例烤茄子").put("qty", 1).put("price_cents", 1200))
            })
            .put("total_cents", 1800)
            .put("qr_text", "YIDIANDIAN-SELF-TEST")
        return printTicket(payload.toString(), requestId)
    }

    @JavascriptInterface
    fun printRawBase64(base64Data: String?, requestId: String?): Boolean {
        io.execute {
            if (!isSocketConnected()) {
                emitResult(
                    requestId = requestId,
                    action = "print_raw",
                    success = false,
                    errorCode = "not_connected",
                    message = "printer is not connected",
                )
                return@execute
            }
            val cleaned = safeText(base64Data).replace("\\s+".toRegex(), "")
            if (cleaned.isBlank()) {
                emitResult(
                    requestId = requestId,
                    action = "print_raw",
                    success = false,
                    errorCode = "invalid_payload",
                    message = "base64 payload is empty",
                )
                return@execute
            }
            try {
                val bytes = Base64.decode(cleaned, Base64.DEFAULT)
                writeToSocket(bytes)
                emitResult(
                    requestId = requestId,
                    action = "print_raw",
                    success = true,
                    data = JSONObject().put("bytes", bytes.size),
                )
            } catch (error: Exception) {
                emitResult(
                    requestId = requestId,
                    action = "print_raw",
                    success = false,
                    errorCode = "print_raw_failed",
                    message = error.message ?: "print raw failed",
                )
            }
        }
        return true
    }

    fun destroy() {
        cancelOngoingConnect()
        closeCurrentSocket()
        io.shutdownNow()
        connectExecutor.shutdownNow()
    }

    private fun writeToSocket(data: ByteArray) {
        val socket = connectedSocket ?: throw IllegalStateException("printer socket unavailable")
        val output = socket.outputStream ?: throw IllegalStateException("printer output stream unavailable")
        var offset = 0
        while (offset < data.size) {
            val size = minOf(256, data.size - offset)
            output.write(data, offset, size)
            output.flush()
            offset += size
            if (offset < data.size) {
                try {
                    Thread.sleep(8L)
                } catch (_: Exception) {
                }
            }
        }
    }

    private fun openSocket(device: BluetoothDevice): BluetoothSocket {
        val strategies = listOf(
            "rfcomm_secure_spp" to { device.createRfcommSocketToServiceRecord(sppUuid) },
            "rfcomm_insecure_spp" to { device.createInsecureRfcommSocketToServiceRecord(sppUuid) },
            "rfcomm_channel_1" to { createRfcommChannel1Socket(device) },
        )
        var lastError: Exception? = null
        for ((_, createSocket) in strategies) {
            var socket: BluetoothSocket? = null
            try {
                socket = createSocket.invoke()
                connectSocketWithTimeout(socket, connectTimeoutMs)
                return socket
            } catch (error: Exception) {
                lastError = if (error is IllegalStateException) error else IllegalStateException(error.message ?: "socket connect failed", error)
                closeQuietly(socket)
            }
        }
        throw IllegalStateException(lastError?.message ?: "all bluetooth socket strategies failed", lastError)
    }

    private fun connectSocketWithTimeout(socket: BluetoothSocket, timeoutMs: Long) {
        val future = connectExecutor.submit {
            socket.connect()
        }
        setPendingConnect(future, socket)
        try {
            future.get(timeoutMs, TimeUnit.MILLISECONDS)
        } catch (error: TimeoutException) {
            future.cancel(true)
            closeQuietly(socket)
            throw IllegalStateException("bluetooth connect timeout ${timeoutMs}ms", error)
        } catch (error: InterruptedException) {
            future.cancel(true)
            closeQuietly(socket)
            Thread.currentThread().interrupt()
            throw IllegalStateException("bluetooth connect interrupted", error)
        } catch (error: ExecutionException) {
            val cause = error.cause
            if (cause is IOException) {
                throw IllegalStateException(cause.message ?: "bluetooth connect failed", cause)
            }
            if (cause is Exception) {
                throw cause
            }
            throw IllegalStateException(cause?.message ?: "bluetooth connect failed", cause)
        } finally {
            clearPendingConnect(future, socket)
        }
    }

    private fun createRfcommChannel1Socket(device: BluetoothDevice): BluetoothSocket {
        return try {
            val method = device.javaClass.getMethod("createRfcommSocket", Int::class.javaPrimitiveType)
            val socket = method.invoke(device, 1)
            socket as? BluetoothSocket
                ?: throw IllegalStateException("rfcomm channel1 socket unavailable")
        } catch (error: Exception) {
            throw IllegalStateException(error.message ?: "rfcomm channel1 socket create failed", error)
        }
    }

    private fun setPendingConnect(future: Future<*>, socket: BluetoothSocket) {
        synchronized(connectLock) {
            pendingConnectFuture = future
            pendingConnectSocket = socket
        }
    }

    private fun clearPendingConnect(future: Future<*>? = null, socket: BluetoothSocket? = null) {
        synchronized(connectLock) {
            if (future == null || pendingConnectFuture === future) {
                pendingConnectFuture = null
            }
            if (socket == null || pendingConnectSocket === socket) {
                pendingConnectSocket = null
            }
        }
    }

    private fun cancelOngoingConnect() {
        val future: Future<*>?
        val socket: BluetoothSocket?
        synchronized(connectLock) {
            future = pendingConnectFuture
            socket = pendingConnectSocket
            pendingConnectFuture = null
            pendingConnectSocket = null
        }
        future?.cancel(true)
        closeQuietly(socket)
    }

    private fun closeQuietly(socket: BluetoothSocket?) {
        try {
            socket?.close()
        } catch (_: Exception) {
        }
    }

    private fun isSocketConnected(): Boolean {
        val socket = connectedSocket ?: return false
        return try {
            socket.isConnected
        } catch (_: Exception) {
            false
        }
    }

    private fun closeCurrentSocket() {
        try {
            connectedSocket?.close()
        } catch (_: Exception) {
        } finally {
            connectedSocket = null
            connectedAddress = ""
            connectedName = ""
        }
    }

    private fun requiredPermissions(): Array<String> {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            arrayOf(
                Manifest.permission.BLUETOOTH_SCAN,
                Manifest.permission.BLUETOOTH_CONNECT,
            )
        } else {
            emptyArray()
        }
    }

    private fun hasBluetoothConnectPermission(): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
            return true
        }
        return activity.checkSelfPermission(Manifest.permission.BLUETOOTH_CONNECT) == android.content.pm.PackageManager.PERMISSION_GRANTED
    }

    private fun emitResult(
        requestId: String?,
        action: String,
        success: Boolean,
        data: JSONObject? = null,
        errorCode: String? = null,
        message: String? = null,
    ) {
        val payload = linkedMapOf<String, Any?>(
            "action" to action,
            "request_id" to safeText(requestId),
            "success" to success,
        )
        if (data != null) payload["data"] = data
        if (!success) {
            payload["code"] = safeText(errorCode.ifBlank { "unknown_error" })
            payload["message"] = safeText(message.ifBlank { "operation failed" })
        }
        emitEvent("result", payload)
    }

    private fun emitState(action: String, payload: Map<String, Any?> = emptyMap()) {
        val result = linkedMapOf<String, Any?>("action" to action)
        payload.forEach { (key, value) -> result[key] = value }
        emitEvent("state", result)
    }

    private fun emitEvent(type: String, payload: Map<String, Any?> = emptyMap()) {
        val obj = JSONObject()
        obj.put("type", type)
        for ((key, value) in payload) {
            obj.put(key, value)
        }
        val encoded = JSONObject.quote(obj.toString())
        emitScript("window.__nativePrinterBridge&&window.__nativePrinterBridge.onEvent(JSON.parse($encoded));")
    }

    private fun safeText(raw: String?): String {
        return (raw ?: "").trim()
    }

    private fun safeText(raw: Any?): String {
        return (raw?.toString() ?: "").trim()
    }

    private fun String?.ifBlank(fallback: () -> String): String {
        val value = safeText(this)
        return if (value.isBlank()) fallback() else value
    }
}
