param(
  [string]$TargetRoot = (Join-Path $env:LOCALAPPDATA 'HTSG-Execution-Platform-Private'),
  [switch]$InstallDeps,
  [switch]$GeneratePrisma
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$nodeRoot = Join-Path $repoRoot '.tools\node'
$nodeExe = Join-Path $nodeRoot 'node.exe'
$npmCmd = Join-Path $nodeRoot 'npm.cmd'

if (-not (Test-Path $nodeExe)) {
  throw "Bundled Node runtime not found at $nodeExe"
}

Write-Host "Syncing project to private local preview root: $TargetRoot" -ForegroundColor Cyan
New-Item -ItemType Directory -Path $TargetRoot -Force | Out-Null

$robocopyArgs = @(
  $repoRoot,
  $TargetRoot,
  '/MIR',
  '/XD', '.git', 'node_modules', '.next', '.tools', '.vercel',
  '/XF', '.env', '.env.local', 'tmp-node.zip'
)

& robocopy @robocopyArgs | Out-Null
$exitCode = $LASTEXITCODE
if ($exitCode -ge 8) {
  throw "Robocopy failed with exit code $exitCode"
}

$envPath = Join-Path $TargetRoot '.env.local'
if (-not (Test-Path $envPath)) {
  Copy-Item (Join-Path $repoRoot '.env.example') $envPath
}

if ($InstallDeps -or -not (Test-Path (Join-Path $TargetRoot 'node_modules'))) {
  Write-Host 'Installing dependencies in private preview root...' -ForegroundColor Cyan
  Push-Location $TargetRoot
  try {
    $env:PATH = "$nodeRoot;$env:PATH"
    & $npmCmd install
  }
  finally {
    Pop-Location
  }
}

if ($GeneratePrisma) {
  Write-Host 'Generating Prisma client...' -ForegroundColor Cyan
  Push-Location $TargetRoot
  try {
    $env:PATH = "$nodeRoot;$env:PATH"
    & $npmCmd run prisma:generate
  }
  finally {
    Pop-Location
  }
}

Write-Host "Private preview workspace ready at: $TargetRoot" -ForegroundColor Green
