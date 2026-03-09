param(
  [string]$ProjectName = "htsg-execution-platform"
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$nodeRoot = Join-Path $repoRoot ".tools\node"
$npxCmd = Join-Path $nodeRoot "npx.cmd"

if (-not (Test-Path $npxCmd)) {
  throw "Bundled Node runtime not found at $npxCmd"
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

$requiredEnv = @(
  "DATABASE_URL",
  "AUTH_SECRET",
  "CRON_SECRET",
  "HTSG_ADMIN_EMAILS",
  "AUTH_MICROSOFT_ENTRA_ID_CLIENT_ID",
  "AUTH_MICROSOFT_ENTRA_ID_CLIENT_SECRET",
  "AUTH_MICROSOFT_ENTRA_ID_TENANT_ID",
  "S3_BUCKET",
  "S3_REGION",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
  "RESEND_API_KEY",
  "EMAIL_FROM"
)

$missing = @()
foreach ($name in $requiredEnv) {
  $value = [Environment]::GetEnvironmentVariable($name)
  if ([string]::IsNullOrWhiteSpace($value)) {
    $missing += $name
  }
}

if ($missing.Count -gt 0) {
  throw "Missing required production environment variables: $($missing -join ', ')"
}

$env:PATH = "$nodeRoot;$env:PATH"

Invoke-NpxOrThrow -Arguments @("vercel", "whoami") -FailureMessage "Vercel CLI is not authenticated on this machine. Run 'npx vercel login' once, then rerun 'npm run deploy:web:production'."

$envPairs = @(
  "DATABASE_URL=$($env:DATABASE_URL)",
  "AUTH_SECRET=$($env:AUTH_SECRET)",
  "HTSG_DATA_MODE=database",
  "AUTH_ALLOW_DEV_CREDENTIALS=false",
  "HTSG_ADMIN_EMAILS=$($env:HTSG_ADMIN_EMAILS)",
  "AUTH_MICROSOFT_ENTRA_ID_CLIENT_ID=$($env:AUTH_MICROSOFT_ENTRA_ID_CLIENT_ID)",
  "AUTH_MICROSOFT_ENTRA_ID_CLIENT_SECRET=$($env:AUTH_MICROSOFT_ENTRA_ID_CLIENT_SECRET)",
  "AUTH_MICROSOFT_ENTRA_ID_TENANT_ID=$($env:AUTH_MICROSOFT_ENTRA_ID_TENANT_ID)",
  "S3_BUCKET=$($env:S3_BUCKET)",
  "S3_REGION=$($env:S3_REGION)",
  "S3_ACCESS_KEY_ID=$($env:S3_ACCESS_KEY_ID)",
  "S3_SECRET_ACCESS_KEY=$($env:S3_SECRET_ACCESS_KEY)",
  "RESEND_API_KEY=$($env:RESEND_API_KEY)",
  "EMAIL_FROM=$($env:EMAIL_FROM)",
  "CRON_SECRET=$($env:CRON_SECRET)"
)

if ($env:S3_ENDPOINT) {
  $envPairs += "S3_ENDPOINT=$($env:S3_ENDPOINT)"
}

if ($env:NEXTAUTH_URL) {
  $envPairs += "NEXTAUTH_URL=$($env:NEXTAUTH_URL)"
}

if ($env:SENTRY_DSN) {
  $envPairs += "SENTRY_DSN=$($env:SENTRY_DSN)"
}

if ($env:NEXT_PUBLIC_SENTRY_DSN) {
  $envPairs += "NEXT_PUBLIC_SENTRY_DSN=$($env:NEXT_PUBLIC_SENTRY_DSN)"
}

$arguments = @("vercel", "deploy", "--prod", "--yes", "--name", $ProjectName)

foreach ($pair in $envPairs) {
  $arguments += "--build-env"
  $arguments += $pair
}

foreach ($pair in $envPairs) {
  $arguments += "--env"
  $arguments += $pair
}

Push-Location $repoRoot
try {
  Invoke-NpxOrThrow -Arguments $arguments -FailureMessage "Vercel production deployment failed."
} finally {
  Pop-Location
}
