# Android POS 小票打印开发总文档

更新时间：2026-04-14  
适用仓库：`D:\bbq-android`  
当前阶段：`P1 完成（含前端状态机收敛），P2/P3 待实施`

## 1. 目标与范围

1. 在无指定打印机品牌前提下，优先兼容大部分蓝牙小票机。
2. Android 仅做设备连接与字节下发，不承载业务规则判断。
3. 前端通过统一 JS Bridge 调用打印能力，业务仍由现有 Web + Backend 主链路负责。
4. 在没有真实打印设备时，仍可完成持续开发与离线验收。

不在本阶段范围：
1. 厂商私有 SDK 深度集成。
2. 钱箱/蜂鸣/缺纸状态回读等厂商扩展。
3. 云打印或网络打印机协议。

## 2. 当前实现状态（已落地）

对应提交：
1. `7c595c6`：打印桥基础能力与调试入口。
2. `e0d7861`：兼容性/稳定性加固（审查结论闭环）。
3. `bb12252`：前端入口迁移到设置页并增强迁移断言。
4. `b5079cd`：前端打印状态机落地 + 设置页状态恢复 + 状态机断言。
5. `0862e6f`：补齐“前端预拦截”自动断言并完成文档日志期望对齐。
6. `1d283f2`：放宽过严 smoke 判据并增加连接错误归一化。
7. `0c7ec1c`：收紧链路信号判定并细化连接错误分类。
8. `003320c`：runtime smoke 必须命中打印桥日志信号。

已完成能力：
1. Android 原生打印桥 `NativePrinterBridge`：
   - 蓝牙权限申请（Android 12+ `BLUETOOTH_SCAN/CONNECT`）。
   - 枚举已配对设备、连接/断开、打印、自检。
2. ESC/POS 渲染器 `EscPosTicketRenderer`：
   - 58/80mm 票宽。
   - 中文编码 `GB18030`。
   - 二维码与切纸。
3. Web 统一桥对象 `window.__bbqPrinter`：
   - 权限、设备枚举、连接、断开、自检打印、样例打印。
4. 设置页打印连接卡片：
   - 打印入口已从主页面迁移至设置页，符合 `settings-copy` 视觉体系。
5. 校验脚本 `scripts/verify_printer_bridge_injection.ps1`：
   - 迁移位置断言 + 绑定链路断言 + 可选离线编译校验 + 可选真机注入 smoke。
6. 前端状态机与恢复机制：
   - 显式状态枚举（`idle/permission_pending/device_listing/connecting/connected/printing/error`）；
   - 按钮启用矩阵控制；
   - 进入设置页自动恢复稳态，避免残留忙态。

## 3. 架构设计

分层：
1. `Web UI 层`：发起打印请求与展示状态，不处理蓝牙细节。
2. `Bridge 层`：JS <-> Android 接口转发与异步回执。
3. `Transport 层`：蓝牙 SPP 连接与字节发送。
4. `Dialect/Render 层`：业务 JSON -> ESC/POS 字节。

关键原则：
1. 业务语义不下沉到 Android。
2. 打印协议与传输层解耦，便于后续加 BLE/TSPL/CPCL。
3. 单链路串行执行，避免并发打印串单。

## 4. Bridge 接口契约

Android 注入对象：`AndroidPrinterBridge`  
Web 统一封装：`window.__bbqPrinter`

核心动作：
1. `requestPermissions()`
2. `listBondedDevices()`
3. `connect(address)`
4. `disconnect()`
5. `printSelfTest()`
6. `printSampleTicket()`
7. `printTicket(payloadJson, requestId)`（底层）

回调事件：
1. `type=state`：连接状态变化。
2. `type=result`：请求结果回执（成功/失败）。

错误码最小集合：
1. `permission_denied`
2. `bluetooth_unavailable`
3. `bluetooth_disabled`
4. `connect_failed`
5. `not_connected`
6. `invalid_payload`
7. `print_failed`

## 5. 票据 JSON 规范（P1）

建议字段：
1. `title`
2. `store_name`
3. `order_no`
4. `table_no`
5. `operator`
6. `width_mm`（58/80）
7. `items[]`：`name/qty/price_cents`
8. `total_cents`
9. `remark`
10. `footer`
11. `qr_text`

约束：
1. 非法 JSON 必须失败返回 `invalid_payload`，禁止降级为空票据。
2. 长文本按显示宽度分行（ASCII=1，CJK=2）。

## 6. 审查闭环（本轮）

来自审查 subagent 的 P1 问题已完成：
1. 单一 RFCOMM 兼容性不足 -> 已改为三段回退：
   - `createRfcommSocketToServiceRecord`
   - `createInsecureRfcommSocketToServiceRecord`
   - 反射 `createRfcommSocket(1)`
2. `connect()` 可能长阻塞 -> 已加原生可控超时与取消，超时主动关闭 socket。
3. 非法票据 payload 静默降级 -> 已改为硬失败 `invalid_payload`。

一并收敛：
1. 中文宽度对齐策略统一，降低中英混排错位。
2. 校验脚本增强为“静态断言 + 可选离线编译断言”。

## 7. 无真实打印设备的开发与验收

必须执行：
1. `pwsh -File scripts/verify_printer_bridge_injection.ps1 -ProjectRoot D:\bbq-android`
2. `mobile/android_shell_v2` 下执行 `./gradlew :app:assembleDebug`
3. 设置页打印卡片验证状态流：
   - 权限申请
   - 刷新设备列表
   - 连接失败路径提示
   - 断开路径提示

可选执行（有真机无打印机）：
1. 带 `-DeviceId` 执行 `verify_printer_bridge_injection.ps1`，验证注入日志出现。
2. 连接任意已配对蓝牙设备，确认超时/失败路径不会卡死后续请求。

## 8. 后续分期

## P2：兼容性扩展

1. BLE GATT 通道接入（与 SPP 并行能力探测）。
2. 设备指纹与能力缓存（成功策略记忆）。
3. 打印队列与重试策略可配置化。

## P3：商用增强

1. 厂商扩展指令（钱箱/蜂鸣/状态回读）。
2. TSPL/CPCL 方言支持。
3. 票据模板中心化与门店级配置。
4. 打印审计与故障归因（日志上报）。

## 9. 上线门槛（建议）

1. P1 脚本校验、编译校验全部通过。
2. 至少 2 个不同厂商设备完成实机打印冒烟（58/80mm 各 1）。
3. 关键失败路径可恢复：
   - 权限拒绝
   - 设备不可达
   - 连接超时
   - 非法 payload
4. 不得引入 Android 业务语义分叉。

## 10. 最终回测（2026-04-14）

1. `run_android_with_web_auth.ps1 -DeviceId YOUR_DEVICE_SERIAL -ProjectRoot D:\bbq-android -KlsApiBase https://your-kls.example.com`：通过（构建/安装/启动/烟测通过）。
2. `verify_printer_bridge_injection.ps1 -ProjectRoot D:\bbq-android -DeviceId YOUR_DEVICE_SERIAL`：通过（静态断言 + compileDebugKotlin + runtime smoke）。
3. 按 `pos_frontend_android_adaptation_spec.md` 进行无设备流程核对：通过（设置页迁移、状态机、前端预拦截、断言链路均符合）。
4. 备注：`Dev auth injected=False` 与 voice command `401` 为登录注入链路观测项，不属于本 POS 前端适配文档阻塞项。

## 11. 关键文件索引

1. `mobile/android_shell_v2/app/src/main/java/com/yidiandian/shellv2/NativePrinterBridge.kt`
2. `mobile/android_shell_v2/app/src/main/java/com/yidiandian/shellv2/EscPosTicketRenderer.kt`
3. `mobile/android_shell_v2/app/src/main/java/com/yidiandian/shellv2/MainActivity.kt`
4. `mobile/android_shell_v2/app/src/main/assets/backend_runtime/web/app.js`
5. `mobile/android_shell_v2/app/src/main/assets/backend_runtime/web/index.html`
6. `scripts/verify_printer_bridge_injection.ps1`
