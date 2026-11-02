"""Simple CLI demo for the agent loop.

Run:
  python3 -m backend.run_agent_loop
"""

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.agent_adapter import RestaurantAgentAdapter
from backend.agent_runtime import AgentEvent, RestaurantAgentRuntime
from backend.harness import RestaurantHarness
from backend.init_db import init_db
from backend.order_session import VoiceOrderSession


def main() -> None:
    init_db()
    harness = RestaurantHarness()
    agent = RestaurantAgentAdapter({"宫保鸡丁": 1, "蒜蓉西兰花": 2, "米饭": 3, "酸梅汤": 4})
    session = VoiceOrderSession(harness=harness, operator="waiter-A", agent=agent)
    runtime = RestaurantAgentRuntime(session)

    events = [
        AgentEvent("WAITER_START_COMMAND", {"command": "1号桌，开始点餐"}),
        AgentEvent("CUSTOMER_START_SPEAK", {}),
        AgentEvent("VOICE_CHUNK", {"text": "宫保鸡丁一份"}),
        AgentEvent("VOICE_CHUNK", {"text": "米饭两份"}),
        AgentEvent("CUSTOMER_DONE", {}),
        AgentEvent("AGENT_PARSE_READBACK", {}),
        AgentEvent("CUSTOMER_CONFIRM_MENU", {}),
        AgentEvent("SERVICE_PREVIEW_BILL", {}),
        AgentEvent("SERVICE_NOTIFY_WAITER", {"message": "请来加水"}),
        AgentEvent("SERVICE_SYNC_BILL", {"target_device_id": "cashier-pad-1"}),
    ]

    outputs = runtime.run_once(events)
    for out in outputs:
        print(out)


if __name__ == "__main__":
    main()