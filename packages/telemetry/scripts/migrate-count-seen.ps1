# One-off migration for Cloudflare D1: enforce instances.count_seen as INTEGER NOT NULL DEFAULT 0
# Usage:
#   .\scripts\migrate-count-seen.ps1
#   .\scripts\migrate-count-seen.ps1 -DatabaseName "uibuilder-telemetry"
#   .\scripts\migrate-count-seen.ps1 -Local

[CmdletBinding()]
param(
    [string]$DatabaseName = 'uibuilder-telemetry',
    [switch]$Local,
    [switch]$SkipVerify
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$telemetryRoot = Resolve-Path (Join-Path $scriptDir '..')
$migrationFile = Join-Path $scriptDir 'fix-instances-count-seen-default.sql'

$migrationSql = @'
PRAGMA foreign_keys=off;

ALTER TABLE instances RENAME TO instances_old;

CREATE TABLE instances (
    uuid          TEXT    PRIMARY KEY,
    count_seen    INTEGER NOT NULL DEFAULT 0,
    first_seen    INTEGER NOT NULL,
    last_seen     INTEGER NOT NULL,
    uib_version   TEXT,
    nr_version    TEXT,
    node_version  TEXT,
    os_platform   TEXT,
    uib_count     INTEGER NOT NULL DEFAULT 0,
    markweb_count INTEGER NOT NULL DEFAULT 0
);

INSERT INTO instances (
    uuid, count_seen, first_seen, last_seen, uib_version, nr_version,
    node_version, os_platform, uib_count, markweb_count
)
SELECT
    uuid, COALESCE(count_seen, 0), first_seen, last_seen, uib_version, nr_version,
    node_version, os_platform, uib_count, markweb_count
FROM instances_old;

DROP TABLE instances_old;

CREATE INDEX IF NOT EXISTS idx_instances_last_seen
    ON instances (last_seen);

PRAGMA foreign_keys=on;
'@

Set-Content -Path $migrationFile -Value $migrationSql -Encoding utf8

Push-Location $telemetryRoot
try {
    Write-Host "Using telemetry folder: $telemetryRoot"

    $locationFlag = '--remote'
    if ($Local) {
        $locationFlag = ''
        Write-Host 'Running migration against local D1 (no --remote flag).'
    } else {
        Write-Host 'Running migration against remote D1 (--remote).'
    }

    $infoArgs = @('d1', 'info', $DatabaseName)
    & npx wrangler @infoArgs
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to fetch D1 info for '$DatabaseName'."
    }

    $applyArgs = @('d1', 'execute', $DatabaseName)
    if ($locationFlag) { $applyArgs += $locationFlag }
    $applyArgs += @('--file', $migrationFile)

    & npx wrangler @applyArgs
    if ($LASTEXITCODE -ne 0) {
        throw 'Migration failed while executing SQL file.'
    }

    if (-not $SkipVerify) {
        $verifyArgs = @('d1', 'execute', $DatabaseName)
        if ($locationFlag) { $verifyArgs += $locationFlag }
        $verifyArgs += @('--command', 'PRAGMA table_info(instances);')

        & npx wrangler @verifyArgs
        if ($LASTEXITCODE -ne 0) {
            throw 'Verification failed while checking table info.'
        }

        $sqlArgs = @('d1', 'execute', $DatabaseName)
        if ($locationFlag) { $sqlArgs += $locationFlag }
        $sqlArgs += @('--command', "SELECT sql FROM sqlite_master WHERE type='table' AND name='instances';")

        & npx wrangler @sqlArgs
        if ($LASTEXITCODE -ne 0) {
            throw 'Verification failed while querying sqlite_master.'
        }
    }

    Write-Host 'Migration complete.'
}
finally {
    Pop-Location
}
