param(
  [string]$TargetRoot = (Join-Path $env:LOCALAPPDATA 'HTSG-Execution-Platform-Private'),
  [int]$Port = 3001,
  [string]$Host = '127.0.0.1'
)

$ErrorActionPreference = 'Stop'
$scriptRoot = $PSScriptRoot
& (Join-Path $scriptRoot 'setup-private-preview.ps1') -TargetRoot $TargetRoot -InstallDeps -GeneratePrisma

$repoRoot = Split-Path -Parent $scriptRoot
$nodeRoot = Join-Path $repoRoot '.tools\node'
$nodeExe = Join-Path $nodeRoot 'node.exe'

Write-Host "Starting private preview at http://$Host`:$Port" -ForegroundColor Green
Push-Location $TargetRoot
try {
  $env:PATH = "$nodeRoot;$env:PATH"
  & $nodeExe '.\node_modules\next\dist\bin\next' dev --hostname $Host --port $Port
}
finally {
  Pop-Location
}
