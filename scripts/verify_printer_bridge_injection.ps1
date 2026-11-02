#!/usr/bin/env pwsh
param(
    [string]$ProjectRoot = "D:\bbq-android",
    [string]$DeviceId = "",
    [int]$BootWaitSec = 7,
    [switch]$SkipOfflineCompile
)

$ErrorActionPreference = "Stop"

$appJs = Join-Path $ProjectRoot "mobile/android_shell_v2/app/src/main/assets/backend_runtime/web/app.js"
$indexHtml = Join-Path $ProjectRoot "mobile/android_shell_v2/app/src/main/assets/backend_runtime/web/index.html"
$mainActivity = Join-Path $ProjectRoot "mobile/android_shell_v2/app/src/main/java/com/yidiandian/shellv2/MainActivity.kt"
$printerBridge = Join-Path $ProjectRoot "mobile/android_shell_v2/app/src/main/java/com/yidiandian/shellv2/NativePrinterBridge.kt"
$renderer = Join-Path $ProjectRoot "mobile/android_shell_v2/app/src/main/java/com/yidiandian/shellv2/EscPosTicketRenderer.kt"
$manifest = Join-Path $ProjectRoot "mobile/android_shell_v2/app/src/main/AndroidManifest.xml"

$required = @($appJs, $indexHtml, $mainActivity, $printerBridge, $renderer, $manifest)
$missing = $required | Where-Object { -not (Test-Path $_) }
if ($missing.Count -gt 0) {
    Write-Host "Missing files:"
    $missing | ForEach-Object { Write-Host " - $_" }
    exit 1
}

$appJsText = Get-Content $appJs -Raw
$indexText = Get-Content $indexHtml -Raw
$activityText = Get-Content $mainActivity -Raw
$bridgeText = Get-Content $printerBridge -Raw
$rendererText = Get-Content $renderer -Raw
$manifestText = Get-Content $manifest -Raw
$mainViewSegment = [regex]::Match($indexText, '(?s)<section\s+id="view-main".*?(?=<section\s+id="view-menu")').Value
$settingsViewSegment = [regex]::Match($indexText, '(?s)<section\s+id="view-settings".*?(?=<section\s+id="view-profile")').Value

$checks = @(
    @{ name = "Web bridge global exported"; ok = $appJsText -match 'window\.__bbqPrinter' },
    @{ name = "Web printer binding mounted in settings lifecycle"; ok = $appJsText -match 'function\s+bindSettingsPrinterCard\(' -and $appJsText -match '(?s)function\s+bindSettingsCopyPage\(\)\s*\{.*?bindSettingsPrinterCard\(\);' },
    @{ name = "Web printer state machine enum defined"; ok = $appJsText -match 'PRINTER_UI_STATES\s*=\s*Object\.freeze\(\{' -and $appJsText -match 'permission_pending' -and $appJsText -match 'device_listing' -and $appJsText -match 'connecting' -and $appJsText -match 'connected' -and $appJsText -match 'printing' -and $appJsText -match 'error' },
    @{ name = "Web printer state machine helpers present"; ok = $appJsText -match 'function\s+setSettingsPrinterState\(' -and $appJsText -match 'function\s+getSettingsPrinterButtonMatrix\(' -and $appJsText -match 'function\s+runSettingsPrinterAction\(' },
    @{ name = "Web printer state recovers on settings enter"; ok = $appJsText -match 'function\s+recoverSettingsPrinterStateOnViewEnter\(' -and $appJsText -match '(?s)function\s+setView\([^)]*\)\s*\{.*?targetViewName === "settings".*?recoverSettingsPrinterStateOnViewEnter\(\)' },
    @{ name = "Web printer connection guard function exists"; ok = $appJsText -match 'function\s+ensureNativePrinterConnected\(' },
    @{ name = "Web selftest print enforces connection guard"; ok = $appJsText -match '(?s)function\s+printNativePrinterSelfTest\([^)]*\)\s*\{.*?ensureNativePrinterConnected\(\)' },
    @{ name = "Web sample print enforces connection guard"; ok = $appJsText -match '(?s)function\s+printNativePrinterSample\([^)]*\)\s*\{.*?ensureNativePrinterConnected\(\)' },
    @{ name = "Web index has settings printer card"; ok = $settingsViewSegment -match 'id="settings-printer-card"' -and $settingsViewSegment -match 'printer-device-select' -and $settingsViewSegment -match 'printer-selftest-btn' },
    @{ name = "Web main page removed printer card"; ok = ($mainViewSegment -ne "") -and -not ($mainViewSegment -match 'printer-selftest-btn') -and -not ($mainViewSegment -match 'printer-device-select') },
    @{ name = "MainActivity injects AndroidPrinterBridge"; ok = $activityText -match 'addJavascriptInterface\(nativePrinterBridge,\s*"AndroidPrinterBridge"\)' },
    @{ name = "Native printer bridge has connect"; ok = $bridgeText -match 'fun connect\(' -and $bridgeText -match 'fun printTicket\(' },
    @{ name = "Native bridge has RFCOMM fallback strategy"; ok = $bridgeText -match 'createInsecureRfcommSocketToServiceRecord' -and $bridgeText -match '"createRfcommSocket"' },
    @{ name = "Native bridge has connect timeout guard"; ok = $bridgeText -match 'future\.get\(\s*timeoutMs,\s*TimeUnit\.MILLISECONDS\s*\)' -and $bridgeText -match 'cancelOngoingConnect\(' },
    @{ name = "Native bridge rejects invalid print payload"; ok = $bridgeText -match 'errorCode\s*=\s*"invalid_payload"' -and $bridgeText -match 'print payload is invalid json' },
    @{ name = "ESC/POS renderer has QR command"; ok = $rendererText -match '0x1D,\s*0x28,\s*0x6B' },
    @{ name = "ESC/POS renderer uses display width helpers"; ok = $rendererText -match 'displayWidth\(' -and $rendererText -match 'charDisplayWidth\(' -and $rendererText -match 'takeByDisplayWidth\(' },
    @{ name = "Manifest contains BLUETOOTH_CONNECT"; ok = $manifestText -match 'android\.permission\.BLUETOOTH_CONNECT' },
    @{ name = "Manifest contains BLUETOOTH_SCAN"; ok = $manifestText -match 'android\.permission\.BLUETOOTH_SCAN' }
)

$failed = $checks | Where-Object { -not $_.ok }
if ($failed.Count -gt 0) {
    Write-Host "Printer bridge static checks failed:"
    $failed | ForEach-Object { Write-Host " - $($_.name)" }
    exit 1
}

Write-Host "Printer bridge static checks passed."

if (-not $SkipOfflineCompile) {
    $gradleRoot = Join-Path $ProjectRoot "mobile/android_shell_v2"
    $gradlew = Join-Path $gradleRoot "gradlew.bat"
    if (-not (Test-Path $gradlew)) {
        throw "gradlew not found: $gradlew"
    }
    Write-Host "Running offline compile assertion (:app:compileDebugKotlin)..."
    Push-Location $gradleRoot
    try {
        & $gradlew :app:compileDebugKotlin --no-daemon
        if ($LASTEXITCODE -ne 0) {
            throw "Gradle compile assertion failed with code $LASTEXITCODE"
        }
    } finally {
        Pop-Location
    }
    Write-Host "Offline compile assertion passed."
}

if ([string]::IsNullOrWhiteSpace($DeviceId)) {
    Write-Host "No device provided, skip runtime injection smoke."
    exit 0
}

$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
if (-not (Test-Path $adb)) {
    throw "adb not found: $adb"
}

$deviceList = & $adb devices
if ($LASTEXITCODE -ne 0) {
    throw "adb devices failed"
}
$idEscaped = [regex]::Escape($DeviceId)
if (-not ($deviceList | Where-Object { $_ -match "^$idEscaped\s+device$" })) {
    throw "device $DeviceId not online"
}

$packageName = "com.yidiandian.shellv2"
& $adb -s $DeviceId shell am force-stop $packageName | Out-Null
Start-Sleep -Milliseconds 500
& $adb -s $DeviceId logcat -c | Out-Null
$startOutput = & $adb -s $DeviceId shell am start -W -n com.yidiandian.shellv2/.MainActivity
$startText = ($startOutput -join "`n")
$startOk = ($startText -match "Status:\s+ok") -or ($startText -match "Activity:\s+com\.yidiandian\.shellv2/\.MainActivity")
$runtimeOk = $false
$runtimeSignalSummary = ""
$logs = @()
$maxPoll = 3
for ($attempt = 1; $attempt -le $maxPoll; $attempt++) {
    if ($attempt -eq 1) {
        Start-Sleep -Seconds $BootWaitSec
    } else {
        Start-Sleep -Seconds 3
    }
    $logs = & $adb -s $DeviceId logcat -d -s BBQWebView:I *:S
    $text = ($logs -join "`n")
    $hitInit = $text -match "\[APPLOG\] \[Printer\] 原生打印桥已就绪"
    $hitPermission = $text -match "\[APPLOG\] \[Printer\] 蓝牙权限就绪"
    $hitDeviceList = $text -match "\[APPLOG\] \[Printer\] 已发现 \d+ 台已配对设备"
    $hitConnected = $text -match "\[APPLOG\] \[Printer\] 已连接:"
    $hitPrinterAny = $text -match "\[APPLOG\] \[Printer\]"
    $hitAppLog = $text -match "\[APPLOG\]"
    $hitUiBoot = $text -match "\[APPLOG\] UI snapshot\(boot\):"
    $hitUiDelayed = $text -match "\[APPLOG\] UI snapshot\(delayed\):"
    $runtimeOk = $hitPrinterAny -or $hitInit -or $hitPermission -or $hitDeviceList -or $hitConnected
    $runtimeSignalSummary = "startOk=$startOk init=$hitInit permission=$hitPermission list=$hitDeviceList connected=$hitConnected printerAny=$hitPrinterAny appLog=$hitAppLog uiBoot=$hitUiBoot uiDelayed=$hitUiDelayed attempt=$attempt/$maxPoll"
    if ($runtimeOk) { break }
}

if (-not $runtimeOk) {
    Write-Host "Runtime smoke failed: printer readiness signals not found."
    Write-Host "Signal summary: $runtimeSignalSummary"
    ($logs | Select-Object -Last 120) | ForEach-Object { Write-Host $_ }
    exit 1
}

Write-Host "Printer bridge runtime injection smoke passed. ($runtimeSignalSummary)"
