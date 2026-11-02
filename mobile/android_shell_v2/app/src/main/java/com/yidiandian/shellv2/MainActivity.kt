package com.yidiandian.shellv2

import android.graphics.Color
import android.os.Bundle
import android.view.Gravity
import android.view.KeyEvent
import android.view.View
import android.net.Uri
import android.util.Log
import android.webkit.ConsoleMessage
import android.webkit.JsResult
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.updatePadding
import androidx.lifecycle.lifecycleScope
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var loadingHint: TextView
    private lateinit var bootstrapOverlay: LinearLayout
    private lateinit var retryButton: Button
    private lateinit var rootContainer: View
    private val bootstrap = LocalServiceBootstrap()
    private lateinit var permissionManager: PermissionManager
    private lateinit var nativeVoiceBridge: NativeVoiceBridge
    private lateinit var nativeMediaBridge: NativeMediaBridge
    private lateinit var nativePrinterBridge: NativePrinterBridge
    private lateinit var nativeAppBridge: NativeAppBridge
    private var bootstrapInFlight: Boolean = false
    private var lastVolumeTriggerAtMs: Long = 0L
    private var volumeSpeechActive: Boolean = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.web_view)
        loadingHint = findViewById(R.id.loading_hint)
        bootstrapOverlay = findViewById(R.id.bootstrap_overlay)
        retryButton = findViewById(R.id.bootstrap_retry_btn)
        rootContainer = findViewById(R.id.root_container)
        permissionManager = PermissionManager(this)
        nativeVoiceBridge = NativeVoiceBridge(this) { script ->
            runOnUiThread {
                webView.evaluateJavascript(script, null)
            }
        }
        nativeMediaBridge = NativeMediaBridge(this) { script ->
            runOnUiThread {
                webView.evaluateJavascript(script, null)
            }
        }
        nativePrinterBridge = NativePrinterBridge(this) { script ->
            runOnUiThread {
                webView.evaluateJavascript(script, null)
            }
        }
        nativeAppBridge = NativeAppBridge(this)

        retryButton.setOnClickListener { bootstrapAndLoad() }
        setupWindowInsets()
        setupWebView()
        bootstrapAndLoad()
    }

    private fun setupWindowInsets() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        ViewCompat.setOnApplyWindowInsetsListener(rootContainer) { _, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            webView.updatePadding(
                left = bars.left,
                top = bars.top,
                right = bars.right,
                bottom = bars.bottom
            )
            bootstrapOverlay.updatePadding(
                left = bars.left,
                top = bars.top,
                right = bars.right,
                bottom = bars.bottom
            )
            insets
        }
        ViewCompat.requestApplyInsets(rootContainer)
    }

    private fun setupWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.mediaPlaybackRequiresUserGesture = false
        // The shell serves local 127.0.0.1 assets. Disable WebView caching so
        // upgraded front-end bundles are always reloaded after an app update.
        settings.cacheMode = WebSettings.LOAD_NO_CACHE
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW

        // Guardrail: keep mobile UI metrics consistent with web baseline.
        settings.textZoom = 100
        settings.setSupportZoom(false)
        settings.builtInZoomControls = false
        settings.displayZoomControls = false
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true

        webView.setBackgroundColor(Color.WHITE)
        webView.clearCache(true)
        webView.overScrollMode = View.OVER_SCROLL_NEVER
        webView.isHapticFeedbackEnabled = false
        webView.isVerticalScrollBarEnabled = false
        webView.isHorizontalScrollBarEnabled = false
        webView.webViewClient = WebViewClient()
        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(consoleMessage: ConsoleMessage): Boolean {
                Log.i(
                    "BBQWebView",
                    "[${consoleMessage.messageLevel()}] ${consoleMessage.message()} @${consoleMessage.sourceId()}:${consoleMessage.lineNumber()}"
                )
                return super.onConsoleMessage(consoleMessage)
            }

            override fun onPermissionRequest(request: PermissionRequest) {
                runOnUiThread {
                    try {
                        request.grant(request.resources)
                    } catch (_: Exception) {
                        request.deny()
                    }
                }
            }

            override fun onJsConfirm(
                view: WebView?,
                url: String?,
                message: String?,
                result: JsResult
            ): Boolean {
                if (isFinishing || isDestroyed) {
                    result.cancel()
                    return true
                }
                var consumed = false
                fun finish(confirm: Boolean) {
                    if (consumed) return
                    consumed = true
                    if (confirm) {
                        result.confirm()
                    } else {
                        result.cancel()
                    }
                }
                val dialog = MaterialAlertDialogBuilder(this@MainActivity)
                    .setMessage(message ?: "请确认操作")
                    .setPositiveButton("确认") { _, _ -> finish(true) }
                    .setNegativeButton("取消") { _, _ -> finish(false) }
                    .setCancelable(true)
                    .create()
                dialog.setOnCancelListener { finish(false) }
                dialog.setOnDismissListener { finish(false) }
                dialog.show()
                dialog.window?.setGravity(Gravity.CENTER)
                return true
            }
        }
        webView.addJavascriptInterface(nativeVoiceBridge, "AndroidVoiceBridge")
        webView.addJavascriptInterface(nativeMediaBridge, "AndroidMediaBridge")
        webView.addJavascriptInterface(nativePrinterBridge, "AndroidPrinterBridge")
        webView.addJavascriptInterface(nativeAppBridge, "AndroidAppBridge")
    }

    private fun bootstrapAndLoad() {
        if (bootstrapInFlight) return
        bootstrapInFlight = true
        lifecycleScope.launch {
            bootstrapOverlay.visibility = View.VISIBLE
            retryButton.visibility = View.GONE
            loadingHint.text = "正在启动本地服务..."
            val result = withContext(Dispatchers.IO) {
                val report = bootstrap.ensureStarted(this@MainActivity)
                val healthy = bootstrap.waitUntilHealthy()
                Pair(report, healthy)
            }
            bootstrapInFlight = false
            val report = result.first
            val healthy = result.second
            if (healthy) {
                bootstrapOverlay.visibility = View.GONE
                if (webView.url.isNullOrBlank()) {
                    webView.loadUrl(buildInitialWebUrl())
                }
                permissionManager.ensureMicrophonePermission()
                permissionManager.ensureNotificationPermission()
                return@launch
            }
            bootstrapOverlay.visibility = View.VISIBLE
            retryButton.visibility = View.VISIBLE
            loadingHint.text =
                "服务未就绪\n模式: ${report.mode}\n详情: ${report.message}\n健康检查: ${AppConfig.LOCAL_HEALTH_URL}"
        }
    }

    private fun buildInitialWebUrl(): String {
        val base = AppConfig.LOCAL_WEB_BASE_URL
        val klsBase = AppConfig.KLS_API_BASE.trim()
        val devAccessToken = AppConfig.DEV_INJECT_ACCESS_TOKEN.trim()
        val devRefreshToken = AppConfig.DEV_INJECT_REFRESH_TOKEN.trim()
        val devRole = AppConfig.DEV_INJECT_ROLE.trim()
        val hasDevInjectedAuth =
            devAccessToken.isNotEmpty() || devRefreshToken.isNotEmpty() || devRole.isNotEmpty()
        return try {
            val builder = Uri.parse(base).buildUpon()
            if (klsBase.isNotEmpty()) {
                builder.appendQueryParameter("kls_base", klsBase)
            }
            // Only enable dev auth query params when explicitly enabled for debug builds.
            if (BuildConfig.DEBUG && AppConfig.DEV_AUTH_INJECT_ENABLED && hasDevInjectedAuth) {
                builder.appendQueryParameter("dev_persist_auth", "1")
                if (devAccessToken.isNotEmpty()) {
                    builder.appendQueryParameter("dev_access_token", devAccessToken)
                }
                if (devRefreshToken.isNotEmpty()) {
                    builder.appendQueryParameter("dev_refresh_token", devRefreshToken)
                }
                if (devRole.isNotEmpty()) {
                    builder.appendQueryParameter("dev_role", devRole)
                }
            }
            builder.build().toString()
        } catch (_: Exception) {
            base
        }
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_VOLUME_DOWN || keyCode == KeyEvent.KEYCODE_VOLUME_UP) {
            if ((event?.repeatCount ?: 0) > 0) {
                return true
            }
            if (volumeSpeechActive) {
                return true
            }
            val now = System.currentTimeMillis()
            if (now - lastVolumeTriggerAtMs < 320L) {
                return true
            }
            lastVolumeTriggerAtMs = now
            volumeSpeechActive = true
            Log.i("BBQWebView", "[KEY] volume pressed code=$keyCode")
            // Guardrail: do not implement business logic in Android layer.
            webView.evaluateJavascript(
                "(function(){if(typeof window.__bbqVolumeKeySpeechStart==='function'){return window.__bbqVolumeKeySpeechStart($keyCode);}return 'missing';})();",
            ) { result ->
                Log.i("BBQWebView", "[KEY] volume down route result=$result")
            }
            return true
        }
        return super.onKeyDown(keyCode, event)
    }

    override fun onKeyUp(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_VOLUME_DOWN || keyCode == KeyEvent.KEYCODE_VOLUME_UP) {
            if (!volumeSpeechActive) {
                return true
            }
            volumeSpeechActive = false
            Log.i("BBQWebView", "[KEY] volume released code=$keyCode")
            webView.evaluateJavascript(
                "(function(){if(typeof window.__bbqVolumeKeySpeechStop==='function'){return window.__bbqVolumeKeySpeechStop($keyCode);}return 'missing';})();",
            ) { result ->
                Log.i("BBQWebView", "[KEY] volume up route result=$result")
            }
            return true
        }
        return super.onKeyUp(keyCode, event)
    }

    override fun onDestroy() {
        nativePrinterBridge.destroy()
        nativeMediaBridge.destroy()
        nativeVoiceBridge.destroy()
        super.onDestroy()
    }
}
