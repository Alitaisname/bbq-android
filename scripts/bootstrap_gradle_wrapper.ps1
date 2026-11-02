#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..\mobile\android_shell_v2')

if (-not (Get-Command gradle -ErrorAction SilentlyContinue)) {
  Write-Host 'gradle not found in PATH. Open Android Studio once or install Gradle.'
  exit 1
}

Write-Host 'Generating Gradle wrapper...'
gradle wrapper --gradle-version 8.7
Write-Host 'Done. You can run .\\gradlew.bat tasks'
