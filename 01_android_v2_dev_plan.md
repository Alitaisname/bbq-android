# Android V2 二次改写方案（开发版）

## 1. 目标与边界

1. 保持现有 `web/` 页面 UI 与交互效果一致（不改视觉、不改结构、不改业务规则）。
2. 保持现有 Python Agent + 工具链为唯一业务执行路径。
3. 安卓端只做容器层（App Shell）：生命周期、权限、按键映射、WebView 承载。
4. 远端服务只包含 KLS 与 CLIProxy，不迁移业务逻辑到远端。

## 2. 目标架构

1. Android App 启动 -> 本地拉起 `backend.web_api`（127.0.0.1:8000）。
2. WebView 仅加载 `http://127.0.0.1:8000/`。
3. 页面业务调用 `/api/*` -> 全部进入本地 Python 后端。
4. 后端模型调用所需 key/base 由 KLS 登录后下发（保持现有注入机制）。
5. ASR 默认走 KLS realtime relay（已实装），legacy speech 仅调试开关保留。

## 3. 核心原则（强约束）

1. 安卓侧禁止新增业务判断（桌号推断、菜品纠错、撤单规则、多桌拆分等）。
2. 前端 `web/app.js` 禁止为安卓分支写独立业务逻辑。
3. 所有业务语义统一由 `backend/web_api.py` + agent 工具链处理。
4. 安卓只负责“触发输入”和“承载页面”。

## 4. 分阶段实施

## Phase 0：基线冻结

1. 以当前可用 web + backend 版本打标签（含 KLS ASR 链路通过点）。
2. 记录基线验收样例：开桌、加菜、退菜、撤桌、买单、菜单录入、OCR录入。
3. 输出“基线对比清单”，后续每次仅做回归比对。

交付：

- baseline 指令集（20条）
- baseline 期望返回样例（json）
- baseline UI 截图（横/竖屏）

## Phase 1：Android 壳重建（不要复用旧脏壳）

1. 新工程目录：`mobile/android_shell_v2`。
2. 最小模块：`MainActivity + WebViewHost + LocalServiceBootstrap + PermissionManager`。
3. 不引入业务 SDK，不实现业务 API 客户端。

交付：

- 空壳可安装运行
- WebView 打开固定健康页

## Phase 2：本地后端进程托管

1. App 冷启动时拉起本地 Python 服务。
2. DB/日志路径映射到 app 私有目录（防权限/路径漂移）。
3. 启动失败时给出可见错误浮层（不静默失败）。

交付：

- `/healthz` 200 后再加载 WebView
- 崩溃恢复策略（重试 + 明确报错）

## Phase 3：WebView 稳定性与点击区域

1. 固定 `textZoom=100`，禁掉会改变布局测量的缩放行为。
2. 处理 WindowInsets，避免顶部栏遮挡导致“竖屏点不到 tab”。
3. `configChanges` 持有页面，旋转不重建 Activity（避免回登录页）。
4. 保留 sessionStorage/localStorage。

交付：

- 竖屏/横屏 tab 可点
- 旋转不丢登录态
- 顶部 icon 无虚线焦点残留

## Phase 4：KLS/CLIProxy 连接注入

1. 仅注入配置，不改业务逻辑。
2. KLS 启动必须使用 env 脚本，保证 `KLS_ASR_PROVIDER` 生效。
3. 网关地址来自 KLS runtime-config/me gateway-key，不在安卓写死。

交付：

- 短信登录正常
- gateway key 正常下发
- 模型请求联通 CLIProxy

## Phase 5：输入层整合（音量键）

1. 音量键仅映射成“触发页面现有按键说话”。
2. 不在安卓新加语义处理流程。
3. 增加录音权限拒绝时的显式提示。

交付：

- 音量键可稳定开始/结束说话
- 页面中部状态框可见且可复现日志

## Phase 6：打包与回归

1. debug/release 双包验证。
2. 20条业务指令回归与 web 结果一致。
3. 仅通过后再进入上机实测。

交付：

- APK 构建产物路径
- 回归报告

## 5. 回归验收（必须全过）

1. UI 等价：主页面/菜单页/数据页/设置页/个人页一致。
2. 交互等价：tab、弹窗、表格点击、状态切换一致。
3. 业务等价：关键意图执行结果与 web 一致。
4. 链路等价：ASR -> transcript -> /api/commands/voice。
5. 异常等价：网络异常不误判订阅失效，不误清登录态。

## 6. 小票打印接入目标（新增）

1. 在无指定品牌设备前提下，优先兼容多数蓝牙小票机：`ESC/POS + Bluetooth SPP`。
2. 安卓侧仅提供“设备连接 + 字节发送 + 状态回传”能力，不在原生层新增业务判定。
3. Web 侧通过统一桥调用打印能力，业务仍由既有 `web/app.js + backend` 驱动。
4. 支持 58/80mm 两种票宽，默认中文编码 `GB18030`，支持二维码与切纸指令。
5. 提供无设备可执行的联调路径：桥接静态校验 + 真机注入日志校验脚本。

## 7. 小票打印实施分期（新增）

1. Phase P1（当前）：落地 `NativePrinterBridge`、`EscPosTicketRenderer`、Web 调试面板、脚本注入验证。
2. Phase P2：补充 BLE 传输层与设备能力识别（SPP/BLE 自动策略）。
3. Phase P3：扩展协议适配（TSPL/CPCL）与厂商特性（钱箱、蜂鸣、状态回读）。
