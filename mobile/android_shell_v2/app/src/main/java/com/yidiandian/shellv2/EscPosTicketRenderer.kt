package com.yidiandian.shellv2

import org.json.JSONArray
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.nio.charset.Charset
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.max

object EscPosTicketRenderer {
    private val charsetGb18030: Charset = Charset.forName("GB18030")
    private val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.CHINA)

    private data class ItemColumns(
        val name: Int,
        val qty: Int,
        val unitPrice: Int,
        val amount: Int,
    )

    private enum class ItemFontSize {
        SMALL,
        MEDIUM,
        LARGE,
    }

    fun render(payload: JSONObject): ByteArray {
        val widthMm = normalizeWidthMm(payload.optInt("width_mm", 58))
        val lineChars = if (widthMm >= 76) 48 else 32
        val columns = itemColumns(lineChars)
        val itemFontSize = normalizeItemFontSize(payload.optString("item_font_size", "small"))
        val out = ByteArrayOutputStream(1024)

        val storeName = sanitize(payload.optString("store_name", "烧烤店"))
        val title = sanitize(payload.optString("title", storeName.ifBlank { "易点点 小票" }))
            .ifBlank { storeName.ifBlank { "易点点 小票" } }

        writeRaw(out, byteArrayOf(0x1B, 0x40))
        writeRaw(out, byteArrayOf(0x1B, 0x61, 0x01))
        writeRaw(out, byteArrayOf(0x1D, 0x21, 0x11))
        writeLine(out, title, lineChars, 1)
        writeRaw(out, byteArrayOf(0x1D, 0x21, 0x00))
        writeRaw(out, byteArrayOf(0x1B, 0x61, 0x00))

        writeLine(out, repeat("-", lineChars), lineChars)
        writeLine(
            out,
            lineWithRight(
                "桌号: ${sanitize(payload.optString("table_no", "-"))}",
                "单号: ${sanitize(payload.optString("order_no", "-"))}",
                lineChars,
            ),
            lineChars,
        )
        val timestamp = sanitize(payload.optString("printed_at", dateFormat.format(Date())))
        writeLine(out, "时间: $timestamp", lineChars)
        writeLine(out, repeat("-", lineChars), lineChars)

        writeLine(out, buildHeader(columns), lineChars)
        writeLine(out, repeat("-", lineChars), lineChars)

        val items = payload.optJSONArray("items") ?: JSONArray()
        var totalCents = 0
        for (i in 0 until items.length()) {
            val item = items.optJSONObject(i) ?: continue
            val name = sanitize(item.optString("name", "未命名菜品"))
            val note = sanitize(item.optString("note", ""))
            val qty = max(1, item.optInt("qty", 1))
            val priceCents = max(0, item.optInt("price_cents", 0))
            val subtotal = qty * priceCents
            totalCents += subtotal
            writeItemLines(out, lineChars, columns, name, qty, priceCents, subtotal, note, itemFontSize)
        }

        writeLine(out, repeat("-", lineChars), lineChars)
        val totalFromPayload = max(0, payload.optInt("total_cents", totalCents))
        writeLine(out, lineWithRight("合计", centsToYuan(totalFromPayload), lineChars), lineChars)

        val remark = sanitize(payload.optString("remark", ""))
        if (remark.isNotBlank()) {
            writeLine(out, "备注：$remark", lineChars)
        }
        val footer = sanitize(payload.optString("footer", "欢迎下次光临"))
        if (footer.isNotBlank()) {
            writeRaw(out, byteArrayOf(0x1B, 0x61, 0x01))
            writeLine(out, footer, lineChars, 1)
            writeRaw(out, byteArrayOf(0x1B, 0x61, 0x00))
        }

        val feedLines = payload.optInt("feed_lines", 4).coerceIn(2, 8)
        writeRaw(out, byteArrayOf(0x1B, 0x64, feedLines.toByte()))
        writeRaw(out, byteArrayOf(0x1D, 0x56, 0x00))
        return out.toByteArray()
    }

    private fun itemColumns(lineChars: Int): ItemColumns {
        return if (lineChars >= 48) {
            ItemColumns(name = 24, qty = 6, unitPrice = 9, amount = 9)
        } else {
            ItemColumns(name = 14, qty = 4, unitPrice = 7, amount = 7)
        }
    }

    private fun writeItemLines(
        out: ByteArrayOutputStream,
        lineChars: Int,
        columns: ItemColumns,
        name: String,
        qty: Int,
        priceCents: Int,
        subtotalCents: Int,
        note: String,
        itemFontSize: ItemFontSize,
    ) {
        if (itemFontSize == ItemFontSize.LARGE) {
            val qtyText = "x$qty"
            val unitText = centsToYuan(priceCents)
            val amountText = centsToYuan(subtotalCents)
            val numericText =
                padLeft(qtyText, columns.qty) +
                    padLeft(unitText, columns.unitPrice) +
                    padLeft(amountText, columns.amount)
            val firstNameWidth = max(2, columns.name / 2)
            val nameLines = chunkByDisplayWidth(name, firstNameWidth)
            val firstName = nameLines.firstOrNull() ?: ""

            writeRaw(out, byteArrayOf(0x1D, 0x21, 0x11))
            writeTextRaw(out, firstName)
            writeRaw(out, byteArrayOf(0x1D, 0x21, 0x00))
            val gap = max(0, columns.name - displayWidth(firstName) * 2)
            writeTextRaw(out, " ".repeat(gap) + numericText)
            writeRaw(out, byteArrayOf(0x0A))

            if (nameLines.size > 1) {
                writeRaw(out, byteArrayOf(0x1D, 0x21, 0x11))
                val largeLineChars = max(8, lineChars / 2)
                for (tail in nameLines.drop(1)) {
                    writeLine(out, tail, largeLineChars)
                }
                writeRaw(out, byteArrayOf(0x1D, 0x21, 0x00))
            }
            if (note.isNotBlank()) {
                for (line in chunkByDisplayWidth("($note)", lineChars)) {
                    writeLine(out, line, lineChars)
                }
            }
            return
        }
        if (itemFontSize == ItemFontSize.MEDIUM) {
            writeRaw(out, byteArrayOf(0x1B, 0x21, 0x10))
        }
        val nameLines = chunkByDisplayWidth(name, columns.name)
        val firstName = nameLines.firstOrNull() ?: ""
        writeLine(
            out,
            buildItemRow(
                columns = columns,
                name = firstName,
                qty = "x$qty",
                unitPrice = centsToYuan(priceCents),
                amount = centsToYuan(subtotalCents),
            ),
            lineChars,
        )
        if (nameLines.size > 1) {
            for (tail in nameLines.drop(1)) {
                writeLine(out, buildItemRow(columns = columns, name = tail), lineChars)
            }
        }
        if (note.isNotBlank()) {
            for (line in chunkByDisplayWidth("($note)", lineChars - 2)) {
                writeLine(out, "  $line", lineChars)
            }
        }
        if (itemFontSize == ItemFontSize.MEDIUM) {
            writeRaw(out, byteArrayOf(0x1B, 0x21, 0x00))
        }
    }

    private fun buildItemRow(
        columns: ItemColumns,
        name: String,
        qty: String = "",
        unitPrice: String = "",
        amount: String = "",
    ): String {
        return padRight(name, columns.name) +
            padLeft(qty, columns.qty) +
            padLeft(unitPrice, columns.unitPrice) +
            padLeft(amount, columns.amount)
    }

    private fun writeLine(out: ByteArrayOutputStream, text: String, lineChars: Int, lineFeed: Int = 1) {
        val normalized = sanitize(text)
        if (normalized.isBlank()) {
            writeRaw(out, byteArrayOf(0x0A))
            return
        }
        val chunks = chunkByDisplayWidth(normalized, lineChars)
        for (chunk in chunks) {
            writeRaw(out, chunk.toByteArray(charsetGb18030))
            repeat(lineFeed) { writeRaw(out, byteArrayOf(0x0A)) }
        }
    }

    private fun lineWithRight(left: String, right: String, lineChars: Int): String {
        val safeLeft = sanitize(left)
        val safeRight = sanitize(right)
        if (safeRight.isBlank()) return safeLeft
        val maxLeftWidth = max(1, lineChars - displayWidth(safeRight) - 1)
        val clippedLeft = takeByDisplayWidth(safeLeft, maxLeftWidth)
        val spaces = max(1, lineChars - displayWidth(clippedLeft) - displayWidth(safeRight))
        return clippedLeft + " ".repeat(spaces) + safeRight
    }

    private fun chunkByDisplayWidth(text: String, lineChars: Int): List<String> {
        val lines = mutableListOf<String>()
        val current = StringBuilder()
        var count = 0
        for (char in text) {
            val width = charDisplayWidth(char)
            if (count + width > lineChars && current.isNotEmpty()) {
                lines += current.toString()
                current.clear()
                count = 0
            }
            current.append(char)
            count += width
        }
        if (current.isNotEmpty()) {
            lines += current.toString()
        }
        if (lines.isEmpty()) {
            lines += ""
        }
        return lines
    }

    private fun buildHeader(columns: ItemColumns): String {
        return buildItemRow(columns, "菜品", "数量", "单价", "小计")
    }

    private fun padRight(value: String, width: Int): String {
        val safe = sanitize(value)
        val clipped = takeByDisplayWidth(safe, width)
        val pad = max(0, width - displayWidth(clipped))
        return clipped + " ".repeat(pad)
    }

    private fun padLeft(value: String, width: Int): String {
        val safe = sanitize(value)
        val clipped = takeByDisplayWidthFromEnd(safe, width)
        val pad = max(0, width - displayWidth(clipped))
        return " ".repeat(pad) + clipped
    }

    private fun takeByDisplayWidthFromEnd(value: String, maxWidth: Int): String {
        if (maxWidth <= 0) return ""
        val reversed = value.reversed()
        val taken = takeByDisplayWidth(reversed, maxWidth)
        return taken.reversed()
    }

    private fun centsToYuan(cents: Int): String {
        return "¥%.1f".format(Locale.CHINA, cents / 100.0)
    }

    private fun writeRaw(out: ByteArrayOutputStream, bytes: ByteArray) {
        out.write(bytes)
    }

    private fun writeTextRaw(out: ByteArrayOutputStream, text: String) {
        val normalized = sanitize(text)
        if (normalized.isNotBlank()) {
            writeRaw(out, normalized.toByteArray(charsetGb18030))
        }
    }

    private fun sanitize(value: String?): String {
        return (value ?: "")
            .replace("\r", " ")
            .replace("\n", " ")
            .trim()
    }

    private fun normalizeWidthMm(widthMm: Int): Int {
        return if (widthMm >= 76) 80 else 58
    }

    private fun normalizeItemFontSize(raw: String?): ItemFontSize {
        return when ((raw ?: "").trim().lowercase(Locale.ROOT)) {
            "medium" -> ItemFontSize.MEDIUM
            "large" -> ItemFontSize.LARGE
            else -> ItemFontSize.SMALL
        }
    }

    private fun repeat(char: String, count: Int): String {
        return char.repeat(max(0, count))
    }

    private fun displayWidth(value: String): Int {
        var width = 0
        for (char in value) {
            width += charDisplayWidth(char)
        }
        return width
    }

    private fun charDisplayWidth(char: Char): Int {
        if (char.code <= 0x7F) {
            return 1
        }
        return if (isCjkLike(char)) 2 else 1
    }

    private fun isCjkLike(char: Char): Boolean {
        val block = Character.UnicodeBlock.of(char)
        return block == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS ||
            block == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS_EXTENSION_A ||
            block == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS_EXTENSION_B ||
            block == Character.UnicodeBlock.CJK_COMPATIBILITY_IDEOGRAPHS ||
            block == Character.UnicodeBlock.CJK_SYMBOLS_AND_PUNCTUATION ||
            block == Character.UnicodeBlock.HALFWIDTH_AND_FULLWIDTH_FORMS ||
            block == Character.UnicodeBlock.HIRAGANA ||
            block == Character.UnicodeBlock.KATAKANA ||
            block == Character.UnicodeBlock.HANGUL_SYLLABLES
    }

    private fun takeByDisplayWidth(value: String, maxWidth: Int): String {
        if (maxWidth <= 0) {
            return ""
        }
        val out = StringBuilder()
        var width = 0
        for (char in value) {
            val nextWidth = charDisplayWidth(char)
            if (width + nextWidth > maxWidth) {
                break
            }
            out.append(char)
            width += nextWidth
        }
        return out.toString()
    }
}
