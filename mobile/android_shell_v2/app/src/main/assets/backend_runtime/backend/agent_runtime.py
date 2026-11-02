from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, List, Literal

from backend.order_session import VoiceOrderSession


EventType = Literal[
    "WAITER_START_COMMAND",
    "CUSTOMER_START_SPEAK",
    "VOICE_CHUNK",
    "CUSTOMER_DONE",
    "AGENT_PARSE_READBACK",
    "CUSTOMER_CONFIRM_MENU",
    "SERVICE_ADD_ITEM",
    "SERVICE_PREVIEW_BILL",
    "SERVICE_NOTIFY_WAITER",
    "SERVICE_SYNC_BILL",
]


@dataclass
class AgentEvent:
    type: EventType
    payload: dict


class RestaurantAgentRuntime:
    """Event loop wrapper around VoiceOrderSession.

    This is the explicit 'agent loop' integration point requested by product:
    - keep receiving device events (button / transcript / service actions)
    - route to session state machine + adapter
    - emit human-readable outputs for TTS/UI push
    """

    def __init__(self, session: VoiceOrderSession):
        self.session = session
        self.outputs: List[str] = []

    def process_event(self, event: AgentEvent) -> None:
        t = event.type
        p = event.payload

        if t == "WAITER_START_COMMAND":
            table_id = self.session.waiter_press_start_by_command(p["command"])
            self.outputs.append(f"已启动{table_id}号桌点餐")
            return

        if t == "CUSTOMER_START_SPEAK":
            self.session.customer_start_speaking()
            self.outputs.append("开始持续监听顾客点餐")
            return

        if t == "VOICE_CHUNK":
            self.session.append_voice_chunk(p["text"])
            self.outputs.append(f"已记录语音片段:{p['text']}")
            return

        if t == "CUSTOMER_DONE":
            self.session.customer_press_done()
            self.outputs.append("顾客已结束点餐，等待Agent解析")
            return

        if t == "AGENT_PARSE_READBACK":
            readback = self.session.agent_parse_and_readback()
            self.outputs.append(readback)
            return

        if t == "CUSTOMER_CONFIRM_MENU":
            order_id = self.session.customer_press_confirm_menu()
            self.outputs.append(f"菜单已确认并下发后厨，订单号:{order_id}")
            return

        if t == "SERVICE_ADD_ITEM":
            self.session.add_item_in_service_mode(menu_item_id=p["menu_item_id"], qty=p["qty"])
            self.outputs.append("已加菜")
            return

        if t == "SERVICE_PREVIEW_BILL":
            bill = self.session.query_bill_preview()
            self.outputs.append(f"当前账单总额:{bill['total_cents']}分")
            return

        if t == "SERVICE_NOTIFY_WAITER":
            msg = self.session.notify_waiter(message=p.get("message", "请服务员到桌"))
            self.outputs.append(msg)
            return

        if t == "SERVICE_SYNC_BILL":
            payload = self.session.sync_bill_to_device(target_device_id=p["target_device_id"])
            self.outputs.append(f"已同步账单到设备:{payload['target_device_id']}")
            return

        raise ValueError(f"unsupported event type: {t}")

    def run_once(self, events: Iterable[AgentEvent]) -> List[str]:
        self.outputs = []
        for event in events:
            self.process_event(event)
        return self.outputs
