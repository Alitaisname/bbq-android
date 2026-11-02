# 安卓前端 POS 适配与连接开发文档（设置页版）

更新时间：2026-04-14  
适用范围：`D:\bbq-android\mobile\android_shell_v2\app\src\main\assets\backend_runtime\web`

实施状态：`已按规范完成实现/审核/回测闭环（2026-04-14）`

已落地提交：
1. `bb12252`：打印连接入口迁移至设置页并收敛绑定链路。
2. `b5079cd`：前端打印显式状态机 + 设置页进入状态恢复 + 自动断言增强。
3. `0862e6f`：补齐“前端预拦截”断言并修正文档日志期望。
4. `1d283f2`、`0c7ec1c`、`003320c`：修复 smoke 误通过风险并完成脚本判据收紧。
5. 审核结论：无 P0/P1/P2 阻塞问题，可合并。
6. 最终回测：文档要求实现项全部通过。

## 1. 文档目标

1. 明确 Android 前端如何接入 POS 打印连接能力。
2. 将“打印连接与自检”入口放入设置页，且视觉规范与现有 `settings-copy` 风格一致。
3. 在无真实打印设备场景下，保证可持续开发与可回归验证。
4. 为后续 BLE/多协议扩展预留稳定接口，不破坏当前业务路径。

## 2. 非目标（本阶段不做）

1. 不改动业务语义决策（桌号、菜品、订单规则仍由后端处理）。
2. 不引入厂商私有 SDK。
3. 不在本阶段实现钱箱/蜂鸣/缺纸状态回读。

## 3. 当前架构基线

1. Web 层暴露统一对象：`window.__bbqPrinter`。
2. JS Bridge 对象：`AndroidPrinterBridge`。
3. 原生层负责：
   - 蓝牙权限
   - 设备连接
   - ESC/POS 字节发送
4. 前端层负责：
   - 触发动作
   - 状态显示
   - 调试与错误提示

## 4. 设置页集成设计

## 4.1 信息架构

在 `view-settings` 内新增独立卡片（`settings-copy-card`）：
1. 卡片标题：`小票打印连接`
2. 卡片内容分 4 行：
   - 行1：设备选择（已配对设备下拉）
   - 行2：票宽选择（58/80）
   - 行3：连接动作（权限/刷新/连接/断开）
   - 行4：打印动作（自检/样例）
3. 状态区：显示连接状态与最近错误，默认文案 `打印状态：未初始化`。

## 4.2 视觉与交互规范

1. 使用 `#view-settings .settings-copy-*` 既有样式体系，避免 `legacy-card` 风格混入设置页。
2. 禁用态按钮必须降低不透明度并禁止点击。
3. 错误态文本必须明显区分（红色语义 + 背景提醒）。
4. 不新增悬浮弹层，全部状态在卡片内就地反馈。

## 4.3 DOM 约束（固定 ID）

1. `printer-device-select`
2. `printer-width-mm`
3. `printer-perm-btn`
4. `printer-refresh-btn`
5. `printer-connect-btn`
6. `printer-disconnect-btn`
7. `printer-selftest-btn`
8. `printer-sample-btn`
9. `printer-status-view`

## 4.4 迁移前后差异清单（P0）

迁移前：
1. 打印连接卡片位于主页面 `view-main` 的 `legacy-card wide`。
2. 打印绑定函数命名与语义为调试面板（`bindNativePrinterDebugPanel`）。

迁移后：
1. 主页面移除打印连接卡片。
2. 设置页 `view-settings` 新增 `settings-copy-card`：`小票打印连接`。
3. 打印入口绑定并入设置页生命周期（与 `bindSettingsCopyPage` 同步初始化）。
4. 脚本断言升级：必须验证“设置页存在 + 主页面移除”。

## 4.5 落地步骤顺序（P0）

1. 修改 `index.html`：删除主页面打印卡片。
2. 修改 `index.html`：在 `view-settings` 新增打印卡片（复用固定 ID）。
3. 修改 `app.js`：将打印绑定函数改为设置页语义并在 `bindSettingsCopyPage` 中挂载。
4. 修改样式文件：`styles.css`、`preview_nonauth.css`、`runtime_compat.css` 同步新增设置页打印卡片样式。
5. 修改脚本：`verify_printer_bridge_injection.ps1` 新增迁移位置断言。
6. 跑离线验收命令并记录结果。

## 4.6 设置页最终 DOM 片段（P0 规范）

以下结构必须落在 `#view-settings .settings-copy-stack` 内：

```html
<section class="settings-copy-card" id="settings-printer-card">
  <header class="settings-copy-card-head">
    <h2>小票打印连接</h2>
  </header>
  <div class="settings-copy-card-body">
    <!-- 设备选择 -->
    <!-- 票宽选择 -->
    <!-- 连接动作 -->
    <!-- 打印动作 -->
    <p id="printer-status-view">打印状态：未初始化</p>
  </div>
</section>
```

## 5. 前端状态机

状态集合：
1. `idle`
2. `permission_pending`
3. `device_listing`
4. `connecting`
5. `connected`
6. `printing`
7. `error`

状态迁移规则：
1. 任一异步动作发起时，禁用对应按钮组。
2. 异步动作完成后，无论成功失败都必须恢复按钮状态。
3. `connecting` 期间禁止再次发起 `connect`。
4. `printing` 期间禁止重复发起同类打印动作。

## 5.1 状态机执行表（P0）

| 事件 | 前置条件 | 目标状态 | 按钮启用矩阵 | 失败回滚 | 状态文案 |
|---|---|---|---|---|---|
| 点击`申请蓝牙权限` | `idle/error/connected` | `permission_pending` | `perm=禁用, 其余=启用` | 回到`idle/error`并恢复按钮 | `正在申请蓝牙权限...` |
| 点击`刷新配对设备` | `idle/error/connected` | `device_listing` | `refresh=禁用, connect=禁用` | 回到`error`并恢复 | `正在刷新配对设备...` |
| 点击`连接选中设备` | 已选设备地址 | `connecting` | `connect/disconnect/print=禁用` | 回到`error`并恢复 | `连接中...` |
| 点击`断开连接` | 任意状态 | `idle` | `disconnect=禁用` | 回到`error`并恢复 | `打印机已断开` |
| 点击`打印自检/样例` | `connected` | `printing` | `print按钮=禁用, connect=禁用` | 回到`error`并恢复 | `正在发送打印数据...` |

按钮启用矩阵补充：
1. `connected` 时：`connect` 禁用，`disconnect/print` 启用。
2. `idle` 时：`connect` 启用，`disconnect/print` 禁用。

## 5.2 已落地代码约束（第二轮）

1. `app.js` 中已引入显式状态枚举：`PRINTER_UI_STATES`，覆盖 `idle/permission_pending/device_listing/connecting/connected/printing/error`。
2. 已引入统一状态迁移函数：`setSettingsPrinterState(...)`，状态文案通过 `PRINTER_STATUS_TEXT` 统一维护。
3. 已引入按钮启用矩阵函数：`getSettingsPrinterButtonMatrix(...)`，由当前状态和连接态共同决策按钮可用性。
4. 已引入设置页进入恢复函数：`recoverSettingsPrinterStateOnViewEnter()`，用于消除跨页面后残留忙态，并回到 `idle/connected` 稳态。
5. `setView(...)` 在进入 `settings` 时会调用恢复函数，确保设置页打开后按钮状态与连接状态一致。

## 6. 接口契约与容错

## 6.1 `window.__bbqPrinter` 约束

1. `isAvailable()`：布尔值，决定是否渲染“可操作”状态。
2. `requestPermissions()`：失败时必须写入状态区，不可静默。
3. `listBondedDevices()`：返回空数组时显示“未找到已配对设备”。
4. `connect(address)`：address 为空时直接前端拦截。
5. `disconnect()`：可重复调用，幂等处理。
6. `printSelfTest()` / `printSampleTicket()`：未连接时直接报错，不发请求。

## 6.2 超时与失败策略

1. 每个请求都有独立超时，不共享定时器。
2. 超时后要清理 pending 句柄，避免内存泄漏。
3. 错误文案优先使用后端/原生返回 message，再回退默认文案。

## 6.3 契约一致性决策（P0）

统一决策：`前端预拦截 + 原生兜底` 双保险。

1. 前端在调用打印动作前先校验 `connectedAddress`：
   - 未连接直接提示，不发起打印请求。
2. 原生继续保留 `not_connected` 校验：
   - 防止前端状态不同步时误打。
3. 验收以前端可见行为为准：未连接时用户必须收到明确提示。

## 7. 无设备开发与验证路径

## 7.1 离线必须项

1. `node --check .../web/app.js`
2. `pwsh -File scripts/verify_printer_bridge_injection.ps1 -ProjectRoot D:\bbq-android`
3. `./gradlew :app:assembleDebug`

## 7.2 真机无打印机可执行项

1. 进入设置页，验证打印卡片样式与响应式布局。
2. 权限申请流程可触发并有状态反馈。
3. 刷新配对设备可返回列表或空提示。
4. 对不可达设备连接，必须在超时后恢复 UI，可继续重试。

## 7.3 无设备联调手册（P2）

标准操作序列：
1. 进入设置页，确认“`小票打印连接`”卡片可见。
2. 点击“申请蓝牙权限”，观察状态变更。
3. 点击“刷新配对设备”，观察设备下拉更新。
4. 不选设备点击连接，验证前端拦截提示。
5. 选不可达设备连接，验证超时后按钮恢复。
6. 未连接状态点击打印，验证前端拦截提示。

期望日志关键字：
1. `[Printer] 原生打印桥已就绪`
2. `[Printer] 蓝牙权限就绪` 或 `蓝牙权限未授权`
3. `[Printer] 已发现 X 台已配对设备`
4. `[Printer] 连接中...` / `连接打印机失败`
5. `[Printer]` 状态文案应属于状态机集合之一：
   - `打印状态：空闲`
   - `正在申请蓝牙权限...`
   - `正在刷新配对设备...`
   - `连接中...`
   - `打印机已连接`
   - `正在发送打印数据...`
   - `打印状态异常`
6. `打印状态：未初始化` 仅作为页面初始 UI 文案可见，不作为日志必现项。

## 8. 后端问题联动策略（同样走 subagent 流程）

若实现过程中发现后端协议或接口问题，执行同样闭环：
1. 起审核 subagent 定位后端问题与风险。
2. 起实现 subagent 修复后端（限定相关文件）。
3. 起审核 subagent 复核修复。
4. 主代理同步本规范与进度文档，记录接口变更与回归命令。

后端问题触发条件（本项目）：
1. 打印接口返回码/结构与前端契约不一致。
2. 本地代理或 KLS 链路导致打印相关请求异常。
3. 打印任务状态回传字段变更未同步前端。

## 9. 里程碑与验收

## M1（前端接入完成）

1. 打印连接入口已迁移到设置页。
2. 设置页视觉符合 `settings-copy` 体系。
3. 主页面不再承载打印连接操作入口。

## M2（链路稳定）

1. 超时/失败后 UI 不锁死。
2. 可连续执行 `连接失败 -> 断开 -> 重连`。
3. 无设备环境离线脚本持续通过。

## M3（文档完备）

1. 本规范覆盖入口、状态机、接口、验证路径。
2. `docs/progress.md` 同步记录本轮变更。
3. `docs/pos_printing_development_guide.md` 与本规范不冲突。

## M4（自动化可判定）

1. 校验脚本断言：
   - 打印卡片位于设置页。
   - 主页面不存在打印卡片入口。
   - 打印绑定已纳入设置页绑定链路。
2. 离线编译断言持续通过。

## 10. 代码改动建议清单（实现参考）

1. `index.html`
   - 将打印面板从主页面 `legacy-card` 移至设置页 `settings-copy-card`。
2. `styles.css` / `preview_nonauth.css` / `runtime_compat.css`
   - 为设置页打印卡片补充样式，避免主页面风格污染。
3. `app.js`
   - 保留 `window.__bbqPrinter` 能力；
   - 将绑定函数从调试面板语义调整为设置页语义；
   - 在页面初始化时与 `bindSettingsCopyPage` 协同执行。
4. `scripts/verify_printer_bridge_injection.ps1`
   - 校验入口 ID 迁移后的页面结构与桥接可用性。

## 11. 样式覆盖矩阵（P1）

| 文件 | 必改选择器 | 目的 |
|---|---|---|
| `styles.css` | `#view-settings .settings-copy-card` 下打印专用块 | 主运行态样式 |
| `preview_nonauth.css` | 同步打印卡片样式选择器 | 预览态一致 |
| `runtime_compat.css` | 同步打印卡片样式选择器 | 兼容态一致 |

移动端断点要求：
1. 设备下拉与票宽下拉不得溢出卡片。
2. 动作按钮在窄屏允许换行，但顺序固定：权限 -> 刷新 -> 连接 -> 断开 -> 自检 -> 样例。
3. 状态文本在窄屏可换行，禁止被遮挡。
