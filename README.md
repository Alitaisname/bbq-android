# 易点点 · BBQ Android

面向餐饮门店的智能语音点餐与收银 Android 应用。支持开桌、点菜、加退菜、备注、外卖单、买单撤桌，以及菜单拍照录入、蓝牙小票打印和营业数据查询。

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 功能

- **点餐收银**：桌台订单、上菜状态、买单确认、外卖与打包。
- **语音操作**：开桌、加退菜、整单与单菜备注、多桌操作。
- **菜单管理**：语音录菜、拍照识别后确认录入、分类与价格管理。
- **小票打印**：蓝牙打印、58/80 mm 纸宽、字号设置、结账自动打印和历史订单补打。
- **经营数据**：当日、本周、本月营业额，营收趋势和历史订单。
- **语言与输入**：中文/维语显示，普通话/粤语/四川话识别配置，音量键语音控制。

## 常用指令

先录入菜单，再在主页面说出指令。桌号、菜名和数量按门店实际情况替换。

| 操作 | 示例 |
| --- | --- |
| 自动开桌 | `开桌` |
| 指定桌开桌 | `A3开桌` |
| 开桌并点菜 | `开桌，加2串羊肉串，少辣` |
| 加菜 | `3号桌加2串羊肉串` |
| 退菜 | `3号桌退1串羊肉串` |
| 菜品备注 | `A3羊肉串备注不要辣椒` |
| 外卖单 | `外卖2份臭豆腐` |
| 买单 / 撤桌 | `3号桌买单` / `3号桌撤桌` |

语音支持“按一次开始，再按一次结束”和“按住说话，松开结束”两种模式。音量键行为随模式变化。买单与撤桌请核对弹窗后确认。

更多操作：[用户说明](docs/user_guide.md) · [指令速查](docs/quick_operation_guide.md) · [离线 HTML 速查表](docs/quick_operation_guide.html)。

## 技术结构与范围

Android 使用 Kotlin + WebView，原生桥负责录音、音量键、拍照、通知和蓝牙打印。Chaquopy 在设备内运行 Python 3.11 HTTP 服务和 SQLite 点餐业务。

本仓库包含 Android 工程和内嵌 Web/Python 业务源码。远端 **KLS（账号与运行配置服务）和 CLIProxy/AI 网关源码不在本仓库中**。完整登录、语音和菜单图片识别需要自行提供相应服务；源码不附带线上账号或模型额度。

## 构建运行

环境：Android Studio、JDK 17、Android SDK Platform 35。最低运行版本 Android 8.0（API 26）。Windows 脚本使用 PowerShell 7+。

```powershell
git clone https://github.com/Alitaisname/bbq-android.git
cd bbq-android/mobile/android_shell_v2
```

在 Android Studio 中打开该工程，配置 SDK 并同步 Gradle。也可在此目录创建 `local.properties`：

```properties
sdk.dir=C:/Users/YOUR_NAME/AppData/Local/Android/Sdk
```

传入自己的 KLS 服务地址（设备必须能够访问），构建 APK：

```powershell
./gradlew.bat :app:assembleDebug -PKLS_API_BASE=https://your-kls.example.com
```

输出：`mobile/android_shell_v2/app/build/outputs/apk/debug/app-debug.apk`。可用 Android Studio 安装，或运行 `adb install -r <APK路径>`。发布签名需自行配置。

默认 `KLS_API_BASE` 使用示例域名，必须替换才能连接服务。接口和开发配置见 [Android 配置说明](docs/setup_local_android_shell.md)。请勿提交 token、短信密钥、签名文件或真实经营数据库。

## 开发与目录

| 目录 | 内容 |
| --- | --- |
| `mobile/android_shell_v2/` | Android 工程、Gradle wrapper、原生桥 |
| `mobile/android_shell_v2/app/src/main/assets/backend_runtime/` | Web 界面、Python 业务、数据库结构 |
| `docs/` | 使用说明、打印接口、开发记录 |
| `scripts/` | 资源同步和开发校验脚本 |

内嵌 Web/Python 可直接修改并重建 APK。另有独立主工程时，可对 `scripts/sync_runtime_payload.ps1` 显式传入 `SourceRoot` 和 `DestRoot` 同步资源；直接构建本仓库不需要同步步骤。

在仓库根目录验证工程结构与启动配置：

```powershell
pwsh -File scripts/verify_phase1.ps1
pwsh -File scripts/verify_phase2.ps1
```

欢迎通过 Issues 报告问题或提交 Pull Request。设备问题请附 Android 版本、App 版本、复现步骤及已脱敏日志。

## 许可证

原创代码使用 [MIT License](LICENSE)，允许使用、修改、分发和商业使用，分发时保留版权和许可声明。第三方依赖及字体遵循各自许可证，见 [第三方说明](THIRD_PARTY_NOTICES.md)。
