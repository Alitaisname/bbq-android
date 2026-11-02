# Phase 2：本地后端托管（当前实现）

## 1. 启动模式

通过 `app/build.gradle.kts` 的 `BuildConfig` 参数控制：

1. `BACKEND_BOOT_MODE=EMBEDDED_PYTHON`（当前默认）
   - 使用 Chaquopy 在 App 内启动 Python 解释器。
   - 启动前先把 `assets/backend_runtime` 解压到 `filesDir/backend_runtime`。
   - 调用 `embedded_backend.py` 启动本地 `backend.web_api` 服务。
2. `BACKEND_BOOT_MODE=ATTACH_EXISTING`
   - 仅探测 `LOCAL_HEALTH_URL`，等待外部后端已启动。
3. `BACKEND_BOOT_MODE=SPAWN_COMMAND`
   - 兼容保留：通过命令行子进程方式启动后端（Android 一般不作为主路径）。

## 2. 健康检查闸门

MainActivity 启动流程：

1. `ensureStarted()` 执行启动动作。
2. `waitUntilHealthy()` 轮询 `LOCAL_HEALTH_URL`。
3. 仅在健康检查通过后加载 `LOCAL_WEB_BASE_URL`。
4. 不通过时展示覆盖层（模式、失败详情、健康检查地址）并提供“重试”。

参数：

1. `BACKEND_HEALTH_TIMEOUT_MS`：总等待时长（默认 12000ms）。
2. `BACKEND_HEALTH_POLL_INTERVAL_MS`：轮询间隔（默认 350ms）。

## 3. 运行时资源

运行时资源位于：`app/src/main/assets/backend_runtime`，包括：

1. `backend/*.py`
2. `web/*`
3. `db/schema.sql`
4. `VERSION`（资源版本标记）

同步脚本：`scripts/sync_runtime_payload.ps1`

1. 默认从 `D:\dc` 同步 `backend/web/db` 到 assets 目录。
2. 每次你在 `D:\dc` 改了后端或页面，都要执行一次同步脚本再打包 APK。

## 4. 诊断信息

1. 覆盖层会展示启动模式与失败原因。
2. `SPAWN_COMMAND` 模式下仍会写 `filesDir/backend.log`。
3. `EMBEDDED_PYTHON` 模式的状态由 `embedded_backend.py` 返回文本（`ok:` / `error:`）。

## 5. 当前边界

1. 这一步已经实现“APK 内本地 Python 服务启动”。
2. 目前仍需你在真机回归确认：
   - 启动后覆盖层是否消失
   - Web 页是否由 `127.0.0.1:8000` 本地服务提供
   - 关键业务语令与 Web 基线是否一致
