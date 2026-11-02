# 安卓壳初始化（本机）

1. 执行：`scripts/bootstrap_gradle_wrapper.ps1`
2. 进入：`mobile/android_shell_v2`
3. 运行：`./gradlew.bat tasks`
4. 在 Android Studio 打开该目录进行 Sync。

> 当前工程已包含内嵌 Python 运行时。正常构建见根目录 README；下方一键脚本用于具备独立 KLS 开发环境的维护者。

## Debug 注入登录态（免手动登录）

用途：开发阶段跳过短信登录，启动直接带入已有 token。

1. 在 `mobile/android_shell_v2/local.properties` 添加（示例）：
   - `DEV_AUTH_INJECT_ENABLED=true`
   - `DEV_INJECT_ACCESS_TOKEN=你的_access_token`
   - `DEV_INJECT_REFRESH_TOKEN=你的_refresh_token`
   - `DEV_INJECT_ROLE=waiter`
2. 重新构建 Debug 包：
   - `./gradlew.bat :app:assembleDebug`
3. 安装后启动应用：
   - Debug 构建会自动注入 token 并进入已登录态。

注意：
- 该能力仅用于 `DEBUG` 构建。
- 发布包不要配置上述字段。

## 一键 Run + 注入 + 装机 + Smoke

开发阶段推荐统一使用：

`pwsh -ExecutionPolicy Bypass -File scripts/run_android_with_web_auth.ps1`

该脚本会做：

1. 优先从当前 Web 会话提取 token 注入 Debug 包。
2. 若 Web token 全过期，自动在本机 KLS 里签发开发 `access_token + refresh_token`（仅本机调试）。
3. 自动 `assembleDebug`、安装真机、拉起 App。
4. 自动触发一次音量键录音 start/stop，并输出 smoke 日志摘要（UI 快照、tab 样式规则、音量键路由、原生录音链路）。

可选参数示例：

`pwsh -ExecutionPolicy Bypass -File scripts/run_android_with_web_auth.ps1 -DeviceId YOUR_DEVICE_SERIAL -DevPhone YOUR_PHONE`

若本机 KLS 地址有变化，可显式注入：

`pwsh -ExecutionPolicy Bypass -File scripts/run_android_with_web_auth.ps1 -DeviceId YOUR_DEVICE_SERIAL -KlsApiBase http://192.0.2.10:8100`

说明：

1. `KlsApiBase` 会在构建时写入 `BuildConfig.KLS_API_BASE`，用于 App 内所有 KLS 请求（短信、登录、ASR 会话/转写）。
2. 音量键链路采用“按下开始录音、抬起结束录音”。
3. 自动 smoke 只能模拟按键，不会注入真实人声；真实语音识别需手工“按住说话再松开”验证。
4. 脚本默认优先尝试当前主机的局域网 IPv4 地址；若设备不可达，会自动回落到 `adb reverse + http://127.0.0.1:8100`。
5. 若使用局域网 `http://<LAN-IP>:8100`，需要 Android 壳放行 cleartext（当前 `network_security_config.xml` 已全局放行开发态 HTTP）。
6. 当前脚本默认以“登录注入成功”为核心验收；ASR 烟测默认不作为失败门槛。
   - 如需强制校验 ASR，再追加：`-RequireAsrSmoke $true`

## KLS 运行时配置与模型注入（当前统一口径）

当前 Android runtime 以 KLS 运行时配置为唯一配置源，不再依赖本地写死模型名；`gateway-key` 只保留兼容口，不作为主流程依赖。

链路：

1. 登录后前端必须先调用 `GET /api/me/runtime-config`，获取：
   - `gateway_base_url`
   - `gateway_auth_mode`
   - `gateway_key_downlink_enabled`
   - `chat_model_alias`
   - `asr_model_alias`
   - `menu_ocr_model_alias`
2. 业务请求发往本地 Python 后端时，统一附带：
   - `X-Client-Platform`
   - `X-App-Version-Code`
   - `X-Device-Id`
3. 本地 runtime 后端调用 KLS `/v1/*` 时，优先使用 `Authorization: Bearer <access_token>`；若仍处于兼容桥接阶段，`X-Gateway-Api-Key` 可用 `access_token` 作回退值，但不应依赖真实 `gateway_api_key`。
4. KLS 按请求头与 runtime-config 选择模型并调用网关。

排查要点：

1. 若出现 `502 model ...`，先确认 KLS 的 `chat_model_alias` 是否为当前 CLIProxy 可用模型。
2. 确认请求头中 `X-Client-Platform / X-App-Version-Code / X-Device-Id` 存在（可在后端日志或抓包中验证）。
3. 若只改了 KLS 端模型，Android 端无需改代码；重新登录或触发 `runtime-config` 刷新即可生效。
4. `runtime-config` 为必拉项，不要把模型、ASR、OCR 配置写死在客户端。
5. `gateway-key` 非主流程依赖，不应作为 Android 正常启动或正常请求的前置条件。
