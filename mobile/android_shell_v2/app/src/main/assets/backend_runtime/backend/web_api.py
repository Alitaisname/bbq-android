from __future__ import annotations

import base64
import binascii
from contextlib import closing
from dataclasses import asdict
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import re
import sqlite3
import threading
from time import time
from types import SimpleNamespace
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlparse
from urllib.request import Request, urlopen
from uuid import uuid4

from backend.agent_client import create_agent_adapter
from backend.harness import OrderItemInput, RestaurantHarness
from backend.init_db import DB_PATH, ROOT, init_db
from backend.order_session import VoiceOrderSession
from backend.runtime_gateway import request_gateway_overrides
from backend.transcription import TranscriptionError, create_transcription_provider


WEB_ROOT = ROOT / "web"
AUDIO_ROOT = ROOT / "data" / "audio_uploads"
TABLE_NO_PATTERN = re.compile(r"^(?:[A-Z]\d+|\d+)$")
TABLE_PREFIX_PATTERN = re.compile(r"^[A-Z]?$")
TABLE_NUMBERING_CONFIG_KEY = "table_numbering_config"
TAKEOUT_NUMBERING_RUNTIME_KEY = "takeout_numbering_runtime"
ORDER_NOTE_I18N_CACHE_KEY = "order_note_i18n_cache"


def normalize_order_note_fragment(raw: Any) -> str:
    return re.sub(r"\s+", " ", re.sub(r"^[（(]+|[)）]+$", "", str(raw or "").strip())).strip()


def split_order_note_parts(raw: Any) -> list[str]:
    note = normalize_order_note_fragment(raw)
    if not note:
        return []
    seen: set[str] = set()
    parts: list[str] = []
    for token in re.split(r"[；;，,、\n]+", note):
        part = normalize_order_note_fragment(token)
        if not part or part in seen:
            continue
        seen.add(part)
        parts.append(part)
    return parts


def join_order_note_parts(parts: list[str]) -> str:
    seen: set[str] = set()
    merged: list[str] = []
    for raw in parts:
        part = normalize_order_note_fragment(raw)
        if not part or part in seen:
            continue
        seen.add(part)
        merged.append(part)
    return "；".join(merged)


def contains_uyghur_script(raw: Any) -> bool:
    return bool(re.search(r"[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]", str(raw or "")))


def contains_chinese_script(raw: Any) -> bool:
    return bool(re.search(r"[\u3400-\u9FFF]", str(raw or "")))


class ApiError(Exception):
    def __init__(self, code: str, message: str, status: HTTPStatus = HTTPStatus.BAD_REQUEST):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status = status


class SessionRepository:
    def __init__(self, db_path: Path = DB_PATH, audio_root: Path | None = None):
        self.db_path = db_path
        self.audio_root = audio_root or AUDIO_ROOT
        self._account_scope_root = Path(db_path).resolve().parent / "account_scopes"
        self._sessions: dict[str, VoiceOrderSession] = {}
        self._voice_event_results: dict[str, dict[str, Any]] = {}
        self._table_action_history: dict[str, list[dict[str, Any]]] = {}
        self._selected_table_by_channel: dict[str, str] = {}
        self._stats_config: dict[str, Any] = {"include_open_orders_in_current": False}
        self._table_numbering_config: dict[str, Any] = self._build_default_table_numbering_config()
        self._table_numbering_runtime: dict[str, int] = {}
        self._op_lock = threading.RLock()
        self._ensure_takeout_numbering_defaults(self._table_numbering_config)
        self._ensure_runtime_settings_table()
        self._load_persisted_table_numbering_config()
        self._load_persisted_takeout_numbering_runtime()
        self.transcription_provider = create_transcription_provider()

    @staticmethod
    def _build_default_table_numbering_config() -> dict[str, Any]:
        return {
            "cyclic_enabled": True,
            "takeout_enabled": True,
            "dinein_prefix": "A",
            "cyclic_start": 1,
            "cyclic_end": 30,
            "takeout_prefix": "W",
            "dinein_start": 1,
            "takeout_start": 1,
        }

    @staticmethod
    def _normalize_runtime_account_key(raw: Any) -> str:
        safe = re.sub(r"[^a-z0-9._-]+", "-", str(raw or "").strip().lower()).strip("-._")
        return safe[:64] or "guest"

    def switch_runtime_account_scope(self, account_key: str) -> dict[str, Any]:
        safe_key = self._normalize_runtime_account_key(account_key)
        target_dir = self._account_scope_root / safe_key
        target_db = target_dir / "restaurant.db"
        target_audio_root = target_dir / "audio_uploads"
        target_dir.mkdir(parents=True, exist_ok=True)
        target_audio_root.mkdir(parents=True, exist_ok=True)
        init_db(db_path=target_db)
        changed = Path(self.db_path).resolve() != target_db.resolve()
        self.db_path = target_db
        self.audio_root = target_audio_root
        self._sessions = {}
        self._voice_event_results = {}
        self._table_action_history = {}
        self._selected_table_by_channel = {}
        self._stats_config = {"include_open_orders_in_current": False}
        self._table_numbering_config = self._build_default_table_numbering_config()
        self._table_numbering_runtime = {}
        self._ensure_takeout_numbering_defaults(self._table_numbering_config)
        self._ensure_runtime_settings_table()
        self._load_persisted_table_numbering_config()
        self._load_persisted_takeout_numbering_runtime()
        return {
            "account_key": safe_key,
            "changed": changed,
            "db_path": str(target_db),
        }

    def create_session(
        self,
        table_id: int,
        operator: str,
        request_headers: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        session_id = str(uuid4())
        harness = RestaurantHarness(self.db_path)
        session = VoiceOrderSession(
            harness=harness,
            operator=operator,
            agent=create_agent_adapter(harness.get_menu_alias_map(), request_headers=request_headers),
        )
        session.waiter_press_start(table_id=table_id)
        self._sessions[session_id] = session
        return self.serialize(session_id, session)

    def get_session(self, session_id: str) -> VoiceOrderSession:
        try:
            return self._sessions[session_id]
        except KeyError as exc:
            raise ApiError("NOT_FOUND", f"session_id={session_id} not found", HTTPStatus.NOT_FOUND) from exc

    def serialize(self, session_id: str, session: VoiceOrderSession | None = None) -> dict[str, Any]:
        session = session or self.get_session(session_id)
        return {
            "session_id": session_id,
            "table_id": session.table_id,
            "operator": session.operator,
            "stage": session.stage.value,
            "transcript_chunks": list(session.transcript_chunks),
            "parsed_items": [asdict(item) for item in session.parsed_items],
            "order_id": session.order_id,
        }

    def save_audio_upload(self, session_id: str, audio_bytes: bytes, extension: str) -> str:
        self.audio_root.mkdir(parents=True, exist_ok=True)
        audio_id = f"{session_id}-{int(time() * 1000)}.{extension}"
        audio_path = self.audio_root / audio_id
        audio_path.write_bytes(audio_bytes)
        return audio_id

    def process_voice_audio_command(
        self,
        audio_bytes: bytes,
        mime_type: str,
        operator: str,
        event_id: str = "",
        device_id: str = "",
        transcript_hint: str = "",
        request_headers: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        with self._op_lock:
            result = self._process_voice_audio_command_locked(
                audio_bytes=audio_bytes,
                mime_type=mime_type,
                operator=operator,
                event_id=event_id,
                device_id=device_id,
                transcript_hint=transcript_hint,
                request_headers=request_headers,
            )
            return self._attach_agent_failure_feedback(result, source="voice-audio")

    def _process_voice_audio_command_locked(
        self,
        audio_bytes: bytes,
        mime_type: str,
        operator: str,
        event_id: str = "",
        device_id: str = "",
        transcript_hint: str = "",
        request_headers: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        if event_id and event_id in self._voice_event_results:
            replayed = dict(self._voice_event_results[event_id])
            replayed["idempotent_replay"] = True
            return replayed

        tx = self.transcription_provider.transcribe(
            audio_bytes=audio_bytes,
            mime_type=mime_type,
            manual_transcript=transcript_hint,
        )
        result = self.process_voice_command(
            transcript=tx.transcript,
            operator=operator,
            event_id=event_id,
            device_id=device_id,
            request_headers=request_headers,
        )
        enriched = dict(result)
        enriched["transcript"] = tx.transcript
        enriched["transcription_provider"] = tx.provider
        return enriched

    def process_voice_command(
        self,
        transcript: str,
        operator: str,
        event_id: str = "",
        device_id: str = "",
        request_headers: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        with self._op_lock:
            result = self._process_voice_command_locked(
                transcript=transcript,
                operator=operator,
                event_id=event_id,
                device_id=device_id,
                request_headers=request_headers,
            )
            return self._attach_agent_failure_feedback(result, source="voice-command")

    def process_menu_voice_command(
        self,
        transcript: str,
        operator: str,
        event_id: str = "",
        device_id: str = "",
        request_headers: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        with self._op_lock:
            result = self._process_menu_voice_command_locked(
                transcript=transcript,
                operator=operator,
                event_id=event_id,
                device_id=device_id,
                request_headers=request_headers,
            )
            return self._attach_agent_failure_feedback(result, source="menu-command")

    def process_menu_image_parse(
        self,
        image_base64: str,
        mime_type: str,
        operator: str,
        event_id: str = "",
        device_id: str = "",
        ocr_model: str = "",
        ocr_timeout_seconds: float | None = None,
        request_headers: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        with self._op_lock:
            result = self._process_menu_image_parse_locked(
                image_base64=image_base64,
                mime_type=mime_type,
                operator=operator,
                event_id=event_id,
                device_id=device_id,
                ocr_model=ocr_model,
                ocr_timeout_seconds=ocr_timeout_seconds,
                request_headers=request_headers,
            )
            return self._attach_agent_failure_feedback(result, source="menu-image")

    def process_menu_image_import(
        self,
        image_base64: str,
        mime_type: str,
        operator: str,
        event_id: str = "",
        device_id: str = "",
        ocr_model: str = "",
        ocr_timeout_seconds: float | None = None,
        records: list[dict[str, Any]] | None = None,
        request_headers: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        with self._op_lock:
            result = self._process_menu_image_import_locked(
                image_base64=image_base64,
                mime_type=mime_type,
                operator=operator,
                event_id=event_id,
                device_id=device_id,
                ocr_model=ocr_model,
                ocr_timeout_seconds=ocr_timeout_seconds,
                records=records,
                request_headers=request_headers,
            )
            return self._attach_agent_failure_feedback(result, source="menu-image-import")

    def process_menu_i18n_map(
        self,
        target_language: str,
        menu_item_ids: list[int] | None = None,
        request_headers: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        target = str(target_language or "").strip().lower()
        if target not in {"zh_cn", "ug_cn"}:
            target = "zh_cn"
        requested_ids = {
            int(item_id)
            for item_id in list(menu_item_ids or [])
            if isinstance(item_id, int) or str(item_id).strip().isdigit()
        }
        harness = RestaurantHarness(self.db_path)
        all_items = [
            item
            for item in harness.list_menu_items()
            if bool(item.get("is_available", False))
            and (not requested_ids or int(item.get("menu_item_id", 0)) in requested_ids)
        ]
        if not all_items:
            return {"target_language": target, "items": []}

        agent = create_agent_adapter(harness.get_menu_alias_map(), request_headers=request_headers)
        mapper = getattr(agent, "map_menu_display_names", None)
        if not callable(mapper):
            raise ApiError("MODEL_PLAN_ERROR", "menu language mapper unavailable", HTTPStatus.BAD_GATEWAY)
        mapped = mapper(all_items, target)
        rows = mapped.get("items", []) if isinstance(mapped, dict) else []
        by_id: dict[int, str] = {}
        if isinstance(rows, list):
            for row in rows:
                if not isinstance(row, dict):
                    continue
                try:
                    menu_item_id = int(row.get("menu_item_id", 0))
                except (TypeError, ValueError):
                    menu_item_id = 0
                display_name = str(row.get("display_name", "") or "").strip()
                if menu_item_id > 0 and display_name:
                    by_id[menu_item_id] = display_name

        items: list[dict[str, Any]] = []
        for item in all_items:
            menu_item_id = int(item.get("menu_item_id", 0))
            source_name = str(item.get("name", "") or "").strip()
            items.append(
                {
                    "menu_item_id": menu_item_id,
                    "source_name": source_name,
                    "target_language": target,
                    "display_name": by_id.get(menu_item_id, source_name),
                }
            )
        return {"target_language": target, "items": items}

    def process_order_note_i18n_map(
        self,
        target_language: str,
        notes: list[str] | None = None,
        request_headers: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        target = str(target_language or "").strip().lower()
        if target not in {"zh_cn", "ug_cn"}:
            target = "zh_cn"

        unique_notes: list[str] = []
        seen_notes: set[str] = set()
        for raw_note in list(notes or []):
            note = normalize_order_note_fragment(raw_note)
            if not note or note in seen_notes:
                continue
            unique_notes.append(note)
            seen_notes.add(note)
        if not unique_notes:
            return {"target_language": target, "items": []}

        with self._op_lock:
            cache_payload = self._load_runtime_setting_json(ORDER_NOTE_I18N_CACHE_KEY) or {}
            lang_cache = cache_payload.get(target) if isinstance(cache_payload.get(target), dict) else {}
            lang_cache = {
                normalize_order_note_fragment(key): str(value or "").strip()
                for key, value in lang_cache.items()
                if normalize_order_note_fragment(key) and str(value or "").strip()
            }

            by_note: dict[str, str] = {}
            missing: list[str] = []
            for note in unique_notes:
                cached_value = str(lang_cache.get(note, "") or "").strip()
                if cached_value:
                    by_note[note] = cached_value
                    continue
                if target != "ug_cn" or contains_uyghur_script(note) or not contains_chinese_script(note):
                    by_note[note] = note
                    if target == "ug_cn":
                        lang_cache[note] = note
                    continue
                missing.append(note)

            if missing:
                harness = RestaurantHarness(self.db_path)
                agent = create_agent_adapter(harness.get_menu_alias_map(), request_headers=request_headers)
                mapper = getattr(agent, "map_order_note_display_names", None)
                if not callable(mapper):
                    raise ApiError("MODEL_PLAN_ERROR", "order note language mapper unavailable", HTTPStatus.BAD_GATEWAY)
                mapped = mapper(missing, target)
                rows = mapped.get("items", []) if isinstance(mapped, dict) else []
                for row in rows if isinstance(rows, list) else []:
                    if not isinstance(row, dict):
                        continue
                    source_note = normalize_order_note_fragment(row.get("source_note", ""))
                    display_name = normalize_order_note_fragment(row.get("display_name", ""))
                    if source_note and display_name:
                        by_note[source_note] = display_name
                        lang_cache[source_note] = display_name
                for note in missing:
                    resolved = str(by_note.get(note, "") or "").strip() or note
                    by_note[note] = resolved
                    lang_cache[note] = resolved
                cache_payload[target] = lang_cache
                self._save_runtime_setting_json(ORDER_NOTE_I18N_CACHE_KEY, cache_payload)

        items = [
            {
                "source_note": note,
                "target_language": target,
                "display_name": str(by_note.get(note, "") or note).strip() or note,
            }
            for note in unique_notes
        ]
        return {"target_language": target, "items": items}

    @staticmethod
    def _attach_agent_failure_feedback(result: dict[str, Any], source: str = "voice-command") -> dict[str, Any]:
        payload = dict(result or {})
        safe_action = str(payload.get("ui_action", "")).strip().upper()
        intent = str(payload.get("intent", "UNKNOWN")).strip().upper() or "UNKNOWN"
        fail_code = str(payload.get("fail_code", "") or "").strip().upper()
        safe_source = str(source or "voice-command").strip().lower() or "voice-command"
        if safe_action == "AGENT_FAILED":
            message = str(payload.get("ui_text", payload.get("message", "")) or "").strip() or "无法执行该指令"
            payload["ui_text"] = message
            ui_feedback = payload.get("ui_feedback")
            if not isinstance(ui_feedback, dict):
                ui_feedback = {}
            ui_feedback["source"] = str(ui_feedback.get("source", safe_source) or safe_source)
            ui_feedback["intent"] = str(ui_feedback.get("intent", intent) or intent)
            ui_feedback["text"] = str(ui_feedback.get("text", message) or message)
            ui_feedback["speak_text"] = str(ui_feedback.get("speak_text", message) or message)
            if fail_code:
                ui_feedback["code"] = fail_code
            payload["ui_feedback"] = ui_feedback
            if fail_code:
                payload["fail_code"] = fail_code
            return payload
        if bool(payload.get("applied")):
            return payload
        message = str(payload.get("message", "")).strip() or "agent operation failed"
        payload["ui_action"] = "AGENT_FAILED"
        payload["ui_text"] = message
        payload["ui_feedback"] = {
            "source": safe_source,
            "intent": intent,
            "text": message,
            "speak_text": message,
        }
        if fail_code:
            payload["ui_feedback"]["code"] = fail_code
            payload["fail_code"] = fail_code
        return payload

    @staticmethod
    def _menu_agent_runtime_fallback(message: str) -> tuple[str, str] | None:
        text = str(message or "").strip().lower()
        if not text:
            return None
        if any(token in text for token in ("timed out", "timeout", "超时")):
            return ("菜单智能体响应超时，请稍后重试", "AGENT_TIMEOUT")
        if any(
            token in text
            for token in (
                "network error",
                "connection refused",
                "failed to establish",
                "name or service not known",
                "getaddrinfo",
                "no route to host",
                "connection reset",
                "connection aborted",
            )
        ):
            return ("菜单智能体连接失败，请检查网络或网关配置", "AGENT_UNREACHABLE")
        return None

    @staticmethod
    def _build_menu_agent_failed_result(
        *,
        event_id: str,
        message: str,
        plan_payload: dict[str, Any],
        fail_code: str = "",
        agent_note: str = "menu-agent-failed",
    ) -> dict[str, Any]:
        safe_message = str(message or "").strip() or "菜品指令无法执行"
        safe_code = str(fail_code or "").strip().upper()
        result: dict[str, Any] = {
            "event_id": event_id,
            "intent": "AGENT_FAILED",
            "table_no": "",
            "applied": False,
            "message": safe_message,
            "table_status": "UNCHANGED",
            "order_status": "UNCHANGED",
            "agent_note": str(agent_note or "menu-agent-failed"),
            "agent_plan": dict(plan_payload or {}),
            "ui_action": "AGENT_FAILED",
            "ui_text": safe_message,
            "ui_feedback": {
                "source": "menu-command",
                "intent": "AGENT_FAILED",
                "text": safe_message,
                "speak_text": safe_message,
            },
        }
        if safe_code:
            result["fail_code"] = safe_code
            result["ui_feedback"]["code"] = safe_code
        return result

    def _process_menu_voice_command_locked(
        self,
        transcript: str,
        operator: str,
        event_id: str = "",
        device_id: str = "",
        request_headers: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        replay_key = f"menu:{event_id}" if event_id else ""
        if replay_key and replay_key in self._voice_event_results:
            replayed = dict(self._voice_event_results[replay_key])
            replayed["idempotent_replay"] = True
            return replayed

        harness = RestaurantHarness(self.db_path)
        before_state = {"menu_items_count": len(harness.list_menu_items())}
        plan_payload = {
            "action": "MENU_ADD",
            "records": [],
            "delete_targets": [],
            "edit_targets": [],
            "rename_targets": [],
            "note": "menu-agent-only-tools",
            "fail_text": "",
            "fail_code": "",
        }

        try:
            parsed_bundle = self._parse_menu_voice_entries(
                transcript=transcript,
                harness=harness,
                request_headers=request_headers,
            )
            action = str(parsed_bundle.get("action", "MENU_ADD")).strip().upper() or "MENU_ADD"
            drafts = list(parsed_bundle.get("records", []))
            delete_targets = list(parsed_bundle.get("delete_targets", []))
            edit_targets = list(parsed_bundle.get("edit_targets", []))
            rename_targets = list(parsed_bundle.get("rename_targets", []))
            parse_mode = str(parsed_bundle.get("parse_mode", "menu-agent-executed")).strip() or "menu-agent-executed"
            fail_text = str(parsed_bundle.get("fail_text", "") or "").strip()
            fail_code = str(parsed_bundle.get("fail_code", "") or "").strip().upper()
            plan_payload["action"] = action
            plan_payload["records"] = drafts
            plan_payload["delete_targets"] = delete_targets
            plan_payload["edit_targets"] = edit_targets
            plan_payload["rename_targets"] = rename_targets
            plan_payload["note"] = parse_mode
            plan_payload["fail_text"] = fail_text
            plan_payload["fail_code"] = fail_code
        except ValueError as exc:
            parsed_message = str(exc or "").strip() or "菜品指令无法解析"
            parsed_code = ""
            runtime_fallback = self._menu_agent_runtime_fallback(parsed_message)
            if runtime_fallback:
                parsed_message, parsed_code = runtime_fallback
            plan_payload["action"] = "AGENT_FAILED"
            plan_payload["fail_text"] = parsed_message
            plan_payload["fail_code"] = parsed_code
            result = self._build_menu_agent_failed_result(
                event_id=event_id,
                message=parsed_message,
                plan_payload=plan_payload,
                fail_code=parsed_code,
                agent_note="menu-agent-parse-failed",
            )
            if replay_key:
                self._voice_event_results[replay_key] = dict(result)
            harness.log_voice_action(
                operator=operator,
                action="MENU_COMMAND",
                event_id=event_id,
                device_id=device_id,
                raw_transcript=transcript,
                tool_called=[],
                agent_plan=plan_payload,
                before_state=before_state,
                after_state=before_state,
                detail=result,
            )
            return result

        if action == "AGENT_FAILED":
            failure_message = str(plan_payload.get("fail_text", "") or "").strip() or "菜品指令无法执行"
            failure_code = str(plan_payload.get("fail_code", "") or "").strip().upper()
            plan_payload["fail_code"] = failure_code
            result = self._build_menu_agent_failed_result(
                event_id=event_id,
                message=failure_message,
                plan_payload=plan_payload,
                fail_code=failure_code,
                agent_note=parse_mode,
            )
            after_state = before_state
            tool_called = []
        elif action == "MENU_DELETE":
            deleted_items: list[dict[str, Any]] = []
            for target in delete_targets:
                menu_item_id = int(target.get("menu_item_id", 0))
                if menu_item_id <= 0:
                    continue
                deleted = harness.delete_menu_item(menu_item_id=menu_item_id, operator=operator)
                deleted_items.append(
                    {
                        "menu_item_id": int(deleted["menu_item_id"]),
                        "dish_name": str(deleted["name"]),
                        "category": str(deleted["category"]),
                        "price_cents": int(deleted["price_cents"]),
                        "deleted": bool(deleted.get("deleted", False)),
                        "already_deleted": bool(deleted.get("already_deleted", False)),
                    }
                )
            if not deleted_items:
                after_state = before_state
                result = {
                    "event_id": event_id,
                    "intent": "MENU_DELETE",
                    "table_no": "",
                    "applied": False,
                    "message": "未识别到可删除菜品，请补充菜品名称",
                    "table_status": "UNCHANGED",
                    "order_status": "UNCHANGED",
                    "fail_code": "TARGET_NOT_FOUND",
                    "agent_note": parse_mode,
                    "agent_plan": plan_payload,
                }
                tool_called = []
            else:
                lexicon = harness.refresh_lexicon(operator=operator, note="menu delete via agent")
                after_state = {
                    "menu_items_count": len(harness.list_menu_items()),
                    "lexicon_version": str(lexicon.get("version", "")),
                }
                first_item = deleted_items[0] if deleted_items else {}
                result = {
                    "event_id": event_id,
                    "intent": "MENU_DELETE",
                    "table_no": "",
                    "applied": True,
                    "message": f"{len(deleted_items)} menu item(s) deleted",
                    "table_status": "UNCHANGED",
                    "order_status": "UNCHANGED",
                    "menu_item_id": int(first_item.get("menu_item_id", 0)),
                    "dish_name": str(first_item.get("dish_name", "")),
                    "deleted_count": len(deleted_items),
                    "deleted_items": deleted_items,
                    "lexicon_version": str(lexicon.get("version", "")),
                    "agent_note": parse_mode,
                    "agent_plan": plan_payload,
                }
                tool_called = ["delete_menu_item", "refresh_lexicon"]
        elif action == "MENU_EDIT":
            updated_items: list[dict[str, Any]] = []
            touched_price = False
            touched_category = False
            for target in edit_targets:
                menu_item_id = int(target.get("menu_item_id", 0))
                if menu_item_id <= 0:
                    continue
                price_cents = int(target.get("price_cents", 0))
                new_category = str(target.get("new_category", "") or "").strip()
                if price_cents <= 0 and not new_category:
                    continue

                merged: dict[str, Any] = {
                    "menu_item_id": menu_item_id,
                    "dish_name": str(target.get("dish_name", "")),
                }

                if price_cents > 0:
                    price_updated = harness.update_menu_item_price(
                        menu_item_id=menu_item_id,
                        price_cents=price_cents,
                        operator=operator,
                    )
                    merged.update(
                        {
                            "dish_name": str(price_updated["name"]),
                            "category": str(price_updated["category"]),
                            "old_price_cents": int(price_updated["old_price_cents"]),
                            "new_price_cents": int(price_updated["new_price_cents"]),
                            "price_updated": bool(price_updated.get("updated", False)),
                        }
                    )
                    touched_price = True

                if new_category:
                    category_updated = harness.update_menu_item_category(
                        menu_item_id=menu_item_id,
                        new_category=new_category,
                        operator=operator,
                    )
                    merged.update(
                        {
                            "dish_name": str(category_updated["name"]),
                            "old_category": str(category_updated["old_category"]),
                            "new_category": str(category_updated["new_category"]),
                            "category_updated": bool(category_updated.get("updated", False)),
                            "category": str(category_updated["new_category"]),
                        }
                    )
                    touched_category = True

                if "new_price_cents" not in merged and price_cents > 0:
                    merged["new_price_cents"] = price_cents
                updated_items.append(merged)

            if not updated_items:
                after_state = before_state
                result = {
                    "event_id": event_id,
                    "intent": "MENU_EDIT",
                    "table_no": "",
                    "applied": False,
                    "message": "未识别到可改价或改分类的菜品，请补充菜品名称及修改内容",
                    "table_status": "UNCHANGED",
                    "order_status": "UNCHANGED",
                    "fail_code": "TARGET_NOT_FOUND",
                    "agent_note": parse_mode,
                    "agent_plan": plan_payload,
                }
                tool_called = []
            else:
                lexicon = harness.refresh_lexicon(operator=operator, note="menu edit via agent")
                after_state = {
                    "menu_items_count": len(harness.list_menu_items()),
                    "lexicon_version": str(lexicon.get("version", "")),
                }
                first_item = updated_items[0] if updated_items else {}
                result = {
                    "event_id": event_id,
                    "intent": "MENU_EDIT",
                    "table_no": "",
                    "applied": True,
                    "message": f"{len(updated_items)} menu item(s) updated",
                    "table_status": "UNCHANGED",
                    "order_status": "UNCHANGED",
                    "menu_item_id": int(first_item.get("menu_item_id", 0)),
                    "dish_name": str(first_item.get("dish_name", "")),
                    "category": str(first_item.get("category", "")),
                    "old_price_cents": int(first_item.get("old_price_cents", 0)),
                    "price_cents": int(first_item.get("new_price_cents", 0)),
                    "old_category": str(first_item.get("old_category", "")),
                    "new_category": str(first_item.get("new_category", "")),
                    "updated_count": len(updated_items),
                    "updated_items": updated_items,
                    "lexicon_version": str(lexicon.get("version", "")),
                    "agent_note": parse_mode,
                    "agent_plan": plan_payload,
                }
                tool_called = ["refresh_lexicon"]
                if touched_price:
                    tool_called.insert(0, "update_menu_item_price")
                if touched_category:
                    tool_called.insert(0, "update_menu_item_category")
        elif action == "MENU_RENAME_CATEGORY":
            renamed_items: list[dict[str, Any]] = []
            for target in rename_targets:
                old_category = str(target.get("old_category", "")).strip()
                new_category = str(target.get("new_category", "")).strip()
                if not old_category or not new_category:
                    continue
                try:
                    renamed = harness.rename_menu_category(
                        old_category=old_category,
                        new_category=new_category,
                        operator=operator,
                    )
                except ValueError:
                    continue
                renamed_items.append(
                    {
                        "old_category": str(renamed.get("old_category", old_category)),
                        "new_category": str(renamed.get("new_category", new_category)),
                        "matched_count": int(renamed.get("matched_count", 0)),
                        "updated_count": int(renamed.get("updated_count", 0)),
                    }
                )
            if not renamed_items:
                after_state = before_state
                result = {
                    "event_id": event_id,
                    "intent": "MENU_RENAME_CATEGORY",
                    "table_no": "",
                    "applied": False,
                    "message": "未识别到可修改的分类，请提供原分类和新分类",
                    "table_status": "UNCHANGED",
                    "order_status": "UNCHANGED",
                    "fail_code": "TARGET_NOT_FOUND",
                    "agent_note": parse_mode,
                    "agent_plan": plan_payload,
                }
                tool_called = []
            else:
                lexicon = harness.refresh_lexicon(operator=operator, note="menu category rename via agent")
                after_state = {
                    "menu_items_count": len(harness.list_menu_items()),
                    "lexicon_version": str(lexicon.get("version", "")),
                }
                first_item = renamed_items[0] if renamed_items else {}
                result = {
                    "event_id": event_id,
                    "intent": "MENU_RENAME_CATEGORY",
                    "table_no": "",
                    "applied": True,
                    "message": f"{len(renamed_items)} category rename(s) applied",
                    "table_status": "UNCHANGED",
                    "order_status": "UNCHANGED",
                    "old_category": str(first_item.get("old_category", "")),
                    "new_category": str(first_item.get("new_category", "")),
                    "renamed_count": len(renamed_items),
                    "renamed_items": renamed_items,
                    "lexicon_version": str(lexicon.get("version", "")),
                    "agent_note": parse_mode,
                    "agent_plan": plan_payload,
                }
                tool_called = ["rename_menu_category", "refresh_lexicon"]
        elif action == "MENU_ADD":
            created_items: list[dict[str, Any]] = []
            updated_items: list[dict[str, Any]] = []
            existing_items: list[dict[str, Any]] = []
            by_name: dict[str, dict[str, Any]] = {}
            for item in harness.list_menu_items():
                if bool(item.get("is_available", False)) is not True:
                    continue
                item_name = str(item.get("name", "")).strip()
                if not item_name:
                    continue
                key = item_name.casefold()
                prev = by_name.get(key)
                if prev is None or int(item.get("menu_item_id", 0)) > int(prev.get("menu_item_id", 0)):
                    by_name[key] = dict(item)
            for draft in drafts:
                dish_name = str(draft.get("dish_name", "")).strip()
                if not dish_name:
                    continue
                draft_price_cents = int(draft.get("price_cents", 0))
                if draft_price_cents <= 0:
                    continue
                category_text = str(draft.get("category", "")).strip()
                unit_text = str(draft.get("unit", "\u4EFD")).strip() or "\u4EFD"
                aliases = [str(alias).strip() for alias in list(draft.get("aliases", []) or []) if str(alias).strip()]
                existing = by_name.get(dish_name.casefold())
                if existing:
                    existing_id = int(existing.get("menu_item_id", 0))
                    existing_price_cents = int(existing.get("price_cents", 0))
                    existing_category = str(existing.get("category", "")).strip()
                    if existing_id > 0 and existing_price_cents == draft_price_cents:
                        existing_items.append(
                            {
                                "menu_item_id": existing_id,
                                "dish_name": str(existing.get("name", dish_name)),
                                "category": existing_category or category_text,
                                "price_cents": existing_price_cents,
                            }
                        )
                        continue
                    if existing_id > 0:
                        try:
                            updated = harness.update_menu_item_price(
                                menu_item_id=existing_id,
                                price_cents=draft_price_cents,
                                operator=operator,
                            )
                        except ValueError:
                            updated = None
                        if updated:
                            updated_items.append(
                                {
                                    "menu_item_id": int(updated["menu_item_id"]),
                                    "dish_name": str(updated["name"]),
                                    "category": existing_category or category_text,
                                    "old_price_cents": int(updated["old_price_cents"]),
                                    "new_price_cents": int(updated["new_price_cents"]),
                                    "updated": bool(updated.get("updated", False)),
                                    "reason": "duplicate_name_price_changed",
                                }
                            )
                            existing["price_cents"] = int(updated["new_price_cents"])
                            by_name[dish_name.casefold()] = existing
                            continue

                item = harness.create_menu_item(
                    name=dish_name,
                    category=category_text,
                    price_cents=draft_price_cents,
                    unit=unit_text,
                    aliases=aliases,
                    operator=operator,
                )
                created_items.append(
                    {
                        "menu_item_id": int(item["menu_item_id"]),
                        "dish_name": str(item["name"]),
                        "category": str(item["category"]),
                        "price_cents": int(item["price_cents"]),
                        "unit": str(item.get("unit", "\u4EFD")),
                        "aliases": aliases,
                    }
                )
                by_name[dish_name.casefold()] = {
                    "menu_item_id": int(item["menu_item_id"]),
                    "name": str(item["name"]),
                    "category": str(item["category"]),
                    "price_cents": int(item["price_cents"]),
                    "is_available": True,
                }

            has_mutation = bool(created_items or updated_items)
            if not has_mutation and existing_items:
                after_state = before_state
                first_item = existing_items[0] if existing_items else {}
                result = {
                    "event_id": event_id,
                    "intent": "MENU_ADD",
                    "table_no": "",
                    "applied": False,
                    "message": "当前菜品已存在",
                    "table_status": "UNCHANGED",
                    "order_status": "UNCHANGED",
                    "menu_item_id": int(first_item.get("menu_item_id", 0)),
                    "dish_name": str(first_item.get("dish_name", "")),
                    "category": str(first_item.get("category", "")),
                    "price_cents": int(first_item.get("price_cents", 0)),
                    "existing_count": len(existing_items),
                    "existing_items": existing_items,
                    "fail_code": "TARGET_ALREADY_EXISTS",
                    "agent_note": parse_mode,
                    "agent_plan": plan_payload,
                }
                tool_called = []
            elif not has_mutation:
                after_state = before_state
                result = {
                    "event_id": event_id,
                    "intent": "MENU_ADD",
                    "table_no": "",
                    "applied": False,
                    "message": "未识别到可新增菜品，请补充菜品名称和价格",
                    "table_status": "UNCHANGED",
                    "order_status": "UNCHANGED",
                    "fail_code": "INVALID_INPUT",
                    "agent_note": parse_mode,
                    "agent_plan": plan_payload,
                }
                tool_called = []
            else:
                lexicon = harness.refresh_lexicon(operator=operator, note="menu command via agent")
                after_state = {
                    "menu_items_count": len(harness.list_menu_items()),
                    "lexicon_version": str(lexicon.get("version", "")),
                }
                first_item = created_items[0] if created_items else (updated_items[0] if updated_items else {})
                if created_items and updated_items:
                    success_message = f"{len(created_items)} menu item(s) added, {len(updated_items)} price update(s) applied"
                elif created_items:
                    success_message = f"{len(created_items)} menu item(s) added"
                elif updated_items:
                    success_message = f"{len(updated_items)} price update(s) applied"
                else:
                    success_message = "no menu changes applied"
                result = {
                    "event_id": event_id,
                    "intent": "MENU_ADD",
                    "table_no": "",
                    "applied": has_mutation,
                    "message": success_message,
                    "table_status": "UNCHANGED",
                    "order_status": "UNCHANGED",
                    "menu_item_id": int(first_item.get("menu_item_id", 0)),
                    "dish_name": str(first_item.get("dish_name", "")),
                    "category": str(first_item.get("category", "")),
                    "price_cents": int(first_item.get("price_cents", first_item.get("new_price_cents", 0))),
                    "created_count": len(created_items),
                    "created_items": created_items,
                    "updated_count": len(updated_items),
                    "updated_items": updated_items,
                    "existing_count": len(existing_items),
                    "existing_items": existing_items,
                    "lexicon_version": str(lexicon.get("version", "")),
                    "agent_note": parse_mode,
                    "agent_plan": plan_payload,
                }
                tool_called = ["refresh_lexicon"]
                if created_items:
                    tool_called.insert(0, "create_menu_item")
                if updated_items:
                    tool_called.insert(0, "update_menu_item_price")
        else:
            result = {
                "event_id": event_id,
                "intent": action or "AGENT_FAILED",
                "table_no": "",
                "applied": False,
                "message": f"菜品指令动作不支持：{action or 'EMPTY_ACTION'}",
                "table_status": "UNCHANGED",
                "order_status": "UNCHANGED",
                "fail_code": "UNSUPPORTED_ACTION",
                "agent_note": parse_mode,
                "agent_plan": plan_payload,
            }
            after_state = before_state
            tool_called = []

        if replay_key:
            self._voice_event_results[replay_key] = dict(result)
        harness.log_voice_action(
            operator=operator,
            action="MENU_COMMAND",
            event_id=event_id,
            device_id=device_id,
            raw_transcript=transcript,
            tool_called=tool_called,
            agent_plan=plan_payload,
            before_state=before_state,
            after_state=after_state,
            detail=result,
        )
        return result

    def _process_menu_image_parse_locked(
        self,
        image_base64: str,
        mime_type: str,
        operator: str,
        event_id: str = "",
        device_id: str = "",
        ocr_model: str = "",
        ocr_timeout_seconds: float | None = None,
        request_headers: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        replay_key = f"menu-img:{event_id}" if event_id else ""
        if replay_key and replay_key in self._voice_event_results:
            replayed = dict(self._voice_event_results[replay_key])
            replayed["idempotent_replay"] = True
            return replayed

        raw_image = str(image_base64 or "").strip()
        safe_mime = str(mime_type or "image/jpeg").strip().lower() or "image/jpeg"
        if not raw_image:
            raise ValueError("image_base64 is required")
        try:
            image_bytes = base64.b64decode(raw_image, validate=True)
        except (ValueError, binascii.Error) as exc:
            raise ValueError("image_base64 is invalid") from exc
        if not image_bytes:
            raise ValueError("empty image payload")
        if len(image_bytes) > 8 * 1024 * 1024:
            raise ValueError("image too large, max 8MB")

        harness = RestaurantHarness(self.db_path)
        before_state = {"menu_items_count": len(harness.list_menu_items())}
        plan_payload: dict[str, Any] = {
            "action": "MENU_IMAGE_PARSE",
            "records": [],
            "note": "menu-image-model",
            "fail_text": "",
            "fail_code": "",
            "ocr_model": str(ocr_model or "").strip(),
        }
        tool_called: list[str] = []
        try:
            agent = create_agent_adapter(harness.get_menu_alias_map(), request_headers=request_headers)
            parser = getattr(agent, "parse_menu_image_payload", None)
            if not callable(parser):
                raise ValueError("menu image parser unavailable")
            parsed = parser(
                image_base64=raw_image,
                mime_type=safe_mime,
                model=str(ocr_model or "").strip(),
                timeout_seconds=ocr_timeout_seconds,
            )
            if not isinstance(parsed, dict):
                raise ValueError("menu image parser returned invalid payload")
            parse_mode = str(parsed.get("parse_mode", parsed.get("note", "menu-image-model"))).strip() or "menu-image-model"
            fail_text = str(parsed.get("fail_text", "") or "").strip()
            fail_code = str(parsed.get("fail_code", "") or "").strip().upper()
            raw_text = str(parsed.get("raw_text", "") or "").strip()
            if fail_text and not list(parsed.get("records", []) or []):
                plan_payload["fail_code"] = fail_code
                raise ValueError(fail_text)
            records = self._coerce_menu_records(parsed, default_parse_mode=parse_mode)
            if not records:
                raise ValueError("no valid menu records recognized")
            plan_payload["records"] = list(records)
            plan_payload["note"] = parse_mode
            result: dict[str, Any] = {
                "event_id": event_id,
                "intent": "MENU_IMAGE_PARSE",
                "table_no": "",
                "applied": True,
                "message": f"{len(records)} menu item(s) recognized from image",
                "table_status": "UNCHANGED",
                "order_status": "UNCHANGED",
                "records": records,
                "recognized_count": len(records),
                "raw_text": raw_text,
                "mime_type": safe_mime,
                "image_size_bytes": len(image_bytes),
                "ocr_model": str(ocr_model or "").strip() or str(parsed.get("model", "")).strip() or "gpt-5.4",
                "agent_note": parse_mode,
                "agent_plan": dict(plan_payload),
            }
        except ValueError as exc:
            parsed_message = str(exc or "").strip() or "menu image parse failed"
            parsed_code = str(plan_payload.get("fail_code", "") or "").strip().upper()
            runtime_fallback = self._menu_agent_runtime_fallback(parsed_message)
            if runtime_fallback and not parsed_code:
                parsed_message, parsed_code = runtime_fallback
            plan_payload["action"] = "AGENT_FAILED"
            plan_payload["fail_text"] = parsed_message
            plan_payload["fail_code"] = parsed_code
            result = {
                "event_id": event_id,
                "intent": "MENU_IMAGE_PARSE",
                "table_no": "",
                "applied": False,
                "message": parsed_message,
                "table_status": "UNCHANGED",
                "order_status": "UNCHANGED",
                "records": [],
                "recognized_count": 0,
                "mime_type": safe_mime,
                "image_size_bytes": len(image_bytes),
                "ocr_model": str(ocr_model or "").strip() or "gpt-5.4",
                "agent_note": "menu-image-parse-failed",
                "agent_plan": dict(plan_payload),
            }
            if parsed_code:
                result["fail_code"] = parsed_code

        after_state = {"menu_items_count": len(harness.list_menu_items())}
        if replay_key:
            self._voice_event_results[replay_key] = dict(result)
        harness.log_voice_action(
            operator=operator,
            action="MENU_IMAGE_PARSE",
            event_id=event_id,
            device_id=device_id,
            raw_transcript="[menu-image]",
            tool_called=tool_called,
            agent_plan=plan_payload,
            before_state=before_state,
            after_state=after_state,
            detail=result,
        )
        return result

    def _process_menu_image_import_locked(
        self,
        image_base64: str,
        mime_type: str,
        operator: str,
        event_id: str = "",
        device_id: str = "",
        ocr_model: str = "",
        ocr_timeout_seconds: float | None = None,
        records: list[dict[str, Any]] | None = None,
        request_headers: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        replay_key = f"menu-img-import:{event_id}" if event_id else ""
        if replay_key and replay_key in self._voice_event_results:
            replayed = dict(self._voice_event_results[replay_key])
            replayed["idempotent_replay"] = True
            return replayed

        provided_records = list(records or []) if isinstance(records, list) else []
        if provided_records:
            try:
                normalized_records = self._coerce_menu_records(
                    {"records": provided_records},
                    default_parse_mode="menu-image-client-preview",
                )
            except ValueError as exc:
                fail_message = str(exc or "").strip() or "no valid menu records recognized"
                result = {
                    "event_id": event_id,
                    "intent": "MENU_IMAGE_IMPORT",
                    "table_no": "",
                    "applied": False,
                    "message": fail_message,
                    "table_status": "UNCHANGED",
                    "order_status": "UNCHANGED",
                    "records": [],
                    "recognized_count": 0,
                    "created_count": 0,
                    "updated_count": 0,
                    "existing_count": 0,
                    "created_items": [],
                    "updated_items": [],
                    "existing_items": [],
                    "ocr_model": str(ocr_model or "").strip(),
                    "agent_note": "menu-image-import-preparsed-invalid",
                    "agent_plan": {
                        "action": "AGENT_FAILED",
                        "note": "menu-image-import-preparsed",
                        "fail_text": fail_message,
                        "fail_code": "INVALID_INPUT",
                    },
                    "fail_code": "INVALID_INPUT",
                }
                if replay_key:
                    self._voice_event_results[replay_key] = dict(result)
                return result
            parsed_result = {
                "applied": True,
                "records": normalized_records,
                "recognized_count": len(normalized_records),
                "ocr_model": str(ocr_model or "").strip(),
                "preparsed": True,
            }

        if not provided_records:
            parse_event_id = f"{event_id}#parse" if event_id else ""
            parsed_result = self._process_menu_image_parse_locked(
                image_base64=image_base64,
                mime_type=mime_type,
                operator=operator,
                event_id=parse_event_id,
                device_id=device_id,
                ocr_model=ocr_model,
                ocr_timeout_seconds=ocr_timeout_seconds,
                request_headers=request_headers,
            )
        if not bool(parsed_result.get("applied")):
            fail_message = str(parsed_result.get("message", "")).strip() or "菜单图片识别失败"
            fail_code = str(parsed_result.get("fail_code", "")).strip().upper()
            result: dict[str, Any] = {
                "event_id": event_id,
                "intent": "MENU_IMAGE_IMPORT",
                "table_no": "",
                "applied": False,
                "message": fail_message,
                "table_status": "UNCHANGED",
                "order_status": "UNCHANGED",
                "records": [],
                "recognized_count": int(parsed_result.get("recognized_count", 0) or 0),
                "created_count": 0,
                "updated_count": 0,
                "existing_count": 0,
                "created_items": [],
                "updated_items": [],
                "existing_items": [],
                "ocr_model": str(parsed_result.get("ocr_model", "") or str(ocr_model or "")).strip(),
                "agent_note": "menu-image-import-parse-failed",
                "agent_plan": {
                    "action": "AGENT_FAILED",
                    "note": "menu-image-import",
                    "fail_text": fail_message,
                    "fail_code": fail_code,
                },
            }
            if fail_code:
                result["fail_code"] = fail_code
            if replay_key:
                self._voice_event_results[replay_key] = dict(result)
            return result

        records = list(parsed_result.get("records", []) or [])
        harness = RestaurantHarness(self.db_path)
        before_state = {"menu_items_count": len(harness.list_menu_items())}
        created_items: list[dict[str, Any]] = []
        updated_items: list[dict[str, Any]] = []
        existing_items: list[dict[str, Any]] = []
        by_name: dict[str, dict[str, Any]] = {}
        for item in harness.list_menu_items():
            if bool(item.get("is_available", False)) is not True:
                continue
            item_name = str(item.get("name", "")).strip()
            if not item_name:
                continue
            key = item_name.casefold()
            prev = by_name.get(key)
            if prev is None or int(item.get("menu_item_id", 0)) > int(prev.get("menu_item_id", 0)):
                by_name[key] = dict(item)

        for draft in records:
            dish_name = str(draft.get("dish_name", "")).strip()
            if not dish_name:
                continue
            draft_price_cents = int(draft.get("price_cents", 0))
            if draft_price_cents <= 0:
                continue
            category_text = str(draft.get("category", "")).strip()
            unit_text = str(draft.get("unit", "\u4EFD")).strip() or "\u4EFD"
            aliases = [str(alias).strip() for alias in list(draft.get("aliases", []) or []) if str(alias).strip()]
            existing = by_name.get(dish_name.casefold())
            if existing:
                existing_id = int(existing.get("menu_item_id", 0))
                existing_price_cents = int(existing.get("price_cents", 0))
                existing_category = str(existing.get("category", "")).strip()
                if existing_id > 0 and existing_price_cents == draft_price_cents:
                    existing_items.append(
                        {
                            "menu_item_id": existing_id,
                            "dish_name": str(existing.get("name", dish_name)),
                            "category": existing_category or category_text,
                            "price_cents": existing_price_cents,
                        }
                    )
                    continue
                if existing_id > 0:
                    try:
                        updated = harness.update_menu_item_price(
                            menu_item_id=existing_id,
                            price_cents=draft_price_cents,
                            operator=operator,
                        )
                    except ValueError:
                        updated = None
                    if updated:
                        updated_items.append(
                            {
                                "menu_item_id": int(updated["menu_item_id"]),
                                "dish_name": str(updated["name"]),
                                "category": existing_category or category_text,
                                "old_price_cents": int(updated["old_price_cents"]),
                                "new_price_cents": int(updated["new_price_cents"]),
                                "updated": bool(updated.get("updated", False)),
                                "reason": "duplicate_name_price_changed",
                            }
                        )
                        existing["price_cents"] = int(updated["new_price_cents"])
                        by_name[dish_name.casefold()] = existing
                        continue

            item = harness.create_menu_item(
                name=dish_name,
                category=category_text,
                price_cents=draft_price_cents,
                unit=unit_text,
                aliases=aliases,
                operator=operator,
            )
            created_items.append(
                {
                    "menu_item_id": int(item["menu_item_id"]),
                    "dish_name": str(item["name"]),
                    "category": str(item["category"]),
                    "price_cents": int(item["price_cents"]),
                    "unit": str(item.get("unit", "\u4EFD")),
                    "aliases": aliases,
                }
            )
            by_name[dish_name.casefold()] = {
                "menu_item_id": int(item["menu_item_id"]),
                "name": str(item["name"]),
                "category": str(item["category"]),
                "price_cents": int(item["price_cents"]),
                "is_available": True,
            }

        has_mutation = bool(created_items or updated_items)
        fail_code = ""
        if not has_mutation and existing_items:
            message = "当前菜品已存在"
            fail_code = "TARGET_ALREADY_EXISTS"
            applied = False
        elif not has_mutation:
            message = "未识别到可写入的菜品"
            fail_code = "INVALID_INPUT"
            applied = False
        else:
            message = f"image import applied: +{len(created_items)} created, {len(updated_items)} updated"
            applied = True

        lexicon_version = ""
        tool_called: list[str] = []
        if has_mutation:
            lexicon = harness.refresh_lexicon(operator=operator, note="menu image import")
            lexicon_version = str(lexicon.get("version", ""))
            tool_called = ["refresh_lexicon"]
            if created_items:
                tool_called.insert(0, "create_menu_item")
            if updated_items:
                tool_called.insert(0, "update_menu_item_price")

        import_note = "menu-image-import-preparsed" if bool(parsed_result.get("preparsed")) else "menu-image-import"
        result = {
            "event_id": event_id,
            "intent": "MENU_IMAGE_IMPORT",
            "table_no": "",
            "applied": applied,
            "message": message,
            "table_status": "UNCHANGED",
            "order_status": "UNCHANGED",
            "records": records,
            "recognized_count": len(records),
            "created_count": len(created_items),
            "created_items": created_items,
            "updated_count": len(updated_items),
            "updated_items": updated_items,
            "existing_count": len(existing_items),
            "existing_items": existing_items,
            "lexicon_version": lexicon_version,
            "ocr_model": str(parsed_result.get("ocr_model", "") or str(ocr_model or "")).strip(),
            "agent_note": import_note,
            "agent_plan": {
                "action": "MENU_IMAGE_IMPORT",
                "records": records,
                "note": import_note,
                "ocr_model": str(ocr_model or "").strip(),
                "fail_text": "" if applied else message,
                "fail_code": fail_code,
            },
        }
        if fail_code:
            result["fail_code"] = fail_code

        after_state = {"menu_items_count": len(harness.list_menu_items())}
        harness.log_voice_action(
            operator=operator,
            action="MENU_IMAGE_IMPORT",
            event_id=event_id,
            device_id=device_id,
            raw_transcript="[menu-image-import]",
            tool_called=tool_called,
            agent_plan=result.get("agent_plan", {}),
            before_state=before_state,
            after_state=after_state,
            detail=result,
        )
        if replay_key:
            self._voice_event_results[replay_key] = dict(result)
        return result

    def _process_voice_command_locked(
        self,
        transcript: str,
        operator: str,
        event_id: str = "",
        device_id: str = "",
        preplanned: Any | None = None,
        skip_idempotency_check: bool = False,
        skip_multi_table_fanout: bool = False,
        skip_plan_steps: bool = False,
        request_headers: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        if not skip_idempotency_check and event_id and event_id in self._voice_event_results:
            replayed = dict(self._voice_event_results[event_id])
            replayed["idempotent_replay"] = True
            return replayed

        harness = RestaurantHarness(self.db_path)
        channel_key = self._channel_key(operator=operator, device_id=device_id)
        selected_table_no = self._get_selected_table(channel_key=channel_key, harness=harness)
        active_board = harness.get_active_tables_board()
        table_rules = self._build_agent_table_rules_state(harness=harness)
        agent_state = {
            # Only expose lightweight current table-number context to the model.
            "active_table_nos": [
                str(item.get("table_no", "")).strip().upper()
                for item in active_board
                if str(item.get("table_no", "")).strip()
            ],
            "selected_table_no": selected_table_no,
            "table_rules": table_rules,
        }
        if preplanned is None:
            agent = create_agent_adapter(harness.get_menu_alias_map(), request_headers=request_headers)
            try:
                plan = agent.plan_voice_operation(
                    transcript=transcript,
                    state=agent_state,
                )
            except ValueError as exc:
                plan = SimpleNamespace(
                    action="AGENT_FAILED",
                    table_no="",
                    items=[],
                    note=str(exc),
                    fail_text=str(exc),
                    fail_code="MODEL_PLAN_ERROR",
                )
        else:
            plan = preplanned
        normalized_plan_items, normalized_plan_note = self._normalize_plan_note_scopes(plan)
        if hasattr(plan, "items"):
            setattr(plan, "items", normalized_plan_items)
        if hasattr(plan, "note"):
            setattr(plan, "note", normalized_plan_note)
        action = str(plan.action or "").strip().upper()
        plan_order_mode = self._normalize_order_mode(getattr(plan, "order_mode", "AUTO"))
        open_table_with_items = action == "OPEN_TABLE" and bool(list(getattr(plan, "items", []) or []))
        open_table_intent = self._has_open_table_intent(transcript)
        open_order_without_table = (
            action in {"ORDER_ITEM", "ADD_ITEM"}
            and bool(list(getattr(plan, "items", []) or []))
            and not str(getattr(plan, "table_no", "") or "").strip()
            and plan_order_mode != "TAKEOUT"
            and open_table_intent
        )
        open_order_with_guessed_table = (
            action in {"ORDER_ITEM", "ADD_ITEM"}
            and bool(list(getattr(plan, "items", []) or []))
            and str(getattr(plan, "table_no", "") or "").strip()
            and plan_order_mode != "TAKEOUT"
            and open_table_intent
            and not bool(getattr(plan, "_table_no_from_prior_step", False))
            and not self._transcript_mentions_table_no(transcript, getattr(plan, "table_no", ""))
        )
        if open_table_with_items or open_order_without_table or open_order_with_guessed_table:
            setattr(plan, "action", "ORDER_ITEM")
            if open_order_with_guessed_table:
                setattr(plan, "table_no", "")
            setattr(plan, "_allow_empty_table_for_order", True)
            action = "ORDER_ITEM"
        plan_payload = self._plan_to_dict(plan)
        plan_steps = self._extract_plan_steps(plan)
        selected_table_fallback_actions = {
            "ORDER_ITEM",
            "ADD_ITEM",
            "REMOVE_ITEM",
            "ADD_ORDER_NOTE",
            "UPDATE_ORDER_NOTE",
            "REMOVE_ORDER_NOTE",
            "ADD_ITEM_NOTE",
            "UPDATE_ITEM_NOTE",
            "REMOVE_ITEM_NOTE",
            "QUERY_BILL",
            "CHECKOUT",
            "CANCEL_ORDER",
            "UNDO_LAST",
        }
        if (
            action in selected_table_fallback_actions
            and not bool(getattr(plan, "_allow_empty_table_for_order", False))
            and plan_order_mode != "TAKEOUT"
            and not str(getattr(plan, "table_no", "") or "").strip()
            and selected_table_no
        ):
            setattr(plan, "table_no", selected_table_no)
            plan_payload = self._plan_to_dict(plan)

        if plan_steps and not skip_plan_steps:
            if len(plan_steps) == 1:
                return self._process_voice_command_locked(
                    transcript=transcript,
                    operator=operator,
                    event_id=event_id,
                    device_id=device_id,
                    preplanned=plan_steps[0],
                    skip_idempotency_check=True,
                    skip_multi_table_fanout=False,
                    skip_plan_steps=True,
                    request_headers=request_headers,
                )
            before_state = {
                "selected_table_no": selected_table_no,
                "steps_count": len(plan_steps),
            }
            step_results: list[dict[str, Any]] = []
            last_step_table_no = ""
            last_opened_table_no = ""
            for idx, step in enumerate(plan_steps, start=1):
                step_event_id = f"{event_id}#step-{idx}" if event_id else ""
                step_action = str(getattr(step, "action", "") or "").strip().upper()
                step_to_execute = step
                if (
                    last_opened_table_no
                    and step_action != "OPEN_TABLE"
                    and not str(getattr(step, "table_no", "") or "").strip()
                ):
                    step_to_execute = SimpleNamespace(
                        action=step_action,
                        table_no=last_opened_table_no,
                        items=list(getattr(step, "items", []) or []),
                        order_mode=self._normalize_order_mode(getattr(step, "order_mode", "AUTO")),
                        note=str(getattr(step, "note", "") or ""),
                        _table_no_from_prior_step=True,
                    )
                step_result = self._process_voice_command_locked(
                    transcript=transcript,
                    operator=operator,
                    event_id=step_event_id,
                    device_id=device_id,
                    preplanned=step_to_execute,
                    skip_idempotency_check=True,
                    skip_multi_table_fanout=False,
                    skip_plan_steps=True,
                    request_headers=request_headers,
                )
                step_results.append(step_result)
                result_table_no = str(step_result.get("table_no", "") or "").strip().upper()
                if result_table_no:
                    last_step_table_no = result_table_no
                if bool(step_result.get("applied")) and step_action == "OPEN_TABLE" and result_table_no:
                    last_opened_table_no = result_table_no
                if not bool(step_result.get("applied")):
                    break

            last_result = dict(step_results[-1]) if step_results else {}
            all_applied = bool(step_results) and all(bool(item.get("applied")) for item in step_results)
            failed_step = next((idx + 1 for idx, item in enumerate(step_results) if not bool(item.get("applied"))), 0)
            message = (
                f"multi-step executed: {len(step_results)} step(s) applied"
                if all_applied
                else f"multi-step stopped at step {failed_step or len(step_results)}"
            )
            result: dict[str, Any] = {
                "event_id": event_id,
                "intent": str(last_result.get("intent", action or "UNKNOWN")),
                "table_no": str(last_result.get("table_no", "") or plan_payload.get("table_no", "")),
                "applied": all_applied,
                "message": message,
                "order_status": str(last_result.get("order_status", "UNCHANGED")),
                "step_results": step_results,
                "agent_note": f"{str(getattr(plan, 'note', '') or '')}|multi-step",
                "agent_plan": plan_payload,
            }
            if action in {"CHECKOUT", "CANCEL_ORDER", "UNDO_LAST"}:
                confirm_candidates = [item for item in step_results if bool(item.get("requires_confirmation"))]
                confirm_handlers = {
                    str(item.get("confirm_handler", "")).strip().lower()
                    for item in confirm_candidates
                    if str(item.get("confirm_handler", "")).strip()
                }
                if len(confirm_candidates) == len(step_results) and len(confirm_handlers) == 1:
                    confirm_handler = confirm_handlers.pop()
                    if confirm_handler in {"checkout_confirm", "cancel_confirm", "undo_confirm"}:
                        confirm_table_nos: list[str] = []
                        for item in step_results:
                            table_no_item = str(item.get("table_no", "")).strip().upper()
                            if table_no_item and table_no_item not in confirm_table_nos:
                                confirm_table_nos.append(table_no_item)
                        if confirm_table_nos:
                            result["table_no"] = ",".join(confirm_table_nos)
                            result["confirm_table_nos"] = list(confirm_table_nos)
                        result["requires_confirmation"] = True
                        result["confirm_handler"] = confirm_handler
                        if confirm_handler == "checkout_confirm":
                            merged_bill = self._merge_checkout_bill_summary(step_results)
                            if merged_bill:
                                result["bill_summary"] = merged_bill
                            result["message"] = f"tables {result.get('table_no', '')} checkout confirmation required"
                        elif confirm_handler == "cancel_confirm":
                            result["message"] = f"tables {result.get('table_no', '')} cancel confirmation required"
                        elif confirm_handler == "undo_confirm":
                            result["message"] = f"tables {result.get('table_no', '')} undo confirmation required"
            if "table_status" in last_result:
                result["table_status"] = str(last_result.get("table_status", "UNCHANGED"))
            if isinstance(last_result.get("order_id"), int):
                result["order_id"] = int(last_result["order_id"])
            if isinstance(last_result.get("items"), list):
                result["items"] = list(last_result["items"])
            self._remember_voice_result(event_id, result)
            after_state = {
                "selected_table_no": self._get_selected_table(channel_key=channel_key, harness=harness),
                "last_step_table_no": last_step_table_no,
                "steps_executed": len(step_results),
            }
            self._audit_voice_action(
                harness=harness,
                operator=operator,
                event_id=event_id,
                device_id=device_id,
                raw_transcript=transcript,
                tool_called=["multi_step_plan"],
                agent_plan=plan_payload,
                before_state=before_state,
                after_state=after_state,
                detail=result,
            )
            return result

        plan_table_no = str(plan.table_no or "").strip().upper()
        plan_table_targets = self._extract_table_targets(raw_table_no=plan_table_no)
        if plan_table_targets:
            canonical_targets: list[str] = []
            for raw_target in plan_table_targets:
                canonical = self._canonicalize_table_no(
                    harness=harness,
                    table_no=raw_target,
                    allow_create=(action == "OPEN_TABLE"),
                )
                if canonical and canonical not in canonical_targets:
                    canonical_targets.append(canonical)
            plan_table_targets = canonical_targets
        if len(plan_table_targets) == 1:
            plan_table_no = plan_table_targets[0]
        if (
            len(plan_table_targets) > 1
            and action in self._multi_table_fanout_actions()
            and not skip_multi_table_fanout
        ):
            before_state = {"table_targets": [self._snapshot_state(harness, t) for t in plan_table_targets]}
            per_table_results: list[dict[str, Any]] = []
            for idx, target_table_no in enumerate(plan_table_targets, start=1):
                sub_event_id = f"{event_id}#part-{idx}" if event_id else ""
                sub_plan = SimpleNamespace(
                    action=action,
                    table_no=target_table_no,
                    items=list(getattr(plan, "items", []) or []),
                    note=str(getattr(plan, "note", "") or ""),
                )
                sub_result = self._process_voice_command_locked(
                    transcript=transcript,
                    operator=operator,
                    event_id=sub_event_id,
                    device_id=device_id,
                    preplanned=sub_plan,
                    skip_idempotency_check=True,
                    skip_multi_table_fanout=True,
                    skip_plan_steps=True,
                    request_headers=request_headers,
                )
                per_table_results.append(sub_result)

            table_no = ",".join(plan_table_targets)
            succeeded_tables = [
                str(item.get("table_no", "")).strip().upper() or plan_table_targets[idx]
                for idx, item in enumerate(per_table_results)
                if bool(item.get("applied"))
            ]
            failed_tables = [
                str(item.get("table_no", "")).strip().upper() or plan_table_targets[idx]
                for idx, item in enumerate(per_table_results)
                if not bool(item.get("applied"))
            ]
            order_status_set = {
                str(item.get("order_status", "")).strip().upper()
                for item in per_table_results
                if str(item.get("order_status", "")).strip()
            }
            order_status = order_status_set.pop() if len(order_status_set) == 1 else ("MIXED" if order_status_set else "UNCHANGED")
            table_status_set = {
                str(item.get("table_status", "")).strip().upper()
                for item in per_table_results
                if str(item.get("table_status", "")).strip()
            }
            table_status = table_status_set.pop() if len(table_status_set) == 1 else ("MIXED" if table_status_set else "UNCHANGED")
            message = (
                f"multi-table {action.lower()} applied for {','.join(succeeded_tables)}"
                if not failed_tables
                else (
                    f"multi-table {action.lower()} partial: {len(succeeded_tables)}/{len(plan_table_targets)} applied; "
                    f"failed tables: {','.join(failed_tables)}"
                )
            )
            plan_payload["action"] = action
            plan_payload["table_no"] = table_no
            plan_payload["table_targets"] = list(plan_table_targets)
            result: dict[str, Any] = {
                "event_id": event_id,
                "intent": action,
                "table_no": table_no,
                "applied": len(failed_tables) == 0,
                "message": message,
                "order_status": order_status,
                "per_table_results": per_table_results,
                "agent_note": f"{str(getattr(plan, 'note', '') or '')}|multi-table-fanout",
                "agent_plan": plan_payload,
            }
            if action in {"CHECKOUT", "CANCEL_ORDER", "UNDO_LAST"}:
                confirm_candidates = [item for item in per_table_results if bool(item.get("requires_confirmation"))]
                confirm_handlers = {
                    str(item.get("confirm_handler", "")).strip().lower()
                    for item in confirm_candidates
                    if str(item.get("confirm_handler", "")).strip()
                }
                if len(confirm_candidates) == len(per_table_results) and len(confirm_handlers) == 1:
                    confirm_handler = confirm_handlers.pop()
                    if confirm_handler in {"checkout_confirm", "cancel_confirm", "undo_confirm"}:
                        result["requires_confirmation"] = True
                        result["confirm_handler"] = confirm_handler
                        if confirm_handler == "checkout_confirm":
                            merged_bill = self._merge_checkout_bill_summary(per_table_results)
                            if merged_bill:
                                result["bill_summary"] = merged_bill
                            result["message"] = f"tables {table_no} checkout confirmation required"
                        elif confirm_handler == "cancel_confirm":
                            result["message"] = f"tables {table_no} cancel confirmation required"
                        elif confirm_handler == "undo_confirm":
                            result["message"] = f"tables {table_no} undo confirmation required"
            order_ids = [int(item["order_id"]) for item in per_table_results if isinstance(item.get("order_id"), int)]
            if order_ids:
                result["order_ids"] = order_ids
            if action in {"ORDER_ITEM", "ADD_ITEM"}:
                result["items"] = [asdict(i) for i in list(getattr(plan, "items", []) or [])]
            if action in {"ORDER_ITEM", "ADD_ITEM", "REMOVE_ITEM", "CANCEL_ORDER", "CHECKOUT", "UNDO_LAST"}:
                result["table_status"] = table_status
            self._remember_voice_result(event_id, result)
            after_state = {"table_targets": [self._snapshot_state(harness, t) for t in plan_table_targets]}
            self._audit_voice_action(
                harness=harness,
                operator=operator,
                event_id=event_id,
                device_id=device_id,
                raw_transcript=transcript,
                tool_called=["multi_table_fanout"],
                agent_plan=plan_payload,
                before_state=before_state,
                after_state=after_state,
                detail=result,
            )
            return result

        if action == "OPEN_TABLE":
            table_no = plan_table_no
        else:
            table_no = plan_table_no
        table_no = self._canonicalize_table_no(
            harness=harness,
            table_no=table_no,
            allow_create=(action == "OPEN_TABLE"),
        )
        plan_payload["action"] = action
        plan_payload["table_no"] = table_no
        before_state = self._snapshot_state(harness, table_no)

        if action == "AGENT_FAILED":
            fail_text = str(getattr(plan, "fail_text", "") or "").strip()
            fail_code = str(getattr(plan, "fail_code", "") or "").strip().upper()
            message = fail_text or str(getattr(plan, "note", "") or "").strip() or "无法执行该指令"
            result = {
                "event_id": event_id,
                "intent": action,
                "table_no": table_no,
                "applied": False,
                "message": message,
                "order_status": "UNCHANGED",
                "agent_note": str(getattr(plan, "note", "")),
                "agent_plan": plan_payload,
                "ui_action": "AGENT_FAILED",
                "ui_text": message,
                "ui_feedback": {
                    "source": "voice-command",
                    "intent": action,
                    "text": message,
                    "speak_text": message,
                    "code": fail_code,
                },
            }
            if fail_code:
                result["fail_code"] = fail_code
            self._remember_voice_result(event_id, result)
            after_state = self._snapshot_state(harness, table_no)
            self._audit_voice_action(
                harness=harness,
                operator=operator,
                event_id=event_id,
                device_id=device_id,
                raw_transcript=transcript,
                tool_called=[],
                agent_plan=plan_payload,
                before_state=before_state,
                after_state=after_state,
                detail=result,
            )
            return result

        if action == "UNKNOWN":
            result = {
                "event_id": event_id,
                "intent": action,
                "table_no": table_no,
                "applied": False,
                "message": "agent can not determine operation",
                "order_status": "UNCHANGED",
                "agent_note": str(getattr(plan, "note", "")),
                "agent_plan": plan_payload,
            }
            self._remember_voice_result(event_id, result)
            after_state = self._snapshot_state(harness, table_no)
            self._audit_voice_action(
                harness=harness,
                operator=operator,
                event_id=event_id,
                device_id=device_id,
                raw_transcript=transcript,
                tool_called=[],
                agent_plan=plan_payload,
                before_state=before_state,
                after_state=after_state,
                detail=result,
            )
            return result

        table_required_actions = {"ORDER_ITEM", "ADD_ITEM", "ADD_ORDER_NOTE", "UPDATE_ORDER_NOTE", "REMOVE_ORDER_NOTE", "ADD_ITEM_NOTE", "UPDATE_ITEM_NOTE", "REMOVE_ITEM_NOTE", "REMOVE_ITEM", "QUERY_BILL", "CHECKOUT", "CANCEL_ORDER", "UNDO_LAST"}
        allow_empty_table_for_takeout_order = (
            action in {"ORDER_ITEM", "ADD_ITEM"}
            and plan_order_mode == "TAKEOUT"
        )
        allow_empty_table_for_open_order = (
            action in {"ORDER_ITEM", "ADD_ITEM"}
            and bool(getattr(plan, "_allow_empty_table_for_order", False))
        )
        if action in table_required_actions and not table_no and not allow_empty_table_for_takeout_order and not allow_empty_table_for_open_order:
            result = {
                "event_id": event_id,
                "intent": action,
                "table_no": "",
                "applied": False,
                "message": f"model returned empty table_no for {action}",
                "table_status": "UNCHANGED",
                "order_status": "UNCHANGED",
                "agent_note": str(getattr(plan, "note", "")),
                "agent_plan": plan_payload,
            }
            self._remember_voice_result(event_id, result)
            after_state = self._snapshot_state(harness, "")
            self._audit_voice_action(
                harness=harness,
                operator=operator,
                event_id=event_id,
                device_id=device_id,
                raw_transcript=transcript,
                tool_called=[],
                agent_plan=plan_payload,
                before_state=before_state,
                after_state=after_state,
                detail=result,
            )
            return result

        if action == "OPEN_TABLE":
            try:
                effective_table_no = table_no or self._allocate_next_table_no(
                    harness=harness,
                    order_mode=plan_order_mode,
                )
                self._validate_table_no_for_opening(
                    effective_table_no,
                    order_mode=plan_order_mode,
                )
                table = harness.get_or_create_table(table_no=effective_table_no, operator=operator)
            except ApiError as exc:
                result = {
                    "event_id": event_id,
                    "intent": action,
                    "table_no": "",
                    "applied": False,
                    "message": exc.message,
                    "table_status": "UNCHANGED",
                    "order_status": "UNCHANGED",
                    "agent_note": str(getattr(plan, "note", "")),
                    "agent_plan": plan_payload,
                }
                self._remember_voice_result(event_id, result)
                after_state = self._snapshot_state(harness, "")
                self._audit_voice_action(
                    harness=harness,
                    operator=operator,
                    event_id=event_id,
                    device_id=device_id,
                    raw_transcript=transcript,
                    tool_called=[],
                    agent_plan=plan_payload,
                    before_state=before_state,
                    after_state=after_state,
                    detail=result,
                )
                return result
            harness.set_table_status(table["id"], "OPEN")
            self._set_selected_table(channel_key, effective_table_no)
            result = {
                "event_id": event_id,
                "intent": action,
                "table_no": effective_table_no,
                "applied": True,
                "message": f"table {effective_table_no} opened",
                "table_status": "OPEN",
                "order_status": "NONE",
                "agent_note": str(getattr(plan, "note", "")),
                "agent_plan": plan_payload,
            }
            self._remember_voice_result(event_id, result)
            after_state = self._snapshot_state(harness, effective_table_no)
            self._audit_voice_action(
                harness=harness,
                operator=operator,
                event_id=event_id,
                device_id=device_id,
                raw_transcript=transcript,
                tool_called=["get_or_create_table", "set_table_status"],
                agent_plan=plan_payload,
                before_state=before_state,
                after_state=after_state,
                detail=result,
            )
            return result

        table = harness.get_table_by_no(table_no) if table_no else None
        if plan_table_no and table is not None:
            self._set_selected_table(channel_key, table_no)

        if table is None and action in {"ORDER_ITEM", "ADD_ITEM"}:
            try:
                effective_table_no = table_no or self._allocate_next_table_no(
                    harness=harness,
                    order_mode=plan_order_mode,
                )
                self._validate_table_no_for_opening(
                    effective_table_no,
                    order_mode=plan_order_mode,
                )
                table = harness.get_or_create_table(table_no=effective_table_no, operator=operator)
                table_no = effective_table_no
                self._set_selected_table(channel_key, table_no)
            except ApiError as exc:
                result = {
                    "event_id": event_id,
                    "intent": action,
                    "table_no": table_no,
                    "applied": False,
                    "message": exc.message,
                    "table_status": "UNCHANGED",
                    "order_status": "UNCHANGED",
                    "agent_note": str(getattr(plan, "note", "")),
                    "agent_plan": plan_payload,
                }
                self._remember_voice_result(event_id, result)
                after_state = self._snapshot_state(harness, table_no)
                self._audit_voice_action(
                    harness=harness,
                    operator=operator,
                    event_id=event_id,
                    device_id=device_id,
                    raw_transcript=transcript,
                    tool_called=[],
                    agent_plan=plan_payload,
                    before_state=before_state,
                    after_state=after_state,
                    detail=result,
                )
                return result

        open_order_id = harness.get_open_order_id_by_table(table["id"]) if table is not None else None

        if action in {"ADD_ITEM_NOTE", "UPDATE_ITEM_NOTE", "REMOVE_ITEM_NOTE"}:
            raw_note = str(getattr(plan, "note", "") or "")
            item_level_notes = [str(getattr(item, "note", "") or "") for item in list(getattr(plan, "items", []) or [])]
            incoming_note = self._merge_order_note_text(raw_note, *item_level_notes)
            target_menu_item_ids = sorted({int(item.menu_item_id) for item in list(getattr(plan, "items", []) or []) if int(item.menu_item_id or 0) > 0})
            if table is None or open_order_id is None:
                result = {
                    "event_id": event_id,
                    "intent": action,
                    "table_no": table_no,
                    "applied": False,
                    "message": f"桌号 {table_no or '-'} 当前没有进行中的账单",
                    "order_status": "NONE",
                    "agent_note": raw_note,
                    "agent_plan": plan_payload,
                }
                self._remember_voice_result(event_id, result)
                after_state = self._snapshot_state(harness, table_no)
                self._audit_voice_action(
                    harness=harness,
                    operator=operator,
                    event_id=event_id,
                    device_id=device_id,
                    raw_transcript=transcript,
                    tool_called=[],
                    agent_plan=plan_payload,
                    before_state=before_state,
                    after_state=after_state,
                    detail=result,
                )
                return result
            if not target_menu_item_ids:
                result = {
                    "event_id": event_id,
                    "intent": action,
                    "table_no": table_no,
                    "applied": False,
                    "message": "未识别到目标菜品",
                    "order_status": "UNCHANGED",
                    "agent_note": raw_note,
                    "agent_plan": plan_payload,
                }
                self._remember_voice_result(event_id, result)
                after_state = self._snapshot_state(harness, table_no)
                self._audit_voice_action(
                    harness=harness,
                    operator=operator,
                    event_id=event_id,
                    device_id=device_id,
                    raw_transcript=transcript,
                    tool_called=[],
                    agent_plan=plan_payload,
                    before_state=before_state,
                    after_state=after_state,
                    detail=result,
                )
                return result
            target_rows = harness.get_open_order_items_by_menu_ids(table_no=table_no, menu_item_ids=target_menu_item_ids)
            if not target_rows:
                result = {
                    "event_id": event_id,
                    "intent": action,
                    "table_no": table_no,
                    "applied": False,
                    "message": "当前账单未找到目标菜品",
                    "order_status": "OPEN",
                    "agent_note": raw_note,
                    "agent_plan": plan_payload,
                }
                self._remember_voice_result(event_id, result)
                after_state = self._snapshot_state(harness, table_no)
                self._audit_voice_action(
                    harness=harness,
                    operator=operator,
                    event_id=event_id,
                    device_id=device_id,
                    raw_transcript=transcript,
                    tool_called=[],
                    agent_plan=plan_payload,
                    before_state=before_state,
                    after_state=after_state,
                    detail=result,
                )
                return result
            target_item_names = [str(row.get("item_name", "") or "").strip() for row in target_rows]
            incoming_note = self._normalize_item_note_text(incoming_note, target_item_names)
            if not incoming_note:
                incoming_note = self._extract_item_note_text_from_transcript(transcript, target_item_names)
            if action in {"ADD_ITEM_NOTE", "UPDATE_ITEM_NOTE"} and not incoming_note:
                result = {
                    "event_id": event_id,
                    "intent": action,
                    "table_no": table_no,
                    "applied": False,
                    "message": "未识别到新的菜品备注内容",
                    "order_status": "UNCHANGED",
                    "agent_note": raw_note,
                    "agent_plan": plan_payload,
                }
                self._remember_voice_result(event_id, result)
                after_state = self._snapshot_state(harness, table_no)
                self._audit_voice_action(
                    harness=harness,
                    operator=operator,
                    event_id=event_id,
                    device_id=device_id,
                    raw_transcript=transcript,
                    tool_called=[],
                    agent_plan=plan_payload,
                    before_state=before_state,
                    after_state=after_state,
                    detail=result,
                )
                return result
            previous_item_notes: list[dict[str, Any]] = []
            changed_items: list[dict[str, Any]] = []
            for row in target_rows:
                previous_note = str(row.get("note", "") or "")
                if action == "ADD_ITEM_NOTE":
                    next_note = self._merge_order_note_text(previous_note, incoming_note)
                elif action == "UPDATE_ITEM_NOTE":
                    next_note = incoming_note
                else:
                    next_note = ""
                if next_note == previous_note:
                    continue
                updated = harness.set_order_item_note(order_item_id=int(row["order_item_id"]), note=next_note, operator=operator)
                previous_item_notes.append(
                    {
                        "order_item_id": int(row["order_item_id"]),
                        "previous_note": previous_note,
                    }
                )
                changed_items.append(
                    {
                        "order_item_id": int(row["order_item_id"]),
                        "menu_item_id": int(row["menu_item_id"]),
                        "item_name": str(row.get("item_name", "") or ""),
                        "note": str(updated.get("note", "") or ""),
                    }
                )
            if not changed_items:
                result = {
                    "event_id": event_id,
                    "intent": action,
                    "table_no": table_no,
                    "applied": False,
                    "order_id": open_order_id,
                    "table_status": "OPEN",
                    "order_status": "OPEN",
                    "message": "当前菜品备注未发生变化",
                    "agent_note": raw_note,
                    "agent_plan": plan_payload,
                }
                self._remember_voice_result(event_id, result)
                after_state = self._snapshot_state(harness, table_no)
                self._audit_voice_action(
                    harness=harness,
                    operator=operator,
                    event_id=event_id,
                    device_id=device_id,
                    raw_transcript=transcript,
                    tool_called=[],
                    agent_plan=plan_payload,
                    before_state=before_state,
                    after_state=after_state,
                    detail=result,
                )
                return result
            harness.set_table_status(table["id"], "OPEN")
            self._set_selected_table(channel_key, table_no)
            result = {
                "event_id": event_id,
                "intent": action,
                "table_no": table_no,
                "applied": True,
                "order_id": open_order_id,
                "table_status": "OPEN",
                "order_status": "OPEN",
                "updated_items": changed_items,
                "message": f"table {table_no} item note updated",
                "agent_note": raw_note,
                "agent_plan": plan_payload,
            }
            self._remember_voice_result(event_id, result)
            self._table_action_history.setdefault(table_no, []).append(
                {
                    "kind": action,
                    "order_id": open_order_id,
                    "previous_item_notes": previous_item_notes,
                }
            )
            after_state = self._snapshot_state(harness, table_no)
            self._audit_voice_action(
                harness=harness,
                operator=operator,
                event_id=event_id,
                device_id=device_id,
                raw_transcript=transcript,
                tool_called=["set_order_item_note", "set_table_status"],
                agent_plan=plan_payload,
                before_state=before_state,
                after_state=after_state,
                detail=result,
            )
            return result

        if action in {"ADD_ORDER_NOTE", "UPDATE_ORDER_NOTE", "REMOVE_ORDER_NOTE"}:
            raw_note = str(getattr(plan, "note", "") or "")
            incoming_note = self._merge_order_note_text(raw_note)
            if table is None or open_order_id is None:
                result = {
                    "event_id": event_id,
                    "intent": action,
                    "table_no": table_no,
                    "applied": False,
                    "message": f"桌号 {table_no or '-'} 当前没有进行中的账单",
                    "order_status": "NONE",
                    "agent_note": raw_note,
                    "agent_plan": plan_payload,
                }
                self._remember_voice_result(event_id, result)
                after_state = self._snapshot_state(harness, table_no)
                self._audit_voice_action(
                    harness=harness,
                    operator=operator,
                    event_id=event_id,
                    device_id=device_id,
                    raw_transcript=transcript,
                    tool_called=[],
                    agent_plan=plan_payload,
                    before_state=before_state,
                    after_state=after_state,
                    detail=result,
                )
                return result
            previous_order_note = harness.get_order_note(open_order_id)
            if action == "ADD_ORDER_NOTE":
                if not incoming_note:
                    result = {
                        "event_id": event_id,
                        "intent": action,
                        "table_no": table_no,
                        "applied": False,
                        "message": "未识别到备注内容",
                        "order_status": "UNCHANGED",
                        "agent_note": raw_note,
                        "agent_plan": plan_payload,
                    }
                    self._remember_voice_result(event_id, result)
                    after_state = self._snapshot_state(harness, table_no)
                    self._audit_voice_action(
                        harness=harness,
                        operator=operator,
                        event_id=event_id,
                        device_id=device_id,
                        raw_transcript=transcript,
                        tool_called=[],
                        agent_plan=plan_payload,
                        before_state=before_state,
                        after_state=after_state,
                        detail=result,
                    )
                    return result
                saved_note = harness.set_order_note(
                    order_id=open_order_id,
                    note=self._merge_order_note_text(previous_order_note, incoming_note),
                    operator=operator,
                )
                message = f"table {table_no} note updated"
            elif action == "UPDATE_ORDER_NOTE":
                if not incoming_note:
                    result = {
                        "event_id": event_id,
                        "intent": action,
                        "table_no": table_no,
                        "applied": False,
                        "message": "未识别到新的备注内容",
                        "order_status": "UNCHANGED",
                        "agent_note": raw_note,
                        "agent_plan": plan_payload,
                    }
                    self._remember_voice_result(event_id, result)
                    after_state = self._snapshot_state(harness, table_no)
                    self._audit_voice_action(
                        harness=harness,
                        operator=operator,
                        event_id=event_id,
                        device_id=device_id,
                        raw_transcript=transcript,
                        tool_called=[],
                        agent_plan=plan_payload,
                        before_state=before_state,
                        after_state=after_state,
                        detail=result,
                    )
                    return result
                saved_note = harness.set_order_note(order_id=open_order_id, note=incoming_note, operator=operator)
                message = f"table {table_no} note replaced"
            else:
                if incoming_note:
                    saved_note = harness.set_order_note(
                        order_id=open_order_id,
                        note=self._remove_order_note_text(previous_order_note, incoming_note),
                        operator=operator,
                    )
                else:
                    saved_note = harness.set_order_note(order_id=open_order_id, note="", operator=operator)
                if saved_note == previous_order_note:
                    result = {
                        "event_id": event_id,
                        "intent": action,
                        "table_no": table_no,
                        "applied": False,
                        "order_id": open_order_id,
                        "table_status": "OPEN",
                        "order_status": "OPEN",
                        "order_note": saved_note,
                        "message": "当前备注未发生变化",
                        "agent_note": raw_note,
                        "agent_plan": plan_payload,
                    }
                    self._remember_voice_result(event_id, result)
                    after_state = self._snapshot_state(harness, table_no)
                    self._audit_voice_action(
                        harness=harness,
                        operator=operator,
                        event_id=event_id,
                        device_id=device_id,
                        raw_transcript=transcript,
                        tool_called=[],
                        agent_plan=plan_payload,
                        before_state=before_state,
                        after_state=after_state,
                        detail=result,
                    )
                    return result
                message = f"table {table_no} note removed"
            harness.set_table_status(table["id"], "OPEN")
            self._set_selected_table(channel_key, table_no)
            result = {
                "event_id": event_id,
                "intent": action,
                "table_no": table_no,
                "applied": True,
                "order_id": open_order_id,
                "table_status": "OPEN",
                "order_status": "OPEN",
                "order_note": saved_note,
                "message": message,
                "agent_note": raw_note,
                "agent_plan": plan_payload,
            }
            self._remember_voice_result(event_id, result)
            self._table_action_history.setdefault(table_no, []).append(
                {"kind": action, "order_id": open_order_id, "previous_order_note": previous_order_note}
            )
            after_state = self._snapshot_state(harness, table_no)
            self._audit_voice_action(
                harness=harness,
                operator=operator,
                event_id=event_id,
                device_id=device_id,
                raw_transcript=transcript,
                tool_called=["set_order_note", "set_table_status"],
                agent_plan=plan_payload,
                before_state=before_state,
                after_state=after_state,
                detail=result,
            )
            return result

        if action in {"ORDER_ITEM", "ADD_ITEM"}:
            items = list(getattr(plan, "items", []) or [])
            order_note = self._merge_order_note_text(getattr(plan, "note", ""))
            previous_order_note = ""
            if not items:
                result = {
                    "event_id": event_id,
                    "intent": action,
                    "table_no": table_no,
                    "applied": False,
                    "message": "agent can not extract order items",
                    "order_status": "UNCHANGED",
                    "agent_note": str(getattr(plan, "note", "")),
                    "agent_plan": plan_payload,
                }
                self._remember_voice_result(event_id, result)
                after_state = self._snapshot_state(harness, table_no)
                self._audit_voice_action(
                    harness=harness,
                    operator=operator,
                    event_id=event_id,
                    device_id=device_id,
                    raw_transcript=transcript,
                    tool_called=[],
                    agent_plan=plan_payload,
                    before_state=before_state,
                    after_state=after_state,
                    detail=result,
                )
                return result

            if table is None:
                try:
                    effective_table_no = table_no or self._allocate_next_table_no(
                        harness=harness,
                        order_mode=plan_order_mode,
                    )
                    self._validate_table_no_for_opening(
                        effective_table_no,
                        order_mode=plan_order_mode,
                    )
                    table = harness.get_or_create_table(table_no=effective_table_no, operator=operator)
                    table_no = effective_table_no
                    open_order_id = None
                    self._set_selected_table(channel_key, table_no)
                except ApiError as exc:
                    result = {
                        "event_id": event_id,
                        "intent": action,
                        "table_no": table_no,
                        "applied": False,
                        "message": exc.message,
                        "table_status": "UNCHANGED",
                        "order_status": "UNCHANGED",
                        "agent_note": str(getattr(plan, "note", "")),
                        "agent_plan": plan_payload,
                    }
                    self._remember_voice_result(event_id, result)
                    after_state = self._snapshot_state(harness, table_no)
                    self._audit_voice_action(
                        harness=harness,
                        operator=operator,
                        event_id=event_id,
                        device_id=device_id,
                        raw_transcript=transcript,
                        tool_called=[],
                        agent_plan=plan_payload,
                        before_state=before_state,
                        after_state=after_state,
                        detail=result,
                    )
                    return result

            if open_order_id is None:
                order_id = harness.create_order(
                    table_id=table["id"],
                    items=items,
                    operator=operator,
                    order_note=order_note,
                )
                created_new = True
            else:
                order_id = open_order_id
                created_new = False
                previous_order_note = harness.get_order_note(order_id)
                for item in items:
                    harness.add_item(
                        order_id=order_id,
                        menu_item_id=item.menu_item_id,
                        qty=item.qty,
                        operator=operator,
                        note=item.note,
                    )
                if order_note:
                    merged_note = self._merge_order_note_text(harness.get_order_note(order_id), order_note)
                    harness.set_order_note(order_id=order_id, note=merged_note, operator=operator)
            harness.set_table_status(table["id"], "OPEN")
            self._set_selected_table(channel_key, table_no)
            result = {
                "event_id": event_id,
                "intent": action,
                "table_no": table_no,
                "applied": True,
                "order_id": order_id,
                "table_status": "OPEN",
                "order_status": "OPEN",
                "order_note": harness.get_order_note(order_id),
                "items": [asdict(i) for i in items],
                "message": f"table {table_no} order updated",
                "agent_note": str(getattr(plan, "note", "")),
                "agent_plan": plan_payload,
            }
            self._remember_voice_result(event_id, result)
            self._table_action_history.setdefault(table_no, []).append(
                {
                    "kind": "ORDER_ITEM" if created_new else "ADD_ITEM",
                    "order_id": order_id,
                    "created_new": created_new,
                    "count": len(items),
                    "previous_order_note": previous_order_note,
                }
            )
            after_state = self._snapshot_state(harness, table_no)
            tool_called = ["create_order" if created_new else "add_item", "set_table_status"]
            if order_note and not created_new:
                tool_called.insert(1, "set_order_note")
            self._audit_voice_action(
                harness=harness,
                operator=operator,
                event_id=event_id,
                device_id=device_id,
                raw_transcript=transcript,
                tool_called=tool_called,
                agent_plan=plan_payload,
                before_state=before_state,
                after_state=after_state,
                detail=result,
            )
            return result

        if action == "REMOVE_ITEM":
            if table is None or open_order_id is None:
                if plan_table_no and table is not None:
                    self._set_selected_table(channel_key, table_no)
                result = {
                    "event_id": event_id,
                    "intent": action,
                    "table_no": table_no,
                    "applied": False,
                    "message": f"桌号 {table_no or '-'} 当前没有进行中的账单",
                    "order_status": "NONE",
                    "agent_note": str(getattr(plan, "note", "")),
                    "agent_plan": plan_payload,
                }
                self._remember_voice_result(event_id, result)
                after_state = self._snapshot_state(harness, table_no)
                self._audit_voice_action(
                    harness=harness,
                    operator=operator,
                    event_id=event_id,
                    device_id=device_id,
                    raw_transcript=transcript,
                    tool_called=[],
                    agent_plan=plan_payload,
                    before_state=before_state,
                    after_state=after_state,
                    detail=result,
                )
                return result

            items = list(getattr(plan, "items", []) or [])
            if not items:
                result = {
                    "event_id": event_id,
                    "intent": action,
                    "table_no": table_no,
                    "applied": False,
                    "message": "未识别到可退菜品，请补充菜品名称",
                    "order_status": "UNCHANGED",
                    "agent_note": str(getattr(plan, "note", "")),
                    "agent_plan": plan_payload,
                }
                self._remember_voice_result(event_id, result)
                after_state = self._snapshot_state(harness, table_no)
                self._audit_voice_action(
                    harness=harness,
                    operator=operator,
                    event_id=event_id,
                    device_id=device_id,
                    raw_transcript=transcript,
                    tool_called=[],
                    agent_plan=plan_payload,
                    before_state=before_state,
                    after_state=after_state,
                    detail=result,
                )
                return result

            removed = harness.remove_order_items(order_id=open_order_id, items=items, operator=operator)
            removed_items = list(removed.get("removed_items", []))
            if not removed_items:
                result = {
                    "event_id": event_id,
                    "intent": action,
                    "table_no": table_no,
                    "applied": False,
                    "order_id": open_order_id,
                    "table_status": "OPEN",
                    "order_status": "OPEN",
                    "removed_items": [],
                    "message": f"桌号 {table_no} 没有可退的对应菜品",
                    "agent_note": str(getattr(plan, "note", "")),
                    "agent_plan": plan_payload,
                }
                self._remember_voice_result(event_id, result)
                after_state = self._snapshot_state(harness, table_no)
                self._audit_voice_action(
                    harness=harness,
                    operator=operator,
                    event_id=event_id,
                    device_id=device_id,
                    raw_transcript=transcript,
                    tool_called=["remove_order_items"],
                    agent_plan=plan_payload,
                    before_state=before_state,
                    after_state=after_state,
                    detail=result,
                )
                return result

            self._set_selected_table(channel_key, table_no)
            result = {
                "event_id": event_id,
                "intent": action,
                "table_no": table_no,
                "applied": True,
                "order_id": open_order_id,
                "table_status": "OPEN",
                "order_status": "OPEN",
                "removed_items": removed_items,
                "message": f"table {table_no} order item removed",
                "agent_note": str(getattr(plan, "note", "")),
                "agent_plan": plan_payload,
            }
            self._remember_voice_result(event_id, result)
            after_state = self._snapshot_state(harness, table_no)
            self._audit_voice_action(
                harness=harness,
                operator=operator,
                event_id=event_id,
                device_id=device_id,
                raw_transcript=transcript,
                tool_called=["remove_order_items"],
                agent_plan=plan_payload,
                before_state=before_state,
                after_state=after_state,
                detail=result,
            )
            return result

        if action == "QUERY_BILL":
            if table is None or open_order_id is None:
                if plan_table_no and table is not None:
                    self._set_selected_table(channel_key, table_no)
                result = {
                    "event_id": event_id,
                    "intent": action,
                    "table_no": table_no,
                    "applied": False,
                    "message": f"table {table_no or '-'} has no OPEN order",
                    "order_status": "NONE",
                    "agent_note": str(getattr(plan, "note", "")),
                    "agent_plan": plan_payload,
                }
                self._remember_voice_result(event_id, result)
                after_state = self._snapshot_state(harness, table_no)
                self._audit_voice_action(
                    harness=harness,
                    operator=operator,
                    event_id=event_id,
                    device_id=device_id,
                    raw_transcript=transcript,
                    tool_called=[],
                    agent_plan=plan_payload,
                    before_state=before_state,
                    after_state=after_state,
                    detail=result,
                )
                return result
            bill = harness.preview_bill(order_id=open_order_id)
            self._set_selected_table(channel_key, table_no)
            result = {
                "event_id": event_id,
                "intent": action,
                "table_no": table_no,
                "applied": True,
                "order_id": open_order_id,
                "order_status": "OPEN",
                "bill_summary": {
                    "subtotal_cents": bill["subtotal_cents"],
                    "extra_fee_total_cents": bill["extra_fee_total_cents"],
                    "extra_fee_items": list(bill.get("extra_fee_items", [])),
                    "total_cents": bill["total_cents"],
                    "currency": bill["currency"],
                },
                "message": f"table {table_no} bill preview",
                "agent_note": str(getattr(plan, "note", "")),
                "agent_plan": plan_payload,
            }
            self._remember_voice_result(event_id, result)
            after_state = self._snapshot_state(harness, table_no)
            self._audit_voice_action(
                harness=harness,
                operator=operator,
                event_id=event_id,
                device_id=device_id,
                raw_transcript=transcript,
                tool_called=["preview_bill"],
                agent_plan=plan_payload,
                before_state=before_state,
                after_state=after_state,
                detail=result,
            )
            return result

        if action == "CANCEL_ORDER":
            if table is None:
                result = {
                    "event_id": event_id,
                    "intent": action,
                    "table_no": table_no,
                    "applied": False,
                    "message": f"table {table_no or '-'} not found",
                    "order_status": "NONE",
                    "agent_note": str(getattr(plan, "note", "")),
                    "agent_plan": plan_payload,
                }
                self._remember_voice_result(event_id, result)
                after_state = self._snapshot_state(harness, table_no)
                self._audit_voice_action(
                    harness=harness,
                    operator=operator,
                    event_id=event_id,
                    device_id=device_id,
                    raw_transcript=transcript,
                    tool_called=[],
                    agent_plan=plan_payload,
                    before_state=before_state,
                    after_state=after_state,
                    detail=result,
                )
                return result
            self._set_selected_table(channel_key, table_no)
            result = {
                "event_id": event_id,
                "intent": action,
                "table_no": table_no,
                "applied": True,
                "order_id": open_order_id,
                "table_status": str(table.get("status", "")).upper() or "OPEN",
                "order_status": "OPEN" if open_order_id is not None else "NONE",
                "requires_confirmation": True,
                "confirm_handler": "cancel_confirm",
                "message": f"table {table_no} cancel confirmation required",
                "agent_note": str(getattr(plan, "note", "")),
                "agent_plan": plan_payload,
            }
            self._remember_voice_result(event_id, result)
            after_state = self._snapshot_state(harness, table_no)
            self._audit_voice_action(
                harness=harness,
                operator=operator,
                event_id=event_id,
                device_id=device_id,
                raw_transcript=transcript,
                tool_called=[],
                agent_plan=plan_payload,
                before_state=before_state,
                after_state=after_state,
                detail=result,
            )
            return result

        if action == "CHECKOUT":
            if table is None or open_order_id is None:
                if plan_table_no and table is not None:
                    self._set_selected_table(channel_key, table_no)
                result = {
                    "event_id": event_id,
                    "intent": action,
                    "table_no": table_no,
                    "applied": False,
                    "message": f"table {table_no or '-'} has no OPEN order",
                    "order_status": "NONE",
                    "agent_note": str(getattr(plan, "note", "")),
                    "agent_plan": plan_payload,
                }
                self._remember_voice_result(event_id, result)
                after_state = self._snapshot_state(harness, table_no)
                self._audit_voice_action(
                    harness=harness,
                    operator=operator,
                    event_id=event_id,
                    device_id=device_id,
                    raw_transcript=transcript,
                    tool_called=[],
                    agent_plan=plan_payload,
                    before_state=before_state,
                    after_state=after_state,
                    detail=result,
                )
                return result
            bill = harness.preview_bill(order_id=open_order_id)
            self._set_selected_table(channel_key, table_no)
            result = {
                "event_id": event_id,
                "intent": action,
                "table_no": table_no,
                "applied": True,
                "order_id": open_order_id,
                "table_status": "OPEN",
                "order_status": "OPEN",
                "requires_confirmation": True,
                "confirm_handler": "checkout_confirm",
                "bill_summary": {
                    "subtotal_cents": bill["subtotal_cents"],
                    "extra_fee_total_cents": bill["extra_fee_total_cents"],
                    "extra_fee_items": list(bill.get("extra_fee_items", [])),
                    "total_cents": bill["total_cents"],
                    "currency": bill["currency"],
                },
                "message": f"table {table_no} checkout confirmation required",
                "agent_note": str(getattr(plan, "note", "")),
                "agent_plan": plan_payload,
            }
            self._remember_voice_result(event_id, result)
            after_state = self._snapshot_state(harness, table_no)
            self._audit_voice_action(
                harness=harness,
                operator=operator,
                event_id=event_id,
                device_id=device_id,
                raw_transcript=transcript,
                tool_called=["preview_bill"],
                agent_plan=plan_payload,
                before_state=before_state,
                after_state=after_state,
                detail=result,
            )
            return result

        if action == "UNDO_LAST":
            if plan_table_no and table is not None:
                self._set_selected_table(channel_key, table_no)
            history = self._table_action_history.get(table_no, []) if table_no else []
            if not history or table is None:
                can_close_idle_table = (
                    table is not None
                    and open_order_id is None
                    and str(table.get("status", "")).upper() == "OPEN"
                )
                if can_close_idle_table:
                    result = {
                        "event_id": event_id,
                        "intent": action,
                        "table_no": table_no,
                        "applied": True,
                        "order_id": open_order_id,
                        "table_status": str(table.get("status", "")).upper() or "OPEN",
                        "order_status": "NONE",
                        "requires_confirmation": True,
                        "confirm_handler": "undo_confirm",
                        "message": f"table {table_no} undo confirmation required",
                        "agent_note": str(getattr(plan, "note", "")),
                        "agent_plan": plan_payload,
                    }
                    self._remember_voice_result(event_id, result)
                    after_state = self._snapshot_state(harness, table_no)
                    self._audit_voice_action(
                        harness=harness,
                        operator=operator,
                        event_id=event_id,
                        device_id=device_id,
                        raw_transcript=transcript,
                        tool_called=[],
                        agent_plan=plan_payload,
                        before_state=before_state,
                        after_state=after_state,
                        detail=result,
                    )
                    return result
                result = {
                    "event_id": event_id,
                    "intent": action,
                    "table_no": table_no,
                    "applied": False,
                    "message": f"table {table_no or '-'} has no undoable action",
                    "order_status": "UNCHANGED",
                    "agent_note": str(getattr(plan, "note", "")),
                    "agent_plan": plan_payload,
                }
                self._remember_voice_result(event_id, result)
                after_state = self._snapshot_state(harness, table_no)
                self._audit_voice_action(
                    harness=harness,
                    operator=operator,
                    event_id=event_id,
                    device_id=device_id,
                    raw_transcript=transcript,
                    tool_called=[],
                    agent_plan=plan_payload,
                    before_state=before_state,
                    after_state=after_state,
                    detail=result,
                )
                return result
            result = {
                "event_id": event_id,
                "intent": action,
                "table_no": table_no,
                "applied": True,
                "order_id": open_order_id,
                "table_status": str(table.get("status", "")).upper() or "OPEN",
                "order_status": "OPEN" if open_order_id is not None else "NONE",
                "requires_confirmation": True,
                "confirm_handler": "undo_confirm",
                "message": f"table {table_no} undo confirmation required",
                "agent_note": str(getattr(plan, "note", "")),
                "agent_plan": plan_payload,
            }
            self._remember_voice_result(event_id, result)
            after_state = self._snapshot_state(harness, table_no)
            self._audit_voice_action(
                harness=harness,
                operator=operator,
                event_id=event_id,
                device_id=device_id,
                raw_transcript=transcript,
                tool_called=[],
                agent_plan=plan_payload,
                before_state=before_state,
                after_state=after_state,
                detail=result,
            )
            return result

        result = {
            "event_id": event_id,
            "intent": action or "UNKNOWN",
            "table_no": table_no,
            "applied": False,
            "message": "agent selected unsupported action",
            "order_status": "UNCHANGED",
            "agent_note": str(getattr(plan, "note", "")),
            "agent_plan": plan_payload,
        }
        self._remember_voice_result(event_id, result)
        after_state = self._snapshot_state(harness, table_no)
        self._audit_voice_action(
            harness=harness,
            operator=operator,
            event_id=event_id,
            device_id=device_id,
            raw_transcript=transcript,
            tool_called=[],
            agent_plan=plan_payload,
            before_state=before_state,
            after_state=after_state,
            detail=result,
        )
        return result

    def _parse_items_from_payload(
        self, payload_text: str, harness: RestaurantHarness, request_headers: dict[str, str] | None = None
    ) -> list[OrderItemInput]:
        text = (payload_text or "").strip()
        if not text:
            return []

        items: list[OrderItemInput] = []
        for match in re.finditer(r"#?(\d+)\s*[xX*]\s*(\d+)", text):
            menu_item_id = int(match.group(1))
            qty = int(match.group(2))
            if qty > 0:
                items.append(OrderItemInput(menu_item_id=menu_item_id, qty=qty))
        if items:
            return items

        alias_map = harness.get_menu_alias_map()
        if not alias_map:
            return []

        agent = create_agent_adapter(alias_map, request_headers=request_headers)
        try:
            reply = agent.parse_customer_order([text])
        except ValueError:
            return []
        return list(reply.items)

    def _remember_voice_result(self, event_id: str, result: dict[str, Any]) -> None:
        if not event_id:
            return
        self._voice_event_results[event_id] = dict(result)

    @staticmethod
    def _channel_key(operator: str, device_id: str) -> str:
        safe_operator = str(operator or "").strip() or "-"
        safe_device = str(device_id or "").strip() or "-"
        return f"{safe_operator}|{safe_device}"

    def _get_selected_table(self, channel_key: str, harness: RestaurantHarness) -> str:
        table_no = str(self._selected_table_by_channel.get(channel_key, "") or "").strip().upper()
        if not table_no:
            return ""
        if not self._is_valid_single_table_no(table_no):
            self._selected_table_by_channel.pop(channel_key, None)
            return ""
        if harness.get_table_by_no(table_no) is None:
            self._selected_table_by_channel.pop(channel_key, None)
            return ""
        return table_no

    def _set_selected_table(self, channel_key: str, table_no: str) -> None:
        safe_table_no = str(table_no or "").strip().upper()
        if not safe_table_no:
            return
        if not self._is_valid_single_table_no(safe_table_no):
            return
        self._selected_table_by_channel[channel_key] = safe_table_no

    def _clear_selected_table(self, channel_key: str) -> None:
        self._selected_table_by_channel.pop(channel_key, None)

    def _rotate_selected_table_after_checkout(
        self,
        channel_key: str,
        billed_table_no: str,
        harness: RestaurantHarness,
    ) -> None:
        safe_billed = str(billed_table_no or "").strip().upper()
        current = self._get_selected_table(channel_key=channel_key, harness=harness)
        if current and current != safe_billed:
            return
        next_table = self._pick_any_open_table(harness=harness)
        if next_table:
            self._set_selected_table(channel_key, next_table)
            return
        self._clear_selected_table(channel_key)

    @staticmethod
    def _pick_any_open_table(harness: RestaurantHarness) -> str:
        open_tables = harness.get_active_tables_board()
        if not open_tables:
            return ""
        return str(open_tables[0].get("table_no", "")).strip().upper()

    def _resolve_selected_table_for_channel(
        self,
        channel_key: str,
        harness: RestaurantHarness,
        open_tables: list[dict[str, Any]] | None = None,
    ) -> str:
        tables = open_tables if open_tables is not None else harness.get_active_tables_board()
        open_table_nos = {
            str(row.get("table_no", "")).strip().upper()
            for row in tables
            if str(row.get("table_no", "")).strip()
        }
        selected = self._get_selected_table(channel_key=channel_key, harness=harness)
        if selected and selected in open_table_nos:
            return selected
        if selected:
            self._clear_selected_table(channel_key)
        if open_table_nos:
            first_open = str(tables[0].get("table_no", "")).strip().upper()
            if first_open:
                self._set_selected_table(channel_key, first_open)
                return first_open
        return ""

    @staticmethod
    def _empty_selected_table_detail() -> dict[str, Any]:
        return {
            "selected_table_no": "",
            "table_status": "IDLE",
            "order_status": "NONE",
            "order_id": None,
            "order_note": "",
            "items": [],
            "bill_summary": {
                "subtotal_cents": 0,
                "extra_fee_total_cents": 0,
                "extra_fee_items": [],
                "total_cents": 0,
                "currency": "CNY",
            },
        }

    def _parse_menu_voice_entries(
        self, transcript: str, harness: RestaurantHarness, request_headers: dict[str, str] | None = None
    ) -> dict[str, Any]:
        text = str(transcript or "").strip()
        if not text:
            raise ValueError("菜品指令为空，请先输入内容")

        agent = create_agent_adapter(harness.get_menu_alias_map(), request_headers=request_headers)
        parser = getattr(agent, "parse_menu_entry_payload", None)
        if not callable(parser):
            raise ValueError("菜品解析器不可用")

        payload = parser(text)
        action = self._coerce_menu_operation_action(payload=payload)
        mode = str(payload.get("parse_mode", payload.get("note", "menu-agent-model-structured"))).strip()
        fail_text = str(payload.get("fail_text", payload.get("error_text", payload.get("ui_text", ""))) or "").strip()
        fail_code = str(payload.get("fail_code", payload.get("error_code", "")) or "").strip().upper()
        if action == "AGENT_FAILED":
            if not fail_text:
                fail_text = str(payload.get("note", "")).strip() or "菜品指令无法执行"
            return {
                "action": "AGENT_FAILED",
                "records": [],
                "delete_targets": [],
                "edit_targets": [],
                "rename_targets": [],
                "parse_mode": mode or "menu-agent-model-structured",
                "fail_text": fail_text,
                "fail_code": fail_code,
            }
        if action == "MENU_DELETE":
            delete_targets = self._coerce_menu_delete_targets(payload=payload, harness=harness)
            return {
                "action": action,
                "records": [],
                "delete_targets": delete_targets,
                "edit_targets": [],
                "rename_targets": [],
                "parse_mode": mode or "menu-agent-model-structured",
                "fail_text": "",
                "fail_code": "",
            }
        if action == "MENU_EDIT":
            edit_targets = self._coerce_menu_edit_targets(payload=payload, harness=harness)
            return {
                "action": action,
                "records": [],
                "delete_targets": [],
                "edit_targets": edit_targets,
                "rename_targets": [],
                "parse_mode": mode or "menu-agent-model-structured",
                "fail_text": "",
                "fail_code": "",
            }
        if action == "MENU_RENAME_CATEGORY":
            rename_targets = self._coerce_menu_rename_targets(payload=payload)
            return {
                "action": action,
                "records": [],
                "delete_targets": [],
                "edit_targets": [],
                "rename_targets": rename_targets,
                "parse_mode": mode or "menu-agent-model-structured",
                "fail_text": "",
                "fail_code": "",
            }
        records = self._coerce_menu_records(payload, default_parse_mode="menu-agent-model-structured")
        return {
            "action": "MENU_ADD",
            "records": records,
            "delete_targets": [],
            "edit_targets": [],
            "rename_targets": [],
            "parse_mode": mode or "menu-agent-model-structured",
            "fail_text": "",
            "fail_code": "",
        }

    @staticmethod
    def _coerce_menu_operation_action(payload: dict[str, Any]) -> str:
        if not isinstance(payload, dict):
            return "AGENT_FAILED"
        raw = str(payload.get("action", payload.get("intent", ""))).strip().upper()
        if raw in {"MENU_ADD", "MENU_DELETE", "MENU_EDIT", "MENU_RENAME_CATEGORY", "AGENT_FAILED"}:
            return raw
        if raw in {"FAILED", "FAIL", "ERROR", "REJECTED"}:
            return "AGENT_FAILED"
        if raw in {"ADD", "CREATE", "INSERT"}:
            return "MENU_ADD"
        if raw in {"DELETE", "REMOVE", "MENU_REMOVE"}:
            return "MENU_DELETE"
        if raw in {"RENAME_CATEGORY", "CATEGORY_RENAME", "MENU_RENAME", "RENAME"}:
            return "MENU_RENAME_CATEGORY"
        if raw in {"EDIT", "UPDATE", "MODIFY", "MENU_UPDATE"}:
            return "MENU_EDIT"
        return "AGENT_FAILED"

    def _coerce_menu_delete_targets(self, payload: dict[str, Any], harness: RestaurantHarness) -> list[dict[str, Any]]:
        if not isinstance(payload, dict):
            raise ValueError("menu delete payload must be object")
        raw_targets: Any = payload.get("delete_targets")
        if not raw_targets:
            for key in ("targets", "items", "records"):
                candidate = payload.get(key)
                if candidate:
                    raw_targets = candidate
                    break
        if isinstance(raw_targets, dict):
            raw_targets = [raw_targets]
        if not isinstance(raw_targets, list) or not raw_targets:
            raw_targets = [payload]

        all_items = harness.list_menu_items()
        id_to_name = {
            int(item.get("menu_item_id", 0)): str(item.get("name", ""))
            for item in all_items
            if int(item.get("menu_item_id", 0)) > 0
        }

        targets: list[dict[str, Any]] = []
        seen_ids: set[int] = set()
        for raw in raw_targets:
            if not isinstance(raw, dict):
                continue
            menu_item_id = 0
            for key in ("menu_item_id", "menu_id", "id"):
                try:
                    menu_item_id = int(raw.get(key, 0))
                except (TypeError, ValueError):
                    menu_item_id = 0
                if menu_item_id > 0:
                    break
            if menu_item_id > 0 and menu_item_id not in seen_ids and menu_item_id in id_to_name:
                seen_ids.add(menu_item_id)
                targets.append(
                    {
                        "menu_item_id": menu_item_id,
                        "dish_name": id_to_name.get(menu_item_id, ""),
                    }
                )
                continue

            token = str(raw.get("dish_name", raw.get("name", raw.get("alias", "")))).strip()
            if not token:
                continue
            matches = harness.find_menu_items_by_name_or_alias(token=token, available_only=True)
            for match in matches:
                match_id = int(match.get("menu_item_id", 0))
                if match_id <= 0 or match_id in seen_ids:
                    continue
                seen_ids.add(match_id)
                targets.append(
                    {
                        "menu_item_id": match_id,
                        "dish_name": str(match.get("name", token)),
                    }
                )

        if not targets:
            raise ValueError("menu delete target not found")
        return targets
    def _coerce_menu_edit_targets(self, payload: dict[str, Any], harness: RestaurantHarness) -> list[dict[str, Any]]:
        if not isinstance(payload, dict):
            raise ValueError("menu edit payload must be object")
        raw_targets: Any = payload.get("edit_targets")
        if not raw_targets:
            for key in ("updates", "targets", "items", "records"):
                candidate = payload.get(key)
                if candidate:
                    raw_targets = candidate
                    break
        if isinstance(raw_targets, dict):
            raw_targets = [raw_targets]
        if not isinstance(raw_targets, list) or not raw_targets:
            raw_targets = [payload]

        all_items = harness.list_menu_items()
        id_to_item = {
            int(item.get("menu_item_id", 0)): item
            for item in all_items
            if int(item.get("menu_item_id", 0)) > 0 and bool(item.get("is_available", False))
        }

        targets_by_id: dict[int, dict[str, Any]] = {}
        for raw in raw_targets:
            if not isinstance(raw, dict):
                continue

            price_cents = self._coerce_menu_price_cents(raw)
            if price_cents <= 0:
                price_cents = 0
            new_category = str(
                raw.get(
                    "new_category",
                    raw.get("category", raw.get("target_category", raw.get("to_category", ""))),
                )
                or ""
            ).strip()
            if not new_category:
                new_category = ""

            if price_cents <= 0 and not new_category:
                continue

            menu_item_id = 0
            for key in ("menu_item_id", "menu_id", "id"):
                try:
                    menu_item_id = int(raw.get(key, 0))
                except (TypeError, ValueError):
                    menu_item_id = 0
                if menu_item_id > 0:
                    break

            def _merge_target(target_id: int, dish_name: str) -> None:
                existing = targets_by_id.get(target_id, {"menu_item_id": target_id, "dish_name": dish_name})
                if price_cents > 0:
                    existing["price_cents"] = int(price_cents)
                if new_category:
                    existing["new_category"] = new_category
                targets_by_id[target_id] = existing

            if menu_item_id > 0 and menu_item_id in id_to_item:
                item = id_to_item[menu_item_id]
                _merge_target(menu_item_id, str(item.get("name", "")))
                continue

            token = str(raw.get("dish_name", raw.get("name", raw.get("alias", "")))).strip()
            if not token:
                continue
            matches = harness.find_menu_items_by_name_or_alias(token=token, available_only=True)
            for match in matches:
                match_id = int(match.get("menu_item_id", 0))
                if match_id <= 0:
                    continue
                _merge_target(match_id, str(match.get("name", token)))

        targets = list(targets_by_id.values())
        if not targets:
            raise ValueError("menu edit target not found")
        return targets

    def _coerce_menu_rename_targets(self, payload: dict[str, Any]) -> list[dict[str, Any]]:
        if not isinstance(payload, dict):
            raise ValueError("menu rename payload must be object")
        raw_targets: Any = payload.get("rename_targets")
        if not raw_targets:
            for key in ("targets", "records", "items"):
                candidate = payload.get(key)
                if candidate:
                    raw_targets = candidate
                    break
        if isinstance(raw_targets, dict):
            raw_targets = [raw_targets]
        if not isinstance(raw_targets, list) or not raw_targets:
            raw_targets = [payload]

        targets: list[dict[str, Any]] = []
        seen_keys: set[tuple[str, str]] = set()
        for raw in raw_targets:
            if not isinstance(raw, dict):
                continue
            old_category = str(
                raw.get(
                    "old_category",
                    raw.get("from_category", raw.get("source_category", raw.get("old", raw.get("from", "")))),
                )
            ).strip()
            new_category = str(
                raw.get(
                    "new_category",
                    raw.get("to_category", raw.get("target_category", raw.get("new", raw.get("to", "")))),
                )
            ).strip()
            if not old_category or not new_category:
                continue
            if old_category.lower() == new_category.lower():
                continue
            dedupe_key = (old_category.lower(), new_category.lower())
            if dedupe_key in seen_keys:
                continue
            seen_keys.add(dedupe_key)
            targets.append({"old_category": old_category, "new_category": new_category})
        if not targets:
            raise ValueError("未识别到分类修改目标，请提供原分类和新分类")
        return targets

    @staticmethod
    def _coerce_menu_records(payload: dict[str, Any], default_parse_mode: str) -> list[dict[str, Any]]:
        if not isinstance(payload, dict):
            raise ValueError("menu agent payload must be object")

        raw_records: Any = payload.get("records")
        if not raw_records:
            for key in ("items", "menu_items", "dishes", "entries"):
                candidate = payload.get(key)
                if isinstance(candidate, list) and candidate:
                    raw_records = candidate
                    break
        if isinstance(raw_records, dict):
            raw_records = [raw_records]
        if not isinstance(raw_records, list) or not raw_records:
            raw_records = [payload]

        records: list[dict[str, Any]] = []
        seen_keys: set[tuple[str, int, str]] = set()
        for raw in raw_records:
            if not isinstance(raw, dict):
                continue
            dish_name = str(raw.get("dish_name", raw.get("name", ""))).strip()
            if not dish_name:
                continue
            price_cents = SessionRepository._coerce_menu_price_cents(raw)
            if price_cents <= 0:
                continue
            category = str(raw.get("category", "")).strip()
            if not category or category == "\u672A\u5206\u7C7B":
                category = SessionRepository._infer_menu_category_from_name(dish_name)
            unit = str(raw.get("unit", "\u4EFD")).strip() or "\u4EFD"
            aliases = SessionRepository._coerce_menu_aliases(raw.get("aliases", raw.get("alias", "")))
            aliases = [alias for alias in aliases if alias and alias != dish_name]
            dedupe_key = (dish_name.lower(), price_cents, category.lower())
            if dedupe_key in seen_keys:
                continue
            seen_keys.add(dedupe_key)
            records.append(
                {
                    "dish_name": dish_name,
                    "category": category,
                    "price_cents": price_cents,
                    "unit": unit,
                    "aliases": aliases,
                    "parse_mode": str(raw.get("parse_mode", default_parse_mode)).strip() or default_parse_mode,
                }
            )

        if not records:
            raise ValueError("menu agent returned no valid records")
        return records

    @staticmethod
    def _coerce_menu_price_cents(raw: dict[str, Any]) -> int:
        if not isinstance(raw, dict):
            return 0

        direct_cents = raw.get("price_cents")
        cents = SessionRepository._coerce_price_value_to_cents(direct_cents, assume_yuan=False)
        if cents > 0:
            return cents

        for key in ("price", "price_yuan", "amount"):
            cents = SessionRepository._coerce_price_value_to_cents(raw.get(key), assume_yuan=True)
            if cents > 0:
                return cents

        joined_text = " ".join(
            [
                str(raw.get("price_text", "")),
                str(raw.get("note", "")),
                str(raw.get("dish_name", "")),
                str(raw.get("name", "")),
            ]
        )
        explicit = re.search(r"(\d+(?:\.\d+)?)\s*(?:\u5143|\u5757|rmb)", joined_text, flags=re.IGNORECASE)
        if explicit:
            return max(int(round(float(explicit.group(1)) * 100)), 0)
        labeled = re.search(
            r"(?:price|\u4EF7\u683C)\s*[:\uFF1A]?\s*(\d+(?:\.\d+)?)",
            joined_text,
            flags=re.IGNORECASE,
        )
        if labeled:
            return max(int(round(float(labeled.group(1)) * 100)), 0)
        return 0

    @staticmethod
    def _coerce_price_value_to_cents(value: Any, assume_yuan: bool) -> int:
        if value is None:
            return 0
        if isinstance(value, (int, float)):
            amount = float(value)
            if amount <= 0:
                return 0
            if assume_yuan:
                return int(round(amount * 100))
            return int(round(amount))
        text = str(value).strip()
        if not text:
            return 0
        m = re.search(r"(\d+(?:\.\d+)?)", text)
        if not m:
            return 0
        amount = float(m.group(1))
        if amount <= 0:
            return 0
        if assume_yuan:
            return int(round(amount * 100))
        return int(round(amount))

    @staticmethod
    def _coerce_menu_aliases(raw_aliases: Any) -> list[str]:
        if isinstance(raw_aliases, list):
            return [str(alias).strip() for alias in raw_aliases if str(alias).strip()]
        text = str(raw_aliases or "").strip()
        if not text:
            return []
        return [token.strip() for token in re.split(r"[,/|;\u3001]", text) if token.strip()]

    @staticmethod
    def _infer_menu_category_from_name(dish_name: str) -> str:
        name = str(dish_name or "").strip()
        if not name:
            return "\u70e7\u70e4"
        category_rules = [
            ("\u6d77\u9c9c", ["\u867e", "\u87f9", "\u9c7c", "\u86ce", "\u86e4", "\u868c", "\u86aa", "\u6247\u8d1d", "\u9c8d", "\u6d77\u53c2"]),
            ("\u996e\u54c1", ["\u53ef\u4e50", "\u96ea\u78a7", "\u67e0\u6aac\u8336", "\u5976\u8336", "\u679c\u6c41", "\u9152", "\u5564\u9152", "\u6c7d\u6c34", "\u9178\u6885\u6c64"]),
            ("\u4e3b\u98df", ["\u996d", "\u9762", "\u7c89", "\u70e7\u5356", "\u7092\u996d", "\u76d6\u996d", "\u6cb9\u6761", "\u5305\u5b50", "\u6c34\u997a"]),
            ("\u51c9\u83dc", ["\u51c9\u62cc", "\u62cd\u9ec4\u74dc", "\u51c9\u83dc", "\u53e3\u6c34\u9e21", "\u76ae\u86cb"]),
            ("\u5c0f\u5403", ["\u70b8", "\u85af\u6761", "\u732a\u6392", "\u96de\u5757", "\u82b1\u751f", "\u9ebb\u56e2", "\u70e4\u51b7\u9762"]),
            ("\u70e7\u70e4", ["\u4e32", "\u70e4", "\u7f8a\u8089", "\u725b\u8089", "\u4e94\u82b1", "\u8106\u9aa8", "\u9e21\u7fc5", "\u9e21\u817f"]),
        ]
        for category, keywords in category_rules:
            if any(keyword in name for keyword in keywords):
                return category
        return "\u70e7\u70e4"

    @staticmethod
    def _parse_menu_voice_drafts_relaxed(transcript: str) -> list[dict[str, Any]]:
        text = str(transcript or "").strip()
        if not text:
            return []

        segments = SessionRepository._split_menu_voice_segments(text)
        multi_segment = len(segments) > 1
        drafts: list[dict[str, Any]] = []
        for segment in segments:
            if multi_segment and not SessionRepository._contains_menu_price_hint(segment):
                continue
            try:
                draft = SessionRepository._parse_menu_voice_draft_relaxed(segment)
            except ValueError:
                continue
            if not str(draft.get("dish_name", "")).strip():
                continue
            if int(draft.get("price_cents", 0)) <= 0:
                continue
            if multi_segment:
                draft["parse_mode"] = "menu-agent-relaxed-batch"
            drafts.append(draft)

        if drafts:
            return drafts
        return [SessionRepository._parse_menu_voice_draft_relaxed(text)]

    @staticmethod
    def _split_menu_voice_segments(transcript: str) -> list[str]:
        text = str(transcript or "").strip()
        if not text:
            return []
        normalized = (
            text.replace("\r\n", "\n")
            .replace("\u3002", ";")
            .replace("\uFF1B", ";")
            .replace("\n", ";")
        )
        normalized = re.sub(
            r"(?:\u53E6\u5916|\u518D\u52A0|\u8FD8\u6709|\u5E76\u4E14|\u540C\u65F6|\u7136\u540E|\u63A5\u7740|\u6B64\u5916)\s*",
            ";",
            normalized,
        )
        segments = [part.strip(" ,;") for part in normalized.split(";") if part.strip(" ,;")]
        if len(segments) <= 1:
            return [text]
        return segments[:12]

    @staticmethod
    def _contains_menu_price_hint(text: str) -> bool:
        return bool(
            re.search(
                r"(\d+(?:\.\d+)?)\s*(?:\u5143|\u5757|rmb)|(?:price|\u4EF7\u683C)\s*[:\uFF1A]?\s*\d+(?:\.\d+)?",
                str(text or ""),
                flags=re.IGNORECASE,
            )
        )

    @staticmethod
    def _parse_menu_voice_draft(transcript: str) -> dict[str, Any]:
        text = str(transcript or "").strip()
        if not text:
            raise ValueError("menu transcript is required")

        normalized = (
            text.replace("\uFF0C", ",")
            .replace("\u3002", ",")
            .replace("\uFF1B", ",")
            .replace("\u3001", ",")
        )
        parts = [part.strip() for part in normalized.split(",") if part.strip()]
        if not parts:
            raise ValueError("unable to parse menu transcript")

        name = ""
        category = "\u672A\u5206\u7C7B"
        price_cents = 0
        unit = "\u4EFD"
        aliases: list[str] = []
        command_tokens = {
            "\u65B0\u589E\u83DC\u54C1",
            "\u6DFB\u52A0\u83DC\u54C1",
            "\u5F55\u5165\u83DC\u54C1",
            "\u4E0A\u67B6\u83DC\u54C1",
            "\u83DC\u54C1\u5165\u5E93",
            "\u66F4\u65B0\u83DC\u54C1",
        }

        for part in parts:
            if part in command_tokens:
                continue
            m_price = re.search(r"(\d+(?:\.\d+)?)\s*(?:\u5143|\u5757|rmb)", part, flags=re.IGNORECASE)
            if m_price:
                price_cents = max(int(round(float(m_price.group(1)) * 100)), 0)
                m_unit = re.search(r"(?:\u5143|\u5757)\s*(?:\u4E00|1)\s*([^\s,]+)", part)
                if m_unit:
                    unit = str(m_unit.group(1)).strip() or unit
                continue
            if not name:
                name = part
            elif category == "\u672A\u5206\u7C7B":
                category = part
            else:
                aliases.append(part)

        if not name or price_cents <= 0:
            raise ValueError("menu transcript must include dish name and price")

        return {
            "dish_name": name,
            "category": category,
            "price_cents": price_cents,
            "unit": unit,
            "aliases": aliases,
        }

    @staticmethod
    def _parse_menu_voice_draft_relaxed(transcript: str) -> dict[str, Any]:
        text = str(transcript or "").strip()
        if not text:
            raise ValueError("menu transcript is required")

        try:
            strict = SessionRepository._parse_menu_voice_draft(text)
            strict["parse_mode"] = "menu-agent-strict-parse"
            return strict
        except ValueError:
            pass

        normalized = (
            text.replace("\uFF0C", ",")
            .replace("\u3002", ",")
            .replace("\uFF1B", ",")
            .replace("\u3001", ",")
        )
        cleaned = re.sub(
            r"(?:\u65B0\u589E\u83DC\u54C1|\u6DFB\u52A0\u83DC\u54C1|\u5F55\u5165\u83DC\u54C1|\u4E0A\u67B6\u83DC\u54C1|\u83DC\u54C1\u5165\u5E93|\u66F4\u65B0\u83DC\u54C1|add\s*dish|new\s*dish)",
            " ",
            normalized,
            flags=re.IGNORECASE,
        )

        price_cents = 0
        m_price = re.search(r"(\d+(?:\.\d+)?)\s*(?:\u5143|\u5757|rmb)", cleaned, flags=re.IGNORECASE)
        if m_price:
            price_cents = max(int(round(float(m_price.group(1)) * 100)), 0)
        if price_cents <= 0:
            m_price = re.search(r"(?:price|\u4EF7\u683C)\s*[:\uFF1A]?\s*(\d+(?:\.\d+)?)", cleaned, flags=re.IGNORECASE)
            if m_price:
                price_cents = max(int(round(float(m_price.group(1)) * 100)), 0)
        if price_cents <= 0:
            m_price = re.search(r"(?<![#\d])(\d{1,4})(?!\s*[xX*]\s*\d)", cleaned)
            if m_price:
                price_cents = max(int(m_price.group(1)) * 100, 0)
        if price_cents <= 0:
            price_cents = 100

        dish_name = ""
        m_name = re.search(r"(?:\u83DC\u540D|\u540D\u79F0|dish\s*name|name)\s*[:\uFF1A]?\s*([^,\s]+)", cleaned, flags=re.IGNORECASE)
        if m_name:
            dish_name = str(m_name.group(1)).strip()
        if not dish_name:
            chunks = [part.strip() for part in re.split(r"[,;]", cleaned) if part.strip()]
            for chunk in chunks:
                candidate = re.sub(r"(\d+(?:\.\d+)?)\s*(?:\u5143|\u5757|rmb)", " ", chunk, flags=re.IGNORECASE).strip()
                candidate = re.sub(
                    r"(?:price|\u4EF7\u683C)\s*[:\uFF1A]?\s*\d+(?:\.\d+)?",
                    " ",
                    candidate,
                    flags=re.IGNORECASE,
                ).strip()
                if candidate:
                    dish_name = candidate
                    break
        if not dish_name:
            dish_name = f"AI-DISH-{int(time() * 1000)}"

        category = "\u672A\u5206\u7C7B"
        m_category = re.search(r"(?:\u5206\u7C7B|category)\s*[:\uFF1A]?\s*([^,\s]+)", cleaned, flags=re.IGNORECASE)
        if m_category:
            category = str(m_category.group(1)).strip() or category
        else:
            for token in ("\u6D77\u9C9C", "\u70E7\u70E4", "\u4E3B\u98DF", "\u996E\u54C1", "\u51C9\u83DC", "\u70ED\u83DC"):
                if token in normalized:
                    category = token
                    break

        unit = "\u4EFD"
        m_unit = re.search(r"(?:\u5355\u4F4D|unit)\s*[:\uFF1A]?\s*([^,\s]+)", cleaned, flags=re.IGNORECASE)
        if m_unit:
            unit = str(m_unit.group(1)).strip() or unit
        else:
            m_unit = re.search(r"(?:\u4E00|1)\s*([^\s,]{1,3})", cleaned)
            if m_unit:
                unit = str(m_unit.group(1)).strip() or unit

        aliases: list[str] = []
        m_alias = re.search(r"(?:\u522B\u540D|aliases?|alias)\s*[:\uFF1A]?\s*([^\n]+)", normalized, flags=re.IGNORECASE)
        if m_alias:
            aliases = [
                token.strip()
                for token in re.split(r"[,/|]", str(m_alias.group(1)))
                if token.strip()
            ]
        if not aliases:
            quoted = re.findall(r"['\"]([^'\"]{1,20})['\"]", normalized)
            aliases = [token.strip() for token in quoted if token.strip()]
        aliases = [alias for alias in aliases if alias and alias != dish_name]

        return {
            "dish_name": dish_name,
            "category": category,
            "price_cents": int(price_cents),
            "unit": unit,
            "aliases": aliases,
            "parse_mode": "menu-agent-relaxed",
        }

    @staticmethod
    def _plan_to_dict(plan: Any) -> dict[str, Any]:
        steps = SessionRepository._extract_plan_steps(plan)
        order_mode = str(getattr(plan, "order_mode", "AUTO") or "AUTO").strip().upper()
        if order_mode not in {"AUTO", "DINEIN", "TAKEOUT"}:
            order_mode = "AUTO"
        return {
            "action": str(getattr(plan, "action", "") or "").strip().upper(),
            "table_no": str(getattr(plan, "table_no", "") or "").strip().upper(),
            "items": [asdict(i) for i in list(getattr(plan, "items", []) or [])],
            "order_mode": order_mode,
            "note": str(getattr(plan, "note", "") or ""),
            "fail_text": str(getattr(plan, "fail_text", "") or ""),
            "fail_code": str(getattr(plan, "fail_code", "") or "").strip().upper(),
            "steps": [SessionRepository._step_to_dict(step) for step in steps],
        }

    @staticmethod
    def _extract_plan_steps(plan: Any) -> list[Any]:
        raw_steps = getattr(plan, "steps", [])
        if not isinstance(raw_steps, list):
            return []
        steps: list[Any] = []
        for raw in raw_steps:
            if raw is None:
                continue
            if isinstance(raw, dict):
                steps.append(
                    SimpleNamespace(
                        action=str(raw.get("action", "") or "").strip().upper(),
                        table_no=str(raw.get("table_no", "") or "").strip().upper(),
                        items=SessionRepository._coerce_order_items(raw.get("items", [])),
                        order_mode=SessionRepository._normalize_order_mode(raw.get("order_mode", "AUTO")),
                        note=str(raw.get("note", "") or ""),
                    )
                )
                continue
            action = str(getattr(raw, "action", "") or "").strip().upper()
            if not action:
                continue
            steps.append(
                SimpleNamespace(
                    action=action,
                    table_no=str(getattr(raw, "table_no", "") or "").strip().upper(),
                    items=SessionRepository._coerce_order_items(getattr(raw, "items", [])),
                    order_mode=SessionRepository._normalize_order_mode(getattr(raw, "order_mode", "AUTO")),
                    note=str(getattr(raw, "note", "") or ""),
                )
            )
        return steps

    @staticmethod
    def _step_to_dict(step: Any) -> dict[str, Any]:
        raw_items = list(getattr(step, "items", []) or [])
        items: list[dict[str, Any]] = []
        for item in raw_items:
            if isinstance(item, OrderItemInput):
                items.append(asdict(item))
            elif isinstance(item, dict):
                try:
                    menu_item_id = int(item.get("menu_item_id", 0))
                    qty = int(item.get("qty", 0))
                except (TypeError, ValueError):
                    continue
                if menu_item_id > 0 and qty > 0:
                    items.append({"menu_item_id": menu_item_id, "qty": qty, "note": str(item.get("note", ""))})
        return {
            "action": str(getattr(step, "action", "") or "").strip().upper(),
            "table_no": str(getattr(step, "table_no", "") or "").strip().upper(),
            "items": items,
            "order_mode": SessionRepository._normalize_order_mode(getattr(step, "order_mode", "AUTO")),
            "note": str(getattr(step, "note", "") or ""),
        }

    @staticmethod
    def _coerce_order_items(raw_items: Any) -> list[OrderItemInput]:
        if not isinstance(raw_items, list):
            return []
        items: list[OrderItemInput] = []
        for raw in raw_items:
            if isinstance(raw, OrderItemInput):
                if int(raw.qty) > 0:
                    items.append(raw)
                continue
            if not isinstance(raw, dict):
                continue
            try:
                menu_item_id = int(raw.get("menu_item_id", 0))
                qty = int(raw.get("qty", 0))
            except (TypeError, ValueError):
                continue
            if menu_item_id <= 0 or qty <= 0:
                continue
            items.append(OrderItemInput(menu_item_id=menu_item_id, qty=qty, note=str(raw.get("note", ""))))
        return items

    @staticmethod
    def _merge_order_note_text(*notes: Any) -> str:
        merged_parts: list[str] = []
        for note in notes:
            merged_parts.extend(split_order_note_parts(note))
        return join_order_note_parts(merged_parts)

    @staticmethod
    def _remove_order_note_text(base_note: Any, remove_note: Any) -> str:
        remove_parts = set(split_order_note_parts(remove_note))
        if not remove_parts:
            return join_order_note_parts(split_order_note_parts(base_note))
        return join_order_note_parts([part for part in split_order_note_parts(base_note) if part not in remove_parts])

    @staticmethod
    def _normalize_item_note_text(note: Any, item_names: list[str] | None = None) -> str:
        normalized = str(note or "").strip()
        if not normalized:
            return ""
        candidate = normalized
        names = [str(name or "").strip() for name in list(item_names or []) if str(name or "").strip()]
        for _ in range(3):
            previous = candidate
            candidate = re.sub(r"^\s*(?:给|把|将)\s*", "", candidate)
            candidate = re.sub(r"^\s*(?:这道菜|这个菜|该菜)\s*", "", candidate)
            for name in sorted(names, key=len, reverse=True):
                candidate = re.sub(rf"^\s*{re.escape(name)}\s*(?:这道菜|这个菜|该菜)?\s*", "", candidate)
                candidate = re.sub(rf"^\s*(?:这道菜|这个菜|该菜)?\s*{re.escape(name)}\s*", "", candidate)
            candidate = re.sub(r"^\s*(?:的)?\s*备注\s*", "", candidate)
            candidate = re.sub(r"^\s*(?:改成|改为|更新为|换成|设为|加备注|备注是|备注为)\s*", "", candidate)
            candidate = re.sub(r"^\s*[:：,，;；]+\s*", "", candidate)
            candidate = candidate.strip()
            if candidate == previous:
                break
        return normalize_order_note_fragment(candidate)

    @classmethod
    def _extract_item_note_text_from_transcript(cls, transcript: Any, item_names: list[str] | None = None) -> str:
        candidate = str(transcript or "").strip()
        if not candidate:
            return ""
        names = [str(name or "").strip() for name in list(item_names or []) if str(name or "").strip()]
        for _ in range(3):
            previous = candidate
            candidate = re.sub(r"^\s*(?:给|把|将|帮我|帮)\s*", "", candidate)
            candidate = re.sub(r"^\s*(?:删除|去掉|取消|清空|修改|更新|改成|改为|换成|设为|加上|加个|加)\s*", "", candidate)
            candidate = re.sub(r"^\s*(?:这道菜|这个菜|该菜)\s*", "", candidate)
            for name in sorted(names, key=len, reverse=True):
                candidate = re.sub(rf"^\s*{re.escape(name)}\s*(?:这道菜|这个菜|该菜)?\s*", "", candidate)
                candidate = re.sub(rf"^\s*(?:这道菜|这个菜|该菜)?\s*{re.escape(name)}\s*", "", candidate)
            candidate = re.sub(r"^\s*(?:的)?\s*", "", candidate)
            candidate = re.sub(r"^\s*备注\s*", "", candidate)
            candidate = re.sub(r"^\s*(?:改成|改为|更新为|换成|设为|加备注|备注是|备注为)\s*", "", candidate)
            candidate = re.sub(r"^\s*[:：,，;；]+\s*", "", candidate)
            candidate = candidate.strip()
            if candidate == previous:
                break
        return cls._normalize_item_note_text(candidate, item_names)

    @classmethod
    def _normalize_plan_note_scopes(cls, plan: Any) -> tuple[list[OrderItemInput], str]:
        raw_items = list(getattr(plan, "items", []) or [])
        normalized_items: list[OrderItemInput] = []
        for item in raw_items:
            if isinstance(item, OrderItemInput):
                if int(item.menu_item_id) > 0 and int(item.qty) > 0:
                    normalized_items.append(item)
                continue
            if isinstance(item, dict):
                try:
                    menu_item_id = int(item.get("menu_item_id", 0) or 0)
                    qty = int(item.get("qty", 0) or 0)
                except (TypeError, ValueError):
                    continue
                if menu_item_id > 0 and qty > 0:
                    normalized_items.append(
                        OrderItemInput(menu_item_id=menu_item_id, qty=qty, note=str(item.get("note", "") or ""))
                    )
                continue
            try:
                menu_item_id = int(getattr(item, "menu_item_id", 0) or 0)
                qty = int(getattr(item, "qty", 0) or 0)
            except (TypeError, ValueError):
                continue
            if menu_item_id > 0 and qty > 0:
                normalized_items.append(
                    OrderItemInput(menu_item_id=menu_item_id, qty=qty, note=str(getattr(item, "note", "") or ""))
                )
        top_level_note = cls._merge_order_note_text(getattr(plan, "note", ""))
        return normalized_items, top_level_note

    def _snapshot_state(self, harness: RestaurantHarness, table_no: str) -> dict[str, Any]:
        safe_table_no = str(table_no or "").strip().upper()
        if not safe_table_no:
            return {"table_no": "", "exists": False, "table_status": "", "open_order_id": None, "open_items_count": 0}
        table = harness.get_table_by_no(safe_table_no)
        if table is None:
            return {
                "table_no": safe_table_no,
                "exists": False,
                "table_status": "",
                "open_order_id": None,
                "open_items_count": 0,
            }
        open_order_id = harness.get_open_order_id_by_table(table["id"])
        open_items_count = 0
        if open_order_id is not None:
            with closing(harness._conn()) as conn:
                open_items_count = int(
                    conn.execute(
                        "SELECT COUNT(1) AS c FROM order_items WHERE order_id = ?",
                        (open_order_id,),
                    ).fetchone()["c"]
                )
        return {
            "table_no": safe_table_no,
            "exists": True,
            "table_id": int(table["id"]),
            "table_status": str(table["status"]),
            "open_order_id": int(open_order_id) if open_order_id is not None else None,
            "open_items_count": int(open_items_count),
        }

    def _audit_voice_action(
        self,
        harness: RestaurantHarness,
        operator: str,
        event_id: str,
        device_id: str,
        raw_transcript: str,
        tool_called: list[str],
        agent_plan: dict[str, Any],
        before_state: dict[str, Any],
        after_state: dict[str, Any],
        detail: dict[str, Any],
    ) -> None:
        harness.log_voice_action(
            operator=operator,
            action="VOICE_COMMAND",
            event_id=event_id,
            device_id=device_id,
            raw_transcript=raw_transcript,
            tool_called=tool_called,
            agent_plan=agent_plan,
            before_state=before_state,
            after_state=after_state,
            detail=detail,
        )

    @staticmethod
    def _multi_table_fanout_actions() -> set[str]:
        return {"ORDER_ITEM", "ADD_ITEM", "ADD_ORDER_NOTE", "UPDATE_ORDER_NOTE", "REMOVE_ORDER_NOTE", "ADD_ITEM_NOTE", "UPDATE_ITEM_NOTE", "REMOVE_ITEM_NOTE", "REMOVE_ITEM", "QUERY_BILL", "CHECKOUT", "CANCEL_ORDER", "UNDO_LAST"}

    @staticmethod
    def _merge_checkout_bill_summary(per_table_results: list[dict[str, Any]]) -> dict[str, Any]:
        subtotal_cents = 0
        extra_fee_total_cents = 0
        total_cents = 0
        currency = "CNY"
        extra_fee_items: list[dict[str, Any]] = []
        for item in per_table_results:
            summary = item.get("bill_summary")
            if not isinstance(summary, dict):
                continue
            subtotal_cents += int(summary.get("subtotal_cents", 0) or 0)
            extra_fee_total_cents += int(summary.get("extra_fee_total_cents", 0) or 0)
            total_cents += int(summary.get("total_cents", 0) or 0)
            currency = str(summary.get("currency", currency) or currency)
            raw_extra = summary.get("extra_fee_items", [])
            if isinstance(raw_extra, list):
                for fee in raw_extra:
                    if isinstance(fee, dict):
                        extra_fee_items.append(dict(fee))
        return {
            "subtotal_cents": subtotal_cents,
            "extra_fee_total_cents": extra_fee_total_cents,
            "extra_fee_items": extra_fee_items,
            "total_cents": total_cents,
            "currency": currency,
        }

    @staticmethod
    def _is_valid_single_table_no(table_no: str) -> bool:
        safe = str(table_no or "").strip().upper()
        if not safe:
            return False
        return bool(TABLE_NO_PATTERN.fullmatch(safe))

    def _normalize_single_table_no(self, table_no: str, field_name: str = "table_no", allow_empty: bool = False) -> str:
        safe = str(table_no or "").strip().upper()
        if not safe:
            if allow_empty:
                return ""
            raise ApiError("INVALID_INPUT", f"{field_name} is required", HTTPStatus.BAD_REQUEST)
        if not self._is_valid_single_table_no(safe):
            raise ApiError(
                "INVALID_INPUT",
                f"{field_name} format is invalid, only letter+digits or digits are allowed",
                HTTPStatus.BAD_REQUEST,
            )
        return safe

    @staticmethod
    def _normalize_table_prefix(prefix: str, field_name: str) -> str:
        safe = str(prefix or "").strip().upper()
        if not TABLE_PREFIX_PATTERN.fullmatch(safe):
            raise ApiError("INVALID_INPUT", f"{field_name} must be empty or a single letter", HTTPStatus.BAD_REQUEST)
        return safe

    def _extract_table_targets(self, raw_table_no: str) -> list[str]:
        targets: list[str] = []

        def _append(token: str) -> None:
            normalized = self._normalize_single_table_no(token, field_name="table_no", allow_empty=True)
            if not normalized:
                return
            if normalized not in targets:
                targets.append(normalized)

        safe_raw = str(raw_table_no or "").strip()
        if safe_raw:
            normalized = (
                safe_raw.replace("\uFF0C", ",")
                .replace("\u3001", ",")
                .replace("\uFF1B", ",")
                .replace(";", ",")
                .replace("|", ",")
            )
            for token in normalized.replace("\t", " ").split(" "):
                for segment in token.split(","):
                    _append(segment)
            if targets:
                return targets
        return targets

    def _load_table_numbering_config(self, harness: RestaurantHarness | None = None) -> SimpleNamespace:
        cfg = self.get_table_numbering_config()
        return SimpleNamespace(**cfg)

    def _build_agent_table_rules_state(self, harness: RestaurantHarness) -> dict[str, Any]:
        cfg = self.get_table_numbering_config()
        cyclic_enabled = bool(cfg["cyclic_enabled"])
        takeout_enabled = bool(cfg["takeout_enabled"])
        dinein_prefix = str(cfg["dinein_prefix"] or "").strip().upper()
        cyclic_start = int(cfg["cyclic_start"])
        cyclic_end = int(cfg["cyclic_end"])
        takeout_prefix = str(cfg["takeout_prefix"] or "").strip().upper()
        takeout_start = int(cfg["takeout_start"])
        if cyclic_end < cyclic_start:
            cyclic_end = cyclic_start

        cyclic_available_table_nos: list[str] = []
        cyclic_open_table_nos: list[str] = []
        if cyclic_enabled:
            for candidate_num in range(cyclic_start, cyclic_end + 1):
                candidate = f"{dinein_prefix}{candidate_num}" if dinein_prefix else str(candidate_num)
                table = harness.get_table_by_no(candidate)
                if table is None:
                    cyclic_available_table_nos.append(candidate)
                    continue
                if str(table.get("status", "")).upper() == "OPEN":
                    cyclic_open_table_nos.append(candidate)
                else:
                    cyclic_available_table_nos.append(candidate)

        cyclic_max_tables = max(cyclic_end - cyclic_start + 1, 0)
        return {
            "cyclic_enabled": cyclic_enabled,
            "dinein_prefix": dinein_prefix,
            "cyclic_start": cyclic_start,
            "cyclic_end": cyclic_end,
            "cyclic_max_tables": cyclic_max_tables,
            "cyclic_available_table_nos": cyclic_available_table_nos,
            "cyclic_open_table_nos": cyclic_open_table_nos,
            "takeout_enabled": takeout_enabled,
            "takeout_prefix": takeout_prefix,
            "takeout_start": takeout_start,
            "order_mode_optional_param": "AUTO|DINEIN|TAKEOUT",
            "failure_action": "AGENT_FAILED",
            "failure_rule": "If user command violates table rules or cannot be executed, return AGENT_FAILED with fail_text/fail_code.",
        }

    def _canonicalize_table_no(self, harness: RestaurantHarness, table_no: str, allow_create: bool = False) -> str:
        safe = str(table_no or "").strip().upper()
        if not safe:
            return ""
        if not re.fullmatch(r"\d{1,4}", safe):
            return safe
        cfg = self._load_table_numbering_config(harness)
        prefix = str(getattr(cfg, "dinein_prefix", "") or "").strip().upper()
        if not prefix:
            return safe
        prefixed = f"{prefix}{safe}"
        if allow_create:
            return prefixed
        if harness.get_table_by_no(safe) is not None:
            return safe
        if harness.get_table_by_no(prefixed) is not None:
            return prefixed
        return safe

    def _cyclic_numbering_enabled(self) -> bool:
        return bool(self._table_numbering_config.get("cyclic_enabled", False))

    def _takeout_numbering_enabled(self) -> bool:
        self._ensure_takeout_numbering_defaults(self._table_numbering_config)
        return bool(self._table_numbering_config.get("takeout_enabled", True))

    @staticmethod
    def _normalize_order_mode(order_mode: Any) -> str:
        safe = str(order_mode or "AUTO").strip().upper()
        if safe not in {"AUTO", "DINEIN", "TAKEOUT"}:
            return "AUTO"
        return safe

    @staticmethod
    def _has_open_table_intent(transcript: Any) -> bool:
        text = str(transcript or "").strip().lower()
        if not text:
            return False
        return any(
            token in text
            for token in ("开桌", "开台", "新开", "开一桌", "开个桌", "来客人", "来客", "帮我开", "open table")
        )

    @staticmethod
    def _transcript_mentions_table_no(transcript: Any, table_no: Any) -> bool:
        text = str(transcript or "").strip().upper()
        safe = str(table_no or "").strip().upper()
        if not text or not safe:
            return False
        if safe in text:
            return True
        match = re.fullmatch(r"([A-Z]?)(\d+)", safe)
        if not match:
            return False
        prefix, number = match.groups()
        if prefix and re.search(rf"{re.escape(prefix)}\s*{number}", text):
            return True
        if re.search(rf"(?<!\d){number}\s*(号桌|桌|台)", text):
            return True
        for spoken in SessionRepository._spoken_table_number_forms(int(number)):
            if re.search(rf"{re.escape(spoken)}\s*(号桌|桌|台)", text):
                return True
        return False

    @staticmethod
    def _spoken_table_number_forms(number: int) -> list[str]:
        digits = "零一二三四五六七八九"
        if number <= 0 or number > 99:
            return []
        if number < 10:
            return [digits[number]]
        tens, ones = divmod(number, 10)
        forms: list[str] = []
        if tens == 1:
            forms.append("十" if ones == 0 else f"十{digits[ones]}")
            forms.append("一十" if ones == 0 else f"一十{digits[ones]}")
        else:
            forms.append(f"{digits[tens]}十" if ones == 0 else f"{digits[tens]}十{digits[ones]}")
        return forms

    def _is_takeout_context(self, order_mode: Any = "AUTO") -> bool:
        mode = self._normalize_order_mode(order_mode)
        if mode == "TAKEOUT":
            return True
        return False

    def _allocate_next_table_no(self, harness: RestaurantHarness, order_mode: Any = "AUTO") -> str:
        takeout = self._is_takeout_context(order_mode=order_mode)
        if takeout and self._takeout_numbering_enabled():
            takeout_prefix = str(self._table_numbering_config.get("takeout_prefix", "W") or "W").strip().upper()
            dinein_prefix = str(self._table_numbering_config.get("dinein_prefix", "") or "").strip().upper()
            if takeout_prefix == dinein_prefix:
                takeout_prefix = "W" if dinein_prefix != "W" else "T"
            return self._allocate_next_takeout_table_no(
                harness=harness,
                prefix=takeout_prefix,
                start=int(self._table_numbering_config.get("takeout_start", 1)),
            )
        if self._cyclic_numbering_enabled():
            cyclic_next = self._allocate_next_cyclic_table_no(harness)
            if cyclic_next:
                return cyclic_next
            prefix = str(self._table_numbering_config.get("dinein_prefix", "A") or "A").strip().upper()
            start = int(self._table_numbering_config.get("cyclic_start", 1))
            end = int(self._table_numbering_config.get("cyclic_end", 30))
            range_label = f"{prefix}{start}-{prefix}{end}" if prefix else f"{start}-{end}"
            raise ApiError("INVALID_STATE", "循环桌已满开桌失败", HTTPStatus.BAD_REQUEST)
        return self._allocate_next_available_table_no(
            harness=harness,
            prefix=str(self._table_numbering_config.get("dinein_prefix", "") or ""),
            start=int(self._table_numbering_config.get("dinein_start", 1)),
        )

    def _allocate_next_cyclic_table_no(self, harness: RestaurantHarness) -> str | None:
        prefix = str(self._table_numbering_config.get("dinein_prefix", "A") or "A").strip().upper()
        start = int(self._table_numbering_config.get("cyclic_start", 1))
        end = int(self._table_numbering_config.get("cyclic_end", 30))
        if end < start:
            return None
        for candidate_num in range(start, end + 1):
            candidate = f"{prefix}{candidate_num}" if prefix else str(candidate_num)
            table = harness.get_table_by_no(candidate)
            if table is None:
                return candidate
            if str(table.get("status", "")).upper() != "OPEN":
                return candidate
        return None

    def _allocate_released_cyclic_table_no(self, harness: RestaurantHarness) -> str | None:
        prefix = str(self._table_numbering_config.get("dinein_prefix", "A") or "A").strip().upper()
        start = int(self._table_numbering_config.get("cyclic_start", 1))
        end = int(self._table_numbering_config.get("cyclic_end", 30))
        if end < start:
            return None
        for candidate_num in range(start, end + 1):
            candidate = f"{prefix}{candidate_num}"
            table = harness.get_table_by_no(candidate)
            # Reuse only previously created and now-idle cyclic numbers.
            # Never-created numbers remain governed by the sequential allocator.
            if table is not None and str(table.get("status", "")).upper() != "OPEN":
                return candidate
        return None

    def _validate_table_no_for_opening(self, table_no: str, order_mode: Any = "AUTO") -> None:
        safe_table_no = self._normalize_single_table_no(table_no, field_name="table_no", allow_empty=False)
        if self._is_takeout_context(order_mode=order_mode) and self._takeout_numbering_enabled():
            takeout_prefix = str(self._table_numbering_config.get("takeout_prefix", "W") or "W").strip().upper()
            takeout_start = int(self._table_numbering_config.get("takeout_start", 1) or 1)
            m_takeout = re.fullmatch(rf"{re.escape(takeout_prefix)}(\d+)", safe_table_no)
            if not m_takeout:
                raise ApiError("INVALID_INPUT", "外卖单桌号格式无效", HTTPStatus.BAD_REQUEST)
            value = int(m_takeout.group(1))
            if value < takeout_start:
                raise ApiError("INVALID_INPUT", "外卖单号小于起始号", HTTPStatus.BAD_REQUEST)
            return
        if not self._cyclic_numbering_enabled():
            return
        prefix = str(self._table_numbering_config.get("dinein_prefix", "A") or "A").strip().upper()
        start = int(self._table_numbering_config.get("cyclic_start", 1))
        end = int(self._table_numbering_config.get("cyclic_end", 30))
        range_label = f"{prefix}{start}-{prefix}{end}" if prefix else f"{start}-{end}"

        if prefix:
            m = re.fullmatch(rf"{re.escape(prefix)}(\d+)", safe_table_no)
        else:
            m = re.fullmatch(r"(\d+)", safe_table_no)
        if not m:
            raise ApiError("INVALID_INPUT", "超出桌数范围限制开桌失败", HTTPStatus.BAD_REQUEST)
        value = int(m.group(1))
        if value < start or value > end:
            raise ApiError("INVALID_STATE", "超出桌数范围限制开桌失败", HTTPStatus.BAD_REQUEST)

    def _allocate_next_available_table_no(
        self,
        harness: RestaurantHarness,
        prefix: str,
        start: int,
    ) -> str:
        safe_prefix = str(prefix or "").strip().upper()
        safe_start = max(int(start), 1)
        max_existing = self._find_max_existing_number_by_prefix(harness=harness, prefix=safe_prefix)
        next_number = max(safe_start, max_existing + 1)
        return f"{safe_prefix}{next_number}"

    def _allocate_next_takeout_table_no(
        self,
        harness: RestaurantHarness,
        prefix: str,
        start: int,
    ) -> str:
        safe_prefix = str(prefix or "").strip().upper()
        safe_start = max(int(start), 1)
        runtime_next = int(self._table_numbering_runtime.get("takeout_next_number", 0) or 0)
        if runtime_next > 0:
            max_existing = self._find_max_existing_number_by_prefix(harness=harness, prefix=safe_prefix)
            upper_bound = max(max_existing, runtime_next)
            for candidate_num in range(runtime_next, upper_bound + 1):
                candidate = f"{safe_prefix}{candidate_num}"
                table = harness.get_table_by_no(candidate)
                if table is None or str(table.get("status", "")).upper() != "OPEN":
                    return candidate
            return f"{safe_prefix}{upper_bound + 1}"
        return self._allocate_next_available_table_no(harness=harness, prefix=safe_prefix, start=safe_start)

    @staticmethod
    def _find_max_existing_number_by_prefix(harness: RestaurantHarness, prefix: str) -> int:
        safe_prefix = str(prefix or "").strip().upper()
        if safe_prefix:
            regex = re.compile(rf"^{re.escape(safe_prefix)}(\d+)$")
        else:
            regex = re.compile(r"^(\d+)$")
        max_value = 0
        for row in harness.list_table_states():
            table_no = str(row.get("table_no", "") or "").strip().upper()
            m = regex.fullmatch(table_no)
            if not m:
                continue
            value = int(m.group(1))
            if value > max_value:
                max_value = value
        return max_value

    def _list_open_takeout_table_nos(self, harness: RestaurantHarness) -> list[str]:
        takeout_prefix = str(self._table_numbering_config.get("takeout_prefix", "W") or "W").strip().upper()
        dinein_prefix = str(self._table_numbering_config.get("dinein_prefix", "") or "").strip().upper()
        if takeout_prefix == dinein_prefix:
            takeout_prefix = "W" if dinein_prefix != "W" else "T"
        regex = re.compile(rf"^{re.escape(takeout_prefix)}(\d+)$")
        return [
            table_no
            for table_no in (
                str(row.get("table_no", "") or "").strip().upper()
                for row in harness.get_active_tables_board()
            )
            if regex.fullmatch(table_no)
        ]

    def checkout_preview(self, table_no: str) -> dict[str, Any]:
        safe_table_no = self._normalize_single_table_no(table_no, field_name="table_no")
        harness = RestaurantHarness(self.db_path)
        table = harness.get_table_by_no(safe_table_no)
        if table is None:
            raise ApiError("INVALID_STATE", f"table {safe_table_no} not found", HTTPStatus.BAD_REQUEST)
        open_order_id = harness.get_open_order_id_by_table(table["id"])
        if open_order_id is None:
            raise ApiError("INVALID_STATE", f"table {safe_table_no} has no OPEN order", HTTPStatus.BAD_REQUEST)
        bill = harness.preview_bill(order_id=open_order_id)
        return {
            "table_no": safe_table_no,
            "order_id": open_order_id,
            "bill_summary": {
                "subtotal_cents": bill["subtotal_cents"],
                "extra_fee_total_cents": bill["extra_fee_total_cents"],
                "extra_fee_items": list(bill.get("extra_fee_items", [])),
                "total_cents": bill["total_cents"],
                "currency": bill["currency"],
            },
        }

    def _ensure_runtime_settings_table(self) -> None:
        with closing(sqlite3.connect(self.db_path)) as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS runtime_settings (
                    key TEXT PRIMARY KEY,
                    value_json TEXT NOT NULL,
                    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            conn.commit()

    def _load_runtime_setting_json(self, key: str) -> dict[str, Any] | None:
        with closing(sqlite3.connect(self.db_path)) as conn:
            row = conn.execute("SELECT value_json FROM runtime_settings WHERE key = ? LIMIT 1", (key,)).fetchone()
        if row is None:
            return None
        try:
            value = json.loads(str(row[0] or "{}"))
        except json.JSONDecodeError:
            return None
        return value if isinstance(value, dict) else None

    def _save_runtime_setting_json(self, key: str, value: dict[str, Any]) -> None:
        payload = json.dumps(value, ensure_ascii=False)
        with closing(sqlite3.connect(self.db_path)) as conn:
            conn.execute(
                """
                INSERT INTO runtime_settings(key, value_json, updated_at)
                VALUES (?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(key)
                DO UPDATE SET value_json = excluded.value_json, updated_at = CURRENT_TIMESTAMP
                """,
                (key, payload),
            )
            conn.commit()

    def _load_persisted_table_numbering_config(self) -> None:
        saved = self._load_runtime_setting_json(TABLE_NUMBERING_CONFIG_KEY)
        if not isinstance(saved, dict) or not saved:
            return
        try:
            self.update_table_numbering_config(saved)
        except ApiError:
            # Keep built-in defaults when persisted config is invalid.
            pass

    def _load_persisted_takeout_numbering_runtime(self) -> None:
        saved = self._load_runtime_setting_json(TAKEOUT_NUMBERING_RUNTIME_KEY)
        if not isinstance(saved, dict):
            self._table_numbering_runtime = {}
            return
        try:
            next_number = int(saved.get("takeout_next_number", 0) or 0)
        except (TypeError, ValueError):
            next_number = 0
        self._table_numbering_runtime = {"takeout_next_number": next_number} if next_number > 0 else {}

    def _save_takeout_numbering_runtime(self) -> None:
        if self._table_numbering_runtime:
            self._save_runtime_setting_json(TAKEOUT_NUMBERING_RUNTIME_KEY, dict(self._table_numbering_runtime))
            return
        with closing(sqlite3.connect(self.db_path)) as conn:
            conn.execute("DELETE FROM runtime_settings WHERE key = ?", (TAKEOUT_NUMBERING_RUNTIME_KEY,))
            conn.commit()

    def get_stats_config(self) -> dict[str, Any]:
        return dict(self._stats_config)

    def update_stats_config(self, payload: dict[str, Any]) -> dict[str, Any]:
        if "include_open_orders_in_current" in payload:
            self._stats_config["include_open_orders_in_current"] = bool(payload["include_open_orders_in_current"])
        return dict(self._stats_config)

    def get_table_numbering_config(self) -> dict[str, Any]:
        config = dict(self._table_numbering_config)
        self._ensure_takeout_numbering_defaults(config)
        self._table_numbering_config = config
        return dict(self._table_numbering_config)

    def update_table_numbering_config(self, payload: dict[str, Any]) -> dict[str, Any]:
        config = dict(self._table_numbering_config)

        allowed_keys = {
            "cyclic_enabled",
            "takeout_enabled",
            "dinein_prefix",
            "dinein_start",
            "cyclic_start",
            "cyclic_end",
            "takeout_prefix",
            "takeout_start",
        }
        unknown_keys = [key for key in payload.keys() if key not in allowed_keys]
        if unknown_keys:
            raise ApiError("INVALID_INPUT", f"unsupported config keys: {', '.join(sorted(unknown_keys))}", HTTPStatus.BAD_REQUEST)

        if "cyclic_enabled" in payload:
            config["cyclic_enabled"] = bool(payload.get("cyclic_enabled"))
        if "takeout_enabled" in payload:
            config["takeout_enabled"] = bool(payload.get("takeout_enabled"))
        for key in ("dinein_prefix", "takeout_prefix"):
            if key in payload:
                config[key] = self._normalize_table_prefix(payload.get(key, config[key]), field_name=key)
        for key in ("dinein_start", "cyclic_start", "cyclic_end", "takeout_start"):
            if key in payload:
                try:
                    config[key] = int(payload.get(key))
                except (TypeError, ValueError) as exc:
                    raise ApiError("INVALID_INPUT", f"{key} must be integer", HTTPStatus.BAD_REQUEST) from exc

        cyclic_enabled = bool(config.get("cyclic_enabled", False))
        takeout_enabled = True
        dinein_prefix = self._normalize_table_prefix(config.get("dinein_prefix", ""), field_name="dinein_prefix")
        takeout_prefix = self._normalize_table_prefix(config.get("takeout_prefix", ""), field_name="takeout_prefix")
        dinein_start = int(config.get("dinein_start", 1) or 1)

        if cyclic_enabled and not dinein_prefix:
            dinein_prefix = "A"
        if takeout_enabled and not dinein_prefix:
            dinein_prefix = "D"
        if takeout_enabled and not takeout_prefix:
            takeout_prefix = "W" if dinein_prefix != "W" else "T"

        if takeout_enabled and not cyclic_enabled and not dinein_prefix:
            dinein_prefix = "D"

        config["dinein_prefix"] = dinein_prefix
        config["takeout_prefix"] = takeout_prefix
        config["cyclic_enabled"] = cyclic_enabled
        config["takeout_enabled"] = takeout_enabled
        config["dinein_start"] = dinein_start

        if int(config["cyclic_start"]) <= 0 or int(config["cyclic_end"]) <= 0:
            raise ApiError("INVALID_INPUT", "cyclic_start/cyclic_end must be > 0", HTTPStatus.BAD_REQUEST)
        if cyclic_enabled and int(config["cyclic_start"]) > int(config["cyclic_end"]):
            raise ApiError("INVALID_INPUT", "cyclic_start must be <= cyclic_end", HTTPStatus.BAD_REQUEST)
        if int(config["dinein_start"]) <= 0 or int(config["takeout_start"]) <= 0:
            raise ApiError("INVALID_INPUT", "dinein_start/takeout_start must be > 0", HTTPStatus.BAD_REQUEST)
        self._ensure_takeout_numbering_defaults(config)

        self._table_numbering_config = config
        self._table_numbering_runtime = {}
        self._save_runtime_setting_json(TABLE_NUMBERING_CONFIG_KEY, self._table_numbering_config)
        self._save_takeout_numbering_runtime()
        return self.get_table_numbering_config()

    def reset_takeout_numbering(self, operator: str = "waiter-A") -> dict[str, Any]:
        with self._op_lock:
            harness = RestaurantHarness(self.db_path)
            open_takeout_tables = self._list_open_takeout_table_nos(harness)
            if open_takeout_tables:
                raise ApiError("INVALID_STATE", "当前仍有外卖单未完成，不能重置外卖单号", HTTPStatus.BAD_REQUEST)
            takeout_start = int(self._table_numbering_config.get("takeout_start", 1) or 1)
            takeout_prefix = str(self._table_numbering_config.get("takeout_prefix", "W") or "W").strip().upper()
            dinein_prefix = str(self._table_numbering_config.get("dinein_prefix", "") or "").strip().upper()
            if takeout_prefix == dinein_prefix:
                takeout_prefix = "W" if dinein_prefix != "W" else "T"
            self._table_numbering_runtime = {"takeout_next_number": takeout_start}
            self._save_takeout_numbering_runtime()
            return {
                "reset_applied": True,
                "takeout_prefix": takeout_prefix,
                "takeout_start": takeout_start,
                "next_takeout_table_no": f"{takeout_prefix}{takeout_start}",
                "open_takeout_tables": [],
                "operator": str(operator or "").strip() or "waiter-A",
            }

    def clear_all_menu_items(self, operator: str = "waiter-A") -> dict[str, Any]:
        with self._op_lock:
            harness = RestaurantHarness(self.db_path)
            menu_items = harness.list_menu_items()
            available_items = [item for item in menu_items if bool(item.get("is_available", False))]
            deleted_items: list[dict[str, Any]] = []
            for item in available_items:
                menu_item_id = int(item.get("menu_item_id", 0))
                if menu_item_id <= 0:
                    continue
                deleted = harness.delete_menu_item(menu_item_id=menu_item_id, operator=operator)
                deleted_items.append(
                    {
                        "menu_item_id": int(deleted.get("menu_item_id", 0)),
                        "dish_name": str(deleted.get("name", "")),
                        "category": str(deleted.get("category", "")),
                        "price_cents": int(deleted.get("price_cents", 0)),
                    }
                )
            lexicon = harness.refresh_lexicon(operator=operator, note="menu clear all")
            result = {
                "cleared_count": len(deleted_items),
                "cleared_items": deleted_items,
                "remaining_available_count": 0,
                "lexicon_version": str(lexicon.get("version", "")),
                "message": f"menu cleared: {len(deleted_items)} item(s)",
            }
            harness.log_voice_action(
                operator=operator,
                action="MENU_CLEAR_ALL",
                event_id=f"menu-clear-{int(time() * 1000)}",
                device_id="settings-ui",
                raw_transcript="[settings clear menu]",
                tool_called=["delete_menu_item", "refresh_lexicon"],
                agent_plan={},
                before_state={"available_menu_items": len(available_items)},
                after_state={"available_menu_items": 0, "lexicon_version": str(lexicon.get("version", ""))},
                detail=result,
            )
            return result

    def clear_all_open_tables(self, operator: str = "waiter-A") -> dict[str, Any]:
        with self._op_lock:
            harness = RestaurantHarness(self.db_path)
            table_states = harness.list_table_states()
            open_tables = [row for row in table_states if str(row.get("status", "")).upper() == "OPEN"]
            closed_tables: list[dict[str, Any]] = []
            canceled_order_ids: list[int] = []

            for row in open_tables:
                table_id = int(row.get("table_id", 0))
                table_no = str(row.get("table_no", "")).strip().upper()
                if table_id <= 0 or not table_no:
                    continue
                open_order_id = row.get("open_order_id")
                if isinstance(open_order_id, int) and open_order_id > 0:
                    canceled = harness.cancel_open_order(order_id=open_order_id, operator=operator)
                    if canceled:
                        canceled_order_ids.append(open_order_id)
                harness.set_table_status(table_id=table_id, status="IDLE")
                self._table_action_history.pop(table_no, None)
                closed_tables.append(
                    {
                        "table_id": table_id,
                        "table_no": table_no,
                        "open_order_id": int(open_order_id) if isinstance(open_order_id, int) else None,
                    }
                )

            self._selected_table_by_channel = {}
            result = {
                "closed_table_count": len(closed_tables),
                "closed_tables": closed_tables,
                "canceled_order_count": len(canceled_order_ids),
                "canceled_order_ids": canceled_order_ids,
                "message": f"tables cleared: {len(closed_tables)} open table(s) set to IDLE",
            }
            harness.log_voice_action(
                operator=operator,
                action="TABLE_CLEAR_ALL_OPEN",
                event_id=f"table-clear-{int(time() * 1000)}",
                device_id="settings-ui",
                raw_transcript="[settings clear tables]",
                tool_called=["cancel_open_order", "set_table_status"],
                agent_plan={},
                before_state={"open_table_count": len(open_tables)},
                after_state={"open_table_count": 0},
                detail=result,
            )
            return result

    @staticmethod
    def _ensure_takeout_numbering_defaults(config: dict[str, Any]) -> None:
        config["takeout_enabled"] = True
        dinein_prefix = str(config.get("dinein_prefix", "") or "").strip().upper()
        takeout_prefix = str(config.get("takeout_prefix", "") or "").strip().upper()
        if not takeout_prefix or takeout_prefix == dinein_prefix:
            takeout_prefix = "W" if dinein_prefix != "W" else "T"
        config["takeout_prefix"] = takeout_prefix
        try:
            takeout_start = int(config.get("takeout_start", 1) or 1)
        except (TypeError, ValueError):
            takeout_start = 1
        config["takeout_start"] = max(takeout_start, 1)

    def profit_current(self) -> dict[str, Any]:
        harness = RestaurantHarness(self.db_path)
        base = harness.profit_current()
        if not self._stats_config.get("include_open_orders_in_current", False):
            return base
        open_subtotal = harness.open_orders_subtotal()
        return {
            "total_cents": int(base["total_cents"]) + int(open_subtotal),
            "currency": "CNY",
            "includes_open_orders": True,
        }

    def _undo_action(
        self,
        harness: RestaurantHarness,
        table: dict[str, Any],
        last_action: dict[str, Any],
        operator: str,
    ) -> dict[str, Any]:
        kind = str(last_action.get("kind", ""))
        order_id = int(last_action.get("order_id", 0))
        count = int(last_action.get("count", 0))
        previous_order_note = str(last_action.get("previous_order_note", "") or "")
        previous_item_notes = list(last_action.get("previous_item_notes", []) or [])
        if kind == "ADD_ITEM":
            removed = harness.remove_last_order_items(order_id=order_id, count=count, operator=operator)
            if order_id > 0:
                harness.set_order_note(order_id=order_id, note=previous_order_note, operator=operator)
            return {"kind": kind, "order_id": order_id, "removed_items": removed}
        if kind in {"ADD_ORDER_NOTE", "UPDATE_ORDER_NOTE", "REMOVE_ORDER_NOTE"}:
            restored_note = harness.set_order_note(order_id=order_id, note=previous_order_note, operator=operator)
            return {"kind": kind, "order_id": order_id, "restored_order_note": restored_note}
        if kind in {"ADD_ITEM_NOTE", "UPDATE_ITEM_NOTE", "REMOVE_ITEM_NOTE"}:
            restored_items: list[dict[str, Any]] = []
            for row in previous_item_notes:
                safe_item_id = int((row or {}).get("order_item_id", 0))
                if safe_item_id <= 0:
                    continue
                restored = harness.set_order_item_note(
                    order_item_id=safe_item_id,
                    note=str((row or {}).get("previous_note", "") or ""),
                    operator=operator,
                )
                restored_items.append(restored)
            return {"kind": kind, "order_id": order_id, "restored_items": restored_items}
        if kind == "ORDER_ITEM":
            created_new = bool(last_action.get("created_new", False))
            if created_new:
                deleted = harness.delete_open_order(order_id=order_id, operator=operator)
                if deleted:
                    still_open = harness.get_open_order_id_by_table(table["id"])
                    if still_open is None:
                        harness.set_table_status(table["id"], "IDLE")
                return {"kind": kind, "order_id": order_id, "deleted_order": deleted}
            removed = harness.remove_last_order_items(order_id=order_id, count=count, operator=operator)
            if order_id > 0:
                harness.set_order_note(order_id=order_id, note=previous_order_note, operator=operator)
            return {"kind": kind, "order_id": order_id, "removed_items": removed}
        raise ApiError("INVALID_STATE", f"undo unsupported for action kind: {kind}", HTTPStatus.BAD_REQUEST)

    def checkout_confirm(self, table_no: str, operator: str, event_id: str = "", device_id: str = "") -> dict[str, Any]:
        with self._op_lock:
            targets = self._extract_table_targets(raw_table_no=table_no)
            if len(targets) <= 1:
                return self._checkout_confirm_locked(
                    table_no=table_no,
                    operator=operator,
                    event_id=event_id,
                    device_id=device_id,
                )

            per_table_results: list[dict[str, Any]] = []
            for idx, target in enumerate(targets, start=1):
                sub_event_id = f"{event_id}#part-{idx}" if event_id else ""
                try:
                    sub = self._checkout_confirm_locked(
                        table_no=target,
                        operator=operator,
                        event_id=sub_event_id,
                        device_id=device_id,
                    )
                    sub = dict(sub)
                    sub["applied"] = True
                except ApiError as exc:
                    sub = {
                        "event_id": sub_event_id,
                        "table_no": target,
                        "applied": False,
                        "table_status": "UNCHANGED",
                        "order_status": "UNCHANGED",
                        "message": exc.message,
                    }
                per_table_results.append(sub)

            all_applied = all(bool(item.get("applied")) for item in per_table_results)
            table_statuses = {str(item.get("table_status", "")).strip().upper() for item in per_table_results if str(item.get("table_status", "")).strip()}
            order_statuses = {str(item.get("order_status", "")).strip().upper() for item in per_table_results if str(item.get("order_status", "")).strip()}
            result: dict[str, Any] = {
                "event_id": event_id,
                "table_no": ",".join(targets),
                "applied": all_applied,
                "table_status": table_statuses.pop() if len(table_statuses) == 1 else ("MIXED" if table_statuses else "UNCHANGED"),
                "order_status": order_statuses.pop() if len(order_statuses) == 1 else ("MIXED" if order_statuses else "UNCHANGED"),
                "message": (
                    f"tables {','.join(targets)} checkout confirmed"
                    if all_applied
                    else f"tables {','.join(targets)} checkout partial confirmed"
                ),
                "per_table_results": per_table_results,
                "bill_summary": self._merge_checkout_bill_summary(per_table_results),
            }
            order_ids = [int(item["order_id"]) for item in per_table_results if isinstance(item.get("order_id"), int)]
            if order_ids:
                result["order_ids"] = order_ids
            return result

    def cancel_confirm(self, table_no: str, operator: str, event_id: str = "", device_id: str = "") -> dict[str, Any]:
        with self._op_lock:
            targets = self._extract_table_targets(raw_table_no=table_no)
            if len(targets) <= 1:
                return self._cancel_confirm_locked(
                    table_no=table_no,
                    operator=operator,
                    event_id=event_id,
                    device_id=device_id,
                )

            per_table_results: list[dict[str, Any]] = []
            for idx, target in enumerate(targets, start=1):
                sub_event_id = f"{event_id}#part-{idx}" if event_id else ""
                try:
                    sub = self._cancel_confirm_locked(
                        table_no=target,
                        operator=operator,
                        event_id=sub_event_id,
                        device_id=device_id,
                    )
                    sub = dict(sub)
                    sub["applied"] = True
                except ApiError as exc:
                    sub = {
                        "event_id": sub_event_id,
                        "table_no": target,
                        "applied": False,
                        "table_status": "UNCHANGED",
                        "order_status": "UNCHANGED",
                        "message": exc.message,
                    }
                per_table_results.append(sub)

            all_applied = all(bool(item.get("applied")) for item in per_table_results)
            table_statuses = {str(item.get("table_status", "")).strip().upper() for item in per_table_results if str(item.get("table_status", "")).strip()}
            order_statuses = {str(item.get("order_status", "")).strip().upper() for item in per_table_results if str(item.get("order_status", "")).strip()}
            result: dict[str, Any] = {
                "event_id": event_id,
                "table_no": ",".join(targets),
                "applied": all_applied,
                "table_status": table_statuses.pop() if len(table_statuses) == 1 else ("MIXED" if table_statuses else "UNCHANGED"),
                "order_status": order_statuses.pop() if len(order_statuses) == 1 else ("MIXED" if order_statuses else "UNCHANGED"),
                "message": (
                    f"tables {','.join(targets)} cancel confirmed"
                    if all_applied
                    else f"tables {','.join(targets)} cancel partial confirmed"
                ),
                "per_table_results": per_table_results,
            }
            order_ids = [int(item["order_id"]) for item in per_table_results if isinstance(item.get("order_id"), int)]
            if order_ids:
                result["order_ids"] = order_ids
            return result

    def _cancel_confirm_locked(self, table_no: str, operator: str, event_id: str = "", device_id: str = "") -> dict[str, Any]:
        safe_table_no = self._normalize_single_table_no(table_no, field_name="table_no")
        replay_key = f"cancel:{event_id}" if event_id else ""
        if replay_key and replay_key in self._voice_event_results:
            replayed = dict(self._voice_event_results[replay_key])
            replayed["idempotent_replay"] = True
            return replayed

        harness = RestaurantHarness(self.db_path)
        before_state = self._snapshot_state(harness, safe_table_no)
        table = harness.get_table_by_no(safe_table_no)
        if table is None:
            raise ApiError("INVALID_STATE", f"table {safe_table_no} not found", HTTPStatus.BAD_REQUEST)

        open_order_id = harness.get_open_order_id_by_table(table["id"])
        tool_called: list[str] = []
        order_status = "NONE"
        message = f"table {safe_table_no} closed"
        if open_order_id is not None:
            canceled = harness.cancel_open_order(order_id=open_order_id, operator=operator)
            if not canceled:
                raise ApiError("INVALID_STATE", f"table {safe_table_no} order is not OPEN", HTTPStatus.BAD_REQUEST)
            tool_called.append("cancel_open_order")
            order_status = "CANCELED"
            message = f"table {safe_table_no} order canceled"

        harness.set_table_status(table["id"], "IDLE")
        tool_called.append("set_table_status")
        self._table_action_history.pop(safe_table_no, None)
        self._rotate_selected_table_after_checkout(
            channel_key=self._channel_key(operator=operator, device_id=device_id),
            billed_table_no=safe_table_no,
            harness=harness,
        )
        result = {
            "event_id": event_id,
            "table_no": safe_table_no,
            "order_id": open_order_id,
            "table_status": "IDLE",
            "order_status": order_status,
            "remove_from_board": True,
            "message": message,
        }
        if replay_key:
            self._voice_event_results[replay_key] = dict(result)
        harness.log_voice_action(
            operator=operator,
            action="CANCEL_ORDER_CONFIRM",
            event_id=event_id,
            device_id=device_id,
            raw_transcript=f"{safe_table_no} cancel confirm",
            tool_called=tool_called,
            agent_plan={},
            before_state=before_state,
            after_state=self._snapshot_state(harness, safe_table_no),
            detail=result,
        )
        return result

    def undo_confirm(self, table_no: str, operator: str, event_id: str = "", device_id: str = "") -> dict[str, Any]:
        with self._op_lock:
            return self._undo_confirm_locked(
                table_no=table_no,
                operator=operator,
                event_id=event_id,
                device_id=device_id,
            )

    def _undo_confirm_locked(self, table_no: str, operator: str, event_id: str = "", device_id: str = "") -> dict[str, Any]:
        safe_table_no = self._normalize_single_table_no(table_no, field_name="table_no")
        replay_key = f"undo:{event_id}" if event_id else ""
        if replay_key and replay_key in self._voice_event_results:
            replayed = dict(self._voice_event_results[replay_key])
            replayed["idempotent_replay"] = True
            return replayed

        harness = RestaurantHarness(self.db_path)
        before_state = self._snapshot_state(harness, safe_table_no)
        table = harness.get_table_by_no(safe_table_no)
        if table is None:
            raise ApiError("INVALID_STATE", f"table {safe_table_no} not found", HTTPStatus.BAD_REQUEST)

        open_order_id = harness.get_open_order_id_by_table(table["id"])
        history = self._table_action_history.get(safe_table_no, [])
        tool_called: list[str] = []
        if history:
            last = history.pop()
            undo_result = self._undo_action(harness=harness, table=table, last_action=last, operator=operator)
            result = {
                "event_id": event_id,
                "table_no": safe_table_no,
                "undo": undo_result,
                "order_status": "OPEN" if self._snapshot_state(harness, safe_table_no).get("open_order_id") is not None else "NONE",
                "message": f"table {safe_table_no} undo applied",
            }
            tool_called.append("undo_action")
        else:
            can_close_idle_table = (
                open_order_id is None
                and str(table.get("status", "")).upper() == "OPEN"
            )
            if not can_close_idle_table:
                raise ApiError("INVALID_STATE", f"table {safe_table_no} has no undoable action", HTTPStatus.BAD_REQUEST)
            harness.set_table_status(table["id"], "IDLE")
            self._table_action_history.pop(safe_table_no, None)
            self._rotate_selected_table_after_checkout(
                channel_key=self._channel_key(operator=operator, device_id=device_id),
                billed_table_no=safe_table_no,
                harness=harness,
            )
            result = {
                "event_id": event_id,
                "table_no": safe_table_no,
                "order_id": open_order_id,
                "table_status": "IDLE",
                "order_status": "NONE",
                "remove_from_board": True,
                "message": f"table {safe_table_no} closed",
            }
            tool_called.append("set_table_status")

        if replay_key:
            self._voice_event_results[replay_key] = dict(result)
        harness.log_voice_action(
            operator=operator,
            action="UNDO_LAST_CONFIRM",
            event_id=event_id,
            device_id=device_id,
            raw_transcript=f"{safe_table_no} undo confirm",
            tool_called=tool_called,
            agent_plan={},
            before_state=before_state,
            after_state=self._snapshot_state(harness, safe_table_no),
            detail=result,
        )
        return result

    def _checkout_confirm_locked(self, table_no: str, operator: str, event_id: str = "", device_id: str = "") -> dict[str, Any]:
        safe_table_no = self._normalize_single_table_no(table_no, field_name="table_no")
        replay_key = f"checkout:{event_id}" if event_id else ""
        if replay_key and replay_key in self._voice_event_results:
            replayed = dict(self._voice_event_results[replay_key])
            replayed["idempotent_replay"] = True
            return replayed

        harness = RestaurantHarness(self.db_path)
        before_state = self._snapshot_state(harness, safe_table_no)
        table = harness.get_table_by_no(safe_table_no)
        if table is None:
            raise ApiError("INVALID_STATE", f"table {safe_table_no} not found", HTTPStatus.BAD_REQUEST)
        open_order_id = harness.get_open_order_id_by_table(table["id"])
        if open_order_id is None:
            raise ApiError("INVALID_STATE", f"table {safe_table_no} has no OPEN order", HTTPStatus.BAD_REQUEST)

        bill = harness.generate_bill(order_id=open_order_id, operator=operator)
        harness.set_table_status(table["id"], "IDLE")
        result = {
            "event_id": event_id,
            "table_no": safe_table_no,
            "order_id": open_order_id,
            "table_status": "IDLE",
            "order_status": "BILLED",
            "remove_from_board": True,
            "bill_summary": {
                "subtotal_cents": bill["subtotal_cents"],
                "extra_fee_total_cents": bill["extra_fee_total_cents"],
                "extra_fee_items": list(bill.get("extra_fee_items", [])),
                "total_cents": bill["total_cents"],
                "currency": bill["currency"],
            },
            "message": f"table {safe_table_no} billed",
        }
        if replay_key:
            self._voice_event_results[replay_key] = dict(result)
        harness.log_voice_action(
            operator=operator,
            action="CHECKOUT_CONFIRM",
            event_id=event_id,
            device_id=device_id,
            raw_transcript=f"{safe_table_no} checkout confirm",
            tool_called=["generate_bill", "set_table_status"],
            agent_plan={},
            before_state=before_state,
            after_state=self._snapshot_state(harness, safe_table_no),
            detail=result,
        )
        return result

    def set_selected_table(self, operator: str = "", device_id: str = "", table_no: str = "") -> dict[str, Any]:
        with self._op_lock:
            harness = RestaurantHarness(self.db_path)
            channel_key = self._channel_key(operator=operator, device_id=device_id)
            safe_table_no = self._normalize_single_table_no(table_no, field_name="table_no", allow_empty=True)
            if not safe_table_no:
                self._clear_selected_table(channel_key)
                return self._empty_selected_table_detail()

            table = harness.get_table_by_no(safe_table_no)
            if table is None:
                raise ApiError("INVALID_STATE", f"table {safe_table_no} not found", HTTPStatus.BAD_REQUEST)
            if str(table.get("status", "")).upper() != "OPEN":
                raise ApiError("INVALID_STATE", f"table {safe_table_no} is not OPEN", HTTPStatus.BAD_REQUEST)

            self._set_selected_table(channel_key, safe_table_no)
            detail = harness.get_table_order_detail(safe_table_no)
            if detail is None:
                return self._empty_selected_table_detail()
            return {"selected_table_no": safe_table_no, **detail}

    def set_order_item_served(
        self,
        operator: str = "",
        device_id: str = "",
        table_no: str = "",
        order_item_id: int = 0,
        served: bool = False,
    ) -> dict[str, Any]:
        with self._op_lock:
            harness = RestaurantHarness(self.db_path)
            safe_table_no = self._normalize_single_table_no(table_no, field_name="table_no", allow_empty=False)
            safe_item_id = int(order_item_id or 0)
            if safe_item_id <= 0:
                raise ApiError("INVALID_INPUT", "order_item_id must be positive integer", HTTPStatus.BAD_REQUEST)

            updated = harness.set_order_item_served(
                table_no=safe_table_no,
                order_item_id=safe_item_id,
                served=bool(served),
                operator=str(operator or "waiter-A"),
            )
            channel_key = self._channel_key(operator=operator, device_id=device_id)
            self._set_selected_table(channel_key, safe_table_no)
            detail = harness.get_table_order_detail(safe_table_no)
            if detail is None:
                return self._empty_selected_table_detail()
            return {"selected_table_no": safe_table_no, **detail, "updated_item": updated}

    def remove_order_item_by_id(
        self,
        operator: str = "",
        device_id: str = "",
        table_no: str = "",
        order_item_id: int = 0,
    ) -> dict[str, Any]:
        with self._op_lock:
            harness = RestaurantHarness(self.db_path)
            safe_table_no = self._normalize_single_table_no(table_no, field_name="table_no", allow_empty=False)
            safe_item_id = int(order_item_id or 0)
            if safe_item_id <= 0:
                raise ApiError("INVALID_INPUT", "order_item_id must be positive integer", HTTPStatus.BAD_REQUEST)

            removed = harness.remove_order_item_by_id(
                table_no=safe_table_no,
                order_item_id=safe_item_id,
                operator=str(operator or "waiter-A"),
            )
            channel_key = self._channel_key(operator=operator, device_id=device_id)
            self._set_selected_table(channel_key, safe_table_no)
            detail = harness.get_table_order_detail(safe_table_no)
            if detail is None:
                return self._empty_selected_table_detail()
            return {"selected_table_no": safe_table_no, **detail, "removed_item": removed}

    def get_selected_table_detail(self, operator: str = "", device_id: str = "") -> dict[str, Any]:
        harness = RestaurantHarness(self.db_path)
        channel_key = self._channel_key(operator=operator, device_id=device_id)
        selected_table_no = self._resolve_selected_table_for_channel(channel_key=channel_key, harness=harness)
        if not selected_table_no:
            return self._empty_selected_table_detail()
        detail = harness.get_table_order_detail(selected_table_no)
        if detail is None:
            self._clear_selected_table(channel_key)
            return self._empty_selected_table_detail()
        return {"selected_table_no": selected_table_no, **detail}

    def get_active_tables(self, operator: str = "", device_id: str = "") -> dict[str, Any]:
        harness = RestaurantHarness(self.db_path)
        tables = harness.get_active_tables_board()
        selected_table_no = ""
        if str(operator or "").strip() or str(device_id or "").strip():
            channel_key = self._channel_key(operator=operator, device_id=device_id)
            selected_table_no = self._resolve_selected_table_for_channel(
                channel_key=channel_key,
                harness=harness,
                open_tables=tables,
            )
        return {"tables": tables, "selected_table_no": selected_table_no}


class RestaurantApiHandler(BaseHTTPRequestHandler):
    server_version = "RestaurantHarnessHTTP/0.1"
    _KLS_PROXY_PREFIX = "/api/kls-proxy"

    def do_OPTIONS(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/"):
            self.send_response(HTTPStatus.NO_CONTENT)
            self._send_cors_headers()
            self.end_headers()
            return
        self.send_error(HTTPStatus.NOT_FOUND)

    def do_GET(self) -> None:
        with self._gateway_override_context():
            parsed = urlparse(self.path)
            if parsed.path.startswith(self._KLS_PROXY_PREFIX):
                try:
                    self._proxy_kls_request(parsed, method="GET")
                except ApiError as exc:
                    self._send_error_json(exc.code, exc.message, exc.status)
                except Exception as exc:  # noqa: BLE001
                    self._send_error_json("INTERNAL_ERROR", f"internal error: {str(exc)}", HTTPStatus.INTERNAL_SERVER_ERROR)
                return
            if parsed.path == "/api/tables/active":
                query = parse_qs(parsed.query)
                self._send_ok(
                    self.server.repo.get_active_tables(
                        operator=str(query.get("operator", [""])[0]),
                        device_id=str(query.get("device_id", [""])[0]),
                    )
                )
                return
            if parsed.path == "/api/tables/selected":
                query = parse_qs(parsed.query)
                self._send_ok(
                    self.server.repo.get_selected_table_detail(
                        operator=str(query.get("operator", [""])[0]),
                        device_id=str(query.get("device_id", [""])[0]),
                    )
                )
                return
            if parsed.path == "/api/menu/items":
                harness = RestaurantHarness(self.server.repo.db_path)
                self._send_ok({"items": harness.list_menu_items()})
                return
            if parsed.path == "/api/stats/profit/current":
                self._send_ok(self.server.repo.profit_current())
                return
            if parsed.path == "/api/stats/profit/today":
                harness = RestaurantHarness(self.server.repo.db_path)
                self._send_ok(harness.profit_today())
                return
            if parsed.path == "/api/stats/profit/this-week":
                harness = RestaurantHarness(self.server.repo.db_path)
                self._send_ok(harness.profit_this_week())
                return
            if parsed.path == "/api/stats/profit/this-month":
                harness = RestaurantHarness(self.server.repo.db_path)
                self._send_ok(harness.profit_this_month())
                return
            if parsed.path == "/api/stats/profit/weekly":
                harness = RestaurantHarness(self.server.repo.db_path)
                self._send_ok({"items": harness.profit_weekly(), "currency": "CNY"})
                return
            if parsed.path == "/api/stats/profit/monthly":
                harness = RestaurantHarness(self.server.repo.db_path)
                self._send_ok({"items": harness.profit_monthly(), "currency": "CNY"})
                return
            if parsed.path == "/api/stats/config":
                self._send_ok(self.server.repo.get_stats_config())
                return
            if parsed.path == "/api/settings/table-numbering":
                self._send_ok(self.server.repo.get_table_numbering_config())
                return
            if parsed.path == "/api/orders/history":
                query = parse_qs(parsed.query)
                raw_table_no = str(query.get("table_no", [""])[0]).strip().upper()
                table_no = (
                    self.server.repo._normalize_single_table_no(raw_table_no, field_name="table_no", allow_empty=False)
                    if raw_table_no
                    else ""
                )
                start_at = str(query.get("start_at", [""])[0]).strip()
                end_at = str(query.get("end_at", [""])[0]).strip()
                try:
                    limit = int(query.get("limit", ["50"])[0] or "50")
                except ValueError as exc:
                    raise ApiError("INVALID_INPUT", "limit must be integer", HTTPStatus.BAD_REQUEST) from exc
                harness = RestaurantHarness(self.server.repo.db_path)
                self._send_ok(
                    {
                        "items": harness.list_order_history(
                            table_no=table_no,
                            start_at=start_at,
                            end_at=end_at,
                            limit=limit,
                        ),
                        "filters": {
                            "table_no": table_no,
                            "start_at": start_at,
                            "end_at": end_at,
                            "limit": min(max(limit, 1), 100),
                        },
                    }
                )
                return
            if parsed.path == "/api/audit/voice":
                query = parse_qs(parsed.query)
                harness = RestaurantHarness(self.server.repo.db_path)
                self._send_ok(
                    {
                        "items": harness.list_voice_audit_logs(
                            operator=str(query.get("operator", [""])[0]),
                            table_no=str(query.get("table_no", [""])[0]),
                            limit=int(query.get("limit", ["100"])[0] or "100"),
                        )
                    }
                )
                return
            if parsed.path.startswith("/api/sessions/"):
                self._handle_get_session(parsed.path)
                return
            if parsed.path.startswith("/api/"):
                self._send_error_json("NOT_FOUND", f"unknown path: {parsed.path}", HTTPStatus.NOT_FOUND)
                return

            self._serve_static(parsed.path)

    def do_POST(self) -> None:
        with self._gateway_override_context():
            parsed = urlparse(self.path)
            try:
                if parsed.path.startswith(self._KLS_PROXY_PREFIX):
                    self._proxy_kls_request(parsed, method="POST")
                    return
                if parsed.path == "/api/commands/voice-audio":
                    self._ensure_gateway_injected()
                    payload = self._read_json()
                    audio_base64 = str(payload.get("audio_base64", ""))
                    mime_type = str(payload.get("mime_type", "audio/webm"))
                    event_id = str(payload.get("event_id", ""))
                    audio_bytes = self._decode_audio(audio_base64)
                    extension = self._ext_from_mime_type(mime_type)
                    audio_session_id = f"voicecmd-{event_id}" if event_id else f"voicecmd-{uuid4().hex}"
                    audio_id = self.server.repo.save_audio_upload(audio_session_id, audio_bytes, extension)
                    data = self.server.repo.process_voice_audio_command(
                        audio_bytes=audio_bytes,
                        mime_type=mime_type,
                        operator=str(payload.get("operator_id", payload.get("operator", "waiter-A"))),
                        event_id=event_id,
                        device_id=str(payload.get("device_id", "")),
                        transcript_hint=str(payload.get("transcript", "")),
                        request_headers=self._client_context_headers(),
                    )
                    data["audio_id"] = audio_id
                    data["audio_size_bytes"] = len(audio_bytes)
                    self._send_ok(data)
                    return
    
                if parsed.path == "/api/orders/checkout-preview":
                    payload = self._read_json()
                    table_no = str(payload.get("table_no", "")).strip().upper()
                    if not table_no:
                        raise ApiError("INVALID_INPUT", "table_no is required", HTTPStatus.BAD_REQUEST)
                    self._send_ok(self.server.repo.checkout_preview(table_no=table_no))
                    return
    
                if parsed.path == "/api/tables/select":
                    payload = self._read_json()
                    self._send_ok(
                        self.server.repo.set_selected_table(
                            operator=str(payload.get("operator_id", payload.get("operator", ""))),
                            device_id=str(payload.get("device_id", "")),
                            table_no=str(payload.get("table_no", "")),
                        )
                    )
                    return
    
                if parsed.path == "/api/orders/items/served":
                    payload = self._read_json()
                    self._send_ok(
                        self.server.repo.set_order_item_served(
                            operator=str(payload.get("operator_id", payload.get("operator", ""))),
                            device_id=str(payload.get("device_id", "")),
                            table_no=str(payload.get("table_no", "")),
                            order_item_id=int(payload.get("order_item_id", 0) or 0),
                            served=bool(payload.get("served", False)),
                        )
                    )
                    return

                if parsed.path == "/api/orders/items/remove":
                    payload = self._read_json()
                    self._send_ok(
                        self.server.repo.remove_order_item_by_id(
                            operator=str(payload.get("operator_id", payload.get("operator", ""))),
                            table_no=str(payload.get("table_no", "")),
                            order_item_id=int(payload.get("order_item_id", 0) or 0),
                        )
                    )
                    return
    
                if parsed.path == "/api/orders/checkout-confirm":
                    payload = self._read_json()
                    table_no = str(payload.get("table_no", "")).strip().upper()
                    if not table_no:
                        raise ApiError("INVALID_INPUT", "table_no is required", HTTPStatus.BAD_REQUEST)
                    operator = str(payload.get("operator_id", payload.get("operator", "waiter-A")))
                    event_id = str(payload.get("event_id", ""))
                    device_id = str(payload.get("device_id", ""))
                    data = self.server.repo.checkout_confirm(
                        table_no=table_no,
                        operator=operator,
                        event_id=event_id,
                        device_id=device_id,
                    )
                    self._send_ok(data)
                    return
    
                if parsed.path == "/api/orders/cancel-confirm":
                    payload = self._read_json()
                    table_no = str(payload.get("table_no", "")).strip().upper()
                    if not table_no:
                        raise ApiError("INVALID_INPUT", "table_no is required", HTTPStatus.BAD_REQUEST)
                    operator = str(payload.get("operator_id", payload.get("operator", "waiter-A")))
                    event_id = str(payload.get("event_id", ""))
                    device_id = str(payload.get("device_id", ""))
                    data = self.server.repo.cancel_confirm(
                        table_no=table_no,
                        operator=operator,
                        event_id=event_id,
                        device_id=device_id,
                    )
                    self._send_ok(data)
                    return
    
                if parsed.path == "/api/orders/undo-confirm":
                    payload = self._read_json()
                    table_no = str(payload.get("table_no", "")).strip().upper()
                    if not table_no:
                        raise ApiError("INVALID_INPUT", "table_no is required", HTTPStatus.BAD_REQUEST)
                    operator = str(payload.get("operator_id", payload.get("operator", "waiter-A")))
                    event_id = str(payload.get("event_id", ""))
                    device_id = str(payload.get("device_id", ""))
                    data = self.server.repo.undo_confirm(
                        table_no=table_no,
                        operator=operator,
                        event_id=event_id,
                        device_id=device_id,
                    )
                    self._send_ok(data)
                    return
    
                if parsed.path == "/api/commands/voice":
                    self._ensure_gateway_injected()
                    payload = self._read_json()
                    chain_started_at_ms = int(time() * 1000)
                    data = self.server.repo.process_voice_command(
                        transcript=str(payload.get("transcript", "")),
                        operator=str(payload.get("operator_id", payload.get("operator", "waiter-A"))),
                        event_id=str(payload.get("event_id", "")),
                        device_id=str(payload.get("device_id", "")),
                        request_headers=self._client_context_headers(),
                    )
                    chain_completed_at_ms = int(time() * 1000)
                    if isinstance(data, dict):
                        timing_obj = data.get("timing") if isinstance(data.get("timing"), dict) else {}
                        timing_obj["backend_chain_started_at_ms"] = chain_started_at_ms
                        timing_obj["backend_chain_completed_at_ms"] = chain_completed_at_ms
                        timing_obj["backend_chain_total_ms"] = max(0, chain_completed_at_ms - chain_started_at_ms)
                        data["timing"] = timing_obj
                    self._send_ok(data)
                    return
    
                if parsed.path == "/api/menu/items":
                    payload = self._read_json()
                    harness = RestaurantHarness(self.server.repo.db_path)
                    aliases_raw = payload.get("aliases", [])
                    aliases = aliases_raw if isinstance(aliases_raw, list) else str(aliases_raw).split(",")
                    item = harness.create_menu_item(
                        name=str(payload.get("dish_name", payload.get("name", ""))),
                        category=str(payload.get("category", "")),
                        price_cents=int(payload.get("price_cents", 0)),
                        unit=str(payload.get("unit", "\u4EFD")),
                        aliases=[str(a).strip() for a in aliases if str(a).strip()],
                        operator=str(payload.get("operator_id", payload.get("operator", "waiter-A"))),
                    )
                    self._send_ok(item, HTTPStatus.CREATED)
                    return
    
                if parsed.path == "/api/menu/items/delete":
                    payload = self._read_json()
                    menu_item_id = int(payload.get("menu_item_id", 0))
                    if menu_item_id <= 0:
                        raise ApiError("INVALID_INPUT", "menu_item_id is required", HTTPStatus.BAD_REQUEST)
                    operator = str(payload.get("operator_id", payload.get("operator", "waiter-A"))).strip() or "waiter-A"
                    harness = RestaurantHarness(self.server.repo.db_path)
                    deleted = harness.delete_menu_item(menu_item_id=menu_item_id, operator=operator)
                    if bool(deleted.get("already_deleted", False)):
                        raise ApiError("INVALID_STATE", f"menu_item_id={menu_item_id} not available", HTTPStatus.BAD_REQUEST)
                    lexicon = harness.refresh_lexicon(operator=operator, note="menu delete via long press")
                    self._send_ok(
                        {
                            "menu_item_id": int(deleted.get("menu_item_id", 0)),
                            "dish_name": str(deleted.get("name", "")),
                            "category": str(deleted.get("category", "")),
                            "price_cents": int(deleted.get("price_cents", 0)),
                            "deleted": bool(deleted.get("deleted", False)),
                            "lexicon_version": str(lexicon.get("version", "")),
                        }
                    )
                    return
    
                if parsed.path == "/api/menu/commands/voice":
                    self._ensure_gateway_injected()
                    payload = self._read_json()
                    data = self.server.repo.process_menu_voice_command(
                        transcript=str(payload.get("transcript", "")),
                        operator=str(payload.get("operator_id", payload.get("operator", "waiter-A"))),
                        event_id=str(payload.get("event_id", "")),
                        device_id=str(payload.get("device_id", "")),
                        request_headers=self._client_context_headers(),
                    )
                    self._send_ok(data)
                    return

                if parsed.path == "/api/menu/i18n-map":
                    self._ensure_gateway_injected()
                    payload = self._read_json()
                    raw_ids = payload.get("menu_item_ids", [])
                    item_ids = raw_ids if isinstance(raw_ids, list) else []
                    data = self.server.repo.process_menu_i18n_map(
                        target_language=str(payload.get("target_language", "")),
                        menu_item_ids=item_ids,
                        request_headers=self._client_context_headers(),
                    )
                    self._send_ok(data)
                    return

                if parsed.path == "/api/order-notes/i18n-map":
                    self._ensure_gateway_injected()
                    payload = self._read_json()
                    raw_notes = payload.get("notes", [])
                    note_items = raw_notes if isinstance(raw_notes, list) else []
                    data = self.server.repo.process_order_note_i18n_map(
                        target_language=str(payload.get("target_language", "")),
                        notes=note_items,
                        request_headers=self._client_context_headers(),
                    )
                    self._send_ok(data)
                    return

                if parsed.path == "/api/menu/ocr/parse":
                    self._ensure_gateway_injected()
                    payload = self._read_json()
                    raw_timeout = payload.get("ocr_timeout_seconds", None)
                    timeout_value: float | None
                    if raw_timeout in (None, ""):
                        timeout_value = None
                    else:
                        try:
                            timeout_value = float(raw_timeout)
                        except (TypeError, ValueError) as exc:
                            raise ApiError(
                                "INVALID_INPUT",
                                "ocr_timeout_seconds must be a number",
                                HTTPStatus.BAD_REQUEST,
                            ) from exc
                    data = self.server.repo.process_menu_image_parse(
                        image_base64=str(payload.get("image_base64", "")),
                        mime_type=str(payload.get("mime_type", "image/jpeg")),
                        operator=str(payload.get("operator_id", payload.get("operator", "waiter-A"))),
                        event_id=str(payload.get("event_id", "")),
                        device_id=str(payload.get("device_id", "")),
                        ocr_model=str(payload.get("ocr_model", "")),
                        ocr_timeout_seconds=timeout_value,
                        request_headers=self._client_context_headers(),
                    )
                    self._send_ok(data)
                    return

                if parsed.path == "/api/menu/ocr/import":
                    self._ensure_gateway_injected()
                    payload = self._read_json()
                    records_payload = payload.get("records")
                    records_value = records_payload if isinstance(records_payload, list) else None
                    raw_timeout = payload.get("ocr_timeout_seconds", None)
                    timeout_value: float | None
                    if raw_timeout in (None, ""):
                        timeout_value = None
                    else:
                        try:
                            timeout_value = float(raw_timeout)
                        except (TypeError, ValueError) as exc:
                            raise ApiError(
                                "INVALID_INPUT",
                                "ocr_timeout_seconds must be a number",
                                HTTPStatus.BAD_REQUEST,
                            ) from exc
                    data = self.server.repo.process_menu_image_import(
                        image_base64=str(payload.get("image_base64", "")),
                        mime_type=str(payload.get("mime_type", "image/jpeg")),
                        operator=str(payload.get("operator_id", payload.get("operator", "waiter-A"))),
                        event_id=str(payload.get("event_id", "")),
                        device_id=str(payload.get("device_id", "")),
                        ocr_model=str(payload.get("ocr_model", "")),
                        ocr_timeout_seconds=timeout_value,
                        records=records_value,
                        request_headers=self._client_context_headers(),
                    )
                    self._send_ok(data)
                    return

                if parsed.path == "/api/menu/items/voice-draft":
                    self._ensure_gateway_injected()
                    payload = self._read_json()
                    draft = str(payload.get("transcript", "")).strip()
                    parsed_bundle = self.server.repo._parse_menu_voice_entries(
                        transcript=draft,
                        harness=RestaurantHarness(self.server.repo.db_path),
                        request_headers=self._client_context_headers(),
                    )
                    records = list(parsed_bundle.get("records", []))
                    if not records:
                        raise ApiError("INVALID_INPUT", "菜品语音内容无法解析，请补充完整指令", HTTPStatus.BAD_REQUEST)
                    primary = dict(records[0])
                    primary["records"] = records
                    primary["parse_mode"] = (
                        str(parsed_bundle.get("parse_mode", primary.get("parse_mode", ""))).strip()
                        or str(primary.get("parse_mode", ""))
                    )
                    self._send_ok(primary)
                    return
    
                if parsed.path == "/api/menu/lexicon/refresh":
                    payload = self._read_json()
                    operator = str(payload.get("operator_id", payload.get("operator", "waiter-A")))
                    note = str(payload.get("note", "manual refresh"))
                    harness = RestaurantHarness(self.server.repo.db_path)
                    self._send_ok(harness.refresh_lexicon(operator=operator, note=note))
                    return
    
                if parsed.path == "/api/stats/config":
                    payload = self._read_json()
                    self._send_ok(self.server.repo.update_stats_config(payload))
                    return
    
                if parsed.path == "/api/settings/table-numbering":
                    payload = self._read_json()
                    self._send_ok(self.server.repo.update_table_numbering_config(payload))
                    return

                if parsed.path == "/api/settings/menu/clear-all":
                    payload = self._read_json()
                    operator = str(payload.get("operator_id", payload.get("operator", "waiter-A"))).strip() or "waiter-A"
                    self._send_ok(self.server.repo.clear_all_menu_items(operator=operator))
                    return

                if parsed.path == "/api/settings/tables/clear-open":
                    payload = self._read_json()
                    operator = str(payload.get("operator_id", payload.get("operator", "waiter-A"))).strip() or "waiter-A"
                    self._send_ok(self.server.repo.clear_all_open_tables(operator=operator))
                    return

                if parsed.path == "/api/settings/takeout-numbering/reset":
                    payload = self._read_json()
                    operator = str(payload.get("operator_id", payload.get("operator", "waiter-A"))).strip() or "waiter-A"
                    self._send_ok(self.server.repo.reset_takeout_numbering(operator=operator))
                    return

                if parsed.path == "/api/runtime/account-scope":
                    payload = self._read_json()
                    account_key = str(payload.get("account_key", "guest")).strip()
                    self._send_ok(self.server.repo.switch_runtime_account_scope(account_key))
                    return

                if parsed.path == "/api/sessions":
                    self._ensure_gateway_injected()
                    payload = self._read_json()
                    session_data = self.server.repo.create_session(
                        table_id=int(payload.get("table_id", 1)),
                        operator=str(payload.get("operator", "waiter-A")),
                        request_headers=self._client_context_headers(),
                    )
                    self._send_ok(session_data, HTTPStatus.CREATED)
                    return
    
                if parsed.path.endswith("/start-speaking"):
                    session_id = self._session_id_from_path(parsed.path, "start-speaking")
                    session = self.server.repo.get_session(session_id)
                    session.customer_start_speaking()
                    self._send_ok(self.server.repo.serialize(session_id, session))
                    return
    
                if parsed.path.endswith("/voice-chunks"):
                    session_id = self._session_id_from_path(parsed.path, "voice-chunks")
                    payload = self._read_json()
                    session = self.server.repo.get_session(session_id)
                    session.append_voice_chunk(str(payload.get("text", "")))
                    self._send_ok(self.server.repo.serialize(session_id, session))
                    return
    
                if parsed.path.endswith("/audio"):
                    session_id = self._session_id_from_path(parsed.path, "audio")
                    payload = self._read_json()
                    session = self.server.repo.get_session(session_id)
                    audio_base64 = str(payload.get("audio_base64", ""))
                    mime_type = str(payload.get("mime_type", "audio/webm"))
                    transcript_hint = str(payload.get("transcript", "")).strip()
                    audio_bytes = self._decode_audio(audio_base64)
                    extension = self._ext_from_mime_type(mime_type)
                    audio_id = self.server.repo.save_audio_upload(session_id, audio_bytes, extension)
                    tx = self.server.repo.transcription_provider.transcribe(
                        audio_bytes=audio_bytes,
                        mime_type=mime_type,
                        manual_transcript=transcript_hint,
                    )
                    session.append_voice_chunk(tx.transcript)
                    data = self.server.repo.serialize(session_id, session)
                    data["audio_id"] = audio_id
                    data["audio_size_bytes"] = len(audio_bytes)
                    data["transcript"] = tx.transcript
                    data["transcription_provider"] = tx.provider
                    self._send_ok(data)
                    return
    
                if parsed.path.endswith("/done"):
                    session_id = self._session_id_from_path(parsed.path, "done")
                    session = self.server.repo.get_session(session_id)
                    session.customer_press_done()
                    self._send_ok(self.server.repo.serialize(session_id, session))
                    return
    
                if parsed.path.endswith("/parse"):
                    self._ensure_gateway_injected()
                    session_id = self._session_id_from_path(parsed.path, "parse")
                    session = self.server.repo.get_session(session_id)
                    readback = session.agent_parse_and_readback()
                    data = self.server.repo.serialize(session_id, session)
                    data["readback_text"] = readback
                    self._send_ok(data)
                    return
    
                if parsed.path.endswith("/confirm"):
                    session_id = self._session_id_from_path(parsed.path, "confirm")
                    session = self.server.repo.get_session(session_id)
                    order_id = session.customer_press_confirm_menu()
                    data = self.server.repo.serialize(session_id, session)
                    data["order_id"] = order_id
                    self._send_ok(data)
                    return
    
                if parsed.path.endswith("/items"):
                    session_id = self._session_id_from_path(parsed.path, "items")
                    payload = self._read_json()
                    session = self.server.repo.get_session(session_id)
                    session.add_item_in_service_mode(
                        menu_item_id=int(payload["menu_item_id"]),
                        qty=int(payload.get("qty", 1)),
                    )
                    self._send_ok(self.server.repo.serialize(session_id, session))
                    return
    
                if parsed.path.endswith("/bill-preview"):
                    session_id = self._session_id_from_path(parsed.path, "bill-preview")
                    session = self.server.repo.get_session(session_id)
                    self._send_ok(session.query_bill_preview())
                    return
    
                if parsed.path.endswith("/notify"):
                    session_id = self._session_id_from_path(parsed.path, "notify")
                    payload = self._read_json()
                    session = self.server.repo.get_session(session_id)
                    message = session.notify_waiter(str(payload.get("message", "call waiter")))
                    self._send_ok({"message": message})
                    return
    
                if parsed.path.endswith("/bill-sync"):
                    session_id = self._session_id_from_path(parsed.path, "bill-sync")
                    payload = self._read_json()
                    session = self.server.repo.get_session(session_id)
                    data = session.sync_bill_to_device(str(payload.get("target_device_id", "cashier-pad-1")))
                    self._send_ok(data)
                    return

                raise ApiError("NOT_FOUND", f"unknown path: {parsed.path}", HTTPStatus.NOT_FOUND)
            except ValueError as exc:
                self._send_error_json("INVALID_STATE", str(exc), HTTPStatus.BAD_REQUEST)
            except TranscriptionError as exc:
                self._send_error_json(exc.code, exc.message, HTTPStatus.BAD_REQUEST)
            except ApiError as exc:
                self._send_error_json(exc.code, exc.message, exc.status)
            except Exception as exc:  # noqa: BLE001
                self._send_error_json("INTERNAL_ERROR", f"internal error: {str(exc)}", HTTPStatus.INTERNAL_SERVER_ERROR)

    def log_message(self, format: str, *args: Any) -> None:
        return

    def _handle_get_session(self, path: str) -> None:
        try:
            session_id = self._session_id_from_path(path)
            self._send_ok(self.server.repo.serialize(session_id))
        except ApiError as exc:
            self._send_error_json(exc.code, exc.message, exc.status)

    def _read_json(self) -> dict[str, Any]:
        content_length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(content_length) if content_length else b"{}"
        try:
            return json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError as exc:
            raise ApiError("INVALID_INPUT", "request body must be valid JSON") from exc

    @staticmethod
    def _parse_menu_voice_draft(transcript: str) -> dict[str, Any]:
        try:
            return SessionRepository._parse_menu_voice_draft_relaxed(transcript)
        except ValueError as exc:
            raise ApiError("INVALID_INPUT", str(exc), HTTPStatus.BAD_REQUEST) from exc

    def _session_id_from_path(self, path: str, tail: str | None = None) -> str:
        parts = [part for part in path.split("/") if part]
        if len(parts) < 3 or parts[0] != "api" or parts[1] != "sessions":
            raise ApiError("NOT_FOUND", f"invalid path: {path}", HTTPStatus.NOT_FOUND)
        if tail is not None and parts[-1] != tail:
            raise ApiError("NOT_FOUND", f"invalid path: {path}", HTTPStatus.NOT_FOUND)
        return parts[2]

    def _decode_audio(self, audio_base64: str) -> bytes:
        if not audio_base64:
            raise ApiError("INVALID_INPUT", "audio_base64 is required", HTTPStatus.BAD_REQUEST)
        try:
            return base64.b64decode(audio_base64, validate=True)
        except (ValueError, binascii.Error) as exc:
            raise ApiError("INVALID_INPUT", "audio_base64 is invalid", HTTPStatus.BAD_REQUEST) from exc

    @staticmethod
    def _ext_from_mime_type(mime_type: str) -> str:
        mapping = {
            "audio/webm": "webm",
            "audio/wav": "wav",
            "audio/mp4": "m4a",
            "audio/mpeg": "mp3",
            "audio/ogg": "ogg",
        }
        return mapping.get(mime_type.lower(), "bin")

    def _serve_static(self, path: str) -> None:
        rel = "index.html" if path in {"/", ""} else path.lstrip("/")
        file_path = (WEB_ROOT / rel).resolve()
        if WEB_ROOT.resolve() not in file_path.parents and file_path != WEB_ROOT.resolve():
            self.send_error(HTTPStatus.FORBIDDEN)
            return
        if not file_path.exists() or file_path.is_dir():
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        content_type = {
            ".html": "text/html; charset=utf-8",
            ".js": "application/javascript; charset=utf-8",
            ".css": "text/css; charset=utf-8",
        }.get(file_path.suffix.lower(), "application/octet-stream")
        data = file_path.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _proxy_kls_request(self, parsed, method: str) -> None:
        raw_base = str(self.headers.get("X-KLS-Base-Url", "")).strip()
        if not raw_base:
            raise ApiError("INVALID_INPUT", "missing X-KLS-Base-Url", HTTPStatus.BAD_REQUEST)
        normalized_base = raw_base.rstrip("/")
        if not re.match(r"^https?://", normalized_base, flags=re.IGNORECASE):
            raise ApiError("INVALID_INPUT", "invalid X-KLS-Base-Url", HTTPStatus.BAD_REQUEST)

        suffix = parsed.path[len(self._KLS_PROXY_PREFIX) :]
        upstream_path = suffix if suffix.startswith("/") else f"/{suffix}"
        upstream_url = f"{normalized_base}{upstream_path}"
        if parsed.query:
            upstream_url = f"{upstream_url}?{parsed.query}"

        body: bytes | None = None
        if method.upper() in {"POST", "PUT", "PATCH"}:
            content_length = int(self.headers.get("Content-Length", "0") or "0")
            body = self.rfile.read(content_length) if content_length > 0 else b""

        forward_headers: dict[str, str] = {}
        for header_name in (
            "Authorization",
            "Content-Type",
            "X-Client-Platform",
            "X-App-Version-Code",
            "X-Device-Id",
            "X-App-Id",
            "X-Timestamp",
            "X-Nonce",
            "X-Signature",
            "X-Idempotency-Key",
        ):
            value = str(self.headers.get(header_name, "")).strip()
            if value:
                forward_headers[header_name] = value

        request = Request(
            upstream_url,
            data=body if body is not None else None,
            headers=forward_headers,
            method=method.upper(),
        )
        try:
            with closing(urlopen(request, timeout=20)) as response:
                status = HTTPStatus(response.getcode())
                payload = response.read()
                content_type = str(response.headers.get("Content-Type", "application/json; charset=utf-8")).strip()
                self._send_raw(payload, status=status, content_type=content_type)
                return
        except HTTPError as exc:
            payload = exc.read() if hasattr(exc, "read") else b""
            content_type = str(exc.headers.get("Content-Type", "application/json; charset=utf-8")).strip() if exc.headers else "application/json; charset=utf-8"
            self._send_raw(payload, status=HTTPStatus(exc.code), content_type=content_type)
            return
        except URLError as exc:
            raise ApiError("UPSTREAM_UNREACHABLE", f"kls proxy failed: {str(exc.reason or exc)}", HTTPStatus.BAD_GATEWAY) from exc

    def _send_raw(self, payload: bytes, status: HTTPStatus, content_type: str = "application/json; charset=utf-8") -> None:
        data = payload if isinstance(payload, (bytes, bytearray)) else bytes(payload or b"")
        self.send_response(status)
        self._send_cors_headers()
        self.send_header("Content-Type", content_type or "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        if data:
            self.wfile.write(data)

    def _send_ok(self, data: dict[str, Any], status: HTTPStatus = HTTPStatus.OK) -> None:
        self._send_json({"ok": True, "data": data}, status)

    def _send_error_json(self, code: str, message: str, status: HTTPStatus) -> None:
        self._send_json({"ok": False, "error": {"code": code, "message": message}}, status)

    def _send_json(self, payload: dict[str, Any], status: HTTPStatus) -> None:
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self._send_cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _send_cors_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization, X-Gateway-Api-Key, X-Gateway-Base-Url, X-Gateway-Model, X-Client-Platform, X-App-Version-Code, X-Device-Id, X-App-Id, X-Timestamp, X-Nonce, X-Signature, X-Idempotency-Key, X-KLS-Base-Url",
        )

    def _client_context_headers(self) -> dict[str, str]:
        headers: dict[str, str] = {}
        for header_name in ("X-Client-Platform", "X-App-Version-Code", "X-Device-Id"):
            value = str(self.headers.get(header_name, "")).strip()
            if value:
                headers[header_name] = value
        return headers

    def _gateway_override_context(self):
        api_key = str(self.headers.get("X-Gateway-Api-Key", "")).strip()
        base_url = str(self.headers.get("X-Gateway-Base-Url", "")).strip()
        model = str(self.headers.get("X-Gateway-Model", "")).strip()
        return request_gateway_overrides(api_key=api_key, base_url=base_url, model=model)

    def _ensure_gateway_injected(self) -> None:
        api_key = str(self.headers.get("X-Gateway-Api-Key", "")).strip()
        base_url = str(self.headers.get("X-Gateway-Base-Url", "")).strip()
        missing: list[str] = []
        if not api_key:
            missing.append("X-Gateway-Api-Key")
        if not base_url:
            missing.append("X-Gateway-Base-Url")
        if missing:
            raise ApiError(
                "GATEWAY_INJECTION_REQUIRED",
                f"missing headers: {', '.join(missing)}",
                HTTPStatus.UNAUTHORIZED,
            )


class RestaurantApiServer(ThreadingHTTPServer):
    def __init__(self, server_address: tuple[str, int], db_path: Path = DB_PATH, audio_root: Path | None = None):
        super().__init__(server_address, RestaurantApiHandler)
        self.repo = SessionRepository(db_path, audio_root=audio_root)


def build_server(host: str = "127.0.0.1", port: int = 8000, db_path: Path = DB_PATH) -> RestaurantApiServer:
    init_db(db_path=db_path)
    audio_root = db_path.parent / "audio_uploads"
    return RestaurantApiServer((host, port), db_path=db_path, audio_root=audio_root)


def main() -> None:
    server = build_server()
    print("Serving on http://127.0.0.1:8000")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
