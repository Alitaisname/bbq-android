package com.yidiandian.shellv2

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Typeface
import android.text.Layout
import android.text.StaticLayout
import android.text.TextDirectionHeuristics
import android.text.TextPaint
import org.json.JSONArray
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.ceil
import kotlin.math.max

object BitmapTicketRenderer {
    private val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.CHINA)

    private data class ReceiptLine(
        val text: String,
        val isItem: Boolean = false,
    )

    fun render(payload: JSONObject): ByteArray {
        val widthMm = if (payload.optInt("width_mm", 58) >= 76) 80 else 58
        val widthPx = if (widthMm >= 76) 576 else 384
        val displayLanguage = clean(payload.optString("display_language", "zh_cn"))
        if (displayLanguage != "ug_cn") {
            return escPosRaster(renderChineseBitmap(payload, widthPx))
        }
        val lines = buildReceiptLines(payload)
        val bitmap = renderTextBitmap(lines, widthPx, normalizeItemFontSize(payload.optString("item_font_size", "small")))
        return escPosRaster(bitmap)
    }

    private fun renderChineseBitmap(payload: JSONObject, widthPx: Int): Bitmap {
        val padding = 18f
        val contentWidth = widthPx - padding * 2
        val titlePaint = textPaint(38f, true).apply { textAlign = Paint.Align.CENTER }
        val basePaint = textPaint(24f, false)
        val headerPaint = textPaint(22f, true)
        val itemNamePaint = textPaint(
            when (normalizeItemFontSize(payload.optString("item_font_size", "small"))) {
                "large" -> 42f
                "medium" -> 35f
                else -> 30f
            },
            false,
        )
        val itemNumberPaint = textPaint(26f, false).apply { textAlign = Paint.Align.RIGHT }
        val notePaint = textPaint(24f, false)
        val totalPaint = textPaint(32f, true)
        val linePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.BLACK
            strokeWidth = 1f
        }
        val items = payload.optJSONArray("items") ?: JSONArray()
        val maxHeight = max(1200, 260 + items.length() * 180)
        val draft = Bitmap.createBitmap(widthPx, maxHeight, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(draft)
        canvas.drawColor(Color.WHITE)

        val qtyRight = padding + contentWidth * 0.55f
        val unitRight = padding + contentWidth * 0.77f
        val amountRight = padding + contentWidth
        val nameMaxWidth = (qtyRight - padding - 14f).coerceAtMost(contentWidth * 0.42f)
        var y = padding

        fun drawTextLine(text: String, paint: Paint, x: Float = padding, align: Paint.Align = Paint.Align.LEFT) {
            val oldAlign = paint.textAlign
            paint.textAlign = align
            y += lineHeight(paint)
            canvas.drawText(text, x, y - paint.fontMetrics.descent, paint)
            paint.textAlign = oldAlign
        }

        val title = clean(payload.optString("title", "")).ifBlank { clean(payload.optString("store_name", "账单小票")).ifBlank { "账单小票" } }
        for (line in wrapByPaint(title, titlePaint, contentWidth)) {
            drawTextLine(line, titlePaint, widthPx / 2f, Paint.Align.CENTER)
        }
        y += 8f
        canvas.drawLine(padding, y, amountRight, y, linePaint)
        y += 8f
        drawTextLine(
            "桌号: ${clean(payload.optString("table_no", "-"))}    单号: ${clean(payload.optString("order_no", "-"))}",
            basePaint,
        )
        drawTextLine("时间: ${clean(payload.optString("printed_at", dateFormat.format(Date())))}", basePaint)
        y += 8f
        canvas.drawLine(padding, y, amountRight, y, linePaint)
        y += 8f

        y += lineHeight(headerPaint)
        val headerBaseline = y - headerPaint.fontMetrics.descent
        canvas.drawText("菜品", padding, headerBaseline, headerPaint)
        headerPaint.textAlign = Paint.Align.RIGHT
        canvas.drawText("数量", qtyRight, headerBaseline, headerPaint)
        canvas.drawText("单价", unitRight, headerBaseline, headerPaint)
        canvas.drawText("小计", amountRight, headerBaseline, headerPaint)
        headerPaint.textAlign = Paint.Align.LEFT
        y += 8f
        canvas.drawLine(padding, y, amountRight, y, linePaint)
        y += 8f

        var totalCents = 0
        for (i in 0 until items.length()) {
            val item = items.optJSONObject(i) ?: continue
            val name = clean(item.optString("name", "未命名菜品")).ifBlank { "未命名菜品" }
            val note = clean(item.optString("note", ""))
            val qty = max(1, item.optInt("qty", 1))
            val unit = max(0, item.optInt("price_cents", 0))
            val subtotal = qty * unit
            totalCents += subtotal
            val nameLines = wrapByPaint(name, itemNamePaint, nameMaxWidth)

            y += lineHeight(itemNamePaint)
            val firstBaseline = y - itemNamePaint.fontMetrics.descent
            canvas.drawText(nameLines.firstOrNull() ?: name, padding, firstBaseline, itemNamePaint)
            canvas.drawText("x$qty", qtyRight, firstBaseline, itemNumberPaint)
            canvas.drawText(centsToYuan(unit), unitRight, firstBaseline, itemNumberPaint)
            canvas.drawText(centsToYuan(subtotal), amountRight, firstBaseline, itemNumberPaint)
            for (tail in nameLines.drop(1)) {
                y += lineHeight(itemNamePaint)
                canvas.drawText(tail, padding, y - itemNamePaint.fontMetrics.descent, itemNamePaint)
            }
            if (note.isNotBlank()) {
                for (line in wrapByPaint("($note)", notePaint, contentWidth - 8f)) {
                    y += lineHeight(notePaint)
                    canvas.drawText(line, padding + 8f, y - notePaint.fontMetrics.descent, notePaint)
                }
            }
            y += 10f
        }

        canvas.drawLine(padding, y, amountRight, y, linePaint)
        val totalFromPayload = max(0, payload.optInt("total_cents", totalCents))
        y += lineHeight(totalPaint) + 4f
        canvas.drawText("合计", padding, y - totalPaint.fontMetrics.descent, totalPaint)
        totalPaint.textAlign = Paint.Align.RIGHT
        canvas.drawText(centsToYuan(totalFromPayload), amountRight, y - totalPaint.fontMetrics.descent, totalPaint)
        totalPaint.textAlign = Paint.Align.LEFT

        val remark = clean(payload.optString("remark", ""))
        if (remark.isNotBlank()) {
            drawTextLine("备注：$remark", basePaint)
        }
        val footer = clean(payload.optString("footer", "欢迎下次光临"))
        if (footer.isNotBlank()) {
            y += 8f
            drawTextLine(footer, basePaint, widthPx / 2f, Paint.Align.CENTER)
        }

        val finalHeight = (ceil((y + padding) / 8.0).toInt() * 8).coerceAtMost(maxHeight)
        return Bitmap.createBitmap(draft, 0, 0, widthPx, finalHeight)
    }

    private fun buildReceiptLines(payload: JSONObject): List<ReceiptLine> {
        val out = mutableListOf<ReceiptLine>()
        val storeName = clean(payload.optString("store_name", ""))
        val title = clean(payload.optString("title", "")).ifBlank { storeName.ifBlank { "تالون" } }
        val tableNo = clean(payload.optString("table_no", "-"))
        val orderNo = clean(payload.optString("order_no", "-"))
        val timestamp = clean(payload.optString("printed_at", dateFormat.format(Date())))
        val items = payload.optJSONArray("items") ?: JSONArray()
        val totalCents = max(0, payload.optInt("total_cents", sumItemsCents(items)))
        val remark = clean(payload.optString("remark", ""))
        val footer = clean(payload.optString("footer", "قايتا كېلىڭ"))

        out += ReceiptLine(title)
        out += ReceiptLine("--------------------------------")
        out += ReceiptLine("ئۈستەل: $tableNo    نومۇر: $orderNo")
        out += ReceiptLine("ۋاقىت: $timestamp")
        out += ReceiptLine("--------------------------------")
        out += ReceiptLine("تاماق                 سانى   باھا   جەمئى")
        out += ReceiptLine("--------------------------------")
        for (i in 0 until items.length()) {
            val item = items.optJSONObject(i) ?: continue
            val name = clean(item.optString("name", "تاماق"))
            val note = clean(item.optString("note", ""))
            val qty = max(1, item.optInt("qty", 1))
            val unit = max(0, item.optInt("price_cents", 0))
            val subtotal = qty * unit
            out += ReceiptLine(name, isItem = true)
            if (note.isNotBlank()) out += ReceiptLine("  ($note)", isItem = true)
            out += ReceiptLine("x$qty    ${centsToYuan(unit)}    ${centsToYuan(subtotal)}", isItem = true)
        }
        out += ReceiptLine("--------------------------------")
        out += ReceiptLine("جەمئى: ${centsToYuan(totalCents)}")
        if (remark.isNotBlank()) out += ReceiptLine("ئىزاھات: $remark")
        if (footer.isNotBlank()) out += ReceiptLine(footer)
        return out
    }

    private fun renderTextBitmap(lines: List<ReceiptLine>, widthPx: Int, itemFontSize: String): Bitmap {
        val padding = 18
        val basePaint = TextPaint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.BLACK
            textSize = 25f
            typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.NORMAL)
        }
        val itemPaint = TextPaint(basePaint).apply {
            textSize = when (itemFontSize) {
                "large" -> 35f
                "medium" -> 30f
                else -> 25f
            }
            typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.BOLD)
        }
        val textWidth = widthPx - padding * 2
        val layouts = lines.map { line ->
            buildStaticLayout(line.text, if (line.isItem) itemPaint else basePaint, textWidth)
        }
        val contentHeight = layouts.sumOf { it.height }
        val height = max(96, contentHeight + padding * 2)
        val alignedHeight = ceil(height / 8.0).toInt() * 8
        val bitmap = Bitmap.createBitmap(widthPx, alignedHeight, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        canvas.drawColor(Color.WHITE)
        var y = padding.toFloat()
        for (layout in layouts) {
            canvas.save()
            canvas.translate(padding.toFloat(), y)
            layout.draw(canvas)
            canvas.restore()
            y += layout.height
        }
        return bitmap
    }

    private fun buildStaticLayout(text: String, paint: TextPaint, widthPx: Int): StaticLayout {
        return StaticLayout.Builder.obtain(text, 0, text.length, paint, widthPx)
            .setAlignment(Layout.Alignment.ALIGN_NORMAL)
            .setTextDirection(TextDirectionHeuristics.FIRSTSTRONG_RTL)
            .setLineSpacing(4f, 1.0f)
            .setIncludePad(true)
            .build()
    }

    private fun textPaint(size: Float, bold: Boolean): TextPaint {
        return TextPaint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.BLACK
            textSize = size
            typeface = Typeface.create(Typeface.SANS_SERIF, if (bold) Typeface.BOLD else Typeface.NORMAL)
        }
    }

    private fun lineHeight(paint: Paint): Float {
        val metrics = paint.fontMetrics
        return metrics.descent - metrics.ascent + 5f
    }

    private fun wrapByPaint(text: String, paint: Paint, maxWidth: Float): List<String> {
        val source = clean(text)
        if (source.isBlank()) return listOf("")
        val lines = mutableListOf<String>()
        val current = StringBuilder()
        for (char in source) {
            val next = current.toString() + char
            if (current.isNotEmpty() && paint.measureText(next) > maxWidth) {
                lines += current.toString()
                current.clear()
            }
            current.append(char)
        }
        if (current.isNotEmpty()) lines += current.toString()
        return lines.ifEmpty { listOf(source) }
    }

    private fun escPosRaster(bitmap: Bitmap): ByteArray {
        val out = ByteArrayOutputStream(bitmap.width * bitmap.height / 8 + 64)
        write(out, byteArrayOf(0x1B, 0x40))
        write(out, byteArrayOf(0x1B, 0x61, 0x01))
        val widthBytes = (bitmap.width + 7) / 8
        val height = bitmap.height
        write(
            out,
            byteArrayOf(
                0x1D, 0x76, 0x30, 0x00,
                (widthBytes and 0xFF).toByte(),
                ((widthBytes shr 8) and 0xFF).toByte(),
                (height and 0xFF).toByte(),
                ((height shr 8) and 0xFF).toByte(),
            )
        )
        for (y in 0 until height) {
            for (xByte in 0 until widthBytes) {
                var value = 0
                for (bit in 0 until 8) {
                    val x = xByte * 8 + bit
                    if (x >= bitmap.width) continue
                    val pixel = bitmap.getPixel(x, y)
                    val red = Color.red(pixel)
                    val green = Color.green(pixel)
                    val blue = Color.blue(pixel)
                    val luminance = (red * 30 + green * 59 + blue * 11) / 100
                    if (luminance < 180) {
                        value = value or (0x80 shr bit)
                    }
                }
                out.write(value)
            }
        }
        write(out, byteArrayOf(0x0A, 0x0A, 0x0A, 0x1D, 0x56, 0x00))
        return out.toByteArray()
    }

    private fun sumItemsCents(items: JSONArray): Int {
        var total = 0
        for (i in 0 until items.length()) {
            val item = items.optJSONObject(i) ?: continue
            val qty = max(1, item.optInt("qty", 1))
            total += qty * max(0, item.optInt("price_cents", 0))
        }
        return total
    }

    private fun centsToYuan(cents: Int): String {
        return "¥%.2f".format(Locale.CHINA, cents / 100.0)
    }

    private fun clean(value: String?): String {
        return (value ?: "").replace("\r", " ").trim()
    }

    private fun normalizeItemFontSize(raw: String?): String {
        return when ((raw ?: "").trim().lowercase(Locale.ROOT)) {
            "medium" -> "medium"
            "large" -> "large"
            else -> "small"
        }
    }

    private fun write(out: ByteArrayOutputStream, bytes: ByteArray) {
        out.write(bytes)
    }
}
