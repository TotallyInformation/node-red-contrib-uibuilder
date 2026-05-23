#!/usr/bin/env node
/**
 * Fetch and display the telemetry stats from the /stats endpoint.
 *
 * Configuration: set WORKER_URL and STATS_TOKEN in .env.test.local,
 * or export them as environment variables before running.
 *
 * Usage:
 *   npm run stats
 *   node scripts/stats.mjs
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// ── Load .env.test.local ──────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url))
const envFile = resolve(__dirname, '..', '.env.test.local')
if (existsSync(envFile)) {
    for (const line of readFileSync(envFile, 'utf8').split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eq = trimmed.indexOf('=')
        if (eq === -1) continue
        const key = trimmed.slice(0, eq).trim()
        const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
        if (key && !(key in process.env)) process.env[key] = val
    }
}

const WORKER_URL = (process.env.WORKER_URL ?? '').replace(/\/$/, '')
const STATS_TOKEN = process.env.STATS_TOKEN ?? ''

if (!WORKER_URL) {
    console.error('Error: WORKER_URL is not set. Add it to .env.test.local or export it.')
    process.exit(1)
}
if (!STATS_TOKEN) {
    console.error('Error: STATS_TOKEN is not set. Add it to .env.test.local or export it.')
    process.exit(1)
}

// ── Fetch ─────────────────────────────────────────────────────────────────────

process.stdout.write(`Fetching stats from ${WORKER_URL}/stats … `)
const res = await fetch(`${WORKER_URL}/stats`, {
    headers: { Authorization: `Bearer ${STATS_TOKEN}` },
})

if (res.status === 401) {
    console.error('\nError: 401 Unauthorized — check your STATS_TOKEN.')
    process.exit(1)
}
if (!res.ok) {
    console.error(`\nError: ${res.status} ${res.statusText}`)
    process.exit(1)
}

const data = await res.json()
console.log('OK\n')

// ── Display ───────────────────────────────────────────────────────────────────

const period = data.period?.replace(/_/g, ' ') ?? 'unknown period'
console.log(`${'═'.repeat(52)}`)
console.log(`  uibuilder Telemetry  —  ${period}`)
console.log(`${'═'.repeat(52)}\n`)

// Summary
const s = data.summary ?? {}
console.log('SUMMARY')
console.table({
    'Active instances':      s.active_instances      ?? 0,
    'Total uibuilder nodes': s.total_uib_nodes        ?? 0,
    'Total Markweb nodes':   s.total_markweb_nodes    ?? 0,
})

// uibuilder versions
if (data.uib_versions?.length) {
    console.log('\nuibuilder VERSIONS')
    console.table(
        data.uib_versions.map(v => ({ version: v.uib_version, instances: v.instances })),
    )
}

// Browser usage
if (data.browsers?.length) {
    console.log('\nBROWSER USAGE')
    console.table(
        data.browsers.map(b => ({
            browser: b.browser_family,
            version: b.browser_version,
            connections: b.total,
        })),
    )
}

// OS platforms
if (data.platforms?.length) {
    console.log('\nOS PLATFORMS')
    console.table(
        data.platforms.map(p => ({ platform: p.os_platform, instances: p.instances })),
    )
}
