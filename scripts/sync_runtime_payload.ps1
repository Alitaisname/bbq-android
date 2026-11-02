#!/usr/bin/env pwsh
param(
  [string]$SourceRoot = 'D:\dc',
  [string]$DestRoot = 'D:\bbq-android\mobile\android_shell_v2\app\src\main\assets\backend_runtime'
)

$ErrorActionPreference = 'Stop'

$backendSrc = Join-Path $SourceRoot 'backend'
$webSrc = Join-Path $SourceRoot 'web'
$dbSchemaSrc = Join-Path $SourceRoot 'db\schema.sql'

if (-not (Test-Path $backendSrc)) { throw "backend source not found: $backendSrc" }
if (-not (Test-Path $webSrc)) { throw "web source not found: $webSrc" }
if (-not (Test-Path $dbSchemaSrc)) { throw "schema source not found: $dbSchemaSrc" }

if (Test-Path $DestRoot) {
  Remove-Item $DestRoot -Recurse -Force
}

$backendDest = Join-Path $DestRoot 'backend'
$webDest = Join-Path $DestRoot 'web'
$dbDestDir = Join-Path $DestRoot 'db'

New-Item -ItemType Directory -Force -Path $backendDest | Out-Null
New-Item -ItemType Directory -Force -Path $webDest | Out-Null
New-Item -ItemType Directory -Force -Path $dbDestDir | Out-Null

# Copy backend *.py only
Get-ChildItem $backendSrc -File -Filter *.py | ForEach-Object {
  Copy-Item $_.FullName -Destination (Join-Path $backendDest $_.Name) -Force
}

# Copy web static files
Copy-Item (Join-Path $webSrc '*') -Destination $webDest -Recurse -Force

# Copy schema
Copy-Item $dbSchemaSrc -Destination (Join-Path $dbDestDir 'schema.sql') -Force

# Payload version marker
$sourceRev = ''
try {
  $sourceRev = (git -C $SourceRoot rev-parse --short HEAD).Trim()
} catch {
  $sourceRev = 'unknown'
}
$version = "source=$sourceRev`nutc=$([DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ'))"
Set-Content -Path (Join-Path $DestRoot 'VERSION') -Value $version -Encoding UTF8

Write-Host "Synced runtime payload to: $DestRoot"
Write-Host "Version: $version"
