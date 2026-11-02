#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

Write-Host '[phase1] checking project files...'
$required = @(
  'mobile/android_shell_v2/settings.gradle.kts',
  'mobile/android_shell_v2/build.gradle.kts',
  'mobile/android_shell_v2/app/build.gradle.kts',
  'mobile/android_shell_v2/app/src/main/AndroidManifest.xml',
  'mobile/android_shell_v2/app/src/main/java/com/yidiandian/shellv2/MainActivity.kt',
  'mobile/android_shell_v2/app/src/main/java/com/yidiandian/shellv2/LocalServiceBootstrap.kt'
)
$missing = @()
foreach($f in $required){ if(-not (Test-Path $f)){ $missing += $f } }
if($missing.Count -gt 0){
  Write-Host '[phase1] missing files:'
  $missing | ForEach-Object { Write-Host " - $_" }
  exit 1
}
Write-Host '[phase1] project scaffold is present.'
exit 0
