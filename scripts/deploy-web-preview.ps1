param(
  [string]$ProjectName = "htsg-execution-platform",
  [string]$AdminEmails = "admin@halotsg.com"
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$nodeRoot = Join-Path $repoRoot ".tools\node"
$npxCmd = Join-Path $nodeRoot "npx.cmd"

if (-not (Test-Path $npxCmd)) {
  throw "Bundled Node runtime not found at $npxCmd"
}

function New-RandomSecret {
  $bytes = New-Object byte[] 32
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  return [Convert]::ToBase64String($bytes).Replace("+", "").Replace("/", "").Replace("=", "")
}

function Invoke-NpxOrThrow {
  param(
    [string[]]$Arguments,
    [string]$FailureMessage
  )

  & $npxCmd @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw $FailureMessage
  }
}

$env:PATH = "$nodeRoot;$env:PATH"

Invoke-NpxOrThrow -Arguments @("vercel", "whoami") -FailureMessage "Vercel CLI is not authenticated on this machine. Run 'npx vercel login' once, then rerun 'npm run deploy:web:preview'."

$authSecret = if ($env:AUTH_SECRET) { $env:AUTH_SECRET } else { New-RandomSecret }
$cronSecret = if ($env:CRON_SECRET) { $env:CRON_SECRET } else { New-RandomSecret }
$emailFrom = if ($env:EMAIL_FROM) { $env:EMAIL_FROM } else { "noreply@halotsg.com" }

Push-Location $repoRoot
try {
  Invoke-NpxOrThrow -Arguments @(
    "vercel",
    "deploy",
    "--yes",
    "--name",
    $ProjectName,
    "--build-env",
    "AUTH_SECRET=$authSecret",
    "--build-env",
    "HTSG_DATA_MODE=mock",
    "--build-env",
    "AUTH_ALLOW_DEV_CREDENTIALS=true",
    "--build-env",
    "HTSG_ADMIN_EMAILS=$AdminEmails",
    "--build-env",
    "CRON_SECRET=$cronSecret",
    "--build-env",
    "EMAIL_FROM=$emailFrom",
    "--env",
    "AUTH_SECRET=$authSecret",
    "--env",
    "HTSG_DATA_MODE=mock",
    "--env",
    "AUTH_ALLOW_DEV_CREDENTIALS=true",
    "--env",
    "HTSG_ADMIN_EMAILS=$AdminEmails",
    "--env",
    "CRON_SECRET=$cronSecret",
    "--env",
    "EMAIL_FROM=$emailFrom"
  ) -FailureMessage "Vercel preview deployment failed."
} finally {
  Pop-Location
}
