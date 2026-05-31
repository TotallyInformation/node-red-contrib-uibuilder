#Requires -Version 5.1
<#
.SYNOPSIS
    Sets up the Cloudflare Workers + D1 telemetry service for uibuilder.

.DESCRIPTION
    This script:
      1. Verifies that Node.js and Wrangler CLI are available.
      2. Authenticates with Cloudflare.
      3. Creates the D1 database and applies the schema.
      4. Patches wrangler.toml with the real database ID.
      5. Prompts for a STATS_TOKEN secret and stores it in Workers secrets.
      6. Deploys the Worker.

.NOTES
    Run this script from the packages/telemetry directory.
    Prerequisites: Node.js 18+ and internet access.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$ScriptDir = $PSScriptRoot

# ── Helpers ──────────────────────────────────────────────────────────────────

function Write-Step {
    param([string]$Message)
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "    OK  $Message" -ForegroundColor Green
}

function Write-Fail {
    param([string]$Message)
    Write-Host "    FAIL  $Message" -ForegroundColor Red
    exit 1
}

function Assert-Command {
    param([string]$Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        Write-Fail "'$Name' was not found. Please install it and re-run this script."
    }
    Write-Success "'$Name' is available."
}

# ── 1. Prerequisites ──────────────────────────────────────────────────────────

Write-Step "Checking prerequisites"
Assert-Command 'node'
Assert-Command 'npm'

# Install or update Wrangler globally if not present
if (-not (Get-Command 'wrangler' -ErrorAction SilentlyContinue)) {
    Write-Step "Installing Wrangler CLI globally"
    npm install -g wrangler
    if ($LASTEXITCODE -ne 0) { Write-Fail "Failed to install Wrangler." }
}
Assert-Command 'wrangler'

# ── 2. Cloudflare login ───────────────────────────────────────────────────────

Write-Step "Authenticating with Cloudflare (browser window will open)"
Push-Location $ScriptDir
wrangler login
if ($LASTEXITCODE -ne 0) { Write-Fail "Cloudflare login failed." }
Write-Success "Authenticated."

# ── 3. Create D1 database ─────────────────────────────────────────────────────

Write-Step "Creating D1 database 'uibuilder-telemetry'"
$dbOutput = wrangler d1 create uibuilder-telemetry 2>&1 | Out-String
Write-Host $dbOutput

# Extract the database_id from wrangler output
$match = [regex]::Match($dbOutput, 'database_id\s*=\s*"([^"]+)"')
if (-not $match.Success) {
    Write-Host "Could not auto-detect database_id from wrangler output." -ForegroundColor Yellow
    $dbId = Read-Host "Please paste the database_id shown above"
} else {
    $dbId = $match.Groups[1].Value
}

if ([string]::IsNullOrWhiteSpace($dbId)) {
    Write-Fail "No database_id provided. Aborting."
}
Write-Success "Database ID: $dbId"

# ── 4. Patch wrangler.toml ────────────────────────────────────────────────────

Write-Step "Updating wrangler.toml with database_id"
$tomlPath = Join-Path $ScriptDir 'wrangler.toml'
$toml = Get-Content $tomlPath -Raw
if ($toml -notmatch 'REPLACE_WITH_YOUR_DATABASE_ID') {
    Write-Host "    wrangler.toml already has a database_id — skipping patch." -ForegroundColor Yellow
} else {
    $toml = $toml -replace 'REPLACE_WITH_YOUR_DATABASE_ID', $dbId
    Set-Content $tomlPath $toml -NoNewline
    Write-Success "wrangler.toml updated."
}

# ── 5. Apply D1 schema ────────────────────────────────────────────────────────

Write-Step "Applying database schema to remote database"
$schemaPath = Join-Path $ScriptDir 'schema.sql'
wrangler d1 execute uibuilder-telemetry --remote --file=$schemaPath
if ($LASTEXITCODE -ne 0) { Write-Fail "Schema application failed." }
Write-Success "Schema applied."

# ── 6. Set STATS_TOKEN secret ─────────────────────────────────────────────────

Write-Step "Setting STATS_TOKEN Worker secret"
Write-Host "    Enter a strong random token (used to access the /stats endpoint)."
Write-Host "    Tip: generate one with: node -e `"console.log(require('crypto').randomBytes(32).toString('hex'))`""
wrangler secret put STATS_TOKEN
if ($LASTEXITCODE -ne 0) { Write-Fail "Failed to set STATS_TOKEN." }
Write-Success "STATS_TOKEN set."

# ── 7. Deploy ─────────────────────────────────────────────────────────────────

Write-Step "Deploying Worker"
wrangler deploy
if ($LASTEXITCODE -ne 0) { Write-Fail "Worker deployment failed." }

Pop-Location

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "  Setup complete!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Telemetry endpoint:"
Write-Host "    POST https://uibuilder-telemetry.<your-subdomain>.workers.dev/telemetry"
Write-Host ""
Write-Host "  Stats endpoint (requires Bearer token):"
Write-Host "    GET  https://uibuilder-telemetry.<your-subdomain>.workers.dev/stats"
Write-Host ""
Write-Host "  To redeploy after changes:"
Write-Host "    cd packages/telemetry && wrangler deploy"
Write-Host ""
