# Phase 0 基线冻结（执行版）

目标：冻结当前 web + backend 行为，作为 Android V2 对照真相源。

## 输出物

1. `baseline_commands.md`：20 条边界语令
2. `baseline_expected_responses.md`：关键返回样例
3. `baseline_ui_snapshot_list.md`：截图位点清单

当前状态：

1. 三份文档已在 `docs/` 创建，后续回归按该版本执行。

## 固定规则

1. 基线期间不修改 `web/` 与 `backend/` 业务逻辑。
2. 每次安卓改动后必须回归 20 条语令。
3. 回归不一致时先修安卓壳，不改业务端语义。
