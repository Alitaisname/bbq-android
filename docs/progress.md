# Android V2 进度

## 2026-04-27

状态：`DONE`

本轮补充完成（开桌复合语音 prompt 收口）：

1. `agent_client.py`
   - 在语音操作提示词中补充规则：开桌命令同时包含菜品时，模型不得只返回 `OPEN_TABLE`；
   - 有菜品时应落到 `ORDER_ITEM`，由后端自动开桌建单，避免“开桌+菜品+备注”最后只执行开桌；
   - 明确循环桌号由后端分配；开桌点菜且用户未明确说桌号时，要求模型 `table_no` 留空，不再猜测或复用 `A1`/当前桌/下一桌。

2. `web_api.py`
   - 执行前增加计划归一化：若模型仍返回 `OPEN_TABLE + items`，或在“开桌”原话下返回空桌号/猜测桌号的 `ORDER_ITEM`，后端会允许自动开新桌；
   - 点菜、加菜、备注、买单、撤桌等动作在模型漏填桌号时，优先使用当前选桌；外卖和开新桌场景不复用当前桌；
   - 多桌批量继续使用逗号分隔 `table_no` 走后端 fanout，不再由 prompt 引导成 `steps`；
   - 单步 `steps` 会折叠为普通单步执行，避免产生双层 `VOICE_COMMAND` 审计；
   - `OPEN_TABLE` 后续空桌号步骤会继承刚开的桌号，避免“开桌+点菜”被拆步后开出空桌；
   - 公共菜品备注不再自动上浮为整单备注，避免“多菜同一单菜备注”被改写作用域。

## 2026-04-26

状态：`DONE`

本轮补充完成（备注兜底翻译 + 本地账号隔离 + 结账体验优化）：

1. 备注翻译兜底修复：
   - 修正 `ensureOrderNoteI18nMapForCurrentLanguage(...)` 的来源收集逻辑；
   - 之前传入 `{ items, order_note }` 时被错误当成空数组，未命中本地常用备注库时不会再请求后端映射；
   - 现在统一从整单备注和单菜备注中提取片段，缺失片段会正常走 `/api/order-notes/i18n-map` 并落到本地缓存。

2. 本地数据按账号隔离：
   - 后端新增运行时账号作用域切换接口 `/api/runtime/account-scope`；
   - 本地 `restaurant.db` 改为按账号切到 `account_scopes/<account_key>/restaurant.db`；
   - 登录态变化时前端会同步账号作用域，并清空当前账号专属的菜单映射/备注映射缓存和当前选桌缓存；
   - 解决更换手机号登录后仍看到上一账号本地菜单、桌台和运行时缓存的问题。

3. 结账自动打印与中文固定打印：
   - 设置页打印栏文案改为 `结账自动打印`，保留手机端常见滑动开关样式；
   - 自动结账打印固定强制走中文菜名与中文备注，不再受 App 显示语言切换影响。

4. 买单按钮卡顿与弹窗展示优化：
   - 主页面点击 `买单` 后先用当前选桌缓存秒开确认弹窗，再异步刷新正式账单；
   - 单桌弹窗改为可滚动账单明细 + 汇总；
   - 多桌弹窗改为按行显示 `桌号 / 金额`，底部统一显示总计；
   - 弹窗确认完成后的回显也复用同一套展示结构。

5. 可见界面翻译补齐：
   - 登录页补齐标题、提示、副文案、手机号/验证码标签与占位、发送验证码按钮和倒计时；
   - 个人页补齐账号信息、当前套餐、升级套餐、套餐选择标题、退出登录，以及角色/套餐/续费状态动态文案；
   - 买单确认弹窗标题、说明、桌号标签与输入占位纳入显示语言切换；
   - 打印设备空态与下拉占位文案同步纳入显示语言切换。

本轮继续补充完成（ASR 去标点 + 历史订单打印）：

1. ASR 入 agent 前统一去标点：
   - `agent_client.py` 与本地兜底 `agent_adapter.py` 新增 transcript 归一化；
   - 所有送入 agent 的语音文本都会先去掉全部标点，再压缩多余空格；
   - UI 和审计里仍保留原始识别文本，方便后续手改提示词和排查。

2. 数据查看页新增 `打印选中单`：
   - 按钮放到 `查询历史订单` 旁边，沿用同一组 toolbar 按钮样式；
   - 直接复用现有原生蓝牙打印桥，不新增后端打印接口；
   - 打印 payload 固定写死为中文菜名、中文备注、中文文本小票。

3. 自动结账打印继续固定中文：
   - 自动打印链路调用原生打印桥时强制 `zh_cn`；
   - 即使当前 App 显示语言为维语，也不会切到维语图片小票。

4. 历史订单补齐订单备注：
   - `list_order_history` 结果新增 `order_note`；
   - 历史订单打印时会一并带上整单备注，保证和原订单一致。

本轮补充完成（ASR 弹窗排版 + 主页面按钮收口 + 备注翻译/维语打印修正）：

1. 按键弹窗排版修复：
   - `提示 / 动画 / 文字` 改为自上而下三段布局；
   - 去掉 ASR 弹窗里导致重叠的绝对定位；
   - 登录后运行时样式与预览样式同步收敛，避免 Android WebView 切样式后再次错位。
   - 波形区、提示文案、识别文案进一步改为整行拉满，修复 Android WebView 下横向只占弹窗一半的问题。
   - 补充 `#asr-live-overlay` 高优先级覆盖，强制卡片三段内容按整行宽度铺满，避免旧样式在 WebView 中继续抢占宽度。
   - 样式入口统一补版本戳，规避 Android WebView 继续命中旧 CSS 缓存导致“已改代码但真机无变化”。
   - ASR 弹窗增加运行时内联布局兜底，在弹窗显示时直接把三段节点宽度和对齐写入元素样式，避免仅靠 CSS 覆盖在 WebView 上继续失效。
   - 修正 ASR 卡片 `grid` 仅定义行不定义列的问题；补 `grid-template-columns: minmax(0, 1fr)` 后，三段内容不再按内容宽度收缩成半边。
   - ASR 底部识别文案区改为受控高度并限制显示行数，避免长句识别把中间波形区再次顶坏。

2. 主页面 `打印 / 买单` 按钮去副文案：
   - 按钮 DOM 改为仅保留主文案；
   - `styles.css` 与 `preview_nonauth.css` 同步改为单行居中按钮，避免仍按主副标题网格布局渲染。

3. 个人页店名编辑图标收敛：
   - 昵称编辑按钮改为明确的笔形 SVG；
   - 补充笔图标尺寸样式，避免在 WebView 中被压缩成不可辨识形态。

4. 备注翻译与维语打印：
   - 主页面统一备注与单菜备注显示前，都会先走显示语言映射；
   - 打印 payload 中单菜备注和总备注统一按当前显示语言转换；
   - 维语图片式小票中，单菜备注改为独立排在菜名下一行，避免与数量/金额同行造成错位。

## 2026-04-25

状态：`DONE`

本轮补充完成（按钮样式 + 二次按键 ASR + 维语图片小票）：

1. 主页面 `打印 / 买单` 按钮再次收敛：
   - DOM 位置保持在账单总计横线上方；
   - 按钮内部改为与菜品录入页拍照按钮一致的主/副文本结构；
   - 总计横线恢复在按钮下方，避免 Android WebView 中按钮被总计区样式覆盖。
   - 同步补充到 `preview_nonauth.css` 运行时皮肤，避免登录后切换 stylesheet 导致按钮样式失效。

2. 二次按键 ASR 持续录入修复：
   - `按一次开始、第二次结束` 模式下，讯飞返回 final 只视为当前语音段结束；
   - 前端保持录音会话不结束，下一段音频会自动重新打开实时 ASR websocket；
   - 直到用户第二次按键后才停止录音并提交文本，避免说完一句后自动停止导致后续语音漏录。
   - 第二次按键提交时若 replacement websocket 正在打开，会短暂等待，减少尾音在 socket 重开瞬间被截断。

3. 维语图片式小票基础链路：
   - Android 新增 `BitmapTicketRenderer`，将同一份小票 payload 渲染成位图并用 ESC/POS 光栅命令发送；
   - 原生打印桥新增 `printTicketImage`；
   - 前端在 `ug_cn` 显示语言下自动走图片小票，中文继续走原 ESC/POS 文本小票；
   - 设置页样例小票也改为复用同一打印路由，避免维语模式下仍走文本小票。

验证：

1. `node --check mobile/android_shell_v2/app/src/main/assets/backend_runtime/web/app.js`
2. `$env:JAVA_HOME='D:\\andrio\\jbr'; Set-Location D:\\bbq-android\\mobile\\android_shell_v2; .\\gradlew --no-daemon :app:assembleDebug`

本轮补充完成（主页面按钮位置 + 备注显示判别）：

1. 主页面 `打印 / 买单` 按钮调整：
   - 按钮移出总计区，放到总计横线上方；
   - 样式对齐菜品录入页 `拍照上传菜单` 按钮；
   - 横线保留在按钮下方的总计区顶部。

2. 备注展示与打印判别收敛：
   - 单个菜品备注只显示在对应菜名下方，格式为 `（备注内容）`；
   - 多个菜品都带同一非空备注时判定为统一备注；
   - 统一备注才显示在主页面菜单下方和小票总备注；
   - 没有统一备注时主页面底部备注区域不显示；
   - 小票总备注改为 `备注：`，单菜备注改为括号样式。

验证：

1. `node --check mobile/android_shell_v2/app/src/main/assets/backend_runtime/web/app.js`
2. `python -m py_compile mobile/android_shell_v2/app/src/main/assets/backend_runtime/backend/agent_client.py`
3. `$env:JAVA_HOME='D:\\andrio\\jbr'; Set-Location .\\mobile\\android_shell_v2; .\\gradlew.bat --no-daemon :app:compileDebugKotlin`

本轮完成（主页面买单确认 + 备注链路 + 打印版式收口）：

1. 主页面账单汇总区买单按钮改为二次确认：
   - 主页面 `买单` 不再直接提交；
   - 改为先请求 `checkout-preview`，再弹出现有买单确认弹窗；
   - 真正执行仍由确认弹窗内的 `确认买单` 触发。

2. 备注链路打通到订单项与主页面：
   - 后端执行 `ADD_ITEM` 时继续透传 agent 识别出的 `item.note`；
   - `get_table_order_detail` 补齐 `order_items.note` 查询与返回；
   - 主页面“当前选中桌台”摘要改为显示 `备注：...`；
   - 选中桌台明细中每个菜品下方保留备注可见；
   - 打印 payload 的 `items[].note` 与整单 `remark` 均带上备注摘要。

3. 打印样式调整：
   - ESC/POS 小票去掉二维码输出；
   - 店名来源改为账号昵称；
   - 小票不再出现 `门店:` 行，改由标题承载店名；
   - 桌号放到顶部首行，与单号同列；
   - `数量 / 单价 / 小计` 改为固定 4 列输出，降低右侧漂移。

4. 个人页店名认知强化：
   - 将昵称相关文案统一为“店名（昵称）”；
   - 输入占位提示明确说明该名称会用于首页和打印小票；
   - 个人页副标题明确提示“昵称即店名”。

验证：

1. `node --check mobile/android_shell_v2/app/src/main/assets/backend_runtime/web/app.js`
2. `python -m py_compile mobile/android_shell_v2/app/src/main/assets/backend_runtime/backend/web_api.py mobile/android_shell_v2/app/src/main/assets/backend_runtime/backend/harness.py`
3. `$env:JAVA_HOME='D:\\andrio\\jbr'; Set-Location .\\mobile\\android_shell_v2; .\\gradlew.bat --no-daemon :app:compileDebugKotlin`

## 2026-04-23

状态：`DONE`

本轮完成（二次按键交互 + 显示语言设置）：

1. 二次按键行为调整：
   - 在 `toggle` 说话方式下，录音/流式进行中时：
   - 音量上键（`KEYCODE_VOLUME_UP`）触发取消（不发送）；
   - 音量下键（`KEYCODE_VOLUME_DOWN`）触发结束并发送；
   - Android 侧将 `keyCode` 透传到 Web 路由（`__bbqVolumeKeySpeechStart/Stop(keyCode)`）。

2. 弹窗增加二次按键提示：
   - ASR 弹窗增加底部提示文案：
   - `第二次按键：音量上取消，音量下发送`
   - 仅在 `toggle` 模式且语音流程活跃时显示，`hold` 模式隐藏。

3. 设置页新增 App 显示语言：
   - 新增 `sc-app-display-language`（`zh_cn` / `ug_cn`）；
   - 增加语言持久化：`localStorage` + Android `SharedPreferences`（`AndroidAppBridge`）；
   - 落地了首批可见文案切换（导航、语音状态前缀、语音按钮文案、设置页语音相关区块）。

4. 维语兼容基础方案已落地到代码骨架：
   - 前端引入 `DISPLAY_LANGUAGE_PRESETS` 词条机制；
   - 运行时按语言键 `t(key)` 映射文案；
   - 为后续扩展全量页面翻译、按模块拆词典提供可迭代入口。

验证：

1. `node --check mobile/android_shell_v2/app/src/main/assets/backend_runtime/web/app.js`
2. `$env:JAVA_HOME='D:\\andrio\\jbr'; Set-Location .\\mobile\\android_shell_v2; .\\gradlew.bat --no-daemon :app:compileDebugKotlin`

## 2026-04-22

状态：`DONE`

本轮完成（登录态维持 + 说话方式切换）：

1. 登录态维持修复：
   - `web/app.js` 保留原有 `localStorage/sessionStorage` 持久化逻辑；
   - 新增原生 `AndroidAppBridge` 备份登录态到 `SharedPreferences`；
   - 冷启动优先从原生持久化恢复，再同步回 WebView 存储；
   - 退出登录时同步清理 Web 侧与原生侧缓存，避免残留脏态。

2. 设置页新增“说话方式”：
   - 新增 `sc-voice-capture-mode` 选项；
   - 支持两种模式：`按一次开始，再按一次结束` / `按住说话，松开结束`；
   - 模式同时持久化到 `localStorage` 与原生 `SharedPreferences`。

3. 主页面与菜品录入页功能同步：
   - 主页面单次语音按钮和菜单页录入按钮统一跟随设置项；
   - 音量键触发逻辑也同步跟随该模式；
   - `hold` 模式走 `pointerdown/pointerup`，避免抬手后再触发一次 `click` 导致二次切换。

验证：

1. `node --check mobile/android_shell_v2/app/src/main/assets/backend_runtime/web/app.js`
2. `$env:JAVA_HOME='D:\\andrio\\jbr'; Set-Location .\\mobile\\android_shell_v2; .\\gradlew.bat --no-daemon :app:compileDebugKotlin`

## 2026-04-17

状态：`DONE`

本轮完成（线上登录注入精确修复）：

1. 修正 `run_android_with_web_auth.ps1` 的 token 来源：
   - 不再只扫描 Chrome `Session Storage`；
   - 同时扫描 `Local Storage\\leveldb`，匹配当前 `bbq.kls.auth.state` 的真实持久化位置。
2. 修正安卓端 dev auth 注入开关：
   - Gradle 打包时显式传入 `DEV_AUTH_INJECT_ENABLED=true`；
   - 避免仅传 `DEV_INJECT_*` 但前端实际未启用注入。

本轮未做：

1. 未增加 ASR 失败兜底分支。
2. 未修改 `menu_alias_map` 或 prompt 结构。
3. 未修改登录页请求协议。

### 2026-04-17 补充（线上无注入打包脚本）

1. 新增 `scripts/run_android_online_clean.ps1`：
   - 仅注入线上 `KLS_API_BASE`；
   - 不传任何 dev auth 参数；
   - 安装后默认执行 `pm clear com.yidiandian.shellv2`，清理重装后残留的旧登录态。
2. 启动校验只检查：
   - `KLS base normalized: preferred=https://your-kls.example.com`
   - `UI snapshot(boot/delayed)`
3. 目的：
   - 让真机进入“纯线上、纯手动登录”的干净状态，避免旧本地登录态干扰。

## 2026-04-14

状态：`DONE`

本轮完成（POS 打印）：

1. 按“审查 subagent -> 实现 subagent -> 主代理文档收敛”流程完成闭环。
2. 审查结论中的 P1 项已修复并落地：
   - RFCOMM 三段回退连接策略；
   - 原生连接超时与取消机制；
   - 非法打印 payload 硬失败（不再静默打印空票据）。
3. P2 低风险项同步收敛：
   - ESC/POS 中文显示宽度对齐策略统一；
   - 打印注入校验脚本增加离线编译断言。
4. 新增 POS 打印总文档：
   - `docs/pos_printing_development_guide.md`
   - 覆盖目标、架构、接口契约、无设备验收、后续 P2/P3 路线。

本轮约束说明：

1. 当前无真实打印设备，不阻断开发推进；
2. 先通过离线与真机注入校验保证链路可用，后续再做多设备实机兼容回归。

### 2026-04-14 补充（前端 POS 设置页适配闭环）

1. 执行链路：
   - 文档起草 -> 文档审核 subagent -> 文档补充 -> 实现 subagent -> 代码审核 subagent -> 文档回填。
2. 前端适配完成：
   - 打印连接入口从 `view-main` 迁移到 `view-settings` 的 `settings-copy-card`；
   - 打印绑定并入 `bindSettingsCopyPage` 生命周期；
   - 增加未连接前端预拦截（原生兜底仍保留）；
   - 三套样式文件同步（`styles/preview_nonauth/runtime_compat`）。
3. 断言脚本升级：
   - `verify_printer_bridge_injection.ps1` 新增“设置页存在 + 主页面移除 + 绑定链路”断言。
4. 审核结果：
   - 审核 subagent 结论 `可合并`，无 P0/P1/P2 阻塞问题。
5. 后端联动：
   - 本轮未触发后端协议问题，无需启动后端修复子流程。

### 2026-04-14 补充（POS 打印状态机与自动验收）

1. 前端打印流程改为显式状态机：
   - `idle / permission_pending / device_listing / connecting / connected / printing / error`；
   - 状态文案统一，按钮启用矩阵按状态和连接态联动。
2. 设置页进入恢复机制：
   - 进入 `settings` 页会执行打印状态恢复；
   - 若上次停留在中间态，会自动回到 `idle/connected`，避免残留忙态锁按钮。
3. 自动断言继续增强：
   - `verify_printer_bridge_injection.ps1` 新增状态机存在性、状态恢复挂载存在性断言。
4. 后端联动：
   - 本轮未发现新增后端协作阻塞，未做后端改动。

### 2026-04-14 补充（最终收口）

1. 继续执行“实现 subagent -> 审核 subagent”串行轮转，新增提交：
   - `b5079cd`：打印前端状态机与设置页恢复机制；
   - `0862e6f`：补齐前端预拦截断言与文档日志口径对齐。
2. 最终审核结论：
   - 无 P0/P1/P2 问题；
   - 达到“文档要求完全闭合（含自动化验收级别）”。

### 2026-04-14 补充（最终回测）

1. 按要求继续执行“测试 -> 实现 -> 审核 -> 实测”循环，新增提交：
   - `1d283f2`：放宽过严判据并增加连接错误归一化；
   - `0c7ec1c`：收紧链路信号通过条件；
   - `003320c`：runtime smoke 必须命中打印桥日志信号。
2. 最终测试结果：
   - `run_android_with_web_auth.ps1`：构建/安装/启动/烟测通过；
   - `verify_printer_bridge_injection.ps1`（含 `-DeviceId`）：通过；
   - 两份 POS 文档实现项回归通过（无设备场景）。
3. 非阻塞备注：
   - 登录注入观测项 `Dev auth injected=False` 与 voice command `401` 仍可见，但不属于本轮 POS 前端适配文档阻塞项。

## 2026-04-12

状态：`DONE`

本轮文档同步完成：

1. 收敛 `docs/setup_local_android_shell.md` 的 KLS 接入口径：
   - `runtime-config` 作为必拉项
   - 业务请求必须透传 `X-Client-Platform / X-App-Version-Code / X-Device-Id`
   - `access_token` 可作为 `X-Gateway-Api-Key` 的兼容回退值
   - `gateway-key` 不再作为主流程依赖
2. 补充 `D:\dc\docs\kls_app_full_integration_requirements.md` 的安卓接入口径段，统一 KLS/安卓文档的调用契约。
3. 当前文档口径已从“网关 key 注入”收敛为“runtime-config + access_token 代理模式 + 设备上下文透传”。

待确认：

1. 是否还需要把 `cliproxy_key_lifecycle_requirements.md` 标记为历史/归档文档，避免后续被误读为当前主流程。

### 2026-04-12 补充（统一 bootstrap 与 smoke）

1. `gateway-key` 进一步明确为非主流程依赖，仅保留兼容/回退用途，不应作为 Android 正常启动或正常请求的前置条件。
2. `scripts/run_android_with_web_auth.ps1` 已纳入两类更稳的验收路径：
   - 订阅优先 token 注入：优先使用当前可用订阅/登录态 token，减少对旧 gateway-key 流程的依赖。
   - `voice command smoke`：把语音命令链路作为自动化 smoke 项，便于验证注入、录音、ASR、前端命令入口是否连通。

## 2026-04-05

状态：`IN_PROGRESS`

已完成：

1. 初始化 `D:\bbq-android` 工程结构与 git 仓库。
2. 创建 `mobile/android_shell_v2` 最小可运行壳工程：
   - WebView 容器
   - LocalServiceBootstrap（phase-2 前置占位）
   - PermissionManager
   - MainActivity（含音量键触发网页按键）
3. 固化关键稳定性约束：
   - `textZoom=100`
   - 关闭缩放
   - Activity `configChanges` 防旋转重建
   - cleartext localhost 放行
4. 新增 Phase1 校验脚本：`scripts/verify_phase1.ps1`
5. 完成 Phase2 首版后端托管链路（可配置模式）：
   - `ATTACH_EXISTING` / `SPAWN_COMMAND`
   - 健康检查闸门（超时/轮询参数可配）
   - 启动失败覆盖层 + 重试按钮
   - `SPAWN_COMMAND` 日志写入 `filesDir/backend.log`
6. 完成 Phase3 首版 WindowInsets 适配：
   - `WindowCompat.setDecorFitsSystemWindows(window, false)`
   - WebView/启动覆盖层跟随系统栏 inset 补边
   - 减少竖屏状态栏遮挡导致点击漂移风险
7. 完成 Phase0 回归资产文档：
   - `docs/baseline_commands.md`
   - `docs/baseline_expected_responses.md`
   - `docs/baseline_ui_snapshot_list.md`
   - `docs/baseline_run_sheet.md`
8. 修复 Android Gradle Kotlin DSL 配置错误：
   - `app/build.gradle.kts` 中 `buildConfigField(String, ...)` 的字符串值改为正确的 `\"...\"` 形式
   - 消除 `Too many characters in a character literal` 构建错误
9. 清理 Kotlin 编译告警：
   - 移除 `MainActivity` 中已废弃的 `WebSettings.databaseEnabled` 设置
10. 处理 AGP 与 `compileSdk=35` 告警：
   - `gradle.properties` 新增 `android.suppressUnsupportedCompileSdk=35`
   - 纳入 Gradle Wrapper（`gradlew` / `gradlew.bat` / `gradle/wrapper/*`）便于环境一致性
   - wrapper 使用 `gradle-9.0.0`（本机已缓存，避免 8.7 下载超时）
11. 真机安装适配修复：
   - 发现目标真机为 Android 8.0（API 26）
   - 将 `app/build.gradle.kts` 的 `minSdk` 从 `28` 下调到 `26`，恢复可安装性
12. 完成 Phase 2.5 首版（嵌入式 Python 本地后端）：
   - 接入 Chaquopy（`com.chaquo.python`）
   - 默认启动模式改为 `EMBEDDED_PYTHON`
   - 新增 `EmbeddedPythonBackend.kt`：App 内调用 Python 启动 `backend.web_api`
   - 新增 `BackendRuntimeAssets.kt`：运行时资源解压与版本标记
   - 新增 `app/src/main/python/embedded_backend.py`：本地 HTTP 服务启动/停止控制
   - 新增 `scripts/sync_runtime_payload.ps1`：从 `D:\dc` 同步 `backend/web/db` 到 APK assets
13. 修复 Android 登录链路与登录页体验问题：
   - 安卓壳新增 `KLS_API_BASE` 注入（默认 `http://192.0.2.12:8100`），并通过启动 URL `kls_base` 参数传给前端
   - 前端 KLS 基址解析优先使用注入值（`window.__KLS_API_BASE__/kls_base`），避免回落到手机本机 `127.0.0.1:8100`
   - 登录页强制隐藏顶部导航栏（消除 tab 栏残留）
   - 放大登录页品牌与副标题字号（含移动端/横屏断点）
14. 修复“登录页点击无反应/改动不生效”的根因：
   - 发现旧机型 WebView（Chromium 71）不支持 `?.`，导致 `app.js` 语法报错后全量脚本中断
   - 对 Android 运行时 `app.js` 执行 ES 兼容转译（目标 `chrome71`），移除可选链语法
   - 保留并验证 `kls_base` 注入优先级与 `auth` 视图隐藏顶部栏逻辑
15. 修复运行时资源缓存不更新问题：
   - `BackendRuntimeAssets` 的版本标记加入 APK `lastUpdateTime`
   - 避免仅依赖 `VERSION` 导致 APK 更新后仍加载旧前端资源
16. 登录后 UI 与语音交互增强（横竖屏同构）：
   - 顶部 tab 去除焦点方框视觉，增大 tab 间距并优化横屏/竖屏间距参数
   - 新增居中悬浮实时语音框（主页面/菜品录入页共用），实时显示 ASR 文本
   - 音量键改为按当前视图路由：主页面触发 `single-action-btn`，菜品页触发 `menu-single-btn`
   - Android 壳通过 `window.__bbqVolumeKeySpeech` 调用前端入口，保持业务逻辑仍在 Web 层
17. 中文文案回归与稳定性修复：
   - 将 Android runtime `app.js` 回滚到 `D:\dc\web\app.js` 基线，清除乱码污染
   - 重新叠加本次增量改动后执行 ES 兼容转译（`target=chrome71`），避免旧 WebView 语法中断
18. 真机语音交互可观测性增强与防误触：
   - 强化顶部 tab 样式（去方框焦点视觉、加大间距、横竖屏分别优化）
   - 中央悬浮层升级为更显著视觉（半透明遮罩 + 更大卡片与字体）
   - ASR 实时链路新增麦克风输入强度展示（`Listening ▂ 34%`），用于验证真机音频输入是否到达前端
   - 音量键触发新增防抖与长按忽略（`repeatCount` + 320ms 节流），避免按键重复导致“刚开始就结束”
   - 音量键按当前视图路由到主页面或菜品页语音按钮，保持业务仍在前端执行

新增文档：

1. `docs/phase2_local_backend_boot.md`

下一步：

1. 在真机验证 `EMBEDDED_PYTHON` 模式下覆盖层可消失并进入业务页。
2. 跑 20 条基线命令，确认 Android 与 Web 一致。
3. 根据真机日志收敛 Phase 2.5 的稳定性问题（超时、重启、异常恢复）。

## 2026-04-06

状态：`IN_PROGRESS`

本轮完成：

1. 明确迁移主路径固定在 `D:\bbq-android`，不再在 `D:\dc` 创建壳工程副本。
2. 新增 Android 原生录音模块：
   - `mobile/android_shell_v2/app/src/main/java/com/yidiandian/shellv2/NativeAudioRecorder.kt`
   - 负责 `AudioRecord` 采集 16k PCM、实时音量回调、停止后返回原始 PCM。
3. 新增 WebView JSBridge 语音桥：
   - `mobile/android_shell_v2/app/src/main/java/com/yidiandian/shellv2/NativeVoiceBridge.kt`
   - 暴露 `startCapture/stopCapture/cancelCapture` 给前端，回传 `started/level/stopped/error/cancelled` 事件。
4. `MainActivity` 接入原生桥：
   - 注入 `AndroidVoiceBridge` 到 WebView；
   - Activity 销毁时释放录音资源，避免录音线程泄漏。
5. 将 Android runtime `app.js` 恢复到当前 `HEAD` 稳定版本（中文文案正常、脚本可解析），避免继续在损坏文本上修补。

验证结果：

1. `node --check mobile/android_shell_v2/app/src/main/assets/backend_runtime/web/app.js` -> `PASS`
2. `:app:assembleDebug` 暂未执行成功：当前终端缺少 `JAVA_HOME`（环境阻断，待补 JDK 路径后重跑）。

下一步：

1. 补齐本机 `JAVA_HOME` 后执行 `:app:assembleDebug`。
2. 真机安装验证 NativeBridge 事件：`started -> level -> stopped`。
3. 在不改业务逻辑前提下，继续收敛“音量键触发 + 中央悬浮实时文本”链路稳定性。

### 2026-04-06 补充（NativeBridge 前端接入）

## 2026-04-08

状态：`IN_PROGRESS`

本轮完成（针对“ASR 出字后 Agent Failed to fetch”）：

1. 明确真机实际执行代码位于 `mobile/android_shell_v2/app/src/main/assets/backend_runtime`，不是 `D:\dc` 运行目录。
2. 修复安卓资产后端模型调用参数兼容：
   - `backend/agent_client.py` 移除全部 `temperature: 0` 固定参数。
   - 保留 `response_format=json_object`，避免结构化输出回退。
3. 修复安卓资产后端网络异常映射：
   - `backend/agent_client.py` 新增 `TimeoutError/socket.timeout` 捕获并统一转为 `ValueError`，避免未捕获异常导致连接中断。
4. 修复安卓资产 Web API 断连问题：
   - `backend/web_api.py` 的 `do_POST` 增加全局 `except Exception`，统一返回 JSON `INTERNAL_ERROR`，避免前端出现无响应的连接断开。
5. 增强前端可观测性：
   - `web/app.js` 在 `api()` 与 `klsApi()` 的 `fetch` 层增加网络异常包装，日志会明确输出失败方法与目标 URL（不再只显示 “Failed to fetch”）。

待你真机复测：

1. 按键语音 -> ASR 出字 -> 自动触发主/菜单 agent。
2. 若失败，日志应显示 `fetch failed: <METHOD> <URL> -> <reason>` 或 `KLS fetch failed: ...`，可直接定位是 8000 还是 8100 链路。

1. `mobile/android_shell_v2/.../web/app.js` 新增原生语音桥消费层：
   - `hasNativeVoiceBridge / ensureNativeVoiceBridgeHandler`
   - `startNativeVoiceCapture / stopNativeVoiceCapture`
   - `pcm16Base64ToWavBlob`
2. 主页面与菜品录入页的实时语音链路改为“优先原生录音、回落 WebSocket 实时流”：
   - `startSingleActionCaptureRealtime`
   - `stopSingleActionCaptureAndExecuteRealtime`
   - `startMenuSingleCaptureRealtime`
   - `stopMenuSingleCaptureAndSubmitRealtime`
3. 结束录音后的转写保持原业务路径：原生 PCM -> WAV Blob -> `klsAsrTranscribeBlob` -> 原有命令执行。

校验：

1. `node --check mobile/android_shell_v2/app/src/main/assets/backend_runtime/web/app.js` -> `PASS`

### 2026-04-06 构建环境补充

1. 已定位本机 Android Studio 内置 JDK：`D:\andrio\jbr`（java.exe 在 `D:\andrio\jbr\bin\java.exe`）。
2. 修复 `NativeVoiceBridge.kt` 两处 Kotlin 字符串构造编译错误（`String(...)` 调用不合法）。
3. 在注入 `JAVA_HOME=D:\andrio\jbr` 后成功通过：
   - `:app:assembleDebug` -> `BUILD SUCCESSFUL`

### 2026-04-06 补充（音量键链路与顶部 Tab 生效修复）

1. 修复顶部 Tab 间距未生效问题：
   - `preview_nonauth.css` 中误写的选择器 `\\.top-links` 改回 `.top-links`，使横竖屏间距配置真正生效。
2. 收敛音量键触发路径：
   - `MainActivity.kt` 中音量键注入脚本改为仅调用 `window.__bbqVolumeKeySpeech`；
   - 去除 Android 侧对具体业务按钮的兜底点击，确保“输入层在原生，业务链路在前端按钮同一路径”。
3. 验证与装机：
   - `:app:assembleDebug` -> `BUILD SUCCESSFUL`；
   - 已安装到真机 `YOUR_DEVICE_SERIAL` 并成功拉起 `com.yidiandian.shellv2/.MainActivity`。

### 2026-04-06 补充（开发态免重复登录 + Tab 焦点框收敛）

1. 开发态登录持久化：
   - `MainActivity.buildInitialWebUrl()` 在 `DEBUG` 构建下追加 `dev_persist_auth=1`；
   - 前端 `app.js` 新增 `DEV_PERSIST_AUTH`，并将 KLS 鉴权态持久化切换为 `localStorage`（开发态），避免每次重启都重新登录。
2. 顶部 Tab 可见性与交互视觉收敛：
   - 修正 `preview_nonauth.css` 的 `.top-links` 选择器后，间距样式正常生效；
   - 为 `.top-links .nav-tab` 增加 `focus/focus-visible/active` 的 `outline/box-shadow` 清理，去掉点击后残留焦点框。
3. 验证与装机：
   - `node --check app.js` 通过；
   - `:app:assembleDebug` 通过；
   - 真机 `YOUR_DEVICE_SERIAL` 已 `install -r` 并成功拉起。

### 2026-04-06 补充（Debug 注入式登录）

1. 新增 Debug 注入字段（Gradle -> BuildConfig）：
   - `DEV_INJECT_ACCESS_TOKEN`
   - `DEV_INJECT_REFRESH_TOKEN`
   - `DEV_INJECT_ROLE`
2. Android 启动参数注入：
   - `MainActivity` 在 `DEBUG` 下将上述字段拼入 Web 首次 URL 查询参数。
3. 前端接收注入并落库：
   - `app.js` 新增 `applyDevInjectedAuthState()`，将注入 token 写入 `klsAuthState` 并持久化；
   - 注入后立即清理 URL 中 token 参数（`history.replaceState`），避免明文停留在地址栏。
4. 文档补充：
   - `docs/setup_local_android_shell.md` 新增“Debug 注入登录态（免手动登录）”配置说明。
5. 验证：
   - `node --check app.js` 通过；
   - `:app:assembleDebug` 通过；
   - 真机 `YOUR_DEVICE_SERIAL` 重装并拉起成功。

### 2026-04-06 补充（Run 工作流固化 + 真机可观测 smoke）

1. 固化开发工作流脚本：
   - 新增 `scripts/run_android_with_web_auth.ps1`；
   - 一次执行完成：token 注入 -> 构建 -> 装机 -> 拉起 -> 音量键 ASR smoke。
2. token 注入策略升级：
   - 优先从浏览器 Web 会话 `bbq.kls.auth.state` 读取有效 token；
   - 若会话 token 全部过期，自动在本机 KLS 服务端用 `TokenStore` 直签 120 分钟开发 access token（仅调试）。
3. Android 可观测性增强：
   - `MainActivity` 新增 WebView console 到 `BBQWebView` 的日志桥接；
   - 音量键触发增加路由日志（`[KEY] volume pressed/route result`）。
4. 前端可观测性增强：
   - `log()` 同步输出 `console.log`（`[APPLOG]` 前缀）；
   - 新增 `logUiRuntimeSnapshot(boot/delayed)`，记录当前皮肤、tab 间距与规则命中、native bridge 状态。
5. 兼容性修复：
   - 为旧 WebView 补齐 `Promise.allSettled` polyfill；
   - 修复 `Blob.arrayBuffer` 不可用导致的 ASR 阻断（增加 `FileReader` 回退）；
   - 去除不兼容旧 WebView 的外链 `lucide` 脚本，消除启动期语法错误。
6. Tab 样式在旧内核生效修复：
   - 从 `flex gap` 退化为 `nav-tab + nav-tab margin-left` 方案（移动端 34px），避免旧 WebView `gap` 兼容问题。
7. 真机 smoke 结果（自动脚本）：
   - `UI snapshot boot/delayed`、`tab_margin_rule=true`、`volume route result=main`、`Single button native capture started` 均已出现；
   - 说明“音量键 -> 原生录音 -> 前端按钮链路入口”已打通；
   - ASR 最终文本是否非空取决于当次录音语音内容与环境噪音（自动脚本仅触发按键，不注入人声）。

### 2026-04-06 补充（音量键按住 start/stop 修复 + KLS 可注入）

1. 音量键录音链路改为按住语义：
   - `MainActivity.kt` 拆分为 `onKeyDown -> __bbqVolumeKeySpeechStart`、`onKeyUp -> __bbqVolumeKeySpeechStop`；
   - 新增 `volumeSpeechActive`，避免重复按下导致的 start/stop 抖动。
2. 前端补齐 start/stop 入口并与原链路对齐：
   - `app.js` 新增 `triggerSpeechCaptureStartByCurrentView` / `triggerSpeechCaptureStopByCurrentView`；
   - 音量键不再依赖“按钮 click 切换态”，改为直接走同一套 `handle*CaptureStart/Stop` 处理函数。
3. 原生桥稳定性补强：
   - `nativeVoiceBridgeRuntime` 增加 `startPending`；
   - 处理 `started` 事件后再允许 stop；
   - `stopCapture` 增加短重试，降低“刚启动即停止”导致的拒绝概率。
4. 错误可见性增强：
   - 新增 `showAsrLiveOverlayError`；
   - ASR 失败与空转写不再瞬间消失，改为悬浮框停留显示，便于真机定位问题。
5. KLS 地址改为构建时注入：
   - `app/build.gradle.kts` 的 `KLS_API_BASE` 支持 `-PKLS_API_BASE=...`；
   - `scripts/run_android_with_web_auth.ps1` 新增 `-KlsApiBase` 参数并在构建时显式注入，避免写死地址连错环境。
6. 验证：
   - `node --check mobile/android_shell_v2/app/src/main/assets/backend_runtime/web/app.js` 通过；
   - `scripts/run_android_with_web_auth.ps1 -DeviceId YOUR_DEVICE_SERIAL -KlsApiBase http://192.0.2.10:8100` 已完成构建、装机与烟测；
   - 日志可见 `volume down/up route result` 与 `Single button native capture started`。

### 2026-04-06 补充（登录注入验收门槛收敛）

1. 调整 `scripts/run_android_with_web_auth.ps1` smoke 判定：
   - 默认以“开发注入登录成功”为验收主目标（`Dev auth token injected` + UI snapshot + tab 规则）。
   - ASR 烟测改为可选门槛：`-RequireAsrSmoke $true` 才强制校验 `Single button native capture started`。
2. 目的：
   - 避免 KLS ASR provider 暂未配置实时能力（如 `manual`）时，把“登录注入成功”误判为失败。
3. 文档同步：
   - `docs/setup_local_android_shell.md` 增加 `-RequireAsrSmoke` 说明。

### 2026-04-06 补充（401 过期修复：会话预热 + refresh_token 注入）

1. 音量键语音链路在开始录音前增加 KLS ASR session 预热：
   - `startSingleActionCaptureRealtime` / `startMenuSingleCaptureRealtime` 先调用 `klsGetRealtimeAsrSession(false)`；
   - 保证“音量键 -> ASR”路径与 KLS session 获取链路一致。
2. 修复本地调试注入 token 无 refresh_token 的问题：
   - `scripts/run_android_with_web_auth.ps1` 的 `Issue-LocalDevAccessToken` 改为同时签发 `refresh_token`；
   - 避免 access_token 过期后无法自动 refresh，出现 401“登录态过期”。
3. 验证：
   - 已重新构建并重装真机 `YOUR_DEVICE_SERIAL`；
   - 启动与音量键路由 smoke 通过，日志无“Auth expired in log”。

### 2026-04-06 补充（网络直连模式修正）

1. 调整 `run_android_with_web_auth.ps1`：
   - `EnableAdbReverse` 默认关闭；
   - `KlsApiBase` 支持空值自动解析本机 IPv4，或显式传服务器地址。
2. 目的：
   - 避免强制 USB 隧道，保证后续接入服务器 KLS/CLIProxy 时链路一致（真实网络）。
3. 验证：
   - 以 `-KlsApiBase http://192.0.2.12:8100` 重装后，日志不再出现 `Failed to fetch`；
   - 当前仅剩 ASR 空音频的预期 503（自动 keyevent 无真人语音）。

### 2026-04-06 补充（真机直连失败根因修复）

1. 根因：
   - Android `network_security_config.xml` 仅放行 `127.0.0.1/localhost` 的明文 HTTP；
   - 当 KLS 使用局域网地址（如 `http://192.0.2.12:8100`）时，WebView 被 cleartext 策略拦截，前端表现为 `Failed to fetch`。
2. 修复：
   - `network_security_config.xml` 增加 `<base-config cleartextTrafficPermitted="true" />`，允许开发阶段直连局域网 KLS。
3. 验证：
   - 重新构建并重装真机后，`Failed to fetch` 消失；
   - 日志链路可稳定走到 `POST /api/asr/transcribe`（当前自动 smoke 仍因无真人语音返回空转写 503）。

### 2026-04-06 补充（KLS 下发模型接入，修复 502 模型不匹配）

1. Android runtime 后端支持请求级模型注入：
   - `runtime_gateway.py` 新增 `request_gateway_overrides(..., model=...)`；
   - 新增 `resolve_openai_model()`，优先使用请求头注入模型，兜底 `OPENAI_MODEL/gpt-5.2`。
2. API 注入头扩展为三元组：
   - `X-Gateway-Api-Key`
   - `X-Gateway-Base-Url`
   - `X-Gateway-Model`
   - `web_api.py` 将 `X-Gateway-Model` 纳入 CORS allow-list 与注入校验。
3. 前端接入 KLS 运行时配置：
   - `app.js` 新增 `klsRuntimeConfigAction()`，调用 `/api/me/runtime-config` 获取
     `gateway_base_url + chat_model_alias`；
   - 业务请求统一携带 `X-Gateway-Model`；
   - 登录后 bootstrap 先拉 runtime-config，再拉 gateway-key，避免模型缺失导致 502。
4. agent 侧改为动态模型：
   - `agent_client.py` 创建适配器时使用 `resolve_openai_model(...)`；
   - 菜单 agent 同样优先取请求注入模型，不再写死 `gpt-4.1-mini`。
5. 兼容性与可用性：
   - 保持原有业务逻辑与接口路径不变，仅补齐“模型由 KLS 下发”的参数链路；
   - 移除调试临时文件（`.tmp_dev_auth.json`、`__pycache__`）避免污染仓库。
6. 校验：
   - `python -m py_compile`（runtime 后端 3 文件）通过；
   - `node --check`（runtime `app.js`）通过；
   - 当前终端缺少 `JAVA_HOME`，未在此终端完成 `assembleDebug`（代码层校验已完成）。

### 2026-04-06 补充（修复按键语音->ASR->文本->Agent 链路回归）

1. 修复点（前端 runtime）：
   - `app.js` 增加 `DEFAULT_GATEWAY_CHAT_MODEL=gpt-5.2`；
   - 新增 `getEffectiveGatewayModelAlias()`；
   - 网关注入阶段不再因 `chatModelAlias` 暂缺而阻塞，自动回退默认模型并持久化；
   - `klsRuntimeConfigAction()` 增强字段兼容：`chat_model_alias/chat_model/model`。
2. 修复点（后端 runtime）：
   - `web_api.py` 的 `_ensure_gateway_injected()` 改回兼容校验：
     - 必须：`X-Gateway-Api-Key`、`X-Gateway-Base-Url`
     - 可选：`X-Gateway-Model`（缺失不再直接 401）
3. 目标：
   - 保留“KLS 可下发模型”的能力；
   - 同时避免模型头瞬时缺失导致整条语音命令链路中断。
4. 校验：
   - `node --check app.js` 通过；
   - `python -m py_compile web_api.py` 通过；
   - `:app:assembleDebug` 通过（`JAVA_HOME=D:\\andrio\\jbr`）。

## 2026-04-07

状态：`IN_PROGRESS`

本轮完成：

1. 修复 WebView confirm 弹窗“飘逸”问题：
   - `MainActivity.kt` 的 `WebChromeClient` 新增 `onJsConfirm`；
   - 将 `window.confirm` 统一接管为 Android 原生 Material 对话框；
   - 弹窗显示后强制 `Gravity.CENTER`，保证在屏幕中心展示，符合 App 弹窗规范。
2. 稳定性处理：
   - Activity 即将销毁时直接 `result.cancel()`，避免 JS confirm 悬挂；
   - 对话框关闭路径统一回收 `JsResult`，避免重复确认/取消。
3. 文档同步：
   - 更新 `02_android_v2_pitfalls.md` 与 `docs/pitfalls.md`，新增 WebView confirm 居中约束。

验证：

1. `:app:assembleDebug` 通过（`BUILD SUCCESSFUL`）。
2. `scripts/verify_phase2.ps1` 通过（`Phase2 verification passed.`）。
3. `scripts/run_android_with_web_auth.ps1` 注入链路 smoke 已执行通过：
   - 完成 token 注入、构建、装机与拉起；
   - 日志门槛 `Dev auth injected/UI snapshot/tab margin rule/volume route` 均为 `True`；
   - 脚本退出码 `0`。

### 2026-04-07 补充（Tab 间距重排 + 个人页乱码修复）

1. 顶部 Tab 视觉层级调整（`preview_nonauth.css`）：
   - 增大品牌与首个 Tab（主页面）的距离：`brand-nav gap` 提升、首个 `nav-tab` 增加左边距；
   - 收敛“菜品录入 / 数据查看”横向占位：后续 Tab 间距由大间距改为中等间距；
   - 同步移动端断点（`max-width: 760px`）下的同类规则，保证横竖屏观感一致。
2. 个人页中文乱码修复（`app.js`）：
   - 修复用户中心渲染中 `???` 占位文本；
   - 统一替换为中文可读文案（如“未登录”“请先完成短信登录”“有效期...续费状态...”）。
3. 文档同步：
   - 更新 `02_android_v2_pitfalls.md` 与 `docs/pitfalls.md`，新增“个人页文案禁止问号占位”防呆项。

校验：

1. `node --check mobile/android_shell_v2/app/src/main/assets/backend_runtime/web/app.js` 通过。
2. `:app:assembleDebug` 通过（`BUILD SUCCESSFUL`）。

### 2026-04-09 补充（App 图标 8 方案草图）

1. 依据当前 UI 主色系生成 8 款同风格 App 图标候选（单图 8 宫格）：
   - 输出：`docs/design/app_icon_candidates_8up.png`
2. 新增方案说明文档：
   - `docs/design/app_icon_candidates_notes.md`
3. 新增本地生成脚本（可复用迭代）：
   - `scripts/generate_app_icon_board.py`

校验：

1. 已本地生成并人工检查图像输出。

### 2026-04-09 补充（A2 配色微调）

1. 按反馈将 `A2` 方案中心“点”字内部颜色调整为 `#1dc172`。
2. 重新生成：
   - `docs/design/app_icon_dot_candidates_4up.png`
3. 同步更新方案说明：
   - `docs/design/app_icon_dot_candidates_4up_notes.md`

校验：

1. 已通过像素抽样确认 `#1dc172` 生效。

### 2026-04-09 补充（A2 图标正式落地 + 重装验证）

1. 将 `A2` 单独导出并作为 Android App 图标落地：
   - 单图输出：`docs/design/app_icon_a2_single.png`
   - 图标前景资源：`res/drawable-nodpi/ic_launcher_a2_foreground.png`
2. 更新 Android 图标配置：
   - `mipmap-anydpi-v26/ic_launcher.xml` 与 `ic_launcher_round.xml` 改为自定义前景/背景；
   - 新增 `drawable/ic_launcher_foreground.xml` 与 `drawable/ic_launcher_background.xml`；
   - `AndroidManifest.xml` 增加 `android:roundIcon`。
3. 新增自动导出脚本：
   - `scripts/export_a2_icon_and_resources.py`

验证：

1. `:app:assembleDebug` 通过（`BUILD SUCCESSFUL`）。
2. 真机 `YOUR_DEVICE_SERIAL` 重装成功（`adb install -r` -> `Success`）。
3. 强制停止后重新拉起成功（`am start -W` -> `Status: ok`）。

### 2026-04-09 补充（图标缓存与裁剪兼容修复）

1. 兼容策略升级：
   - 新增 `ic_launcher_v2` / `ic_launcher_round_v2`（所有 `mipmap-*` 密度）；
   - `AndroidManifest.xml` 的 `icon/roundIcon` 切换为 `@mipmap/ic_launcher_v2` 与 `@mipmap/ic_launcher_round_v2`；
   - 图标导出增加安全留白，降低部分启动器的自动裁剪风险。
2. 验证：
   - `:app:assembleDebug` 通过；
   - `adb install -r -t -g` 成功并可拉起；
   - `aapt dump badging app-debug.apk` 显示应用图标为：
     - `res/mipmap-*/ic_launcher_v2.png`

### 2026-04-09 补充（A2 图标最终收敛：蓝底整体 + 去灰影）

1. 图标视觉调整：
   - 将蓝青渐变作为图标整体底色（不再使用白色整体背景）；
   - 去除“点”字下方灰色圆圈阴影。
2. 资源生成逻辑调整：
   - `scripts/export_a2_icon_and_resources.py` 改为：
     - 前景仅导出透明徽章层（`ic_launcher_a2_foreground.png`）；
     - 背景由 `ic_launcher_background.xml` 提供蓝青渐变。
3. 同步更新说明文档：
   - `docs/design/app_icon_dot_candidates_4up_notes.md`

验证：

1. `:app:assembleDebug` 通过（`BUILD SUCCESSFUL`）。
2. 真机 `YOUR_DEVICE_SERIAL` 重装成功并拉起（`Status: ok`）。

### 2026-04-09 补充（整图直用 launcher 图标）

1. 按要求将 `app_icon_a2_single.png` 以整图方式用于 Android launcher 图标：
   - 新增 `res/drawable-nodpi/ic_launcher_a2_full.png`；
   - `ic_launcher_background.xml` 直接引用整图位图；
   - `ic_launcher_foreground.xml` 改为透明层，避免二次叠加。
2. 更新导出脚本：
   - `scripts/export_a2_icon_and_resources.py` 直接输出整图 Android 资源，不再输出拆分前景图。

验证：

1. `:app:assembleDebug` 通过（`BUILD SUCCESSFUL`）。
2. 真机 `YOUR_DEVICE_SERIAL` 重装成功（`adb install -r` -> `Success`）。
3. 强制停止后重新拉起成功（`am start -W` -> `Status: ok`）。

### 2026-04-09 补充（“点”字版 App 图标 4 方案）

1. 按最新要求重做 App 图标（单图 4 宫格）：
   - 基于原“第一排第 3 个”结构；
   - 中心字形改为“点”；
   - 色调分别匹配原方案“第一排第 2 个”与“第二排第 3 个”风格。
2. 字体样式对齐品牌：
   - 引入 `docs/design/fonts/ZCOOLKuaiLe-Regular.ttf`，用于“点”字渲染。
3. 新增产物与脚本：
   - `docs/design/app_icon_dot_candidates_4up.png`
   - `docs/design/app_icon_dot_candidates_4up_notes.md`
   - `scripts/generate_app_icon_dot_board_4up.py`

校验：

1. 已本地生成并人工检查图像输出。

### 2026-04-07 补充（Failed to fetch 根因修复：KLS 基址注入）

1. 根因定位：
   - Android runtime `index.html` 中 `auth-kls-base-url` 与 `kls-base-url` 仍写死旧地址 `http://192.0.2.12:8100`；
   - 导致 WebView 实际请求未使用 `MainActivity` 注入的 `kls_base`，出现启动期与音量键 ASR 链路 `Failed to fetch`。
2. 代码修复：
   - `mobile/android_shell_v2/app/src/main/assets/backend_runtime/web/index.html`
     - 清空两处 KLS 默认值，改为 placeholder，避免硬编码污染运行时配置。
   - `mobile/android_shell_v2/app/src/main/assets/backend_runtime/web/app.js`
     - 新增 `initializeKlsBaseInputs()`；
     - 启动时优先使用注入/查询参数解析出的 `normalizeKlsBase("")` 回填 auth 与 kls 两处输入框；
     - 若存在 `kls_base` 查询参数则覆盖旧值，确保运行时基址一致。
3. 影响范围：
   - 不改业务逻辑，仅修复 KLS 入口地址来源；
   - 直接改善“发送验证码/登录/获取网关 key/音量键 ASR 会话”全链路稳定性。

### 2026-04-07 补充（KLS 模型下发实时性修复）

1. 问题：
   - 旧逻辑在 `gatewayKey + gatewayBaseUrl + chatModelAlias` 已存在时直接复用，不再拉取 `/api/me/runtime-config`；
   - KLS 后台改模型（例如切到 `kimi-*`）后，已登录 App 可能继续使用旧模型别名直到重新登录。
2. 修复：
   - `app.js` 新增 runtime-config TTL 刷新策略（`KLS_RUNTIME_CONFIG_REFRESH_MS=15s`）；
   - 在网关注入前，当到达刷新窗口会自动重拉 `/api/me/runtime-config`，并覆盖 `gatewayBaseUrl/chatModelAlias`；
   - 刷新成功后记录 `config_id`，当模型或基址发生变更时输出日志：
     - `KLS runtime config applied: model=... base=... config_id=...`。
3. 稳定性：
   - 登录态清理/重建路径（登录注入、登录成功、退出登录）均重置 runtime-config 缓存时间戳，避免脏缓存。

## 2026-04-08

状态：`DONE`

本轮完成：

1. 同步 `2026-04-07` 以来后端核心改动到 Android runtime：
   - 文件：`mobile/android_shell_v2/app/src/main/assets/backend_runtime/backend/agent_client.py`
   - 同步来源：`D:\dc\backend\agent_client.py`（当前源版本 `17224aa`）。
2. 保持 Android 端稳定性：
   - 未覆盖 Android 已适配的前端资源，避免 WebView 旧内核语法兼容问题导致 `app.js` 启动失败；
   - 保留 Android 原有可运行 UI/事件链路，仅升级后端 agent 请求与解析逻辑。
3. 版本标记更新：
   - `mobile/android_shell_v2/app/src/main/assets/backend_runtime/VERSION`
   - 标记为 `source=17224aa`，便于回溯同步来源。

验证（真机）：

1. `python -m py_compile .../backend/agent_client.py` 通过。
2. 执行打包与重装：
   - `scripts/run_android_with_web_auth.ps1 -DeviceId YOUR_DEVICE_SERIAL -KlsApiBase http://127.0.0.1:8100 -EnableAdbReverse:$true`
   - `:app:assembleDebug` 成功；
   - `adb install -r` 成功；
   - App 拉起成功。
3. 日志 smoke 通过项（`BBQWebView`）：
   - `Dev auth token injected`
   - `UI snapshot(boot/delayed)`
   - `KLS runtime config applied`
   - `volume down/up route result`
   - `Single button native capture started`

### 2026-04-08 补充（Android runtime 默认超时对齐到 45s）

1. 问题背景：
   - Web 端常用启动脚本默认 `OPENAI_TIMEOUT_SECONDS=45`；
   - Android runtime 默认 `OPENAI_TIMEOUT_SECONDS=20`，菜单语音在慢模型下更易触发 `internal error: timed out`。
2. 修复：
   - `mobile/android_shell_v2/app/src/main/assets/backend_runtime/backend/agent_client.py`
   - 将默认超时从 `20` 调整为 `45`（仍可被环境变量覆盖）。
3. 影响：
   - 不变更业务逻辑，仅提高 Android 端默认请求耐受时长，和 Web 实测口径对齐。

### 2026-04-08 补充（竖屏底部结构收敛 + 菜单原生拍照上传）

1. 竖屏视觉结构修复：
   - 在 `max-width:1200 && portrait` 下，明确隐藏主页面/菜单页底部 `placeholder-zone`；
   - 同时移除竖屏 `workspace-layout` 底部边界线，避免出现“底部第三层结构”观感。
2. 菜单页新增原生拍照入口（表格下方）：
   - `web/index.html` 在菜单表格下新增 `拍照上传菜单` 按钮与状态文案；
   - `web/styles.css` 新增 Android 风格按钮与状态样式，竖屏自动改为纵向布局。
3. Android 原生接口接入（不走 `<input type=file>`）：
   - 新增 `NativeMediaBridge.kt`，通过 `JavascriptInterface` 提供：
     - `captureMenuImage()`（相机拍照）
     - `pickMenuImage()`（相册选图，保留扩展）
   - 通过 `window.__nativeMediaBridge.onEvent(...)` 回传 `image_base64/mime_type/file_name`。
4. 前端链路对接：
   - `web/app.js` 新增 `AndroidMediaBridge` 运行时封装与事件处理；
   - 新按钮优先走原生拍照，拿到图片后复用现有 `/api/menu/ocr/parse` -> 预览弹窗 -> `/api/menu/ocr/import` 的完整链路；
   - 无原生桥接时自动降级到既有文件选择。
5. 构建与重装验证：
   - `node --check web/app.js` 通过；
   - `:app:compileDebugKotlin` 通过；
   - `scripts/run_android_with_web_auth.ps1` 完整执行通过（真机 `YOUR_DEVICE_SERIAL` 已重装拉起）。

### 2026-04-08 补充（安卓端菜品确认弹窗居中与顶层修复）

1. 问题：
   - 菜品确认弹窗（以及买单/撤桌确认弹窗）在部分场景未稳定居中；
   - 弹窗层级低于反馈/语音浮层，出现“不是最顶层”的遮挡。
2. 修复（仅 `D:\bbq-android`）：
   - `mobile/android_shell_v2/app/src/main/assets/backend_runtime/web/styles.css`
   - `mobile/android_shell_v2/app/src/main/assets/backend_runtime/web/runtime_compat.css`
   - `.modal` 调整为 `flex` 居中并启用 `overflow-y:auto`；
   - `.modal` `z-index` 提升到 `260`（高于 `action-feedback-overlay=120`、`asr-live-overlay=180`）；
   - `.modal-card` 增加 `max-height + overflow:auto + margin:auto`，保证小屏与键盘场景仍可见可滚动。
3. 影响：
   - 不改业务逻辑，仅修复弹窗视觉层级与定位行为。

### 2026-04-08 补充（二次修复：三类确认弹窗强制居中顶层）

1. 问题复现：
   - 菜品确认弹窗在部分皮肤组合下仍落到底部背景区，未稳定居中；
   - 买单/撤桌确认弹窗与菜品确认弹窗未做到统一“屏幕正中 + 最高层级”。
2. 修复策略（仅 Android v2 目录）：
   - 对 `#checkout-modal`、`#cancel-modal`、`#menu-ocr-preview-modal` 增加 ID 级强制样式：
     - `position: fixed !important; inset: 0 !important;`
     - `display: flex !important; align-items/justify-content: center !important;`
     - `z-index: 9999 !important;`
   - 对三类弹窗 `.modal-card` 增加统一约束：
     - `max-height + overflow:auto + margin:auto`，确保小屏仍在中心可滚动。
3. 覆盖文件：
   - `web/styles.css`
   - `web/runtime_compat.css`
   - `web/preview_nonauth.css`
4. 结果：
   - 三类确认弹窗统一为屏幕中心悬浮展示，层级高于页面其它浮层。

### 2026-04-08 补充（三次修复：运行时强制挂顶层，绕过容器限制）

1. 现象：
   - 仅靠 CSS 在部分真机场景仍会出现弹窗被“局部容器约束”而落到底部区域的问题。
2. 修复：
   - 在 `web/app.js` 新增 `ensureViewportModalOverlay(modalEl)`；
   - 每次打开三类弹窗前执行：
     - 将弹窗节点强制挂到 `document.body`；
     - 注入内联样式强制 `fixed + inset:0 + 居中 + 最高层级`；
     - 弹窗卡片同步注入 `maxHeight + overflow`，保证小屏可滚动。
   - 覆盖对象：
     - `openCheckoutConfirmModal(...)`
     - `openCancelConfirmModal(...)`
     - `openMenuOcrPreviewModal(...)`
3. 影响：
   - 不改业务流程，仅增强弹窗定位可靠性，避免被页面布局约束。

### 2026-04-08 补充（提示框/语音框顶层化 + 语音播报 + 流式优先）

1. 成功/失败提示框：
   - `showActionFeedback(...)` 新增运行时顶层挂载逻辑（append 到 `document.body` + 固定定位 + 超高 z-index）。
   - 显示样式统一为屏幕中心悬浮，不受页面表格/工作区容器影响。
2. 按音量键语音输入框：
   - `showAsrLiveOverlay(...)` 同步使用顶层挂载逻辑；
   - 语音框改为屏幕正中“方框”形态（近正方，固定中心）。
3. 流式 ASR 与实时文本：
   - 调整语音链路为“优先实时流式 ASR（KLS WS）→ 失败时回退 Native 录音”；
   - 当走流式路径时，中央语音框实时更新识别文本。
4. 无声音修复：
   - 前端反馈播报优先调用 Android 原生 `AndroidVoiceBridge.speakText(...)`；
   - 失败再回退 `speechSynthesis`。
   - Android 侧 `NativeVoiceBridge` 新增原生 TTS 能力（TextToSpeech）。
5. Android WebView 媒体权限：
   - `MainActivity` 新增 `onPermissionRequest`，对 WebView 的麦克风资源进行授权，提升流式采集可用性。

### 2026-04-08 补充（全项目中文乱码扫描与修复）

1. 扫描范围：
   - `D:\bbq-android` 全项目文本文件（排除 `.git/.idea/build/.gradle/__pycache__`）。
2. 扫描结果：
   - 发现 2 处真实中文乱码，均位于：
     - `mobile/android_shell_v2/app/src/main/assets/backend_runtime/web/app.js`
3. 修复内容：
   - 将 `"鑿滃崟鍥剧墖鎵归噺褰曞叆"` 修复为 `"菜单图片批量录入"`（2 处）。
4. 复扫结果：
   - 无剩余疑似乱码命中。

## 2026-04-09

状态：`IN_PROGRESS`

本轮完成（UI 收口）：

1. 菜品录入页拍照上传入口改为更清晰的双行按钮样式：
   - 主文案：`拍照上传菜单`
   - 副文案：`智能识别并预录入`
   - 同步调整 `index.html / styles.css / preview_nonauth.css`。
2. 数据查看页 KPI 卡片对齐：
   - `当日营业额` 头部结构改为与 `周期营业额` 同构（标题 + 右侧 chip）。
   - `profit-current` 与 `profit-period-value` 统一排版与移动端字号策略。
3. 个人页套餐展示收敛为单套餐：
   - 仅保留基础版卡片。
   - 要点更新为：
     - 语音点餐与收银
     - 营业与销量报表
     - 最多支持1个设备在线
   - 同步修复 `runtime_compat.css` 的旧三列/两列覆盖，避免运行时样式回退。

### 2026-04-09 补充（拍照上传按钮底色对齐）

1. 菜品录入页“拍照上传菜单”按钮由渐变底改为背景同色（白底），保留边框与双行文案层级。
2. 主文案与副文案改为深色系，提升浅底可读性。
3. 同步文件：`styles.css`、`preview_nonauth.css`。

### 2026-04-09 补充（拍照上传按钮改为功能区同款渐变）

1. 菜品录入页“拍照上传菜单”按钮底色由白底改为与表格下方功能区一致的浅青渐变。
2. `styles.css` 与 `preview_nonauth.css` 同步，避免运行态与预览态不一致。
3. 按要求执行默认流程：构建、重装、重启。

### 2026-04-09 补充（ASR 速度差异收敛：安卓与 Web 路径对齐）

1. 问题定位：
   - 安卓端语音链路在实时流失败时会退回 `NativeAudioRecorder + /api/asr/transcribe`，这条路径比 Web 端实时流多一段“录音完成后再上传转写”的等待。
2. 本轮改动（仅 Android runtime 前端，不改业务语义）：
   - 文件：`mobile/android_shell_v2/app/src/main/assets/backend_runtime/web/app.js`
   - 主页面与菜品录入页语音入口统一改为“仅实时 ASR（KLS WS）”。
   - 移除主流程中的 native fallback 分支，避免隐式走慢路径。
   - 去掉开始录音前的重复 session 预取，避免每次多一次额外请求。
3. 结果：
   - 安卓端按键语音链路与 Web 端保持同构：`实时转写 -> 直接执行指令`。
   - 速度差主要收敛到网络与模型执行耗时，不再叠加本地 fallback 的额外时延。

### 2026-04-09 补充（真机兼容修复：恢复 ASR 原生兜底）

1. 现象：
   - 真机日志出现 `Unable to select audio device`，导致 WebView `getUserMedia` 实时流启动失败。
2. 修复：
   - 在 Android runtime `web/app.js` 恢复“实时 ASR 失败 -> Native 录音 -> `/api/asr/transcribe`”兜底分支。
   - 主页面与菜品录入页均恢复同样兜底逻辑，保证功能可用优先。
3. 说明：
   - 保持“实时优先”不变；仅在实时流不可用时自动回退，避免按键语音完全不可用。

### 2026-04-09 补充（音量键起停竞态修复）

1. 问题：
   - 物理音量键触发存在“按下后快速抬起”的竞态，可能导致 `start` 异步尚未完成时 `stop` 被忽略，进而残留原生录音占用。
2. 修复：
   - 新增 `single/menu` 两套 `startPending + stopRequested` 状态机。
   - 若在 `startPending` 期间收到 `stop`，先标记 `stopRequested`，待启动完成后自动执行 `stop`。
   - `startNativeVoiceCapture` 启动前新增“已有录音占用”检测：若在录音则先 `cancelCapture()` 再启动。
3. 结果：
   - 避免 `native voice capture start rejected` 的连锁失败，提升音量键语音稳定性。

### 2026-04-09 补充（短按空音频修复）

1. 问题：
   - 音量键快速抬起时，可能在录音样本不足时触发停止，出现 `audio payload is empty after conversion`。
2. 修复：
   - 主页面/菜品录入页语音链路新增最小采样时长保护（`MIN_CAPTURE_MS_FOR_VOLUME=420ms`）。
   - 若释放过快，内部延迟到最小时长后再执行 stop。
   - 新增 native 启动日志：`Single/Menu native capture started`，便于真机排障。
   - native 停止后新增最小音频字节校验（`bytes < 2048` 直接前端提示“按住说话时间太短”），避免向后端发送空音频并触发 400。

### 2026-04-10 补充（安卓原生 API 实时推流接入）

1. 背景：
   - 真机 WebView `getUserMedia` 在部分设备上会出现 `Unable to select audio device`，导致实时链路先失败再回退，体感出现明显间距。
2. 改动：
   - Android 原生录音桥新增 `chunk` 事件（PCM16 分片）。
   - `createKlsRealtimeAsrCapture(...)` 新增“native-stream”音频源：
     - 优先使用 `AndroidVoiceBridge` 分片实时推流到 KLS ASR WebSocket；
     - 仅在 native-stream 不可用时回退 web-mic；
     - 最终非流式 `/api/asr/transcribe` 仍作为兜底链路保留。
3. 目标：
   - 将“正在聆听 -> 正在聆听+音量”的启动间距压缩为实时路径耗时，避免固定出现“先失败再回退”的体验。

### 2026-04-10 补充（ASR 悬浮框改版：波形条 + 实时文本）

1. 结构调整：
   - `asr-live-overlay` 改为卡片内“双区块”：
     - 上区：横向竖条波形（10 根）；
     - 下区：实时转写文本。
   - 移除“实时语音输入/正在聆听/百分比”文字提示。
2. 交互逻辑：
   - 默认文案改为“准备”；
   - `updateAsrLiveAudioLevel(...)` 改为驱动波形条动态，不再改写文本；
   - 转写文本流式写入卡片下方区域。
3. 视觉适配：
   - 按当前主色调应用蓝系渐变波形与浅蓝卡片背景；
   - 同步 `styles.css / preview_nonauth.css / runtime_compat.css`，确保运行态与预览态一致。

### 2026-04-10 补充（按 Figma 格式再收敛）

1. 在不改配色的前提下，按参考组件收敛格式：
   - 波形条数量由 10 根提升到 14 根，布局更密，接近横向可视化板式。
   - 卡片改为“上区波形面板 + 下区文本面板”双层结构，弱化文字提示感。
2. 动效收敛：
   - 新增持续动画循环（非只在音量回调时跳动），降低“准备 -> 波形启动”体感断层。
   - 波形采用中心强化包络模型（中间高、两侧低），更接近设计稿节奏。
3. 文本展示：
   - 下方仅保留流式文本区域，空态显示“准备”。

### 2026-04-10 补充（流动线条语义对齐）

1. 根据反馈进一步收敛核心语义：
   - 波形改为“持续左->右穿过”的流动线条，而非居中呼吸波。
   - 竖条长度直接由声音强度驱动（声音越大，条越高）。
2. 背景统一：
   - 上方波形区与下方文本区背景都与外层框体背景完全一致；
   - 仅竖条使用独立颜色，不再通过分区背景或边框区分。
3. 框体收敛：
   - 移除波形区和文本区的“内嵌子框”视觉（无额外边框、无额外底色、无额外圆角容器）。
   - 外层卡片背景对齐按键弹窗 `modal-card` 同款白底与边框。

### 2026-04-10 补充（按参考文件复刻波形动画核心）

1. 动画算法改为参考稿同类方案：
   - 采用多正弦叠加 + 相位偏移 + 随机抖动的持续流动模型（非简单呼吸/居中脉冲）。
   - 波形条数量提升为 `31`，并由代码动态生成，视觉上更接近参考文件。
2. 形态改造：
   - ASR 悬浮卡片改为正方形比例（`aspect-ratio: 1/1`）。
   - 波形容器绝对定位铺满整个方框区域，实现“波形贯穿整个方框”。
   - 文本作为同层绝对定位放在底部，无额外子框背景。

### 2026-04-10 补充（UI 崩溃回滚修复）

1. 触发原因：
   - `asr-live` 的样式在 `styles.css / preview_nonauth.css / runtime_compat.css` 三处重复定义，且 `app.js` 里有内联样式强覆盖，导致横竖屏和运行态显示不一致。
2. 本次修复：
   - `index.html` 的 ASR 波形容器改为纯容器（去除硬编码 bars），统一由 JS 动态生成。
   - 移除 `ensureAsrLiveOverlayLayer()` 中对 `.asr-live-card` 的内联尺寸/布局覆盖，恢复 CSS 主导响应式。
   - 三份样式统一为同一版：方形卡片、满框贯穿波形、同层底部文本、左到右流动光带（`asr-wave-sweep`）。
3. 结果预期：
   - 避免“同一页面不同态样式冲突”的崩坏；
   - 波形与文本在同一背景层显示，视觉与交互一致性恢复。

### 2026-04-10 补充（ASR 悬浮层不可见修复）

1. 现象：
   - 真机日志显示音量键事件与 ASR 启动均正常，但用户端看不到按键 UI。
2. 根因：
   - `.asr-live-card` 仅依赖 `aspect-ratio` 计算高度，在部分 WebView 组合下可能退化为 0 高度。
3. 修复：
   - 为 `.asr-live-card` 增加显式 `height` 与 `max-height`（保持方形），并在移动端同步。
   - 同步到 `styles.css / preview_nonauth.css / runtime_compat.css`。

### 2026-04-10 补充（ASR 方框运行时尺寸兜底）

1. 目的：
   - 防止少数 WebView 在样式解析异常时，ASR 方框高度退化导致“按键有触发但 UI 不可见”。
2. 实现：
   - `ensureAsrLiveOverlayLayer()` 增加运行时检测：若 `.asr-live-card` 计算高度 < 24px，则按窗口宽度注入正方形尺寸（220~420px）。
   - 注入时记录日志：`ASR overlay fallback size applied`。

### 2026-04-10 补充（ASR 视觉回调）

1. 用户反馈：
   - 按键方框过大；
   - 波形组件可见性不足；
   - 误感知 ASR 崩溃。
2. 调整：
   - ASR 方框尺寸下调为 `72vw / 300px`（移动端 `76vw / 280px`）。
   - 波形条增强：更高初始振幅、更高不透明度、更强发光，确保“按下即见波形”。
   - 运行时尺寸兜底下调为 `180~300px`，避免再出现超大方框。
3. 范围：
   - 仅改 UI 表达与可见性；未改 ASR 请求链路与业务逻辑。

### 2026-04-10 补充（ASR 波形定位修正）

1. 问题：
   - 波形在方框内出现“左上角隐式显示”，视觉上像未正常展开。
2. 修复：
   - 将波形容器改为卡片上半区固定区域（`top/left/right/bottom` 显式定位），并设为 `align-items:flex-end`。
   - 波形条改为底部锚定拉伸（`transform-origin: center bottom`），避免视觉漂移。
   - 调整条数量与最小振幅（25 条，`ASR_WAVE_MIN_SCALE=0.28`），按下即有明显动态。
3. 说明：
   - 仅调整 UI 动效显示，不改 ASR 请求链路与业务逻辑。

### 2026-04-10 补充（按键说话浮层对齐 voice-waveform-preview-v1）

1. 目标：
   - 按 `D:\dc\web\design-reviews\voice-waveform-preview-v1.html` 的结构收敛“按键说话”浮层；
   - 保留 App 当前白底弹框配色，不引入第二层内嵌框。
2. 实现：
   - `asr-live-card` 由正方形改为横向单层弹框，内部仅保留贯穿整个框体的波形与底部提示文字。
   - 波形条改为围绕中轴跳动，参考稿的多正弦叠加节奏保留，但色彩继续沿用 App 原有蓝白体系。
   - `ensureAsrLiveOverlayLayer()` 的运行时尺寸兜底同步改为横向比例，避免旧的正方形 fallback 把新 UI 顶回去。
3. 同步范围：
   - 已对齐 `styles.css`、`preview_nonauth.css`、`runtime_compat.css` 三份 `asr-live` 样式，避免不同入口视觉分叉。

### 2026-04-10 补充（ASR 波形满框收敛 + KLS 地址回落）

1. UI 收敛：
   - 取消 ASR 浮层为文字预留的底部波形空白，波形改为覆盖整个弹框高度，仅将文字叠在同层底部。
   - 提高波形条最大高度与横向密度，避免“动画只占前半段、后面留白”的体感。
2. KLS 地址解析：
   - `run_android_with_web_auth.ps1` 改为优先选择当前活动网卡的局域网 IPv4。
   - 若设备通过 `adb shell ping` 无法访问该地址，则自动启用 `adb reverse` 并回落到 `http://127.0.0.1:8100`，避免再次注入错误 LAN 地址。

### 2026-04-10 补充（ASR 方形布局回归）

1. 根据最新反馈再次收敛：
   - ASR 浮层恢复为方形尺寸，不再使用横向长条比例。
   - 结构明确为“上方波形、下方文字”。
2. 显示策略：
   - 波形区只占卡片上半区，但横向铺满整个可用宽度，避免出现“动画后方额外空白”。
   - 运行时 fallback 尺寸同步改回方形，防止真机上被旧的横向兜底样式覆盖。

### 2026-04-10 补充（ASR 文案居中 + 去扫光）

1. 文案位置：
   - 将底部提示文案改为独立居中块，固定在波形下方，不再贴着卡片底边漂移。
2. 动画背景：
   - 移除波形层左到右扫过的高亮阴影，仅保留竖条本身动画。

### 2026-04-12 补充（真机 KLS 基址回环覆盖修复）

1. 问题现象：
   - 真机端登录后持续出现 `KLS fetch failed -> Failed to fetch`（`/api/me/runtime-config`、`/api/me/profile` 等）。
   - 原因是历史持久化的 loopback 地址（`127.0.0.1`）优先级过高，覆盖了本次下发的局域网 `kls_base`。
2. 修复内容：
   - `web/app.js` 的 `normalizeKlsBase` 新增规则：当输入值是 loopback，但配置值（`__KLS_API_BASE/KLS_API_BASE/kls_base`）为非 loopback 时，自动切换到配置值。
   - `initializeKlsBaseInputs` 增加启动日志：`KLS base normalized: preferred=... query=... input=...`，便于真机排查。
3. 真机验证（ADB）：
   - 日志确认：`KLS base normalized: ... input=http://192.0.2.12:8100`。
   - 日志确认：`KLS runtime config applied ... base=http://192.0.2.12:8100`。
   - 说明：`/api/me/gateway-key` 404 仍可能出现，但按当前策略为非阻断，不影响主链路。

### 2026-04-12 补充（unify 对接收口：网关键可选 + 真机命令链路验收）

1. 接入收口（只改 Android 仓库）：
   - `web/app.js`：`ensureGatewayInjectionForRequest` 不再主动调用 `klsGatewayKeyAction()`；
   - 保持 `runtime-config + access_token` 为主链路，`gateway-key` 仅兼容路径，避免登录后无意义 404 噪音。

2. 调试脚本增强：
   - `scripts/run_android_with_web_auth.ps1` 新增参数：`RequireVoiceCommandSmoke`；
   - 本地开发发 token 策略改为优先“订阅 ACTIVE 用户”，再回退普通 ACTIVE 用户；
   - 新增可选 voice-command smoke：通过 `adb forward` 调手机本地 `/api/commands/voice`，验证 Android 本地后端 -> KLS -> 模型链路。

3. 真机实测结果（YOUR_DEVICE_SERIAL）：
   - APK 构建/重装/启动通过；
   - `KLS runtime config applied` 正常；
   - Voice command smoke 返回 `intent=OPEN_TABLE` 且 `Voice command smoke: True`；
   - 当前唯一外部依赖告警：ASR 报 `xfyun app_id/api_key/api_secret is required`，属 KLS 服务端凭据未配置，不是 Android 对接代码错误。

### 2026-04-12 补充（KLS 局域网 192.0.2.12 接入修复）

1. 背景：
   - 使用 `run_android_with_web_auth.ps1 -KlsApiBase http://192.0.2.12:8100` 后，真机已命中该基址；
   - 但语音命令链路报错：KLS 返回 `missing headers: X-Client-Platform, X-App-Version-Code, X-Device-Id`。

2. 修复：
   - `web/app.js` 的通用 `api()` 请求默认补齐三类客户端头：
     - `X-Client-Platform`
     - `X-App-Version-Code`
     - `X-Device-Id`
   - 本地后端会透传这些头到模型网关调用，满足 KLS 校验要求。

3. 结果：
   - 重新安装注入后，KLS 基址保持为 `http://192.0.2.12:8100`；
   - 语音命令链路不再因客户端头缺失而被 400 拒绝。

### 2026-04-12 补充（语音单飞执行 + 去流式兜底）

1. 前端单飞控制：
   - 新增全局语音指令单飞锁，同一时刻仅允许一条语音指令进入执行链路。
   - 主语音指令（`/api/commands/voice`）、语音音频兜底（`/api/commands/voice-audio`）、菜单语音录入（`/api/menu/commands/voice`）统一走单飞包装。
   - 改为“禁用操作按钮”策略：执行期间禁用语音相关操作按钮，不再弹出“上一条语音指令处理中”的提示。
   - 按键触发的语音浮层维持到当前执行链路结束后再按原逻辑收起。

2. 后端调用收敛：
   - `agent_client.py` 的 `_request_json_with_stream_fallback` 去除 stream fallback 二次请求。
   - 统一改为单次 `stream=false` 请求，避免失败路径额外重试带来的延迟和重复流量。

3. 目标效果：
   - 防止并发语音指令导致 UI/状态串扰；
   - 减少模型调用尾延迟与双请求噪音，便于后续性能观测。

### 2026-04-12 补充（设置页讯飞语种收敛）

1. 范围：
   - 设置页 `ASR 语种` 下拉移除英语选项，仅保留中文普通话/粤语/四川话。

2. 一致性修复：
   - `restoreAsrLanguagePreset()` 增加非法存储值回写逻辑：
   - 若 localStorage 中存在不受支持的旧值，启动时会归一化为默认值并写回，避免 UI 正常但存储长期脏数据。

### 2026-04-12 补充（上线模式切换）

1. KLS 默认地址：
   - Android 构建默认 `KLS_API_BASE` 从局域网地址切换为 `https://your-kls.example.com`。

2. 启动 URL 的开发注入收敛：
   - `MainActivity.buildInitialWebUrl()` 不再仅因 `DEBUG` 就附加 `dev_persist_auth=1`。
   - 改为只有显式注入了 `DEV_INJECT_ACCESS_TOKEN/DEV_INJECT_REFRESH_TOKEN/DEV_INJECT_ROLE` 时，才追加开发登录参数。
   - 上线打包默认进入真实登录链路，登录页直接使用服务器基址。

### 2026-04-12 补充（上线模式加固：默认禁用开发登录注入）

1. 问题定位：
   - 真机日志已命中 `KLS base normalized ... input=https://your-kls.example.com`；
   - 但仍出现 `Dev auth token injected`，原因是 `local.properties` 中历史 `DEV_INJECT_*` 会被构建属性自动读取。

2. 修复策略：
   - Android 构建新增 `DEV_AUTH_INJECT_ENABLED`（默认 `false`）；
   - 仅当显式传入 `-PDEV_AUTH_INJECT_ENABLED=true` 时才读取并注入 `DEV_INJECT_*`。

3. 客户端收敛：
   - `MainActivity.buildInitialWebUrl()` 注入条件改为：
   - `BuildConfig.DEBUG && AppConfig.DEV_AUTH_INJECT_ENABLED && hasDevInjectedAuth`。
   - 这样即使本机残留调试 token，上线模式默认也不会注入，登录页走真实服务器登录。

### 2026-04-12 补充（登录页验证码发送失败修复：KLS 同源代理）

1. 问题现象：
   - 登录页点击“发送验证码”失败，表现为前端提示失败，怀疑未连通服务器。

2. 根因：
   - `web/app.js` 的 `klsApi()` 直接从 `http://127.0.0.1:8000` WebView 页面对 `https://your-kls.example.com` 发起跨源请求；
   - 在 Android WebView 场景下该链路容易受跨域预检/网络策略影响，导致验证码接口不可用。

3. 修复方案：
   - 新增本地后端 KLS 代理前缀：`/api/kls-proxy/*`（`backend/web_api.py`）；
   - `klsApi()` 在运行于 `localhost/127.0.0.1` 时自动改走同源代理：
   - 前端请求 `http://127.0.0.1:8000/api/kls-proxy/...`，并通过 `X-KLS-Base-Url` 传递目标 KLS 基址；
   - 内置后端转发请求到真实 KLS，透传认证/签名/设备上下文头与状态码、响应体。

4. 验证：
   - 通过 `adb forward tcp:18000 tcp:8000` 直测设备端代理接口：
   - `POST /api/kls-proxy/api/auth/sms/send` 返回 `HTTP 200`，响应 `{"code":0,"message":"ok",...}`；
   - 证明登录页验证码链路已可达服务器。

### 2026-04-12 补充（音量键触发范围收敛）

1. 调整范围：
   - 音量键语音触发仅允许在 `main`（主页面）和 `menu`（菜品录入页）生效。

2. 行为变更：
   - 在 `auth/sales/profile/settings` 等非 `main/menu` 视图，音量键返回 `unsupported`，不再触发录音开始/结束。

3. 影响面：
   - 仅修改 `web/app.js` 的音量键路由函数，不改动其它业务逻辑。

### 2026-04-12 补充（登录态持久化 + 音量键语音快启）

1. 登录态持久化修复：
   - Android 嵌入运行（127.0.0.1/localhost 或原生桥存在）下，KLS 登录态默认使用 `localStorage` 持久化；
   - 保留 `dev_persist_auth` 兼容，且支持从历史 `sessionStorage` 自动迁移到 `localStorage`。
   - 解决关闭 App 后再次打开需要重新登录的问题。

2. 音量键语音漏字修复：
   - 音量键触发路径改为“原生收音快启优先”（主页面与菜品录入页）；
   - 先启动本地原生收音，再在松键后走转写/执行，避免首段语音被 KLS 实时链路启动耗时吞掉。
   - 页面按钮触发路径保持原有实时识别逻辑不变。

### 2026-04-16 补充（订阅过期提示与续期状态修复）

1. 过期前通知补齐：
   - `web/app.js` 新增订阅到期提醒机制，按 `24 小时`、`1 小时` 两个阈值触发一次提醒；
   - 到期后触发“订阅已过期，请续费后重试”提示；
   - 提醒按同一到期时间去重，避免重复弹出。

2. 续期后仍误判过期修复：
   - 网关注入前新增订阅状态同步（`/api/me/subscription/status`），并做短周期缓存；
   - 修正本地过期判断：当已存在 `subscription` 对象时，仅依据 `subscription.expire_at`，不再被旧 `gatewayExpireAt` 兜底误伤；
   - `klsSubscriptionStatusAction()` 同步回写 `gatewayExpireAt` 与最近同步时间戳，确保状态收敛。

3. 过期文案中文化：
   - 将 `subscription expired` 等运行时常见英文错误映射为中文提示；
   - 语音链路中的 `login expired / missing access token / ASR auth expired` 统一改为中文。

### 2026-04-16 补充（AGENT_FAILED 英文失败码中文化）

1. 问题定位：
   - 真机日志显示语音链路返回 `AGENT_FAILED` 时，`ui_text` 可能是 `AMBIGUOUS_COMMAND` 等英文失败码；
   - 前端此前直接展示该字段，导致用户看到英文提示。

2. 修复：
   - `web/app.js` 新增 `localizeAgentFailureMessage()`，对 `AMBIGUOUS_COMMAND`、`INVALID_INPUT`、`TARGET_NOT_FOUND`、`TARGET_ALREADY_EXISTS`、`RULE_VIOLATION`、`PROMPT_INJECTION_DETECTED`、`MODEL_PLAN_ERROR` 等失败码统一映射中文；
   - `dispatchAgentFailureFeedback()` 与 `resolveAgentFailureReason()` 统一走该映射，避免失败提示回退英文。

### 2026-04-23 补充（主/菜单页维文覆盖 + 第二次按键提示排版优化）

1. 主页面与菜单页维文覆盖补齐：
   - `web/index.html` 为主页面与菜单页核心静态节点补充 `id`（表头、空态、占位标题、菜单 OCR 主/副文案等）；
   - `web/app.js` 扩展 `DISPLAY_LANGUAGE_PRESETS`（`zh_cn`/`ug_cn`），新增主页面与菜单页关键文案键值；
   - `applyDisplayLanguageTexts()` 增加主/菜单页静态文案同步，并补齐动态状态文案：
   - 选中桌台、总计标签、订单空态、上菜状态、分类筛选文案、菜单空态、菜单 OCR 按钮与状态。

2. 第二次按键提示简化：
   - 提示文案由长句收敛为简短单行：
   - 中文：`上键取消 · 下键发送`
   - 维文：`يۇقىرى بىكار · تۆۋەن يوللاش`

3. ASR 弹窗排版优化：
   - 移除波形背后横向阴影层与波形柱体阴影；
   - 调整弹窗内布局为“波形在上、识别文本居中在下、二次按键提示最下”；
   - 在横竖屏下同步收敛间距与字号，避免底部留白和文本偏移。

4. 验证结果：
   - `node --check mobile/android_shell_v2/app/src/main/assets/backend_runtime/web/app.js` 通过；
   - `:app:assembleDebug` 在当前终端失败（环境缺少 Java：`JAVA_HOME is not set`），需走既有旧链路脚本打包。

### 2026-04-23 补充（WebView 语法兼容热修）

1. 问题现象：
   - 真机启动日志报错：`Uncaught SyntaxError: Unexpected token ? @ app.js`；
   - 导致前端脚本提前中断，线上地址归一化日志未出现。

2. 根因：
   - `web/app.js` 中格式化函数 `tFmt()` 使用了空值合并运算符 `??`；
   - 当前目标 WebView JS 引擎不支持该语法。

3. 修复：
   - 将 `String(vars[name] ?? "")` 改为 `hasOwnProperty` + 兼容分支写法，移除 `??`。

### 2026-04-23 补充（新增菜品内部 item 多语言展示联动）

1. 问题现象：
   - 设置页切换 App 显示语言后，菜单页新增菜品的内部 item 仍显示原语言；
   - 主页面已点菜明细（以及桌台摘要）也未跟随语言切换。

2. 根因：
   - 菜品渲染与订单渲染直接使用后端返回的 `name/item_name/menu_summary` 原始文本；
   - 语言切换只更新了静态文案，未对已有菜单/订单缓存做重绘；
   - 未利用 `menu_items` 的 `aliases` 作为跨语种名称候选。

3. 修复：
   - `web/app.js` 新增菜品显示名解析函数：
   - 基于 `name + aliases` 构建候选，按当前显示语言优先选择（`ug_cn` 优先维文脚本，`zh_cn` 优先中文脚本）；
   - 菜单页 `renderFilteredMenuItems()` 改为使用解析后的显示名；
   - 主页面 `renderSelectedOrderBoard()` 的 `item_name` 改为按菜单缓存映射后的显示名；
   - 桌台摘要 `menu_summary` 增加分段本地化（按 `|` 和 `xN` 结构解析后映射菜名）；
   - 历史订单明细与摘要同样接入该映射，保持一致性；
   - 显示语言切换后，新增重绘：
   - 菜单缓存、桌台缓存、当前选中桌台缓存、历史订单缓存都会立即按新语言重渲染。

4. 兼容性：
   - 保持现有后端数据结构不变，无需新增表字段；
   - 当菜品无可用跨语种别名时，回退显示原始名称。

5. 二次修正（混合菜名拆分）：
   - 发现部分新增菜品名称为“中维混写在同一字符串”（如包含 `/`、括号或连续混合脚本），此前会被当作单一候选，切换语言后仍显示同一串文本；
   - 新增混合菜名候选拆分逻辑（分隔符拆分 + 括号提取 + 中文/维文脚本片段提取）；
   - 语种切换时基于拆分后的候选重新选取展示名，修复“切换无实际效果”问题。

6. 三次修正（只读菜单语言映射）：
   - 收敛边界：App 显示语言不再影响菜品录入链路，不写入 `menu_items` 或 `menu_aliases`；
   - 新增只读接口 `/api/menu/i18n-map`，按当前数据库菜单和目标显示语言生成 `{menu_item_id, display_name}`；
   - 前端新增 `bbq.menu.display.i18n.map` 本地缓存，按 `menu_item_id + 原始名称/alias 签名 + 目标语言` 缓存显示名；
   - 语言切换和菜单刷新时按需补齐缺失映射，后续新增菜品进入数据库后会在下一次菜单刷新时自动生成当前语言显示名；
   - 菜单页、主页面点菜明细、桌台摘要、历史订单摘要/明细统一读取显示映射；数据库原始菜品名称保持不变。

### 2026-04-25 补充（主页面账单快捷操作）

1. 目标：
   - 在主页面选中桌台的账单汇总行左侧增加“打印”和“买单”两个快捷按钮；
   - 按钮直接接现有后端/原生链路，避免再走语音指令或旧服务页入口。

2. 实现：
   - `index.html` 在 `summary-box` 内新增 `selected-print-btn` 与 `selected-checkout-btn`；
   - `web/app.js` 新增选中桌台操作绑定：
   - 打印：先调用 `/api/orders/checkout-preview` 获取最新账单金额，再用当前选中桌台明细生成 ESC/POS 小票 payload 并调用 `AndroidPrinterBridge.printTicket`；
   - 买单：直接调用 `/api/orders/checkout-confirm`，成功后刷新桌台、统计、历史订单、审计和当前选中桌台面板；
   - 无选中桌台或无菜品时按钮禁用，避免空账单误操作。

3. UI：
   - `styles.css` 将账单汇总行改为左侧按钮组 + 右侧总计布局；
   - 横竖屏收敛按钮尺寸，保持主页面账单区域可触达。

### 2026-04-25 补充（主页面账单快捷按钮样式调整）

1. 调整：
   - 主页面账单汇总区的“打印 / 买单”按钮移动到总计横线上方；
   - 两个按钮并排等分，占满账单汇总区宽度；
   - 按钮视觉参考菜品录入页拍照按钮，使用浅色渐变、蓝/绿色边框、14px 圆角和无重阴影样式。

2. 范围：
   - 仅调整按钮布局与样式，打印和买单功能链路保持不变。

### 2026-04-25 补充（第一轮最小实现：主页面按钮与 ASR toggle）

1. 主页面按钮：
   - `打印 / 买单` 操作区保持在 `summary-box` 之前，真实位于总计横线上方；
   - DOM 增加 `summary-actions-above-total` 标识，避免后续误放回汇总区域；
   - `#view-main .summary-actions` 与 `#view-main .summary-action-btn` 使用高特异性规则，按钮视觉对齐菜品录入页 `#view-menu .menu-native-ocr-btn`，不受 `.summary-box > div` 影响；
   - 横线仅由 `summary-box` 的 `border-top` 承担，移除主页面 `summary-total` 自身横线。

2. ASR toggle：
   - 二次按键提示调整到 ASR 弹窗视觉中心区域，不再贴近底部；
   - toggle 模式下实时 ASR 会话增加持续录入标记，延长 `vad_eos`，并且收到一句话 final 后不自动 resolve/停止；
   - 结束仍只由第二次按键触发：音量上取消、音量下发送；按键释放在 toggle 模式继续忽略。

3. 范围：
   - 本轮不实现维语图片式打印；现有中文 ESC/POS 打印链路保持不变。

### 2026-04-26 补充（小票打印设置与备注拆分）

1. 小票模板：
   - 中文 ESC/POS 与维语图片小票统一去掉 `店员 / خىزمەتچى` 行；
   - 自检小票 payload 同步移除 `operator` 字段，避免模板与真实打印出现分叉。

2. 设置页：
   - `小票打印连接` 卡片新增 `买单自动打印` 滑动开关；
   - 开关状态写入本地存储，重新进入设置页会恢复；
   - `index.html` 同步提升静态资源版本号，确保 WebView 不吃旧缓存。

3. 买单链路：
   - 买单确认弹窗打开时缓存当前桌台的预览摘要；
   - 若已开启 `买单自动打印`，且当前仅对单桌买单，则在买单确认成功后自动把当前账单发送到已连接打印机；
   - 打印失败不回滚买单，只记录日志，避免账务链路被打印异常阻塞。

4. 备注规则：
   - 备注不再只按整串完全相等判断统一备注，而是按分段后的交集计算；
   - 所有菜品都包含的备注上浮为统一备注；
   - 仅个别菜品携带的剩余备注保留在对应菜品名下方；
   - 打印 payload 与主页面展示共用同一套拆分结果，避免页面和小票不一致。

5. 维语备注映射：
   - 扩充常见备注短语本地映射，如 `不放辣椒 / 不加辣椒 / 别放葱 / 不放葱 / 不要洋葱 / 都不要葱 / 都不要辣椒`；
   - 维语显示语言下，统一备注与单项备注都会优先走本地映射后再输出到页面和小票。

### 2026-04-26 补充（维语备注商业化映射链路）

1. 目标：
   - 把维语备注从“仅前端固定词典替换”升级为“词典优先 + 后端持久化映射缓存”；
   - 解决自由文本备注、组合备注、首次出现备注在维语页面和小票上无法完整翻译的问题；
   - 保持中文主链路零额外开销，避免录音、点菜和买单链路被备注翻译拖慢。

2. 后端：
   - 新增 `/api/order-notes/i18n-map`；
   - `SessionRepository` 复用 `runtime_settings` 表，以 `order_note_i18n_cache` 键持久化 `{ target_language -> source_note -> display_name }`；
   - 仅在维语场景下，对未命中本地词典、且仍包含中文的备注片段触发模型翻译；
   - 首次翻译成功后写入运行时缓存，后续同备注直接命中，不再重复调用模型。

3. 前端：
   - 新增 `bbq.order.note.i18n.map` 本地缓存；
   - 备注展示仍然先走本地短语词典，保障即时响应；
   - 若当前语言为维语且备注片段仍未解析，则后台批量请求缺失映射，成功后自动重绘主页面备注展示；
   - 打印前会先等待备注映射补齐，再生成小票 payload，避免页面和打印结果不一致。

4. 覆盖范围：
   - 主页面统一备注；
   - 主页面单菜品备注；
   - 打印按钮小票；
   - 买单自动打印小票。

### 2026-04-26 补充（订单级备注 action 与备注归位）

1. 目标：
   - 新增独立的语音备注 action，使用户可单独对当前选中桌或指定桌号追加整单备注；
   - 点菜 / 加菜链路中，除非用户明确把备注绑定到具体菜品，否则备注统一落到订单级备注；
   - 前端展示、小票打印、维语备注翻译统一改为优先读取 `order_headers.note`，不再依赖“把同一备注复制到所有菜品 note 再推断”。

2. 后端存储：
   - `order_headers` 新增 `note` 字段，并在 `RestaurantHarness` 启动时自动补列；
   - 新增 `get_order_note` / `set_order_note`；
   - `get_table_order_detail` 直接返回 `order_note` 给前端。

3. Agent 规划与执行：
   - 模型规划新增 `ADD_ORDER_NOTE` action；
   - `SessionRepository._process_voice_command_locked` 在该 action 下默认回落到当前 `selected_table_no`；
   - `ORDER_ITEM` / `ADD_ITEM` 使用顶层 `plan.note` 作为订单级备注，`items[].note` 仅保留菜品专属备注；
   - 对旧模型可能返回的“所有菜品都带同一备注”结果，执行前会抽取公共备注并上浮到订单级。

4. 前端：
   - `renderSelectedTableStatus`、`renderSelectedOrderBoard`、`buildSelectedTablePrintPayload` 改为优先读取 `order_note`；
   - 维语备注翻译缓存也覆盖 `order_note`；
   - 历史兼容保留：若旧数据没有 `order_note`，仍可按菜品备注交集推断统一备注。

5. 撤销：
   - `UNDO_LAST` 现已支持回退 `ADD_ORDER_NOTE`；
   - 对带订单级备注的 `ADD_ITEM` / `ORDER_ITEM`，撤销时会同时恢复之前的订单级备注。

### 2026-04-26 补充（Android WebView 设置开关与历史打印按钮真机修正）

1. 根因定位：
   - 设置页滑动开关缺失并非节点未渲染，而是 Android WebView 下旧的空 `span` + 伪元素写法不稳定；
   - 数据查看页 `打印选中单` 样式未生效并非按钮未注入，而是当前真机实际使用 `preview_nonauth.css`，此前只改了 `styles.css`；
   - 多次打包后静态资源仍沿用旧查询串，WebView 会继续命中旧缓存，因此额外通过资源版本号强制刷新。

2. 设置页修正：
   - `settings-copy-switch` 改为真实 DOM 结构：`settings-copy-switch-ui` + `settings-copy-switch-thumb`；
   - `循环桌` 与 `结账自动打印` 两个开关统一复用该结构；
   - 在 `styles.css` 与 `preview_nonauth.css` 中同步开关轨道/圆点样式，确保真机可见。

3. 数据查看页修正：
   - `查询历史订单` 与 `打印选中单` 都统一标记为 `history-toolbar-btn`；
   - `preview_nonauth.css` 中把 `history-print-selected-btn` 并入和 `history-query-btn` 同一套按钮皮肤；
   - `preview_nonauth.css` 中把历史工具栏改为紧凑横向布局，避免横屏 WebView 把打印按钮挤到视口外。

4. 缓存控制：
   - `index.html` 中静态资源版本号依次提升到 `20260426-6`，强制 Android WebView 重拉最新 `styles.css` / `preview_nonauth.css` / `runtime_compat.css` / `app.js`。

5. 真机验证：
   - 已在设备 `YOUR_DEVICE_SERIAL` 上重打包、重装、拉起；
   - 真机截图确认 `结账自动打印` 开关可见；
   - 真机截图确认数据查看页底部 `查询` / `打印选中单` 两个按钮均完整显示且使用同一套蓝色按钮样式。

### 2026-04-26 补充（竖屏数据查看页历史工具栏换行）

1. 目标：
   - 解决竖屏下数据查看页历史工具栏横向空间不足时，日期、查询、打印三项互相挤压的问题；
   - 保持日期单独一行，`查询历史订单` 与 `打印选中单` 换到下一行并排展示。

2. 实现：
   - 在 `preview_nonauth.css` 新增 `@media (max-width: 1200px) and (orientation: portrait)` 针对 `#view-sales .history-toolbar` 的竖屏规则；
   - 竖屏下把历史工具栏切为两列 `grid`；
   - `input[type="date"]` 改为跨整行；
   - 两个操作按钮各占下一行的一列，避免再与日期控件共挤一行。

3. 缓存控制：
   - `index.html` 中静态资源版本提升到 `20260426-7`，确保 Android WebView 命中新样式。

4. 真机验证：
   - 设备 `YOUR_DEVICE_SERIAL` 已重新安装新包；
   - 竖屏真机截图确认：日期单独一行，`查询历史订单` 与 `打印选中单` 已落到下一行并排显示。

### 2026-04-26 补充（Android WebView 黄色选中框清理）

1. 问题：
   - Android WebView 在部分按钮、顶部图标、下拉框等可点击控件上会额外绘制黄色/橙色焦点框；
   - 该高亮不属于业务样式，而是 WebView 的默认触摸/焦点反馈，影响整体 UI 一致性。

2. 实现：
   - 在 `styles.css` 与 `preview_nonauth.css` 中新增统一的安卓触摸焦点消隐规则；
   - 覆盖 `button`、`[role="button"]`、导航 Tab、顶部图标按钮、历史工具栏按钮、主页面账单按钮、常用操作按钮、下拉框等交互控件；
   - 统一关闭 `-webkit-tap-highlight-color`、`-webkit-focus-ring-color`，并在 `:focus` / `:focus-visible` / `:active` 下移除 `outline` 和额外 `box-shadow`。

3. 缓存控制：
   - `index.html` 中静态资源版本提升到 `20260426-8`，确保 Android WebView 命中新的焦点样式。

4. 真机验证：
   - 设备 `YOUR_DEVICE_SERIAL` 已重新安装新包；
   - 真机点击顶部齿轮按钮后未再出现黄色选中框；
   - 真机点击数据查看页的历史查询/打印按钮后也未再出现黄色选中框。

### 2026-04-26 补充（语音提示支持按键中断）

1. 目标：
   - 调整语音提示与录音的互斥关系，不再要求等待提示播报结束；
   - 当用户再次按下语音键时，先中断当前提示播报，再立即进入新的录音链路，避免提示语继续外放干扰 ASR。

2. 实现：
   - `NativeVoiceBridge.kt` 为原生 TTS 增加 `tts_started` / `tts_done` / `tts_error` 事件；
   - 新增 `stopSpeak()` JS Bridge 接口，供前端在启动新一轮语音前主动打断原生播报；
   - `app.js` 维护 `voicePromptPlaybackActive` 状态；
   - 主页面与菜单页的语音启动入口在真正起录音前，会先调用 `interruptVoicePromptPlayback()`，同步中断原生 TTS 或 Web `speechSynthesis`。

3. 预期效果：
   - 提示语播报期间，用户再次按下音量键或页面语音按钮，不会再被强制等待；
   - 旧播报会被先停止，再开始新的说话录入，减少提示语串进识别结果的概率。

### 2026-04-26 补充（订单备注支持新增、修改、删除）

1. 目标：
   - 在现有订单级备注链路上补齐“修改备注”和“删除备注”语音动作；
   - 保持默认桌台回填、撤销、以及多桌批量执行能力一致。

2. 实现：
   - `agent_client.py` 新增 `UPDATE_ORDER_NOTE`、`REMOVE_ORDER_NOTE` 两个动作枚举，并补充了对应的中文意图示例；
   - 未显式说桌号但当前有选中桌时，`ADD_ORDER_NOTE` / `UPDATE_ORDER_NOTE` / `REMOVE_ORDER_NOTE` 都会优先落到当前选中桌；
   - `web_api.py` 中备注执行链路统一改为三态：
     - `ADD_ORDER_NOTE`：把新备注片段合并到原有整单备注；
     - `UPDATE_ORDER_NOTE`：直接用新备注覆盖原有整单备注；
     - `REMOVE_ORDER_NOTE`：若模型给出备注片段，则只删除对应片段；若未给片段，则清空整单备注；
   - 三种动作都接入了 `_table_action_history`，`UNDO_LAST` 可恢复修改前的整单备注；
   - 多桌批量扇出集合补入三种备注动作，支持逗号分隔桌号逐桌执行。

3. 当前行为：
   - 订单级备注仍只写入菜单下备注，不会下沉到菜品备注；
   - 删除链路对“删除某一段备注”和“整单清空备注”两种说法都兼容；
   - 若删除后备注内容未变化，会直接返回“当前备注未发生变化”，避免误报成功。

### 2026-04-26 补充（本地数据持久化与菜品备注删改）

1. 本地数据持久化修复：
   - 原先本地数据库、账号隔离库、音频上传目录都放在 `filesDir/backend_runtime` 下；
   - Android 每次 APK 更新时会重拷 `backend_runtime` 资源目录，导致运行时代码目录被整目录覆盖，从而误删 `restaurant.db`；
   - 现在改为把业务数据统一迁到 `filesDir/backend_data`：
     - 主库：`backend_data/restaurant.db`
     - 分账号库：`backend_data/account_scopes/<account_key>/restaurant.db`
     - 音频目录：`backend_data/audio_uploads`
   - `BackendRuntimeAssets.kt` 在删除旧 `backend_runtime` 前，会先把旧库、账号库、音频目录迁到 `backend_data`；
   - `embedded_backend.py` 也保留了同样的迁移兜底，避免仅靠一侧失效。

2. 菜品备注删改链路：
   - 新增 `ADD_ITEM_NOTE`、`UPDATE_ITEM_NOTE`、`REMOVE_ITEM_NOTE` 三个语音动作；
   - 当用户明确指定菜品并说“修改备注 / 删除备注”时，不再误落到整单备注，而是直接作用于 `order_items.note`；
   - 菜品备注动作的 `items` 不再强依赖 `qty`，模型只返回目标菜品 ID 也可以执行；
   - 执行前会对菜品备注内容做一次归一化清洗：
     - 去掉重复带入的菜名；
     - 去掉 `备注 / 改成 / 加备注 / 给 / 把` 等动作前缀；
     - 若模型把备注内容放进 `items[].note` 而不是顶层 `note`，后端也会兼容读取；
   - `REMOVE_ITEM_NOTE` 支持两种删除方式：
     - 带备注片段：仅删除对应片段；
     - 不带备注片段：清空目标菜品备注；
   - `ADD_ITEM_NOTE` 会把新备注片段合并到目标菜品现有备注；
   - `UPDATE_ITEM_NOTE` 会把目标菜品备注整体替换成新的内容；
   - 两个动作都接入了 `UNDO_LAST`，可恢复修改前的菜品备注。

3. 展示层说明：
   - 菜品名本身没有被备注污染；
   - 前端仍然是“菜品名一行 + 菜品备注一行”的显示方式，备注来自 `order_items.note`，只是视觉上紧贴菜品名下方显示。

### 2026-04-26 补充（菜品备注新增补强与提示词回退）

1. 目标：
   - 修复已点菜品的单独备注在模型已判成 `ADD_ITEM_NOTE / UPDATE_ITEM_NOTE` 但未返回 `note` 时仍然执行失败的问题；
   - 撤回本轮对语音操作备注提示词的瘦身，恢复到上一版提示词内容。

2. 实现：
   - `agent_client.py`
     - 撤回 `_call_model_for_voice_ops()` 的提示词瘦身，恢复为上一个版本的完整提示词。
   - `web_api.py`
     - 在 `ADD_ITEM_NOTE / UPDATE_ITEM_NOTE / REMOVE_ITEM_NOTE` 执行分支里，若模型给出的顶层 `note` 和 `items[].note` 都为空，则仅在该动作已经成立、目标菜品已定位成功的前提下，从原始 `transcript` 中裁剪备注文本；
     - 裁剪逻辑只移除动作前缀、菜名、`备注` 等结构词，不参与动作改判，也不会把整单备注改写成菜品备注；
     - 裁剪结果仍统一经过 `_normalize_item_note_text()` 归一化，保证最终落库内容只保留备注正文。

3. 当前效果：
   - 对于“韭菜备注不要辣椒”“给黄瓜加备注微辣”这类话术，若模型已选中菜品备注动作但漏填 `note`，后端可直接从原话补出“不要辣椒”“微辣”；
   - 对于“删除黄瓜的备注”这类清空型删除，若补出的内容为空，仍按“清空该菜备注”处理；
   - 提示词已恢复到回退前版本，执行侧的菜品备注补全文字逻辑保留。

### 2026-04-26 补充（备注提示词定向适配）

1. 目标：
   - 在不改动现有语音动作框架的前提下，仅增强备注相关提示词；
   - 提高模型对“已点菜品备注”“菜名+备注内容”“空备注删除”的稳定识别。

2. 实现：
   - `agent_client.py`
     - 在 `_call_model_for_voice_ops()` 的现有备注规则段中追加了几条约束，不改动作枚举、不改字段结构、不改 `user_prompt`：
       - `菜名 + 备注 + 备注内容` 必须识别为菜品备注；
       - 已明确指定菜品时，即使没有数量，也不要误判成 `ADD_ITEM / ORDER_ITEM`；
       - `ADD_ITEM_NOTE / UPDATE_ITEM_NOTE` 必须返回非空 `note`；
       - `REMOVE_ITEM_NOTE` 在“删除某菜备注”场景下可返回空 `note`，表示清空；
       - 同一句里若同时存在整单备注和单菜备注，必须分别写入顶层 `note` 与对应 `items[].note`。

3. 当前效果：
   - 备注相关提示词仍保持原有框架，只做定向补强；
   - 对“韭菜备注不要辣椒”“给黄瓜加备注微辣”“删除黄瓜的备注”这类话术的约束更明确。

### 2026-04-26 补充（备注提示词继续收敛）

1. 目标：
   - 继续只优化备注相关提示词；
   - 在不改其他规则框架的前提下，减少备注段落里的重复和交叉表述。

2. 实现：
   - `agent_client.py`
     - 把备注段落收敛成三层规则：
       - 先判作用域：整单备注 vs 菜品备注；
       - 再判动作：新增 / 修改 / 删除；
       - 最后约束字段：顶层 `note`、`items[].note`、空 `note` 删除、`note` 只保留正文。
     - 保留原有动作枚举、字段约束、多桌/外卖/失败分类等其他提示词框架不动。

3. 当前效果：
   - 备注段落更短、更集中；
   - 对“出现菜名就优先走菜品备注”“删除菜品备注可空 `note`”“整单备注与单菜备注不能互相复制”的约束更直接。

### 2026-04-26 补充（备注提示词手动微调）

1. 目标：
   - 保留现有备注提示词框架；
   - 对“菜名+备注且未带数量”的描述做一轮手动微调。

2. 实现：
   - `agent_client.py`
     - 将菜品备注优先判定描述改成“明确出现菜名+备注且未带数量”；
     - 同步保留菜品备注 `note` 只保留正文的约束。

### 2026-04-26 补充（主页面长按删除菜品）

1. 目标：
   - 主页面已点菜品支持长按删除；
   - 删除前增加与菜单页一致的二次确认，避免误触。

2. 实现：
   - `app.js`
     - 在主页面 `renderSelectedOrderBoard()` 渲染的菜品行上补充 `data-order-item-id / data-item-name / data-table-no`；
     - 新增主页面菜品行长按绑定，长按时排除右侧上菜状态区域，避免和勾选上菜冲突；
     - 长按触发后使用 `window.confirm("确认删除菜品：...？")` 做二次确认，交互与菜单页删除保持一致；
     - 确认后调用新的 `/api/orders/items/remove` 接口，并刷新桌台、选中面板、统计、历史订单、审计日志。
   - `harness.py`
     - 新增 `remove_order_item_by_id(table_no, order_item_id, operator)`，按 `order_item_id` 精确删除当前桌台下的单行菜品；
   - `web_api.py`
     - 新增 `/api/orders/items/remove` POST 路由，供主页面长按删除调用；
   - `styles.css` / `preview_nonauth.css` / `runtime_compat.css`
     - 为主页面菜品行补充长按中的高亮态；
   - `index.html`
     - 静态资源版本提升到 `20260426-11`，避免 Android WebView 命中旧缓存。

### 2026-04-26 补充（主页面长按删除真机修复）

1. 问题定位：
   - 真机长按后最初没有触发删除确认，不是删除接口问题，而是主页面菜品列表重绘后逐行绑定的长按监听没有稳定挂到最新 DOM；
   - 修复前即使前端弹出确认框，确认后 `/api/orders/items/remove` 仍会返回 `500`，根因是 `SessionRepository` 缺少 `remove_order_item_by_id(...)` 包装方法；
   - Android 端嵌入式 Python 后端还存在 runtime 模块刷新不稳的问题，容易继续命中旧的 `backend.web_api` 模块状态。

2. 修复实现：
   - `app.js`
     - 把主页面菜品长按监听改成挂在 `selectedOrderBodyEl` 上的委托式监听，避免列表重绘后丢失绑定；
   - `web_api.py`
     - 为 `SessionRepository` 补充 `remove_order_item_by_id(...)`，把删除能力从 HTTP 路由正确转发到 `RestaurantHarness`；
   - `embedded_backend.py`
     - 启动嵌入式后端前主动清理 runtime 下的 `__pycache__`；
     - 强制将 `backend_runtime` 目录置于 `sys.path` 首位并清空 `sys.modules` 中的 `backend*` 模块，再重新导入 `backend.web_api`；
   - `BackendRuntimeAssets.kt`
     - 拷贝运行时资源时跳过 `__pycache__`、`.pyc`、`.pyo`，避免旧字节码再次随 APK 落盘。

3. 真机验证：
   - 已在设备 `YOUR_DEVICE_SERIAL` 上复现并确认：
     - 主页面长按菜品会弹出 `确认删除菜品：韭菜？`；
     - 点击确认后，`/api/orders/items/remove` 返回 `200`；
     - 选中桌台数据从 `羊肉串 + 韭菜` 更新为仅剩 `羊肉串`，说明主页面完整链路已经闭环。

### 2026-04-26 补充（菜品备注删除语义收口）

1. 目标：
   - 菜品备注删除不再做“删除备注片段”；
   - 只要命中 `REMOVE_ITEM_NOTE` 且已定位到目标菜品，就直接清空该菜品整条备注。

2. 实现：
   - `web_api.py`
     - 在 `REMOVE_ITEM_NOTE` 执行分支中移除基于 `incoming_note` 的片段删除逻辑，统一将 `next_note` 置空；
   - `agent_client.py`
     - 同步把 `REMOVE_ITEM_NOTE` 描述改成“清空目标菜品完整备注”，避免后续提示词再把它引导成片段删除。

### 2026-04-26 补充（备注提示词手动微调与 KLS 更新链路校验）

1. 手动提示词改动：
   - `agent_client.py`
     - 将“输入可为中文或英文”从开头移到提示词尾部；
     - 新增“对于不合逻辑的字句按相近语音纠正并尽量映射为可执行意图”的约束，优先吸收 ASR 误字。

2. KLS 线上校验：
   - Android 构建继续使用线上基址 `https://your-kls.example.com`；
   - 通过 SSH 检查远端 `kls-api.service`：
     - 当前运行目录为 `/opt/dc/services/key_lifecycle_service`
     - 服务状态 `active (running)`
   - 线上日志已确认真机启动时命中：
     - `GET /api/app/update/check?platform=android&current_version=120` 返回 `200 OK`
   - 直接访问更新检查接口时，若缺少 `X-Client-Platform / X-App-Version-Code / X-Device-Id` 头，会返回 `400 missing headers`，说明服务端校验已生效。

### 2026-04-26 补充（登录态前台校验，收口同账号多登）

1. 目标：
   - 不改 KLS，仅在安卓 WebView 侧尽快感知“同账号已在其他设备重新登录”；
   - 旧设备在重回前台或停留前台时，主动校验 refresh token 是否仍有效，失效则清本地登录态并回登录页。

2. 实现：
   - `app.js`
     - 新增 `revalidateKlsSessionOnForeground()`：
       - 若存在 `refresh_token`，则在启动/前台恢复/定时巡检时主动调用 `/api/auth/refresh`；
       - 若 refresh 返回 `401`，直接 `clearKlsAuthState()`，并提示“账号已在其他设备登录，请重新登录”；
       - 若只是网络异常，不主动清登录态。
     - 新增 `handleKlsAppForeground()`：
       - app 启动且已登录时，先做一次强制 refresh 校验，再继续 `runKlsPostLoginBootstrap()`；
     - 新增前台监听：
       - `visibilitychange` 回到可见时强制校验；
       - `window focus` 时补一次前台校验；
       - 每 15 秒做一次可见前台巡检，但 refresh 成功后 60 秒内不会重复实际请求。
     - 登录成功和退出登录时，重置前台校验的时间戳与 in-flight 状态。

### 2026-04-27 补充（登录后页面外框收敛）

1. 处理方式：
   - 先撤回错误的顶部 tab 样式覆盖；
   - 保留登录后皮肤原有 tab/品牌视觉；
   - 只收敛数据查看页、设置页、个人页的页面级外框，避免与内部卡片形成重复框体。

2. 实现：
   - `preview_nonauth.css`
     - `.sales-main-board` 移除外层 border/radius，恢复内容自然溢出；
     - `#view-settings`、`#view-profile` 移除页面级 border/radius，仅保留内部卡片边框。

### 2026-04-27 补充（小票菜品项字号设置）

1. 目标：
   - 在设置页“小票打印连接”中增加“菜单字号”选项；
   - 分为“小（当前）/中/大”三档，其中“小”保持原小票字号；
   - 字号只作用于打印小票里的菜品项，不影响标题、桌号、时间、合计、总备注、页脚等区域。

2. 实现：
   - `index.html`
     - 新增 `printer-item-font-size` 下拉设置；
   - `app.js`
     - 新增 `bbq.settings.printer.item_font_size` 本地持久化；
     - 所有打印 payload 统一写入 `item_font_size`，历史单、当前桌、自动结账打印和样例小票共用；
   - `EscPosTicketRenderer.kt`
     - 中文 ESC/POS 小票按 `item_font_size` 只包裹菜品行打印指令；
   - `BitmapTicketRenderer.kt`
     - 图片式小票按行渲染，只有菜品行使用更大的 `TextPaint`。

### 2026-04-27 补充（中文大号小票数字收敛）

1. 目标：
   - 解决中文小票“大号”档菜品行数字过宽导致一行放不下的问题。

2. 实现：
   - `EscPosTicketRenderer.kt`
     - “大号”档保留菜名为双宽双高；
     - 数量、单价、小计和菜品备注改用“中号”指令输出；
     - 其他字号档和小票其他区域不变。

### 2026-04-27 补充（中文大号菜品行同排数字）

1. 目标：
   - “大号”档下短菜名与数量/单价/小计尽量回到同一行；
   - 数字使用小号，避免 58mm 小票横向溢出。

2. 实现：
   - `EscPosTicketRenderer.kt`
     - 同一行先输出双宽双高菜名且不换行；
     - 随后切回默认小号输出数量、单价、小计；
     - 菜名过长时继续拆到下一行，避免强行压缩导致错位。

### 2026-04-27 补充（小票列对齐与主页面滚动边界）

1. 小票：
   - `EscPosTicketRenderer.kt`
     - 58mm 小票列宽调整为：菜品 14、数量 4、单价 7、小计 7；
     - 80mm 小票列宽调整为：菜品 24、数量 6、单价 9、小计 9；
     - “大号”档下菜名仍为大号，但数字按表头后的三列小号右对齐。

2. 主页面：
   - `preview_nonauth.css`、`runtime_compat.css`
     - 屏蔽主页面文字选中和长按选中文本；
     - 左侧桌号列表只在表内上下滚动；
     - 右侧订单表固定表头，只让菜品项 `tbody` 滚动；
     - 整单备注、打印/买单按钮、总计保留在滚动区域外。

### 2026-04-27 补充（主页面滚动实测修正与中文图片小票）

1. 问题：
   - 真机实测右侧菜品区滑动前后无变化，说明上一版 table/flex 滚动约束没有实际接管触摸；
   - 纸面打印对 ESC/POS 文本列宽调整不敏感，实际表现没有明显变化。

2. 修正：
   - `preview_nonauth.css`、`runtime_compat.css`
     - 主页面菜品表格区域改为固定可见高度 `clamp(...)`，超出后强制只滚动菜品项；
   - `app.js`
     - 打印统一优先走 `printTicketImage`；
   - `BitmapTicketRenderer.kt`
     - 增加中文图片小票渲染，按像素坐标绘制菜品、数量、单价、小计，数字列右对齐；
     - 菜品字号设置在图片小票里直接控制 `TextPaint`，避免打印机文本模式字号/空格差异。

### 2026-04-27 补充（图片小票字号与主页面左滑删除）

1. 小票：
   - `BitmapTicketRenderer.kt`
     - 中文图片小票菜品项“小/中/大”三档字号整体上调一档；
     - 菜品名、数量、单价、小计去掉加粗，避免大号档显得过黑；
     - 菜品备注字号同步微调，仍只跟随菜品项区域。


2. 主页面：
   - `app.js`
     - 右侧订单表格高度改为运行时按 WebView 视口、备注区、打印/买单按钮和总计区动态计算；
     - 取消主页面已点菜品长按删除绑定；
     - 改为左滑菜品行显示“删除”按钮，点击后调用现有 `/api/orders/items/remove` 删除链路。
   - `preview_nonauth.css`、`runtime_compat.css`
     - 菜品表格高度读取动态 CSS 变量，超出屏幕时只让 `tbody` 内部滚动；
     - 增加左滑删除按钮的显示态和状态按钮隐藏态。

### 2026-04-27 补充（主页面固定视口与状态按钮长按删除）

1. 主页面固定：
   - `app.js`
     - 主页面工作区高度改为按 WebView 当前视口和实际位置动态计算 `--main-workspace-height`；
     - 订单表内部滚动高度继续按按钮区、备注区、总计区计算，避免整页拖动。
   - `preview_nonauth.css`、`runtime_compat.css`
     - 主页面激活时固定 `body/app-shell`，禁止整页滚动；
     - 隐藏主页面旧占位区，只保留 POS 表格工作区；
     - 横屏下订单区底栏改为按钮和总计同一行，按钮占左侧空白区，总计保留右侧。

2. 删除交互：
   - `app.js`
     - 移除主页面左滑删除按钮渲染与绑定；
     - 改为长按“待上菜”状态按钮触发删除确认；
     - 确认后仍复用 `/api/orders/items/remove` 删除链路。
   - `preview_nonauth.css`、`runtime_compat.css`
     - 增加“待上菜”按钮长按时的删除预警态。

### 2026-04-27 补充（小票店名换行与主/菜品页固定底部）

1. 小票：
   - `BitmapTicketRenderer.kt`
     - 图片小票顶部店名标题字号上调，并按可打印宽度自动换行居中绘制，避免长店名被截断；
     - 菜品数量、单价、小计数字字号下调，金额统一保留 1 位小数，缓解列宽拥挤。
   - `EscPosTicketRenderer.kt`
     - 备用文本小票金额同步改为保留 1 位小数，避免不同打印路径金额格式不一致。

2. 主页面与菜品录入页：
   - `app.js`
     - 主页面订单工作区、菜品录入页表格区按 WebView 视口和外壳底边动态计算高度；
     - 切换到主页面或菜品录入页时立即刷新内部滚动高度。
   - `preview_nonauth.css`、`runtime_compat.css`
     - 主页面和菜品录入页激活时禁止整页拖动，但导航栏仍复用其它页面同一套样式；
     - 只允许桌台列表、订单表格、菜品分类和菜品表格内部滚动。
     - 主/菜品页底部外壳边线隐藏，底部间距由内容高度扣减保留，不在页面最底部显示额外线条。
   - `index.html`
     - 前端资源版本号提升到 `20260427-08`，避免 Android WebView 继续复用旧 CSS/JS 缓存导致样式修改不生效。

### 2026-04-27 补充（竖屏主/菜品页底部滚动区延伸）

1. 主页面与菜品录入页：
   - `app.js`
     - 主页面工作区和菜品录入页表格区的动态底部计算读取 `--fixed-view-bottom-gap`；
     - 撤回上一版的低频高度刷新，避免影响切页稳定性；
     - 竖屏/窄屏下高度计算使用 `innerHeight/clientHeight/visualViewport/outerHeight/screen.height/screen.availHeight` 的较大值，横屏宽屏只使用实际 WebView 可视高度；
     - 横屏 CSS 高度只有 360px 级别时，主页面和菜品录入页外层卡片最小高度降为 220px，避免原 320px 最小值叠加顶部导航后把卡片底部撑出屏幕；
     - 将该高度同步为 `--fixed-view-viewport-height`，主页面横屏、菜单页横竖屏都按同一外层圆角卡片到底部固定边距计算，不再被短 CSS 视口截断。
   - `preview_nonauth.css`、`runtime_compat.css`
     - 主页面和菜品录入页激活时改为外壳纵向 flex 填充，当前页面占满导航栏下方剩余高度；
     - 主页面表格壳和菜品录入页表格壳随当前页面 flex 延伸到底部分界线，防止少量数据时内容区按自身高度收缩。
     - 主/菜品页激活时将 `body` 固定到视口，阻断页面级滚动；
     - 底部间距放在当前页面外层，由圆角卡片自身保留到屏幕底部的固定边距，不再给卡片内部追加底部 padding；
     - 菜品录入页少量数据时恢复使用运行时高度变量撑开外层圆角卡片，避免卡片在中部提前结束。
     - 外壳高度改为读取 `--fixed-view-viewport-height`，横竖屏统一由当前设备高度驱动；按钮样式和按钮布局保持不变。
     - 横屏下主/菜品页维持 16px 外层固定底距，不改变按钮当前布局；通过降低横屏最小高度让外层圆角卡片完整落入可见区域。
     - 菜品录入页内部滚动从 `tbody` 改为 `.menu-record-table-wrap` 承载，表头保持 sticky，避免 Android WebView 对 `table/tbody + flex overflow` 支持不稳定导致整页或外层不滚动。
   - `index.html`
     - 前端资源版本号提升到 `20260427-33`，确保 Android WebView 加载本次高度计算更新。

### 2026-04-27 补充（店员版使用说明）

1. 用户文档：
   - 新增 `docs/user_guide.md`，按“拿到机器先设置、日常点菜、打印、数据查看、常见问题、开店/打烊检查”的顺序整理；
   - 文案面向店员和店长，尽量使用短句和直接操作步骤，便于交付产品时直接查看。
2. README：
   - 在目录说明中补充店员版使用说明入口。

### 2026-04-27 补充（店员版使用说明修订）

1. 用户文档：
   - 删除多余产品介绍、开店检查和商用环境不可见的调试表单说明；
   - 主业务链路改为按功能拆分：屏幕按键操作、语音点菜、修改备注、买单撤桌；
   - 常用语音指令参考基线命令和现有提示词规则，改成店员能直接照着说的短句。

## 2026-05-04

状态：`DONE`

本轮补充完成（关键操作速查）：

1. 用户文档：
   - 新增 `docs/quick_operation_guide.md`；
   - 只保留开桌、点菜、退菜、备注、外卖、买单、撤桌、关键屏幕按钮和按键方式；
   - 标准指令改为短句格式，便于门店贴在收银台或培训时快速查看。
2. 交付物：
   - 重新生成桌面版 `易点点关键操作速查.pdf` 为单页版；
   - 放大字号并改为卡片分区，提升打印和现场查看可读性。
3. HTML 版：
   - 新增 `docs/quick_operation_guide.html`；
   - 改用浏览器原生排版和打印样式，避免 PDF 生成时字体位置漂移。

## 2026-11-02

开源发布准备：

- 重写 README，补充功能、常用指令、构建步骤、目录与外部服务依赖边界。
- 添加 MIT License（版权主体 Alitaisname）、第三方说明和随附字体 OFL 许可。
- 默认 KLS 地址改为示例域名；更新下载入口指向 GitHub Releases。
- 文档和开发脚本中的个人手机号、真机编号及原服务器地址改为示例。
- 补充忽略本地凭据、签名文件、数据库、录音、缓存及临时截图。
- 公开发布采用仅包含已提交文件的独立初始快照，保留本地开发历史；远端创建和上传状态以实际 GitHub 操作结果为准。
