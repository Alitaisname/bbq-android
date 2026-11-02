from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import List

from backend.agent_adapter import RestaurantAgentAdapter
from backend.harness import OrderItemInput, RestaurantHarness


class SessionStage(str, Enum):
    IDLE = "IDLE"
    WAITER_START_CAPTURE = "WAITER_START_CAPTURE"
    CUSTOMER_SPEAKING = "CUSTOMER_SPEAKING"
    CUSTOMER_DONE = "CUSTOMER_DONE"
    AGENT_CONFIRMING = "AGENT_CONFIRMING"
    MENU_CONFIRMED = "MENU_CONFIRMED"
    KITCHEN_SUBMITTED = "KITCHEN_SUBMITTED"
    SERVICE_MODE = "SERVICE_MODE"


@dataclass
class VoiceOrderSession:
    harness: RestaurantHarness
    operator: str
    agent: RestaurantAgentAdapter
    table_id: int | None = None
    stage: SessionStage = SessionStage.IDLE
    transcript_chunks: List[str] = field(default_factory=list)
    parsed_items: List[OrderItemInput] = field(default_factory=list)
    order_id: int | None = None

    def waiter_press_start(self, table_id: int) -> None:
        if self.stage not in {SessionStage.IDLE, SessionStage.SERVICE_MODE}:
            raise ValueError(f"invalid stage for waiter start: {self.stage}")
        self.table_id = table_id
        self.transcript_chunks = []
        self.parsed_items = []
        self.stage = SessionStage.WAITER_START_CAPTURE

    def waiter_press_start_by_command(self, command: str) -> int:
        table_id = self.agent.parse_waiter_start_command(command)
        self.waiter_press_start(table_id=table_id)
        return table_id

    def customer_start_speaking(self) -> None:
        if self.stage != SessionStage.WAITER_START_CAPTURE:
            raise ValueError("customer can only start speaking after waiter start")
        self.stage = SessionStage.CUSTOMER_SPEAKING

    def append_voice_chunk(self, text: str) -> None:
        if self.stage != SessionStage.CUSTOMER_SPEAKING:
            raise ValueError("voice chunks can only be appended while customer speaking")
        if text.strip():
            self.transcript_chunks.append(text.strip())

    def customer_press_done(self) -> None:
        if self.stage != SessionStage.CUSTOMER_SPEAKING:
            raise ValueError("done button is only valid while customer speaking")
        if not self.transcript_chunks:
            raise ValueError("no transcript captured")
        self.stage = SessionStage.CUSTOMER_DONE

    def agent_parse_and_readback(self, parsed_items: List[OrderItemInput] | None = None) -> str:
        if self.stage != SessionStage.CUSTOMER_DONE:
            raise ValueError("agent can parse only after customer done")

        if parsed_items is None:
            reply = self.agent.parse_customer_order(self.transcript_chunks)
            self.parsed_items = reply.items
            readback = reply.readback_text
        else:
            if not parsed_items:
                raise ValueError("parsed_items can not be empty")
            self.parsed_items = parsed_items
            summary = "，".join([f"菜品#{i.menu_item_id} x{i.qty}" for i in parsed_items])
            readback = f"请确认您的菜单：{summary}。"

        self.stage = SessionStage.AGENT_CONFIRMING
        return readback

    def customer_press_confirm_menu(self) -> int:
        if self.stage != SessionStage.AGENT_CONFIRMING:
            raise ValueError("confirm menu button only valid after readback")
        if self.table_id is None:
            raise ValueError("table_id missing")

        self.order_id = self.harness.create_order(
            table_id=self.table_id,
            items=self.parsed_items,
            operator=self.operator,
        )
        self.stage = SessionStage.KITCHEN_SUBMITTED
        # 初次点单提交后进入服务模式（加菜/账单/呼叫服务员）
        self.stage = SessionStage.SERVICE_MODE
        return self.order_id

    def add_item_in_service_mode(self, menu_item_id: int, qty: int) -> None:
        if self.stage != SessionStage.SERVICE_MODE or self.order_id is None:
            raise ValueError("not in service mode")
        self.harness.add_item(
            order_id=self.order_id,
            menu_item_id=menu_item_id,
            qty=qty,
            operator=self.operator,
        )

    def query_bill_preview(self) -> dict:
        if self.stage != SessionStage.SERVICE_MODE or self.order_id is None:
            raise ValueError("not in service mode")
        return self.harness.preview_bill(order_id=self.order_id)

    def notify_waiter(self, message: str = "请服务员到桌") -> str:
        if self.stage != SessionStage.SERVICE_MODE or self.order_id is None:
            raise ValueError("not in service mode")
        return f"TABLE:{self.table_id} ORDER:{self.order_id} MESSAGE:{message}"

    def sync_bill_to_device(self, target_device_id: str) -> dict:
        if self.stage != SessionStage.SERVICE_MODE or self.order_id is None:
            raise ValueError("not in service mode")
        return self.harness.export_bill_to_device(order_id=self.order_id, target_device_id=target_device_id)

    def finalize_bill(self) -> dict:
        if self.stage != SessionStage.SERVICE_MODE or self.order_id is None:
            raise ValueError("not in service mode")
        return self.harness.generate_bill(order_id=self.order_id, operator=self.operator)
