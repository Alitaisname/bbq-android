package com.yidiandian.shellv2

import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import java.io.ByteArrayOutputStream
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.math.sqrt

class NativeAudioRecorder(
    private val sampleRate: Int = 16000,
    private val channelCount: Int = 1,
    private val onLevel: (Float) -> Unit = {},
    private val onChunk: (ByteArray) -> Unit = {},
) {
    private var audioRecord: AudioRecord? = null
    private var workerThread: Thread? = null
    private val recording = AtomicBoolean(false)
    private val output = ByteArrayOutputStream()

    fun start() {
        if (recording.get()) return
        val channelConfig = AudioFormat.CHANNEL_IN_MONO
        val minBuffer = AudioRecord.getMinBufferSize(
            sampleRate,
            channelConfig,
            AudioFormat.ENCODING_PCM_16BIT,
        )
        val bufferSize = maxOf(minBuffer, 4096)
        val recorder = AudioRecord(
            MediaRecorder.AudioSource.MIC,
            sampleRate,
            channelConfig,
            AudioFormat.ENCODING_PCM_16BIT,
            bufferSize,
        )
        if (recorder.state != AudioRecord.STATE_INITIALIZED) {
            recorder.release()
            throw IllegalStateException("native recorder init failed")
        }
        output.reset()
        audioRecord = recorder
        recording.set(true)
        recorder.startRecording()

        workerThread = Thread {
            val shortBuffer = ShortArray(bufferSize / 2)
            var lastLevelAt = 0L
            while (recording.get()) {
                val read = recorder.read(shortBuffer, 0, shortBuffer.size)
                if (read <= 0) continue
                val bytes = ByteArray(read * 2)
                var energy = 0.0
                for (i in 0 until read) {
                    val sample = shortBuffer[i].toInt()
                    bytes[i * 2] = (sample and 0xFF).toByte()
                    bytes[i * 2 + 1] = ((sample shr 8) and 0xFF).toByte()
                    val normalized = sample / 32768.0
                    energy += normalized * normalized
                }
                synchronized(output) {
                    output.write(bytes, 0, bytes.size)
                }
                try {
                    onChunk(bytes)
                } catch (_: Exception) {
                }
                val now = System.currentTimeMillis()
                if (now - lastLevelAt >= 90L) {
                    val rms = sqrt(energy / read).toFloat().coerceIn(0f, 1f)
                    try {
                        onLevel(rms)
                    } catch (_: Exception) {
                    }
                    lastLevelAt = now
                }
            }
        }.apply {
            name = "native-audio-recorder"
            isDaemon = true
            start()
        }
    }

    fun stopAndGetPcm(): ByteArray {
        if (!recording.getAndSet(false)) {
            return synchronized(output) { output.toByteArray() }
        }
        try {
            audioRecord?.stop()
        } catch (_: Exception) {
        }
        try {
            workerThread?.join(500L)
        } catch (_: Exception) {
        }
        workerThread = null
        try {
            audioRecord?.release()
        } catch (_: Exception) {
        }
        audioRecord = null
        return synchronized(output) { output.toByteArray() }
    }

    fun cancel() {
        recording.set(false)
        try {
            audioRecord?.stop()
        } catch (_: Exception) {
        }
        try {
            workerThread?.join(300L)
        } catch (_: Exception) {
        }
        workerThread = null
        try {
            audioRecord?.release()
        } catch (_: Exception) {
        }
        audioRecord = null
        synchronized(output) {
            output.reset()
        }
    }

    fun isRecording(): Boolean = recording.get()

    fun currentSampleRate(): Int = sampleRate
    fun currentChannels(): Int = channelCount
}
