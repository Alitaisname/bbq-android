#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

$root = Join-Path $PSScriptRoot '..'
$appGradle = Join-Path $root 'mobile/android_shell_v2/app/build.gradle.kts'
$bootstrap = Join-Path $root 'mobile/android_shell_v2/app/src/main/java/com/yidiandian/shellv2/LocalServiceBootstrap.kt'
$embeddedBootstrap = Join-Path $root 'mobile/android_shell_v2/app/src/main/java/com/yidiandian/shellv2/EmbeddedPythonBackend.kt'
$assetsBootstrap = Join-Path $root 'mobile/android_shell_v2/app/src/main/java/com/yidiandian/shellv2/BackendRuntimeAssets.kt'
$activity = Join-Path $root 'mobile/android_shell_v2/app/src/main/java/com/yidiandian/shellv2/MainActivity.kt'
$layout = Join-Path $root 'mobile/android_shell_v2/app/src/main/res/layout/activity_main.xml'
$pythonBootstrap = Join-Path $root 'mobile/android_shell_v2/app/src/main/python/embedded_backend.py'
$runtimeVersion = Join-Path $root 'mobile/android_shell_v2/app/src/main/assets/backend_runtime/VERSION'
$syncScript = Join-Path $root 'scripts/sync_runtime_payload.ps1'
$phase2Doc = Join-Path $root 'docs/phase2_local_backend_boot.md'

$missing = @()

if (-not (Test-Path $appGradle)) { $missing += $appGradle }
if (-not (Test-Path $bootstrap)) { $missing += $bootstrap }
if (-not (Test-Path $embeddedBootstrap)) { $missing += $embeddedBootstrap }
if (-not (Test-Path $assetsBootstrap)) { $missing += $assetsBootstrap }
if (-not (Test-Path $activity)) { $missing += $activity }
if (-not (Test-Path $layout)) { $missing += $layout }
if (-not (Test-Path $pythonBootstrap)) { $missing += $pythonBootstrap }
if (-not (Test-Path $runtimeVersion)) { $missing += $runtimeVersion }
if (-not (Test-Path $syncScript)) { $missing += $syncScript }
if (-not (Test-Path $phase2Doc)) { $missing += $phase2Doc }

if ($missing.Count -gt 0) {
  Write-Host "Missing required files:"
  $missing | ForEach-Object { Write-Host " - $_" }
  exit 1
}

$gradleText = Get-Content $appGradle -Raw
$bootstrapText = Get-Content $bootstrap -Raw
$embeddedText = Get-Content $embeddedBootstrap -Raw
$assetsText = Get-Content $assetsBootstrap -Raw
$activityText = Get-Content $activity -Raw
$layoutText = Get-Content $layout -Raw
$pythonText = Get-Content $pythonBootstrap -Raw

$checks = @(
  @{ name = 'Gradle chaquopy plugin'; ok = $gradleText -match 'com\.chaquo\.python' },
  @{ name = 'Gradle embedded python default mode'; ok = $gradleText -match 'EMBEDDED_PYTHON' },
  @{ name = 'BuildConfig BACKEND_BOOT_MODE'; ok = $gradleText -match 'BACKEND_BOOT_MODE' },
  @{ name = 'BuildConfig BACKEND_HEALTH_TIMEOUT_MS'; ok = $gradleText -match 'BACKEND_HEALTH_TIMEOUT_MS' },
  @{ name = 'BuildConfig BACKEND_HEALTH_POLL_INTERVAL_MS'; ok = $gradleText -match 'BACKEND_HEALTH_POLL_INTERVAL_MS' },
  @{ name = 'Bootstrap EMBEDDED_PYTHON mode'; ok = $bootstrapText -match 'EMBEDDED_PYTHON' },
  @{ name = 'Bootstrap SPAWN_COMMAND mode'; ok = $bootstrapText -match 'SPAWN_COMMAND' },
  @{ name = 'Bootstrap backend.log pump'; ok = $bootstrapText -match 'backend\.log' },
  @{ name = 'Embedded backend uses Chaquopy'; ok = $embeddedText -match 'Python\.start' },
  @{ name = 'Runtime asset extraction present'; ok = $assetsText -match 'prepareRuntime' },
  @{ name = 'Python bootstrap start_server'; ok = $pythonText -match 'def start_server' },
  @{ name = 'MainActivity retry button'; ok = $activityText -match 'bootstrap_retry_btn' },
  @{ name = 'MainActivity window insets setup'; ok = $activityText -match 'setupWindowInsets' },
  @{ name = 'Layout retry button'; ok = $layoutText -match 'bootstrap_retry_btn' },
  @{ name = 'Layout root container id'; ok = $layoutText -match 'root_container' }
)

$failed = $checks | Where-Object { -not $_.ok }
if ($failed.Count -gt 0) {
  Write-Host "Phase2 verification failed:"
  $failed | ForEach-Object { Write-Host " - $($_.name)" }
  exit 1
}

Write-Host 'Phase2 verification passed.'
