param(
    [string]$DeviceId = "YOUR_DEVICE_SERIAL",
    [string]$ChromeProfile = "$env:LOCALAPPDATA\Google\Chrome\User Data\Default",
    [string]$ProjectRoot = "D:\bbq-android",
    [string]$JdkHome = "D:\andrio\jbr",
    [string]$KlsServiceDir = "D:\dc\services\key_lifecycle_service",
    [string]$KlsApiBase = "",
    [string]$DevPhone = "",
    [bool]$EnableAdbReverse = $false,
    [bool]$RequireAsrSmoke = $false,
    [bool]$RequireVoiceCommandSmoke = $false
)

$ErrorActionPreference = "Stop"
$script:UseAdbReverseForKls = $false

function Get-JwtExpUnix {
    param([string]$Token)
    try {
        $parts = $Token.Split(".")
        if ($parts.Length -lt 2) { return 0 }
        $payload = $parts[1].Replace("-", "+").Replace("_", "/")
        switch ($payload.Length % 4) {
            2 { $payload += "==" }
            3 { $payload += "=" }
            default { }
        }
        $json = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($payload))
        $obj = $json | ConvertFrom-Json
        return [int64]($obj.exp)
    } catch {
        return 0
    }
}

function Get-WebAuthCandidates {
    param([string]$ProfileDir)
    $sessionDir = Join-Path $ProfileDir "Session Storage"
    if (-not (Test-Path $sessionDir)) { return @() }

    $seen = New-Object 'System.Collections.Generic.HashSet[string]'
    $result = New-Object System.Collections.ArrayList
    $files = Get-ChildItem -Path $sessionDir -File | Sort-Object LastWriteTime -Descending
    foreach ($file in $files) {
        $matches = Select-String -Path $file.FullName -Pattern "bbq.kls.auth.state" -SimpleMatch -ErrorAction SilentlyContinue
        foreach ($match in $matches) {
            try {
                $line = ($match.Line -replace "`0", "")
                $start = $line.IndexOf("{")
                $end = $line.LastIndexOf("}")
                if ($start -lt 0 -or $end -le $start) { continue }
                $obj = ($line.Substring($start, $end - $start + 1)) | ConvertFrom-Json
                $access = [string]$obj.accessToken
                $refresh = [string]$obj.refreshToken
                $role = [string]$obj.role
                if ([string]::IsNullOrWhiteSpace($access)) { continue }
                $key = "$($access.Substring([Math]::Max(0,$access.Length-20)))|$($refresh.Length)"
                if ($seen.Contains($key)) { continue }
                [void]$seen.Add($key)
                $exp = Get-JwtExpUnix -Token $access
                [void]$result.Add([PSCustomObject]@{
                    access_token = $access
                    refresh_token = $refresh
                    role = $role
                    exp_unix = $exp
                    source_file = $file.FullName
                })
            } catch {
                continue
            }
        }
    }
    return $result | Sort-Object exp_unix -Descending
}

function Issue-LocalDevAccessToken {
    param([string]$ServiceDir, [string]$Phone)

$py = @"
import json
import sqlite3
from app.config import load_settings
from app.auth import TokenStore
from app.service import issue_refresh_token

settings = load_settings()
conn = sqlite3.connect(str(settings.db_path))
conn.row_factory = sqlite3.Row
row = conn.execute(
    """
    select u.id, u.account, u.role
    from users u
    join subscriptions s on s.user_id = u.id
    where u.phone = ?
      and u.status = 'ACTIVE'
      and s.status = 'ACTIVE'
    order by datetime(s.expire_at) desc, u.id desc
    limit 1
    """,
    ("$Phone",),
).fetchone()
if row is None:
    row = conn.execute(
        """
        select u.id, u.account, u.role
        from users u
        join subscriptions s on s.user_id = u.id
        where u.status = 'ACTIVE'
          and s.status = 'ACTIVE'
        order by datetime(s.expire_at) desc, u.id desc
        limit 1
        """
    ).fetchone()
if row is None:
    row = conn.execute("select id, account, role from users where status='ACTIVE' order by id desc limit 1").fetchone()
if row is None:
    raise SystemExit("no active/subscribed user found in KLS DB")
store = TokenStore(secret=settings.jwt_secret, issuer=f"kls-{settings.env}")
access = store.issue(user_id=int(row["id"]), account=str(row["account"]), role=str(row["role"]), ttl_minutes=120)
refresh = issue_refresh_token(
    db_path=settings.db_path,
    user_id=int(row["id"]),
    account=str(row["account"]),
    role=str(row["role"]),
    ttl_days=max(1, int(settings.refresh_token_ttl_days or 30)),
)
print(json.dumps({
    "access_token": access,
    "refresh_token": refresh,
    "role": str(row["role"]),
    "source": "local-issue",
    "account": str(row["account"]),
    "db_path": str(settings.db_path),
    "env": str(settings.env),
}, ensure_ascii=False))
"@

    Push-Location $ServiceDir
    try {
        $json = $py | python -
    } finally {
        Pop-Location
    }
    if (-not $json) { throw "local dev token issue returned empty" }
    return ($json | ConvertFrom-Json)
}

function Ensure-AdbDeviceOnline {
    param([string]$Adb, [string]$Id)
    $list = & $Adb devices
    if ($LASTEXITCODE -ne 0) { throw "adb devices failed" }
    $idEscaped = [regex]::Escape($Id)
    $line = $list | Where-Object { $_ -match "^$idEscaped\s+device$" }
    if (-not $line) {
        throw "Device $Id not online. Current:`n$($list -join "`n")"
    }
}

function Configure-AdbReverse {
    param([string]$Adb, [string]$Id)
    if (-not $EnableAdbReverse -and -not $script:UseAdbReverseForKls) { return }
    # Route phone localhost to host localhost over USB tunnel.
    & $Adb -s $Id reverse tcp:8100 tcp:8100 | Out-Null
    & $Adb -s $Id reverse tcp:8317 tcp:8317 | Out-Null
    if ($script:UseAdbReverseForKls -and -not $EnableAdbReverse) {
        Write-Host "[adb-reverse] enabled automatically: tcp:8100 -> host:8100, tcp:8317 -> host:8317"
    } else {
        Write-Host "[adb-reverse] enabled: tcp:8100 -> host:8100, tcp:8317 -> host:8317"
    }
}

function Resolve-PreferredLanHost {
    $configs = Get-NetIPConfiguration -Detailed -ErrorAction SilentlyContinue | Where-Object {
        $_.IPv4Address -and $_.NetAdapter.Status -eq "Up"
    }
    if (-not $configs) { return "" }
    $preferred = $configs | Where-Object {
        $_.IPv4DefaultGateway -and $_.InterfaceAlias -match 'WLAN|Wi-Fi|Ethernet'
    } | Select-Object -First 1
    if (-not $preferred) {
        $preferred = $configs | Where-Object { $_.IPv4DefaultGateway } | Select-Object -First 1
    }
    if (-not $preferred) {
        $preferred = $configs | Select-Object -First 1
    }
    $ip = [string]($preferred.IPv4Address.IPAddress)
    if ([string]::IsNullOrWhiteSpace($ip)) { return "" }
    return $ip.Trim()
}

function Test-DeviceHostReachable {
    param([string]$Adb, [string]$Id, [string]$Host)
    if ([string]::IsNullOrWhiteSpace($Host)) { return $false }
    try {
        & $Adb -s $Id shell ping -c 1 -W 1 $Host | Out-Null
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

function Resolve-KlsApiBase {
    param([string]$Raw, [string]$Adb, [string]$DeviceId)
    $clean = [string]$Raw
    if (-not [string]::IsNullOrWhiteSpace($clean)) {
        return $clean.Trim()
    }
    try {
        $ip = Resolve-PreferredLanHost
        if (-not [string]::IsNullOrWhiteSpace($ip)) {
            if (Test-DeviceHostReachable -Adb $Adb -Id $DeviceId -Host $ip) {
                Write-Host "[kls] using lan host: $ip"
                return "http://$ip:8100"
            }
            Write-Host "[kls] device cannot reach lan host $ip, fallback to adb reverse"
        }
    } catch {
    }
    $script:UseAdbReverseForKls = $true
    return "http://127.0.0.1:8100"
}

$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
if (-not (Test-Path $adb)) { throw "adb not found: $adb" }
Ensure-AdbDeviceOnline -Adb $adb -Id $DeviceId
$resolvedKlsApiBase = Resolve-KlsApiBase -Raw $KlsApiBase -Adb $adb -DeviceId $DeviceId
Configure-AdbReverse -Adb $adb -Id $DeviceId
Write-Host "[kls] api base: $resolvedKlsApiBase"

$candidates = Get-WebAuthCandidates -ProfileDir $ChromeProfile
$now = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$auth = $null
foreach ($c in $candidates) {
    if ($c.exp_unix -gt ($now + 60)) {
        $auth = [PSCustomObject]@{
            access_token = $c.access_token
            refresh_token = $c.refresh_token
            role = $c.role
            source = "web-session"
            source_file = $c.source_file
        }
        break
    }
}

if (-not $auth) {
    $local = Issue-LocalDevAccessToken -ServiceDir $KlsServiceDir -Phone $DevPhone
    $auth = [PSCustomObject]@{
        access_token = [string]$local.access_token
        refresh_token = [string]$local.refresh_token
        role = [string]$local.role
        source = [string]$local.source
        source_file = "$KlsServiceDir (account=$($local.account), env=$($local.env), db=$($local.db_path))"
    }
}

Write-Host ("[auth] source={0} ({1})" -f $auth.source_file, $auth.source)
Write-Host ("[auth] role={0} access_tail={1}" -f $auth.role, $auth.access_token.Substring([Math]::Max(0, $auth.access_token.Length - 16)))

$appDir = Join-Path $ProjectRoot "mobile\android_shell_v2"
Push-Location $appDir
try {
    $env:JAVA_HOME = $JdkHome
    $env:Path = "$env:JAVA_HOME\bin;$env:Path"
    & .\gradlew :app:assembleDebug "-PKLS_API_BASE=$($resolvedKlsApiBase)" "-PDEV_INJECT_ACCESS_TOKEN=$($auth.access_token)" "-PDEV_INJECT_REFRESH_TOKEN=$($auth.refresh_token)" "-PDEV_INJECT_ROLE=$($auth.role)"
    if ($LASTEXITCODE -ne 0) { throw "gradle assemble failed" }
} finally {
    Pop-Location
}

$apk = Join-Path $appDir "app\build\outputs\apk\debug\app-debug.apk"
if (-not (Test-Path $apk)) { throw "apk not found: $apk" }

& $adb -s $DeviceId install -r $apk | Out-Host
if ($LASTEXITCODE -ne 0) { throw "adb install failed" }

& $adb -s $DeviceId logcat -c | Out-Null
& $adb -s $DeviceId shell am start -W -n com.yidiandian.shellv2/.MainActivity | Out-Host
Start-Sleep -Seconds 7

# Optional smoke: local backend command path via adb forward -> /api/commands/voice
$voiceCommandOk = $false
try {
    & $adb -s $DeviceId forward tcp:18000 tcp:8000 | Out-Null
    $gatewayBase = $resolvedKlsApiBase
    $gatewayModel = "gpt-5.2"
    $runtimeHeaders = @{
        "Authorization" = "Bearer $($auth.access_token)"
        "X-Client-Platform" = "android"
        "X-App-Version-Code" = "120"
        "X-Device-Id" = "$DeviceId"
    }
    try {
        $runtimeResp = Invoke-WebRequest "$resolvedKlsApiBase/api/me/runtime-config" -Method GET -Headers $runtimeHeaders -UseBasicParsing -TimeoutSec 20
        $runtimeJson = $runtimeResp.Content | ConvertFrom-Json
        $runtimeBase = [string]$runtimeJson.data.gateway_base_url
        if (-not [string]::IsNullOrWhiteSpace($runtimeBase)) { $gatewayBase = $runtimeBase }
        $runtimeModel = [string]$runtimeJson.data.chat_model_alias
        if (-not [string]::IsNullOrWhiteSpace($runtimeModel)) { $gatewayModel = $runtimeModel }
    } catch {
        Write-Host ("Voice command smoke runtime-config fallback: {0}" -f [string]$_.Exception.Message)
    }

    $voiceHeaders = @{
        "Content-Type" = "application/json"
        "X-Gateway-Api-Key" = "$($auth.access_token)"
        "X-Gateway-Base-Url" = "$gatewayBase"
        "X-Gateway-Model" = "$gatewayModel"
        "X-Client-Platform" = "android"
        "X-App-Version-Code" = "120"
        "X-Device-Id" = "$DeviceId"
    }
    $voiceBody = @{
        transcript = "开台"
        operator = "waiter-A"
        event_id = "voice-smoke-$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())"
        device_id = "$DeviceId"
    } | ConvertTo-Json -Compress
    $voiceResp = Invoke-WebRequest "http://127.0.0.1:18000/api/commands/voice" -Method POST -Headers $voiceHeaders -Body $voiceBody -UseBasicParsing -TimeoutSec 120
    $voiceJson = $voiceResp.Content | ConvertFrom-Json
    $voiceMessage = [string]$voiceJson.data.message
    $voiceCommandOk = [bool]$voiceJson.ok
    if ($voiceMessage -match "agent api network error|timed out|Failed to fetch|missing headers") {
        $voiceCommandOk = $false
    }
    Write-Host ("Voice command smoke: {0} (intent={1}, message={2})" -f $voiceCommandOk, [string]$voiceJson.data.intent, $voiceMessage)
} catch {
    $voiceCommandOk = $false
    Write-Host ("Voice command smoke error: {0}" -f [string]$_.Exception.Message)
}

# smoke: trigger volume key start/stop once
& $adb -s $DeviceId shell input keyevent 25 | Out-Null
Start-Sleep -Milliseconds 1500
& $adb -s $DeviceId shell input keyevent 25 | Out-Null
Start-Sleep -Seconds 8

$logs = & $adb -s $DeviceId logcat -d -s BBQWebView:I *:S
$logText = ($logs -join "`n")
Write-Host "----- smoke log tail (BBQWebView) -----"
($logs | Select-Object -Last 120) | ForEach-Object { Write-Host $_ }

$uiBoot = $logText -match "UI snapshot\(boot\):"
$uiDelayed = $logText -match "UI snapshot\(delayed\):"
$tabGapOk = $logText -match "top_links_gap="
$tabMarginOk = $logText -match "top_tab_margin_left="
$tabRuleOk = $logText -match "tab_margin_rule=true"
$keyRouteOk = ($logText -match "\[KEY\] volume down route result=") -and ($logText -match "\[KEY\] volume up route result=")
$nativeStart = ($logText -match "Single button native capture started") -or ($logText -match "Single button realtime ASR started")
$asrFinalize = ($logText -match "ASR\(single/native\) finalize") -or ($logText -match "ASR\(single\) finalize")
$authExpired = $logText -match "登录态已过期"
$devAuthInjected = $logText -match "Dev auth token injected"
$uiCoreReady = $uiBoot -and $uiDelayed -and $tabGapOk -and $tabMarginOk -and $tabRuleOk
$appSignals = @($devAuthInjected, $keyRouteOk, $nativeStart, $asrFinalize) | Where-Object { $_ }
$linkSignals = @($devAuthInjected, $keyRouteOk, $nativeStart, $asrFinalize, $voiceCommandOk) | Where-Object { $_ }
$appSignalCount = ($appSignals | Measure-Object).Count
$linkSignalCount = ($linkSignals | Measure-Object).Count
$linkSignalReady = $appSignalCount -ge 1

Write-Host "----- smoke summary -----"
Write-Host ("Dev auth injected: {0}" -f $devAuthInjected)
Write-Host ("UI snapshot boot: {0}" -f $uiBoot)
Write-Host ("UI snapshot delayed: {0}" -f $uiDelayed)
Write-Host ("Tab gap logged: {0}" -f $tabGapOk)
Write-Host ("Tab margin logged: {0}" -f $tabMarginOk)
Write-Host ("Tab margin rule loaded: {0}" -f $tabRuleOk)
Write-Host ("Volume key route logged: {0}" -f $keyRouteOk)
Write-Host ("Native capture started: {0}" -f $nativeStart)
Write-Host ("ASR finalize logged: {0}" -f $asrFinalize)
Write-Host ("Auth expired in log: {0}" -f $authExpired)
Write-Host ("Voice command smoke: {0}" -f $voiceCommandOk)
Write-Host ("UI core ready: {0}" -f $uiCoreReady)
Write-Host ("App signals ready: {0} (count={1})" -f $linkSignalReady, $appSignalCount)
Write-Host ("All link signals count (incl voice command): {0}" -f $linkSignalCount)

if ($authExpired) {
    throw "smoke failed: auth expired after injection"
}
if (-not $uiCoreReady) {
    throw "smoke failed: UI snapshot required logs missing"
}
if (-not $linkSignalReady) {
    throw "smoke failed: no app-side chain signal found (dev-auth/key-route/native-start/asr-finalize)"
}
if ($RequireAsrSmoke -and (-not $keyRouteOk -or -not $nativeStart)) {
    throw "smoke failed: ASR required logs missing"
}
if ($RequireVoiceCommandSmoke -and (-not $voiceCommandOk)) {
    throw "smoke failed: voice command path required logs missing"
}
