# Baseline Expected Responses（模板）

每条命令至少校验以下字段：

1. `intent`
2. `table_no`
3. `applied`
4. `message`
5. `ui_action`（若失败）
6. `ui_text`（若失败）

## 示例 A：加菜成功

```json
{
  "intent": "ORDER_ITEM",
  "table_no": "A3",
  "applied": true,
  "message": "table A3 order updated"
}
```

## 示例 B：需确认撤桌

```json
{
  "intent": "CANCEL_ORDER",
  "table_no": "A3",
  "applied": true,
  "requires_confirmation": true,
  "confirm_handler": "cancel_confirm",
  "message": "table A3 cancel confirmation required"
}
```

## 示例 C：失败回调（统一）

```json
{
  "intent": "AGENT_FAILED",
  "applied": false,
  "ui_action": "AGENT_FAILED",
  "ui_text": "循环桌已满开桌失败",
  "fail_code": "TABLE_CAP_REACHED"
}
```

## 示例 D：多步执行

```json
{
  "intent": "CANCEL_ORDER",
  "applied": true,
  "message": "multi-step executed: 2 step(s) applied",
  "step_results": [
    { "table_no": "A8", "applied": true },
    { "table_no": "A9", "applied": true }
  ]
}
```
