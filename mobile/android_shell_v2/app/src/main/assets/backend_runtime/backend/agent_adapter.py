from __future__ import annotations

from dataclasses import dataclass, field
import re
import unicodedata
from typing import Dict, List

from backend.harness import OrderItemInput


@dataclass
class AgentReply:
    readback_text: str
    items: List[OrderItemInput]


@dataclass
class VoiceOperationPlan:
    action: str
    table_no: str
    items: List[OrderItemInput]
    order_mode: str = "AUTO"
    note: str = ""
    fail_text: str = ""
    fail_code: str = ""
    steps: List["VoiceOperationStep"] = field(default_factory=list)


@dataclass
class VoiceOperationStep:
    action: str
    table_no: str
    items: List[OrderItemInput]
    order_mode: str = "AUTO"
    note: str = ""


class RestaurantAgentAdapter:
    """Local adapter for parser and operation planning."""

    def __init__(self, menu_alias_to_id: Dict[str, int]):
        self.menu_alias_to_id = menu_alias_to_id

    def parse_waiter_start_command(self, command: str) -> int:
        m = re.search(r"(\d+)", str(command or ""))
        if not m:
            raise ValueError("unable to parse table id from command")
        value = int(m.group(1))
        if value <= 0:
            raise ValueError("table id must be positive")
        return value

    def parse_customer_order(self, transcript_chunks: List[str]) -> AgentReply:
        text = self._normalize_transcript_text(" ".join(transcript_chunks))
        if not text:
            raise ValueError("no transcript content")

        items: List[OrderItemInput] = []
        for alias, menu_item_id in self.menu_alias_to_id.items():
            qty = self._extract_qty(text, alias)
            if qty > 0:
                items.append(OrderItemInput(menu_item_id=menu_item_id, qty=qty))

        if not items:
            raise ValueError("no order items recognized")

        readback = "Please confirm your order: " + ", ".join(f"#{i.menu_item_id} x{i.qty}" for i in items)
        return AgentReply(readback_text=readback, items=items)

    def plan_voice_operation(
        self,
        transcript: str,
        state: dict | None = None,
    ) -> VoiceOperationPlan:
        text = self._normalize_transcript_text(transcript)
        if not text:
            raise ValueError("transcript is required")
        state = state or {}

        action = self._detect_action(text)
        table_no = self._extract_table_no(text)
        items = self._extract_items_for_ops(text)
        note = self._extract_order_note(text)

        if action == "UNKNOWN" and items:
            action = "ORDER_ITEM"
        if action == "UNKNOWN" and note:
            action = "ADD_ORDER_NOTE"

        if not table_no:
            inferred = self._infer_selected_or_only_open_table_no(state)
            if inferred:
                table_no = inferred

        return VoiceOperationPlan(action=action, table_no=table_no, items=items, note=note)

    def _extract_items_for_ops(self, text: str) -> List[OrderItemInput]:
        items: List[OrderItemInput] = []
        for m in re.finditer(r"#?(\d+)\s*[xX*]\s*(\d+)", text):
            mid = int(m.group(1))
            qty = int(m.group(2))
            if qty > 0:
                items.append(OrderItemInput(menu_item_id=mid, qty=qty))
        if items:
            return items

        for alias, menu_item_id in self.menu_alias_to_id.items():
            qty = self._extract_qty(text, alias)
            if qty > 0:
                items.append(OrderItemInput(menu_item_id=menu_item_id, qty=qty))
        return items

    @staticmethod
    def _normalize_transcript_text(raw: str) -> str:
        compact = " ".join(str(raw or "").split())
        if not compact:
            return ""
        stripped = "".join(
            " " if unicodedata.category(ch).startswith("P") else ch
            for ch in compact
        )
        return " ".join(stripped.split())

    @staticmethod
    def _detect_action(text: str) -> str:
        lowered = str(text or "").lower()
        undo_tokens = ("undo", "revert", "撤销", "回退", "取消上一")
        query_tokens = ("query bill", "bill", "查账单", "查账")
        checkout_tokens = ("checkout", "pay", "买单", "结账", "结单", "埋单")
        open_tokens = ("open table", "open", "开台", "开桌")
        add_tokens = ("add item", "add", "加菜", "追加", "再来")
        order_tokens = ("order item", "order", "点菜", "下单")
        note_tokens = ("备注", "记一下", "记成", "加备注", "note")

        if any(token in lowered for token in (t.lower() for t in undo_tokens)):
            return "UNDO_LAST"
        if any(token in lowered for token in (t.lower() for t in query_tokens)):
            return "QUERY_BILL"
        if any(token in lowered for token in (t.lower() for t in checkout_tokens)):
            return "CHECKOUT"
        if any(token in lowered for token in (t.lower() for t in open_tokens)):
            return "OPEN_TABLE"
        if any(token in lowered for token in (t.lower() for t in note_tokens)):
            return "ADD_ORDER_NOTE"
        if any(token in lowered for token in (t.lower() for t in add_tokens)):
            return "ADD_ITEM"
        if any(token in lowered for token in (t.lower() for t in order_tokens)):
            return "ORDER_ITEM"
        return "UNKNOWN"

    @staticmethod
    def _extract_table_no(text: str) -> str:
        m = re.search(r"(?<![#A-Za-z0-9])([A-Za-z]\d{1,4})(?![A-Za-z0-9])", text, flags=re.IGNORECASE)
        if m:
            return m.group(1).upper()

        m = re.search(r"(\d{1,4})\s*(?:号桌|桌号|桌|台)", text)
        if not m:
            m = re.match(
                r"^\s*(\d{1,4})\s*(?:open|order|add|checkout|bill|undo|开台|点菜|加菜|买单|查账|撤销)?",
                str(text or ""),
                flags=re.IGNORECASE,
            )
        if not m:
            return ""
        return f"A{int(m.group(1))}"

    @staticmethod
    def _infer_selected_or_only_open_table_no(state: dict) -> str:
        selected = str(state.get("selected_table_no", "") or "").strip().upper()
        if selected:
            return selected
        tables = state.get("tables", [])
        opens = [t for t in tables if str(t.get("status", "")).upper() == "OPEN"]
        if len(opens) == 1:
            return str(opens[0].get("table_no", "")).upper()
        return ""

    @staticmethod
    def _extract_order_note(text: str) -> str:
        raw = str(text or "").strip()
        if not raw:
            return ""
        patterns = [
            r"(?:备注|加备注|记一下|记成)\s*[：:，,]?\s*(.+)$",
            r"note\s*[：:，,]?\s*(.+)$",
        ]
        for pattern in patterns:
            match = re.search(pattern, raw, flags=re.IGNORECASE)
            if match:
                return str(match.group(1) or "").strip()
        return ""

    @staticmethod
    def _extract_qty(text: str, dish: str) -> int:
        patterns = [
            rf"{re.escape(dish)}\s*(\d+)\s*(?:份|个)?",
            rf"{re.escape(dish)}\s*([一二两三四五六七八九十])\s*(?:份|个)?",
            rf"{re.escape(dish)}",
        ]
        for idx, pattern in enumerate(patterns):
            m = re.search(pattern, text)
            if not m:
                continue
            if idx == 0:
                return int(m.group(1))
            if idx == 1:
                mapping = {"一": 1, "二": 2, "两": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9, "十": 10}
                return mapping[m.group(1)]
            return 1
        return 0
