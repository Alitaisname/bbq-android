# Android V2 避坑（工程内版）

1. 禁止安卓端写业务规则。
2. 禁止在 `web/app.js` 增加 android 特供业务分支。
3. 禁止 KLS 直接 `uvicorn` 启动（必须 env 脚本）。
4. 禁止远端托管页面替代本地页面。
5. 旋转不可重建 Activity（避免回登录）。
6. 必须固定 WebView textZoom=100（避免布局漂移）。
7. WebView 的 `window.confirm` 必须由 `WebChromeClient.onJsConfirm` 接管为原生 Material 对话框，并保持 `Gravity.CENTER`，禁止沿用默认位置不可控弹窗。
8. 个人页文案禁止使用 `???` 占位符；所有用户可见文本必须保持 UTF-8 中文可读。
