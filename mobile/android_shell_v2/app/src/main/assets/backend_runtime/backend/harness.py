from __future__ import annotations

from contextlib import closing
from dataclasses import dataclass
import json
from pathlib import Path
import re
import sqlite3
from typing import Any, Iterable

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "restaurant.db"
TABLE_NO_PATTERN = re.compile(r"^(?:[A-Z]\d+|\d+)$")


@dataclass
class OrderItemInput:
    menu_item_id: int
    qty: int
    note: str = ""


class RestaurantHarness:
    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = db_path
        self._ensure_order_headers_note_column()
        self._ensure_order_items_served_columns()

    def _conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return conn

    def _ensure_order_headers_note_column(self) -> None:
        with closing(self._conn()) as conn:
            columns = {
                str(row["name"]).strip().lower()
                for row in conn.execute("PRAGMA table_info(order_headers)").fetchall()
            }
            if "note" not in columns:
                conn.execute("ALTER TABLE order_headers ADD COLUMN note TEXT NOT NULL DEFAULT ''")
                conn.commit()

    def _ensure_order_items_served_columns(self) -> None:
        with closing(self._conn()) as conn:
            columns = {
                str(row["name"]).strip().lower()
                for row in conn.execute("PRAGMA table_info(order_items)").fetchall()
            }
            changed = False
            if "is_served" not in columns:
                conn.execute("ALTER TABLE order_items ADD COLUMN is_served INTEGER NOT NULL DEFAULT 0")
                changed = True
            if "served_at" not in columns:
                conn.execute("ALTER TABLE order_items ADD COLUMN served_at TEXT")
                changed = True
            if changed:
                conn.commit()

    def get_open_order_items_by_menu_ids(self, table_no: str, menu_item_ids: Iterable[int]) -> list[dict[str, Any]]:
        safe_table_no = self._normalize_table_no(table_no)
        target_ids = sorted({int(menu_item_id) for menu_item_id in menu_item_ids if int(menu_item_id or 0) > 0})
        if not target_ids:
            return []
        placeholders = ",".join("?" for _ in target_ids)
        with closing(self._conn()) as conn:
            rows = conn.execute(
                f"""
                SELECT oi.id, oi.order_id, oi.menu_item_id, oi.item_name, COALESCE(oi.note, '') AS note
                FROM order_items oi
                JOIN order_headers oh ON oh.id = oi.order_id
                JOIN dining_tables dt ON dt.id = oh.table_id
                WHERE UPPER(dt.table_no) = UPPER(?)
                  AND oh.status = 'OPEN'
                  AND oi.menu_item_id IN ({placeholders})
                ORDER BY oi.id ASC
                """,
                (safe_table_no, *target_ids),
            ).fetchall()
        return [
            {
                "order_item_id": int(row["id"]),
                "order_id": int(row["order_id"]),
                "menu_item_id": int(row["menu_item_id"]),
                "item_name": str(row["item_name"] or ""),
                "note": str(row["note"] or ""),
            }
            for row in rows
        ]

    def set_order_item_note(self, order_item_id: int, note: str, operator: str = "system") -> dict[str, Any]:
        safe_item_id = int(order_item_id or 0)
        if safe_item_id <= 0:
            raise ValueError("order_item_id must be positive integer")
        safe_note = str(note or "").strip()
        with closing(self._conn()) as conn:
            row = conn.execute(
                """
                SELECT oi.id, oi.order_id, oh.status, COALESCE(oi.note, '') AS note
                FROM order_items oi
                JOIN order_headers oh ON oh.id = oi.order_id
                WHERE oi.id = ?
                LIMIT 1
                """,
                (safe_item_id,),
            ).fetchone()
            if row is None:
                raise ValueError(f"order_item_id={safe_item_id} not found")
            if str(row["status"] or "").upper() != "OPEN":
                raise ValueError("only OPEN order item can update note")
            previous_note = str(row["note"] or "")
            conn.execute("UPDATE order_items SET note = ? WHERE id = ?", (safe_note, safe_item_id))
            self._log(
                conn,
                int(row["order_id"]),
                "SET_ORDER_ITEM_NOTE",
                operator,
                f"order_item_id={safe_item_id}, previous_note={previous_note}, note={safe_note}",
            )
            conn.commit()
        return {
            "order_item_id": safe_item_id,
            "order_id": int(row["order_id"]),
            "previous_note": previous_note,
            "note": safe_note,
        }

    def create_order(self, table_id: int, items: Iterable[OrderItemInput], operator: str, order_note: str = "") -> int:
        items = list(items)
        if not items:
            raise ValueError("items can not be empty")

        with closing(self._conn()) as conn:
            table_row = conn.execute(
                "SELECT restaurant_id FROM dining_tables WHERE id = ?",
                (table_id,),
            ).fetchone()
            if table_row is None:
                raise ValueError(f"table_id={table_id} not found")

            restaurant_id = table_row["restaurant_id"]
            order_id = conn.execute(
                "INSERT INTO order_headers(restaurant_id, table_id, created_by, note) VALUES (?, ?, ?, ?)",
                (restaurant_id, table_id, operator, str(order_note or "").strip()),
            ).lastrowid

            for item in items:
                self._insert_order_item(conn, order_id, item)

            self._log(conn, order_id, "CREATE_ORDER", operator, f"items={len(items)}")
            conn.commit()
            return order_id

    def get_table_by_no(self, table_no: str) -> dict | None:
        with closing(self._conn()) as conn:
            row = conn.execute(
                """
                SELECT id, restaurant_id, table_no, status
                FROM dining_tables
                WHERE UPPER(table_no) = UPPER(?)
                ORDER BY id DESC
                LIMIT 1
                """,
                (table_no,),
            ).fetchone()
            if row is None:
                return None
            return {
                "id": row["id"],
                "restaurant_id": row["restaurant_id"],
                "table_no": row["table_no"],
                "status": row["status"],
            }

    def generate_next_table_no(self) -> str:
        with closing(self._conn()) as conn:
            count = conn.execute("SELECT COUNT(1) AS c FROM dining_tables").fetchone()["c"]
        return f"T{count + 1:03d}"

    def get_or_create_table(self, table_no: str, operator: str, capacity: int = 4) -> dict:
        safe_table_no = self._normalize_table_no(table_no)
        table = self.get_table_by_no(safe_table_no)
        if table is not None:
            return table
        with closing(self._conn()) as conn:
            restaurant = conn.execute("SELECT id FROM restaurants ORDER BY id LIMIT 1").fetchone()
            if restaurant is None:
                rid = conn.execute("INSERT INTO restaurants(name) VALUES ('Voice BBQ')").lastrowid
            else:
                rid = restaurant["id"]
            table_id = conn.execute(
                "INSERT INTO dining_tables(restaurant_id, table_no, capacity, status) VALUES (?, ?, ?, 'OPEN')",
                (rid, safe_table_no, capacity),
            ).lastrowid
            self._log(conn, None, "OPEN_TABLE", operator, f"table_no={safe_table_no}")
            conn.commit()
        return {"id": table_id, "restaurant_id": rid, "table_no": safe_table_no, "status": "OPEN"}

    @staticmethod
    def _normalize_table_no(table_no: str) -> str:
        safe = str(table_no or "").strip().upper()
        if not safe:
            raise ValueError("table_no is required")
        if not TABLE_NO_PATTERN.fullmatch(safe):
            raise ValueError("table_no format is invalid, only letter+digits or digits are allowed")
        return safe

    def set_table_status(self, table_id: int, status: str) -> None:
        with closing(self._conn()) as conn:
            conn.execute("UPDATE dining_tables SET status = ? WHERE id = ?", (status, table_id))
            conn.commit()

    def get_open_order_id_by_table(self, table_id: int) -> int | None:
        with closing(self._conn()) as conn:
            row = conn.execute(
                "SELECT id FROM order_headers WHERE table_id = ? AND status = 'OPEN' ORDER BY id DESC LIMIT 1",
                (table_id,),
            ).fetchone()
        if row is None:
            return None
        return int(row["id"])

    def remove_last_order_items(self, order_id: int, count: int, operator: str = "system") -> int:
        if count <= 0:
            return 0
        with closing(self._conn()) as conn:
            rows = conn.execute(
                "SELECT id FROM order_items WHERE order_id = ? ORDER BY id DESC LIMIT ?",
                (order_id, count),
            ).fetchall()
            ids = [int(row["id"]) for row in rows]
            for item_id in ids:
                conn.execute("DELETE FROM order_items WHERE id = ?", (item_id,))
            if ids:
                self._log(conn, order_id, "UNDO_ITEMS", operator, f"removed={len(ids)}")
            conn.commit()
        return len(ids)

    def remove_order_items(
        self,
        order_id: int,
        items: Iterable[OrderItemInput],
        operator: str = "system",
    ) -> dict[str, Any]:
        requested: dict[int, int] = {}
        for item in list(items):
            menu_item_id = int(getattr(item, "menu_item_id", 0))
            qty = int(getattr(item, "qty", 0))
            if menu_item_id <= 0 or qty <= 0:
                continue
            requested[menu_item_id] = requested.get(menu_item_id, 0) + qty

        if not requested:
            return {"removed_items": [], "removed_total_qty": 0}

        with closing(self._conn()) as conn:
            status_row = conn.execute(
                "SELECT status FROM order_headers WHERE id = ?",
                (order_id,),
            ).fetchone()
            if status_row is None:
                raise ValueError(f"order_id={order_id} not found")
            if str(status_row["status"]).upper() != "OPEN":
                raise ValueError("only OPEN order can remove item")

            removed_items: list[dict[str, int]] = []
            removed_total_qty = 0
            for menu_item_id, want_qty in requested.items():
                rows = conn.execute(
                    """
                    SELECT id, qty
                    FROM order_items
                    WHERE order_id = ? AND menu_item_id = ?
                    ORDER BY id DESC
                    """,
                    (order_id, menu_item_id),
                ).fetchall()
                remaining = want_qty
                removed_qty = 0
                for row in rows:
                    if remaining <= 0:
                        break
                    item_id = int(row["id"])
                    row_qty = int(row["qty"])
                    if row_qty <= remaining:
                        conn.execute("DELETE FROM order_items WHERE id = ?", (item_id,))
                        removed_qty += row_qty
                        remaining -= row_qty
                    else:
                        new_qty = row_qty - remaining
                        conn.execute("UPDATE order_items SET qty = ? WHERE id = ?", (new_qty, item_id))
                        removed_qty += remaining
                        remaining = 0

                if removed_qty > 0:
                    removed_items.append(
                        {
                            "menu_item_id": int(menu_item_id),
                            "requested_qty": int(want_qty),
                            "removed_qty": int(removed_qty),
                        }
                    )
                    removed_total_qty += removed_qty

            if removed_total_qty > 0:
                conn.execute(
                    "UPDATE order_headers SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                    (order_id,),
                )
                self._log(
                    conn,
                    order_id,
                    "REMOVE_ITEM",
                    operator,
                    json.dumps({"removed_items": removed_items}, ensure_ascii=False),
                )
            conn.commit()

        return {"removed_items": removed_items, "removed_total_qty": int(removed_total_qty)}

    def cancel_open_order(self, order_id: int, operator: str = "system") -> bool:
        with closing(self._conn()) as conn:
            row = conn.execute("SELECT status FROM order_headers WHERE id = ?", (order_id,)).fetchone()
            if row is None or str(row["status"]).upper() != "OPEN":
                return False
            conn.execute(
                "UPDATE order_headers SET status = 'CANCELED', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (order_id,),
            )
            self._log(conn, order_id, "CANCEL_ORDER", operator, "canceled_open_order")
            conn.commit()
        return True

    def delete_open_order(self, order_id: int, operator: str = "system") -> bool:
        with closing(self._conn()) as conn:
            row = conn.execute("SELECT status FROM order_headers WHERE id = ?", (order_id,)).fetchone()
            if row is None or row["status"] != "OPEN":
                return False
            conn.execute("DELETE FROM order_items WHERE order_id = ?", (order_id,))
            conn.execute("DELETE FROM order_headers WHERE id = ?", (order_id,))
            self._log(conn, order_id, "UNDO_DELETE_ORDER", operator, "deleted_open_order")
            conn.commit()
        return True

    def get_menu_alias_map(self) -> dict[str, int]:
        with closing(self._conn()) as conn:
            rows = conn.execute("SELECT id, name FROM menu_items WHERE is_available = 1").fetchall()
            alias_rows = conn.execute(
                """
                SELECT ma.alias, ma.menu_item_id
                FROM menu_aliases ma
                INNER JOIN menu_items mi ON mi.id = ma.menu_item_id
                WHERE mi.is_available = 1
                """
            ).fetchall()
        mapping = {str(row["name"]).strip(): int(row["id"]) for row in rows if str(row["name"]).strip()}
        for row in alias_rows:
            alias = str(row["alias"]).strip()
            if alias:
                mapping[alias] = int(row["menu_item_id"])
        return mapping

    def list_menu_items(self) -> list[dict]:
        with closing(self._conn()) as conn:
            rows = conn.execute(
                """
                SELECT
                    mi.id,
                    mi.name,
                    mi.category,
                    mi.price_cents,
                    mi.is_available,
                    COALESCE(GROUP_CONCAT(ma.alias, ','), '') AS aliases
                FROM menu_items mi
                LEFT JOIN menu_aliases ma ON ma.menu_item_id = mi.id
                GROUP BY mi.id, mi.name, mi.category, mi.price_cents, mi.is_available
                ORDER BY mi.id DESC
                """
            ).fetchall()
        result: list[dict] = []
        for row in rows:
            aliases = [alias.strip() for alias in str(row["aliases"] or "").split(",") if alias.strip()]
            result.append(
                {
                    "menu_item_id": int(row["id"]),
                    "name": str(row["name"]),
                    "category": str(row["category"]),
                    "price_cents": int(row["price_cents"]),
                    "is_available": int(row["is_available"]) == 1,
                    "aliases": aliases,
                }
            )
        return result

    def create_menu_item(
        self,
        name: str,
        category: str,
        price_cents: int,
        unit: str = "份",
        aliases: list[str] | None = None,
        operator: str = "system",
    ) -> dict:
        if not name.strip():
            raise ValueError("name is required")
        if price_cents <= 0:
            raise ValueError("price_cents must be positive")
        aliases = aliases or []
        with closing(self._conn()) as conn:
            rid = self._ensure_restaurant(conn)
            menu_item_id = conn.execute(
                "INSERT INTO menu_items(restaurant_id, name, category, price_cents) VALUES (?, ?, ?, ?)",
                (rid, name.strip(), category.strip() or "未分类", price_cents),
            ).lastrowid
            for alias in aliases:
                alias_text = alias.strip()
                if not alias_text:
                    continue
                conn.execute(
                    "INSERT INTO menu_aliases(menu_item_id, alias) VALUES (?, ?)",
                    (menu_item_id, alias_text),
                )
            self._log(conn, None, "MENU_ADD", operator, f"menu_item_id={menu_item_id}, unit={unit}")
            conn.commit()
        return {"menu_item_id": int(menu_item_id), "name": name.strip(), "category": category.strip(), "price_cents": price_cents, "unit": unit}

    def find_menu_items_by_name_or_alias(self, token: str, available_only: bool = True) -> list[dict]:
        text = str(token or "").strip()
        if not text:
            return []
        where = ["(UPPER(mi.name) = UPPER(?) OR UPPER(ma.alias) = UPPER(?))"]
        params: list[Any] = [text, text]
        if available_only:
            where.append("mi.is_available = 1")
        sql = f"""
            SELECT
                mi.id,
                mi.name,
                mi.category,
                mi.price_cents,
                mi.is_available
            FROM menu_items mi
            LEFT JOIN menu_aliases ma ON ma.menu_item_id = mi.id
            WHERE {' AND '.join(where)}
            GROUP BY mi.id, mi.name, mi.category, mi.price_cents, mi.is_available
            ORDER BY mi.id DESC
        """
        with closing(self._conn()) as conn:
            rows = conn.execute(sql, tuple(params)).fetchall()
        return [
            {
                "menu_item_id": int(row["id"]),
                "name": str(row["name"]),
                "category": str(row["category"]),
                "price_cents": int(row["price_cents"]),
                "is_available": int(row["is_available"]) == 1,
            }
            for row in rows
        ]

    def delete_menu_item(self, menu_item_id: int, operator: str = "system") -> dict:
        safe_id = int(menu_item_id)
        if safe_id <= 0:
            raise ValueError("menu_item_id must be positive")
        with closing(self._conn()) as conn:
            row = conn.execute(
                """
                SELECT id, name, category, price_cents, is_available
                FROM menu_items
                WHERE id = ?
                """,
                (safe_id,),
            ).fetchone()
            if row is None:
                raise ValueError(f"menu_item_id={safe_id} not found")
            already_deleted = int(row["is_available"]) != 1
            if not already_deleted:
                conn.execute(
                    "UPDATE menu_items SET is_available = 0 WHERE id = ?",
                    (safe_id,),
                )
                self._log(conn, None, "MENU_DELETE", operator, f"menu_item_id={safe_id}, name={str(row['name'])}")
                conn.commit()
            return {
                "menu_item_id": int(row["id"]),
                "name": str(row["name"]),
                "category": str(row["category"]),
                "price_cents": int(row["price_cents"]),
                "deleted": not already_deleted,
                "already_deleted": already_deleted,
            }

    def update_menu_item_price(self, menu_item_id: int, price_cents: int, operator: str = "system") -> dict:
        safe_id = int(menu_item_id)
        safe_price = int(price_cents)
        if safe_id <= 0:
            raise ValueError("menu_item_id must be positive")
        if safe_price <= 0:
            raise ValueError("price_cents must be positive")
        with closing(self._conn()) as conn:
            row = conn.execute(
                """
                SELECT id, name, category, price_cents, is_available
                FROM menu_items
                WHERE id = ?
                """,
                (safe_id,),
            ).fetchone()
            if row is None:
                raise ValueError(f"menu_item_id={safe_id} not found")
            if int(row["is_available"]) != 1:
                raise ValueError(f"menu_item_id={safe_id} unavailable")

            previous_price = int(row["price_cents"])
            changed = previous_price != safe_price
            if changed:
                conn.execute(
                    "UPDATE menu_items SET price_cents = ? WHERE id = ?",
                    (safe_price, safe_id),
                )
                self._log(
                    conn,
                    None,
                    "MENU_EDIT",
                    operator,
                    f"menu_item_id={safe_id}, old_price_cents={previous_price}, new_price_cents={safe_price}",
                )
                conn.commit()
            return {
                "menu_item_id": int(row["id"]),
                "name": str(row["name"]),
                "category": str(row["category"]),
                "old_price_cents": previous_price,
                "new_price_cents": safe_price,
                "updated": changed,
            }

    def update_menu_item_category(self, menu_item_id: int, new_category: str, operator: str = "system") -> dict:
        safe_id = int(menu_item_id)
        category_text = str(new_category or "").strip()
        if safe_id <= 0:
            raise ValueError("menu_item_id must be positive")
        if not category_text:
            raise ValueError("new_category is required")
        with closing(self._conn()) as conn:
            row = conn.execute(
                """
                SELECT id, name, category, price_cents, is_available
                FROM menu_items
                WHERE id = ?
                """,
                (safe_id,),
            ).fetchone()
            if row is None:
                raise ValueError(f"menu_item_id={safe_id} not found")
            if int(row["is_available"]) != 1:
                raise ValueError(f"menu_item_id={safe_id} unavailable")

            old_category = str(row["category"])
            changed = old_category.strip().lower() != category_text.strip().lower()
            if changed:
                conn.execute(
                    "UPDATE menu_items SET category = ? WHERE id = ?",
                    (category_text, safe_id),
                )
                self._log(
                    conn,
                    None,
                    "MENU_EDIT",
                    operator,
                    f"menu_item_id={safe_id}, old_category={old_category}, new_category={category_text}",
                )
                conn.commit()
            return {
                "menu_item_id": int(row["id"]),
                "name": str(row["name"]),
                "old_category": old_category,
                "new_category": category_text,
                "updated": changed,
            }

    def rename_menu_category(self, old_category: str, new_category: str, operator: str = "system") -> dict:
        old_text = str(old_category or "").strip()
        new_text = str(new_category or "").strip()
        if not old_text:
            raise ValueError("old_category is required")
        if not new_text:
            raise ValueError("new_category is required")
        if old_text.lower() == new_text.lower():
            return {
                "old_category": old_text,
                "new_category": new_text,
                "matched_count": 0,
                "updated_count": 0,
            }

        with closing(self._conn()) as conn:
            matched = conn.execute(
                """
                SELECT COUNT(1) AS c
                FROM menu_items
                WHERE UPPER(TRIM(category)) = UPPER(TRIM(?))
                """,
                (old_text,),
            ).fetchone()
            matched_count = int(matched["c"]) if matched else 0
            if matched_count <= 0:
                raise ValueError(f"category={old_text} not found")

            cursor = conn.execute(
                """
                UPDATE menu_items
                SET category = ?
                WHERE UPPER(TRIM(category)) = UPPER(TRIM(?))
                """,
                (new_text, old_text),
            )
            updated_count = int(cursor.rowcount or 0)
            if updated_count > 0:
                self._log(
                    conn,
                    None,
                    "MENU_RENAME_CATEGORY",
                    operator,
                    f"old_category={old_text}, new_category={new_text}, updated_count={updated_count}",
                )
                conn.commit()
            return {
                "old_category": old_text,
                "new_category": new_text,
                "matched_count": matched_count,
                "updated_count": updated_count,
            }

    def refresh_lexicon(self, operator: str, note: str = "") -> dict:
        with closing(self._conn()) as conn:
            version = conn.execute("SELECT COUNT(1) AS c FROM lexicon_versions").fetchone()["c"] + 1
            version_name = f"v{version}"
            conn.execute(
                "INSERT INTO lexicon_versions(version, updated_by, note) VALUES (?, ?, ?)",
                (version_name, operator, note),
            )
            conn.commit()
        return {"version": version_name}

    def profit_today(self) -> dict:
        with closing(self._conn()) as conn:
            cents = conn.execute(
                """
                SELECT COALESCE(SUM(total_cents), 0) AS total
                FROM bills
                WHERE DATE(generated_at, 'localtime') = DATE('now', 'localtime')
                """
            ).fetchone()["total"]
        return {"total_cents": int(cents), "currency": "CNY"}

    def profit_current(self) -> dict:
        # 当前盈利先与今日口径一致，后续可按营业时段切分。
        return self.profit_today()

    def profit_weekly(self) -> list[dict]:
        with closing(self._conn()) as conn:
            rows = conn.execute(
                """
                SELECT DATE(generated_at, 'localtime') AS d, COALESCE(SUM(total_cents), 0) AS total
                FROM bills
                WHERE DATE(generated_at, 'localtime') >= DATE('now', 'localtime', '-6 day')
                GROUP BY DATE(generated_at, 'localtime')
                ORDER BY d ASC
                """
            ).fetchall()
        return [{"label": str(row["d"]), "total_cents": int(row["total"])} for row in rows]

    def profit_monthly(self) -> list[dict]:
        with closing(self._conn()) as conn:
            rows = conn.execute(
                """
                SELECT STRFTIME('%Y-%W', generated_at, 'localtime') AS bucket, COALESCE(SUM(total_cents), 0) AS total
                FROM bills
                WHERE DATE(generated_at, 'localtime') >= DATE('now', 'localtime', '-90 day')
                GROUP BY bucket
                ORDER BY bucket ASC
                """
            ).fetchall()
        return [{"label": str(row["bucket"]), "total_cents": int(row["total"])} for row in rows]

    def profit_this_week(self) -> dict:
        with closing(self._conn()) as conn:
            cents = conn.execute(
                """
                SELECT COALESCE(SUM(total_cents), 0) AS total
                FROM bills
                WHERE STRFTIME('%Y-%W', generated_at, 'localtime') = STRFTIME('%Y-%W', 'now', 'localtime')
                """
            ).fetchone()["total"]
        return {"total_cents": int(cents), "currency": "CNY"}

    def profit_this_month(self) -> dict:
        with closing(self._conn()) as conn:
            cents = conn.execute(
                """
                SELECT COALESCE(SUM(total_cents), 0) AS total
                FROM bills
                WHERE STRFTIME('%Y-%m', generated_at, 'localtime') = STRFTIME('%Y-%m', 'now', 'localtime')
                """
            ).fetchone()["total"]
        return {"total_cents": int(cents), "currency": "CNY"}

    def open_orders_subtotal(self) -> int:
        with closing(self._conn()) as conn:
            subtotal = conn.execute(
                """
                SELECT COALESCE(SUM(oi.unit_price_cents * oi.qty), 0) AS subtotal
                FROM order_headers oh
                INNER JOIN order_items oi ON oi.order_id = oh.id
                WHERE oh.status = 'OPEN'
                """
            ).fetchone()["subtotal"]
        return int(subtotal or 0)

    def log_voice_action(
        self,
        operator: str,
        action: str,
        event_id: str,
        device_id: str,
        raw_transcript: str,
        tool_called: list[str] | None = None,
        agent_plan: dict | None = None,
        before_state: dict | None = None,
        after_state: dict | None = None,
        detail: dict | None = None,
    ) -> None:
        payload = {
            "event_id": event_id,
            "device_id": device_id,
            "raw_transcript": raw_transcript,
            "tool_called": tool_called or [],
            "agent_plan": agent_plan or {},
            "before_state": before_state or {},
            "after_state": after_state or {},
            "detail": detail or {},
        }
        with closing(self._conn()) as conn:
            self._log(conn, None, action, operator, json.dumps(payload, ensure_ascii=False))
            conn.commit()

    def list_voice_audit_logs(
        self,
        operator: str = "",
        table_no: str = "",
        limit: int = 100,
    ) -> list[dict]:
        safe_limit = min(max(int(limit or 100), 1), 200)
        where: list[str] = ["action IN ('VOICE_COMMAND', 'CHECKOUT_CONFIRM')"]
        params: list[Any] = []
        if operator.strip():
            where.append("operator = ?")
            params.append(operator.strip())
        if table_no.strip():
            token = table_no.strip().upper()
            where.append("detail LIKE ?")
            params.append(f"%{token}%")
        sql = f"""
            SELECT id, action, operator, detail, created_at
            FROM audit_logs
            WHERE {' AND '.join(where)}
            ORDER BY id DESC
            LIMIT ?
        """
        params.append(safe_limit)
        with closing(self._conn()) as conn:
            rows = conn.execute(sql, tuple(params)).fetchall()
        items: list[dict] = []
        for row in rows:
            raw_detail = str(row["detail"] or "")
            parsed_detail: dict[str, Any] | None = None
            try:
                parsed_detail = json.loads(raw_detail) if raw_detail else None
            except json.JSONDecodeError:
                parsed_detail = {"raw": raw_detail}
            items.append(
                {
                    "id": int(row["id"]),
                    "action": str(row["action"]),
                    "operator": str(row["operator"]),
                    "created_at": str(row["created_at"]),
                    "detail": parsed_detail or {},
                }
            )
        return items

    def list_order_history(
        self,
        table_no: str = "",
        start_at: str = "",
        end_at: str = "",
        limit: int = 50,
    ) -> list[dict]:
        safe_limit = min(max(int(limit or 50), 1), 100)
        where: list[str] = ["oh.status = 'BILLED'"]
        params: list[Any] = []

        if table_no.strip():
            safe_table_no = self._normalize_table_no(table_no)
            where.append("UPPER(dt.table_no) = UPPER(?)")
            params.append(safe_table_no)

        if start_at.strip():
            where.append("DATETIME(b.generated_at, 'localtime') >= DATETIME(?)")
            params.append(start_at.strip().replace("T", " "))

        if end_at.strip():
            where.append("DATETIME(b.generated_at, 'localtime') <= DATETIME(?)")
            params.append(end_at.strip().replace("T", " "))

        sql = f"""
            SELECT
                oh.id AS order_id,
                dt.table_no AS table_no,
                oh.status AS order_status,
                oh.note AS order_note,
                DATETIME(oh.created_at, 'localtime') AS created_at,
                DATETIME(oh.updated_at, 'localtime') AS updated_at,
                DATETIME(b.generated_at, 'localtime') AS billed_at,
                b.subtotal_cents AS subtotal_cents,
                b.total_cents AS total_cents,
                COALESCE(GROUP_CONCAT(oi.item_name || 'x' || oi.qty, ' | '), '') AS menu_summary
            FROM order_headers oh
            INNER JOIN dining_tables dt ON dt.id = oh.table_id
            INNER JOIN bills b ON b.order_id = oh.id
            LEFT JOIN order_items oi ON oi.order_id = oh.id
            WHERE {' AND '.join(where)}
            GROUP BY
                oh.id,
                dt.table_no,
                oh.status,
                oh.note,
                oh.created_at,
                oh.updated_at,
                b.generated_at,
                b.subtotal_cents,
                b.total_cents
            ORDER BY b.generated_at DESC, oh.id DESC
            LIMIT ?
        """
        params.append(safe_limit)
        with closing(self._conn()) as conn:
            rows = conn.execute(sql, tuple(params)).fetchall()
            if not rows:
                return []

            history_items: list[dict] = []
            order_ids: list[int] = []
            for row in rows:
                order_id = int(row["order_id"])
                order_ids.append(order_id)
                history_items.append(
                    {
                        "order_id": order_id,
                        "table_no": str(row["table_no"]),
                        "order_status": str(row["order_status"]),
                        "order_note": str(row["order_note"] or ""),
                        "created_at": str(row["created_at"] or ""),
                        "updated_at": str(row["updated_at"] or ""),
                        "billed_at": str(row["billed_at"] or ""),
                        "subtotal_cents": int(row["subtotal_cents"] or 0),
                        "extra_fee_total_cents": max(
                            int(row["total_cents"] or 0) - int(row["subtotal_cents"] or 0),
                            0,
                        ),
                        "extra_fee_items": [],
                        "total_cents": int(row["total_cents"] or 0),
                        "currency": "CNY",
                        "menu_summary": str(row["menu_summary"] or ""),
                        "items": [],
                    }
                )

            placeholders = ",".join("?" for _ in order_ids)
            item_rows = conn.execute(
                f"""
                SELECT
                    order_id,
                    item_name,
                    qty,
                    unit_price_cents,
                    note,
                    DATETIME(created_at, 'localtime') AS created_at
                FROM order_items
                WHERE order_id IN ({placeholders})
                ORDER BY order_id DESC, id ASC
                """,
                tuple(order_ids),
            ).fetchall()

        by_order_id = {int(row["order_id"]): row for row in history_items}
        for item in item_rows:
            order_id = int(item["order_id"])
            order = by_order_id.get(order_id)
            if order is None:
                continue
            qty = int(item["qty"] or 0)
            unit_price_cents = int(item["unit_price_cents"] or 0)
            order["items"].append(
                {
                    "item_name": str(item["item_name"] or ""),
                    "qty": qty,
                    "unit_price_cents": unit_price_cents,
                    "line_total_cents": unit_price_cents * qty,
                    "note": str(item["note"] or ""),
                    "created_at": str(item["created_at"] or ""),
                }
            )
        return history_items

    def get_active_tables_board(self) -> list[dict]:
        with closing(self._conn()) as conn:
            rows = conn.execute(
                """
                SELECT
                    dt.id AS table_id,
                    dt.table_no AS table_no,
                    oh.id AS order_id,
                    COALESCE(GROUP_CONCAT(oi.item_name || 'x' || oi.qty, ' | '), '') AS menu_summary,
                    COALESCE(SUM(oi.unit_price_cents * oi.qty), 0) AS subtotal_cents
                FROM dining_tables dt
                LEFT JOIN order_headers oh
                    ON oh.table_id = dt.id
                    AND oh.status = 'OPEN'
                LEFT JOIN order_items oi
                    ON oi.order_id = oh.id
                WHERE dt.status = 'OPEN'
                GROUP BY dt.id, dt.table_no, oh.id
                ORDER BY dt.table_no ASC
                """
            ).fetchall()
        return [
            {
                "table_id": int(row["table_id"]),
                "table_no": str(row["table_no"]),
                "order_id": int(row["order_id"]) if row["order_id"] is not None else None,
                "menu_summary": str(row["menu_summary"] or ""),
                "subtotal_cents": int(row["subtotal_cents"] or 0),
            }
            for row in rows
        ]

    def get_table_order_detail(self, table_no: str) -> dict | None:
        safe_table_no = str(table_no or "").strip().upper()
        if not safe_table_no:
            return None
        table = self.get_table_by_no(safe_table_no)
        if table is None:
            return None

        with closing(self._conn()) as conn:
            row = conn.execute(
                """
                SELECT id, COALESCE(note, '') AS note
                FROM order_headers
                WHERE table_id = ? AND status = 'OPEN'
                ORDER BY id DESC
                LIMIT 1
                """,
                (int(table["id"]),),
            ).fetchone()
            if row is None:
                return {
                    "table_no": safe_table_no,
                    "table_status": str(table.get("status", "")),
                    "order_id": None,
                    "order_status": "NONE",
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

            order_id = int(row["id"])
            item_rows = conn.execute(
                """
                SELECT id, item_name, qty, unit_price_cents, COALESCE(note, '') AS note, COALESCE(is_served, 0) AS is_served, served_at
                FROM order_items
                WHERE order_id = ?
                ORDER BY id ASC
                """,
                (order_id,),
            ).fetchall()

        bill = self.preview_bill(order_id=order_id)
        items = [
            {
                "order_item_id": int(item["id"]),
                "item_name": str(item["item_name"]),
                "qty": int(item["qty"]),
                "unit_price_cents": int(item["unit_price_cents"]),
                "line_total_cents": int(item["qty"]) * int(item["unit_price_cents"]),
                "note": str(item["note"] or ""),
                "served": bool(int(item["is_served"] or 0)),
                "served_at": str(item["served_at"] or ""),
                "status": "SERVED" if bool(int(item["is_served"] or 0)) else "ORDERED",
            }
            for item in item_rows
        ]
        return {
            "table_no": safe_table_no,
            "table_status": "OPEN",
            "order_id": order_id,
            "order_status": "OPEN",
            "order_note": str(row["note"] or ""),
            "items": items,
            "bill_summary": {
                "subtotal_cents": int(bill["subtotal_cents"]),
                "extra_fee_total_cents": int(bill["extra_fee_total_cents"]),
                "extra_fee_items": list(bill.get("extra_fee_items", [])),
                "total_cents": int(bill["total_cents"]),
                "currency": str(bill["currency"]),
            },
        }

    def set_order_item_served(
        self,
        table_no: str,
        order_item_id: int,
        served: bool,
        operator: str = "system",
    ) -> dict[str, Any]:
        safe_table_no = self._normalize_table_no(table_no)
        safe_item_id = int(order_item_id or 0)
        if safe_item_id <= 0:
            raise ValueError("order_item_id must be positive integer")

        with closing(self._conn()) as conn:
            table_row = conn.execute(
                "SELECT id, status FROM dining_tables WHERE UPPER(table_no) = UPPER(?) ORDER BY id DESC LIMIT 1",
                (safe_table_no,),
            ).fetchone()
            if table_row is None:
                raise ValueError(f"table {safe_table_no} not found")
            if str(table_row["status"]).upper() != "OPEN":
                raise ValueError(f"table {safe_table_no} is not OPEN")
            table_id = int(table_row["id"])

            row = conn.execute(
                """
                SELECT oh.id AS order_id, oi.id AS order_item_id
                FROM order_headers oh
                INNER JOIN order_items oi ON oi.order_id = oh.id
                WHERE oh.table_id = ? AND oh.status = 'OPEN' AND oi.id = ?
                LIMIT 1
                """,
                (table_id, safe_item_id),
            ).fetchone()
            if row is None:
                raise ValueError(f"order_item_id={safe_item_id} not found in OPEN order of table {safe_table_no}")

            order_id = int(row["order_id"])
            if served:
                conn.execute("UPDATE order_items SET is_served = 1, served_at = CURRENT_TIMESTAMP WHERE id = ?", (safe_item_id,))
                action = "SERVE_ITEM"
            else:
                conn.execute("UPDATE order_items SET is_served = 0, served_at = NULL WHERE id = ?", (safe_item_id,))
                action = "UNSERVE_ITEM"
            self._log(conn, order_id, action, operator, f"table_no={safe_table_no}, order_item_id={safe_item_id}")
            conn.commit()

        return {
            "table_no": safe_table_no,
            "order_id": order_id,
            "order_item_id": safe_item_id,
            "served": bool(served),
            "status": "SERVED" if served else "ORDERED",
        }

    def remove_order_item_by_id(
        self,
        table_no: str,
        order_item_id: int,
        operator: str = "system",
    ) -> dict[str, Any]:
        safe_table_no = self._normalize_table_no(table_no)
        safe_item_id = int(order_item_id or 0)
        if safe_item_id <= 0:
            raise ValueError("order_item_id must be positive integer")

        with closing(self._conn()) as conn:
            table_row = conn.execute(
                "SELECT id, status FROM dining_tables WHERE UPPER(table_no) = UPPER(?) ORDER BY id DESC LIMIT 1",
                (safe_table_no,),
            ).fetchone()
            if table_row is None:
                raise ValueError(f"table {safe_table_no} not found")
            if str(table_row["status"]).upper() != "OPEN":
                raise ValueError(f"table {safe_table_no} is not OPEN")
            table_id = int(table_row["id"])

            row = conn.execute(
                """
                SELECT
                    oh.id AS order_id,
                    oi.id AS order_item_id,
                    oi.menu_item_id AS menu_item_id,
                    oi.qty AS qty,
                    oi.item_name AS item_name
                FROM order_headers oh
                INNER JOIN order_items oi ON oi.order_id = oh.id
                WHERE oh.table_id = ? AND oh.status = 'OPEN' AND oi.id = ?
                LIMIT 1
                """,
                (table_id, safe_item_id),
            ).fetchone()
            if row is None:
                raise ValueError(f"order_item_id={safe_item_id} not found in OPEN order of table {safe_table_no}")

            order_id = int(row["order_id"])
            menu_item_id = int(row["menu_item_id"])
            qty = int(row["qty"] or 0)
            item_name = str(row["item_name"] or "")
            conn.execute("DELETE FROM order_items WHERE id = ?", (safe_item_id,))
            conn.execute("UPDATE order_headers SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (order_id,))
            self._log(
                conn,
                order_id,
                "REMOVE_ITEM",
                operator,
                json.dumps(
                    {
                        "table_no": safe_table_no,
                        "order_item_id": safe_item_id,
                        "menu_item_id": menu_item_id,
                        "removed_qty": qty,
                        "item_name": item_name,
                    },
                    ensure_ascii=False,
                ),
            )
            conn.commit()

        return {
            "table_no": safe_table_no,
            "order_id": order_id,
            "order_item_id": safe_item_id,
            "menu_item_id": menu_item_id,
            "removed_qty": qty,
            "item_name": item_name,
        }

    def list_table_states(self) -> list[dict]:
        with closing(self._conn()) as conn:
            rows = conn.execute(
                """
                SELECT
                    dt.id AS table_id,
                    dt.table_no AS table_no,
                    dt.status AS table_status,
                    oh.id AS open_order_id
                FROM dining_tables dt
                LEFT JOIN order_headers oh
                    ON oh.table_id = dt.id
                    AND oh.status = 'OPEN'
                ORDER BY dt.table_no ASC
                """
            ).fetchall()
        return [
            {
                "table_id": int(row["table_id"]),
                "table_no": str(row["table_no"]),
                "status": str(row["table_status"]),
                "open_order_id": int(row["open_order_id"]) if row["open_order_id"] is not None else None,
            }
            for row in rows
        ]

    def add_item(self, order_id: int, menu_item_id: int, qty: int, operator: str, note: str = "") -> None:
        if qty <= 0:
            raise ValueError("qty must be positive")

        with closing(self._conn()) as conn:
            status_row = conn.execute(
                "SELECT status FROM order_headers WHERE id = ?",
                (order_id,),
            ).fetchone()
            if status_row is None:
                raise ValueError(f"order_id={order_id} not found")
            if status_row["status"] != "OPEN":
                raise ValueError("only OPEN order can add item")

            self._insert_order_item(conn, order_id, OrderItemInput(menu_item_id=menu_item_id, qty=qty, note=note))
            conn.execute(
                "UPDATE order_headers SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (order_id,),
            )
            self._log(conn, order_id, "ADD_ITEM", operator, f"menu_item_id={menu_item_id}, qty={qty}")
            conn.commit()

    def get_order_note(self, order_id: int) -> str:
        with closing(self._conn()) as conn:
            row = conn.execute(
                "SELECT COALESCE(note, '') AS note FROM order_headers WHERE id = ?",
                (order_id,),
            ).fetchone()
        if row is None:
            raise ValueError(f"order_id={order_id} not found")
        return str(row["note"] or "")

    def set_order_note(self, order_id: int, note: str, operator: str = "system") -> str:
        safe_note = str(note or "").strip()
        with closing(self._conn()) as conn:
            status_row = conn.execute(
                "SELECT status FROM order_headers WHERE id = ?",
                (order_id,),
            ).fetchone()
            if status_row is None:
                raise ValueError(f"order_id={order_id} not found")
            if status_row["status"] != "OPEN":
                raise ValueError("only OPEN order can update note")
            conn.execute(
                "UPDATE order_headers SET note = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (safe_note, order_id),
            )
            self._log(conn, order_id, "SET_ORDER_NOTE", operator, f"note={safe_note}")
            conn.commit()
        return safe_note

    def generate_bill(
        self,
        order_id: int,
        operator: str,
    ) -> dict:
        with closing(self._conn()) as conn:
            status_row = conn.execute(
                "SELECT status FROM order_headers WHERE id = ?",
                (order_id,),
            ).fetchone()
            if status_row is None:
                raise ValueError(f"order_id={order_id} not found")
            if status_row["status"] != "OPEN":
                raise ValueError("bill can only be generated for OPEN order")

            subtotal_cents = conn.execute(
                "SELECT COALESCE(SUM(unit_price_cents * qty), 0) AS subtotal FROM order_items WHERE order_id = ?",
                (order_id,),
            ).fetchone()["subtotal"]

            extra_fee_items: list[dict[str, Any]] = []
            extra_fee_total_cents = 0
            total_cents = subtotal_cents + extra_fee_total_cents
            tax_cents = 0
            service_charge_cents = 0

            conn.execute(
                """
                INSERT INTO bills(order_id, subtotal_cents, tax_cents, service_charge_cents, total_cents, generated_by)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (order_id, subtotal_cents, tax_cents, service_charge_cents, total_cents, operator),
            )
            conn.execute("UPDATE order_headers SET status = 'BILLED' WHERE id = ?", (order_id,))
            self._log(conn, order_id, "GENERATE_BILL", operator, f"total_cents={total_cents}")
            conn.commit()

            return {
                "order_id": order_id,
                "subtotal_cents": subtotal_cents,
                "extra_fee_total_cents": extra_fee_total_cents,
                "extra_fee_items": extra_fee_items,
                "total_cents": total_cents,
                "currency": "CNY",
            }

    def preview_bill(
        self,
        order_id: int,
    ) -> dict:
        with closing(self._conn()) as conn:
            subtotal_cents = conn.execute(
                "SELECT COALESCE(SUM(unit_price_cents * qty), 0) AS subtotal FROM order_items WHERE order_id = ?",
                (order_id,),
            ).fetchone()["subtotal"]

        extra_fee_items: list[dict[str, Any]] = []
        extra_fee_total_cents = 0
        total_cents = subtotal_cents + extra_fee_total_cents
        return {
            "order_id": order_id,
            "subtotal_cents": subtotal_cents,
            "extra_fee_total_cents": extra_fee_total_cents,
            "extra_fee_items": extra_fee_items,
            "total_cents": total_cents,
            "currency": "CNY",
        }

    def export_bill_to_device(self, order_id: int, target_device_id: str) -> dict:
        bill = self.preview_bill(order_id=order_id)
        bill["target_device_id"] = target_device_id
        bill["message_type"] = "BILL_SYNC"
        return bill

    def _insert_order_item(self, conn: sqlite3.Connection, order_id: int, item: OrderItemInput) -> None:
        if item.qty <= 0:
            raise ValueError("qty must be positive")

        menu_row = conn.execute(
            "SELECT name, price_cents, is_available FROM menu_items WHERE id = ?",
            (item.menu_item_id,),
        ).fetchone()
        if menu_row is None:
            raise ValueError(f"menu_item_id={item.menu_item_id} not found")
        if menu_row["is_available"] != 1:
            raise ValueError(f"menu_item_id={item.menu_item_id} unavailable")

        conn.execute(
            """
            INSERT INTO order_items(order_id, menu_item_id, item_name, unit_price_cents, qty, note)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (order_id, item.menu_item_id, menu_row["name"], menu_row["price_cents"], item.qty, item.note),
        )

    @staticmethod
    def _log(conn: sqlite3.Connection, order_id: int | None, action: str, operator: str, detail: str) -> None:
        conn.execute(
            "INSERT INTO audit_logs(order_id, action, operator, detail) VALUES (?, ?, ?, ?)",
            (order_id, action, operator, detail),
        )

    @staticmethod
    def _ensure_restaurant(conn: sqlite3.Connection) -> int:
        row = conn.execute("SELECT id FROM restaurants ORDER BY id LIMIT 1").fetchone()
        if row is not None:
            return int(row["id"])
        return int(conn.execute("INSERT INTO restaurants(name) VALUES ('Voice BBQ')").lastrowid)
