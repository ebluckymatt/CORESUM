param(
  [int]$Port = 3001
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$nodeRoot = Join-Path $repoRoot ".tools\node"
$npxCmd = Join-Path $nodeRoot "npx.cmd"
$privateRoot = Join-Path $env:LOCALAPPDATA "HTSG-Execution-Platform-Private"
$stdoutLog = Join-Path $privateRoot "web-tunnel.stdout.log"
$stderrLog = Join-Path $privateRoot "web-tunnel.stderr.log"

if (-not (Test-Path $npxCmd)) {
  throw "Bundled Node runtime not found at $npxCmd"
}

$env:PATH = "$nodeRoot;$env:PATH"

try {
  Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$Port/projects" -TimeoutSec 5 | Out-Null
} catch {
  throw "HTSG local app is not running on http://127.0.0.1:$Port. Start it first with 'npm run private:background'."
}

if (Test-Path $stdoutLog) {
  Remove-Item $stdoutLog -Force
}

if (Test-Path $stderrLog) {
  Remove-Item $stderrLog -Force
}

$startInfo = @{
  FilePath = $npxCmd
  ArgumentList = @("localtunnel", "--port", "$Port")
  WorkingDirectory = $repoRoot
  RedirectStandardOutput = $stdoutLog
  RedirectStandardError = $stderrLog
  WindowStyle = "Hidden"
}

$process = Start-Process @startInfo -PassThru

for ($i = 0; $i -lt 25; $i++) {
  Start-Sleep -Seconds 1

  if (Test-Path $stdoutLog) {
    $match = Select-String -Path $stdoutLog -Pattern "https://\S+" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($match) {
      Write-Host $match.Matches[0].Value
      return
    }
  }

  if ($process.HasExited) {
    $stderr = if (Test-Path $stderrLog) { Get-Content -Raw $stderrLog } else { "" }
    throw "Tunnel process exited before publishing a URL. $stderr"
  }
}

Write-Host "Tunnel started, but the URL is still pending."
Write-Host "Logs:"
Write-Host "  $stdoutLog"
Write-Host "  $stderrLog"
