from __future__ import annotations

from dataclasses import dataclass
import re


@dataclass
class VoiceCommand:
    intent: str
    table_no: str
    payload_text: str = ""


class VoiceCommandParser:
    INTENT_OPEN = "OPEN_TABLE"
    INTENT_ORDER = "ORDER_ITEM"
    INTENT_ADD = "ADD_ITEM"
    INTENT_CHECKOUT = "CHECKOUT"
    INTENT_QUERY_BILL = "QUERY_BILL"
    INTENT_UNDO_LAST = "UNDO_LAST"

    @classmethod
    def parse(cls, transcript: str) -> VoiceCommand:
        text = (transcript or "").strip()
        if not text:
            raise ValueError("transcript is required")

        if "撤销上一条" in text or "undo last" in text.lower():
            table_no = cls._extract_table_no(text)
            return VoiceCommand(intent=cls.INTENT_UNDO_LAST, table_no=table_no)

        if "开台" in text or "开桌" in text or "open table" in text.lower():
            table_no = cls._extract_table_no(text)
            return VoiceCommand(intent=cls.INTENT_OPEN, table_no=table_no)

        match = re.match(r"^\s*([A-Za-z]?\d+)\s*(点菜|加菜|买单|查账单|order|add|checkout|bill)\s*(.*)$", text, flags=re.IGNORECASE)
        if not match:
            raise ValueError("unsupported voice command format")

        table_no = match.group(1).upper()
        action = (match.group(2) or "").strip().lower()
        payload = (match.group(3) or "").strip()
        if action in {"点菜", "order"}:
            return VoiceCommand(intent=cls.INTENT_ORDER, table_no=table_no, payload_text=payload)
        if action in {"加菜", "add"}:
            return VoiceCommand(intent=cls.INTENT_ADD, table_no=table_no, payload_text=payload)
        if action in {"查账单", "bill"}:
            return VoiceCommand(intent=cls.INTENT_QUERY_BILL, table_no=table_no, payload_text=payload)
        return VoiceCommand(intent=cls.INTENT_CHECKOUT, table_no=table_no, payload_text=payload)

    @staticmethod
    def _extract_table_no(text: str) -> str:
        match = re.search(r"([A-Za-z]?\d+)", text)
        if not match:
            return ""
        return match.group(1).upper()
