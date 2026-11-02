from __future__ import annotations

import importlib
import socket
import shutil
import sys
import threading
from pathlib import Path

_server = None
_thread = None
_lock = threading.RLock()


def _is_port_open(host: str, port: int, timeout: float = 0.6) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except Exception:
        return False


def _migrate_legacy_runtime_data(runtime: Path, data_root: Path) -> None:
    data_root.mkdir(parents=True, exist_ok=True)
    legacy_db = runtime / "restaurant.db"
    target_db = data_root / "restaurant.db"
    if legacy_db.exists() and not target_db.exists():
        shutil.copy2(legacy_db, target_db)

    legacy_account_scopes = runtime / "account_scopes"
    target_account_scopes = data_root / "account_scopes"
    if legacy_account_scopes.exists() and not target_account_scopes.exists():
        shutil.copytree(legacy_account_scopes, target_account_scopes)

    legacy_audio_roots = [
        runtime / "audio_uploads",
        runtime / "data" / "audio_uploads",
    ]
    target_audio_root = data_root / "audio_uploads"
    if not target_audio_root.exists():
        for legacy_audio_root in legacy_audio_roots:
            if legacy_audio_root.exists():
                shutil.copytree(legacy_audio_root, target_audio_root)
                break


def _purge_runtime_python_caches(runtime: Path) -> None:
    for cache_dir in (
        runtime / "__pycache__",
        runtime / "backend" / "__pycache__",
        runtime / "web" / "__pycache__",
    ):
        shutil.rmtree(cache_dir, ignore_errors=True)


def _reload_runtime_backend_modules(runtime: Path) -> None:
    runtime_str = str(runtime)
    sys.path[:] = [entry for entry in sys.path if entry != runtime_str]
    sys.path.insert(0, runtime_str)
    importlib.invalidate_caches()
    for module_name in list(sys.modules.keys()):
        if module_name == "backend" or module_name.startswith("backend."):
            sys.modules.pop(module_name, None)


def start_server(runtime_root: str, host: str = "127.0.0.1", port: int = 8000) -> str:
    global _server, _thread
    runtime = Path(runtime_root).resolve()
    if not runtime.exists():
        return f"error: runtime root not found: {runtime}"

    with _lock:
        if _thread is not None and _thread.is_alive():
            return f"ok: already-running {host}:{port}"
        if _is_port_open(host, int(port)):
            return f"ok: healthy-existing {host}:{port}"

        _purge_runtime_python_caches(runtime)
        _reload_runtime_backend_modules(runtime)

        try:
            from backend.web_api import build_server
        except Exception as exc:  # pragma: no cover
            return f"error: import backend failed: {exc}"

        data_root = runtime.parent / "backend_data"
        _migrate_legacy_runtime_data(runtime=runtime, data_root=data_root)
        db_path = data_root / "restaurant.db"
        try:
            _server = build_server(host=host, port=int(port), db_path=db_path)
        except Exception as exc:  # pragma: no cover
            return f"error: build server failed: {exc}"

        def _serve() -> None:
            global _server, _thread
            try:
                _server.serve_forever()
            except Exception:
                pass
            finally:
                try:
                    if _server is not None:
                        _server.server_close()
                except Exception:
                    pass
                _server = None
                _thread = None

        _thread = threading.Thread(target=_serve, name="bbq-local-backend", daemon=True)
        _thread.start()
        return f"ok: started {host}:{port} root={runtime}"


def stop_server() -> str:
    global _server, _thread
    with _lock:
        if _server is None:
            return "ok: already-stopped"
        try:
            _server.shutdown()
            _server.server_close()
        except Exception as exc:
            return f"error: stop failed: {exc}"
        finally:
            _server = None
            _thread = None
    return "ok: stopped"
