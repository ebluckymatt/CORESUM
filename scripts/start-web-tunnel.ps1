param(
  [int]$Port = 3001,
  [string]$Subdomain = ""
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$nodeRoot = Join-Path $repoRoot ".tools\node"
$npxCmd = Join-Path $nodeRoot "npx.cmd"

if (-not (Test-Path $npxCmd)) {
  throw "Bundled Node runtime not found at $npxCmd"
}

try {
  Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$Port/projects" -TimeoutSec 5 | Out-Null
} catch {
  throw "The local HTSG app is not reachable on http://127.0.0.1:$Port. Start the app first with 'npm run private:preview' or your normal Next.js command, then rerun 'npm run web:tunnel'."
}

$env:PATH = "$nodeRoot;$env:PATH"
$arguments = @("localtunnel", "--port", "$Port")

if (-not [string]::IsNullOrWhiteSpace($Subdomain)) {
  $arguments += "--subdomain"
  $arguments += $Subdomain
}

Write-Host "Opening a temporary public tunnel for http://127.0.0.1:$Port" -ForegroundColor Cyan
Write-Host "Keep this terminal window open while people are using the link." -ForegroundColor Yellow
Write-Host ""

& $npxCmd @arguments
