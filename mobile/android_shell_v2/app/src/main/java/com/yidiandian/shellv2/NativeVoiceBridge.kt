package com.yidiandian.shellv2

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.os.Handler
import android.os.Looper
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.Base64
import android.webkit.JavascriptInterface
import androidx.core.content.ContextCompat
import org.json.JSONObject
import java.util.Locale
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicReference

class NativeVoiceBridge(
    private val context: Context,
    private val emitScript: (String) -> Unit,
) {
    private val io = Executors.newSingleThreadExecutor { runnable ->
        Thread(runnable, "native-voice-bridge").apply { isDaemon = true }
    }
    private val mainHandler = Handler(Looper.getMainLooper())
    private val recorderRef = AtomicReference<NativeAudioRecorder?>(null)
    @Volatile
    private var currentMode: String = "main"
    @Volatile
    private var ttsReady: Boolean = false
    @Volatile
    private var pendingSpeakText: String? = null
    @Volatile
    private var currentTtsUtteranceId: String = ""
    private var tts: TextToSpeech? = null

    @JavascriptInterface
    fun isAvailable(): Boolean = true

    @JavascriptInterface
    fun isRecording(): Boolean = recorderRef.get()?.isRecording() == true

    @JavascriptInterface
    fun startCapture(mode: String?): Boolean {
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            emitEvent(
                type = "error",
                payload = mapOf(
                    "code" to "permission_denied",
                    "message" to "record_audio permission denied",
                ),
            )
            return false
        }
        if (recorderRef.get()?.isRecording() == true) {
            emitEvent(
                type = "error",
                payload = mapOf(
                    "code" to "already_recording",
                    "message" to "native recorder already running",
                ),
            )
            return false
        }
        currentMode = mode?.trim().orEmpty().ifEmpty { "main" }
        io.execute {
            try {
                val recorder = NativeAudioRecorder(
                    sampleRate = 16000,
                    channelCount = 1,
                    onLevel = { level ->
                        emitEvent(
                            type = "level",
                            payload = mapOf(
                                "mode" to currentMode,
                                "level" to level,
                            ),
                        )
                    },
                    onChunk = { pcmChunk ->
                        if (pcmChunk.isEmpty()) return@NativeAudioRecorder
                        val b64 = Base64.encodeToString(pcmChunk, Base64.NO_WRAP)
                        emitEvent(
                            type = "chunk",
                            payload = mapOf(
                                "mode" to currentMode,
                                "sample_rate" to 16000,
                                "channels" to 1,
                                "pcm16_base64" to b64,
                                "bytes" to pcmChunk.size,
                            ),
                        )
                    },
                )
                recorder.start()
                recorderRef.set(recorder)
                emitEvent(
                    type = "started",
                    payload = mapOf(
                        "mode" to currentMode,
                        "sample_rate" to recorder.currentSampleRate(),
                        "channels" to recorder.currentChannels(),
                    ),
                )
            } catch (error: Exception) {
                recorderRef.getAndSet(null)?.cancel()
                emitEvent(
                    type = "error",
                    payload = mapOf(
                        "code" to "start_failed",
                        "message" to (error.message ?: "native recorder start failed"),
                    ),
                )
            }
        }
        return true
    }

    @JavascriptInterface
    fun stopCapture(): Boolean {
        val recorder = recorderRef.get()
        if (recorder == null || !recorder.isRecording()) {
            emitEvent(
                type = "error",
                payload = mapOf(
                    "code" to "not_recording",
                    "message" to "native recorder not active",
                ),
            )
            return false
        }
        io.execute {
            try {
                val pcm = recorder.stopAndGetPcm()
                recorderRef.set(null)
                val b64 = Base64.encodeToString(pcm, Base64.NO_WRAP)
                emitEvent(
                    type = "stopped",
                    payload = mapOf(
                        "mode" to currentMode,
                        "sample_rate" to recorder.currentSampleRate(),
                        "channels" to recorder.currentChannels(),
                        "pcm16_base64" to b64,
                        "bytes" to pcm.size,
                    ),
                )
            } catch (error: Exception) {
                recorderRef.set(null)
                emitEvent(
                    type = "error",
                    payload = mapOf(
                        "code" to "stop_failed",
                        "message" to (error.message ?: "native recorder stop failed"),
                    ),
                )
            }
        }
        return true
    }

    @JavascriptInterface
    fun cancelCapture(): Boolean {
        val recorder = recorderRef.getAndSet(null) ?: return false
        io.execute {
            recorder.cancel()
            emitEvent(
                type = "cancelled",
                payload = mapOf("mode" to currentMode),
            )
        }
        return true
    }

    @JavascriptInterface
    fun speakText(text: String?): Boolean {
        val clean = text?.trim().orEmpty()
        if (clean.isEmpty()) return false
        mainHandler.post {
            try {
                val engine = ensureTts()
                if (engine == null) {
                    emitEvent(
                        type = "error",
                        payload = mapOf(
                            "code" to "tts_unavailable",
                            "message" to "native tts unavailable",
                        ),
                    )
                    return@post
                }
                val utteranceId = "bbq-tts-${System.currentTimeMillis()}"
                currentTtsUtteranceId = utteranceId
                if (ttsReady) {
                    val speakResult = engine.speak(clean, TextToSpeech.QUEUE_FLUSH, null, utteranceId)
                    if (speakResult == TextToSpeech.ERROR) {
                        currentTtsUtteranceId = ""
                        emitEvent(
                            type = "tts_error",
                            payload = mapOf(
                                "utterance_id" to utteranceId,
                                "message" to "native tts speak rejected",
                            ),
                        )
                    }
                } else {
                    pendingSpeakText = clean
                }
            } catch (_: Exception) {
                emitEvent(
                    type = "tts_error",
                    payload = mapOf(
                        "message" to "native tts failed",
                    ),
                )
            }
        }
        return true
    }

    @JavascriptInterface
    fun stopSpeak(): Boolean {
        mainHandler.post {
            try {
                pendingSpeakText = null
                currentTtsUtteranceId = ""
                tts?.stop()
            } catch (_: Exception) {
            } finally {
                emitEvent(type = "tts_done")
            }
        }
        return true
    }

    fun destroy() {
        recorderRef.getAndSet(null)?.cancel()
        mainHandler.post {
            try {
                tts?.stop()
                tts?.shutdown()
            } catch (_: Exception) {
            } finally {
                tts = null
                ttsReady = false
                pendingSpeakText = null
            }
        }
        io.shutdownNow()
    }

    private fun ensureTts(): TextToSpeech? {
        if (tts != null) return tts
        tts = TextToSpeech(context.applicationContext) { status ->
            val engine = tts ?: return@TextToSpeech
            if (status == TextToSpeech.SUCCESS) {
                val result = engine.setLanguage(Locale.SIMPLIFIED_CHINESE)
                ttsReady = result != TextToSpeech.LANG_MISSING_DATA && result != TextToSpeech.LANG_NOT_SUPPORTED
                if (!ttsReady) {
                    engine.language = Locale.CHINA
                    ttsReady = true
                }
                pendingSpeakText?.let { msg ->
                    pendingSpeakText = null
                    try {
                        val utteranceId = "bbq-tts-${System.currentTimeMillis()}"
                        currentTtsUtteranceId = utteranceId
                        val speakResult = engine.speak(msg, TextToSpeech.QUEUE_FLUSH, null, utteranceId)
                        if (speakResult == TextToSpeech.ERROR) {
                            currentTtsUtteranceId = ""
                            emitEvent(
                                type = "tts_error",
                                payload = mapOf(
                                    "utterance_id" to utteranceId,
                                    "message" to "native tts speak rejected",
                                ),
                            )
                        }
                    } catch (_: Exception) {
                        emitEvent(
                            type = "tts_error",
                            payload = mapOf(
                                "message" to "native tts failed",
                            ),
                        )
                    }
                }
            } else {
                ttsReady = false
                emitEvent(
                    type = "tts_error",
                    payload = mapOf(
                        "message" to "native tts unavailable",
                    ),
                )
            }
        }
        tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(utteranceId: String?) {
                val currentId = utteranceId?.trim().orEmpty()
                if (currentId.isEmpty()) return
                emitEvent(
                    type = "tts_started",
                    payload = mapOf("utterance_id" to currentId),
                )
            }

            override fun onDone(utteranceId: String?) {
                val currentId = utteranceId?.trim().orEmpty()
                if (currentId.isEmpty()) return
                if (currentId == currentTtsUtteranceId) {
                    currentTtsUtteranceId = ""
                }
                emitEvent(
                    type = "tts_done",
                    payload = mapOf("utterance_id" to currentId),
                )
            }

            @Deprecated("Deprecated in Java")
            override fun onError(utteranceId: String?) {
                onError(utteranceId, TextToSpeech.ERROR)
            }

            override fun onError(utteranceId: String?, errorCode: Int) {
                val currentId = utteranceId?.trim().orEmpty()
                if (currentId == currentTtsUtteranceId) {
                    currentTtsUtteranceId = ""
                }
                emitEvent(
                    type = "tts_error",
                    payload = mapOf(
                        "utterance_id" to currentId,
                        "error_code" to errorCode,
                        "message" to "native tts playback error",
                    ),
                )
            }

            override fun onStop(utteranceId: String?, interrupted: Boolean) {
                val currentId = utteranceId?.trim().orEmpty()
                if (currentId == currentTtsUtteranceId) {
                    currentTtsUtteranceId = ""
                }
                emitEvent(
                    type = "tts_done",
                    payload = mapOf(
                        "utterance_id" to currentId,
                        "interrupted" to interrupted,
                    ),
                )
            }
        })
        return tts
    }

    private fun emitEvent(type: String, payload: Map<String, Any?> = emptyMap()) {
        val obj = JSONObject()
        obj.put("type", type)
        for ((key, value) in payload) {
            obj.put(key, value)
        }
        val encoded = JSONObject.quote(obj.toString())
        emitScript("window.__nativeVoiceBridge&&window.__nativeVoiceBridge.onEvent(JSON.parse($encoded));")
    }
}
