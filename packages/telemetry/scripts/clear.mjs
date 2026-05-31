#!/usr/bin/env node
/**
 * Delete all telemetry data from the remote D1 database.
 * Prompts for confirmation before proceeding.
 *
 * Requires wrangler to be installed and authenticated.
 *
 * Usage:
 *   npm run clear
 *   node scripts/clear.mjs
 *
 * To skip the confirmation prompt (e.g. in CI):
 *   FORCE=1 npm run clear
 */

import { execSync } from 'node:child_process'
import { createInterface } from 'node:readline'

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Run a wrangler d1 command against the remote database and return its output.
 * The SQL is double-quoted so the shell does not split it at spaces.
 * stderr is merged into stdout (2>&1) because wrangler writes table output to stderr.
 * @param {string} sql
 * @returns {{ status: number, stdout: string }}
 */
const d1 = (sql) => {
    try {
        const stdout = execSync(
            `wrangler d1 execute uibuilder-telemetry --remote --command "${sql}" 2>&1`,
            { encoding: 'utf8' },
        )
        return { status: 0, stdout }
    } catch (err) {
        return { status: err.status ?? 1, stdout: String(err.stdout ?? err.message) }
    }
}

/**
 * Ask a yes/no question on stdin.
 * @param {string} question
 * @returns {Promise<boolean>}
 */
const confirm = (question) => new Promise(resolve => {
    const rl = createInterface({ input: process.stdin, output: process.stdout })
    rl.question(`${question} (y/N) `, answer => {
        rl.close()
        resolve(answer.trim().toLowerCase() === 'y')
    })
})

// ── Count rows ────────────────────────────────────────────────────────────────

console.log('Counting rows in remote database …\n')

const instanceCount = d1('SELECT COUNT(*) AS n FROM instances')
const browserCount  = d1('SELECT COUNT(*) AS n FROM browser_stats')

if (instanceCount.status !== 0) {
    console.error('Failed to query remote database. Is wrangler authenticated?')
    console.error(instanceCount.stdout)
    process.exit(1)
}

/**
 * Extract the integer from a wrangler d1 SELECT COUNT result.
 * Wrangler outputs JSON when stderr is merged via 2>&1; the count is at
 * results[0].n in the first element of the top-level array.
 * @param {{ stdout: string }} result
 * @returns {number|string}
 */
const parseCount = ({ stdout }) => {
    try {
        const jsonStart = stdout.indexOf('[')
        if (jsonStart === -1) return '?'
        const json = JSON.parse(stdout.slice(jsonStart))
        const n = json[0]?.results?.[0]?.n
        return typeof n === 'number' ? n : '?'
    } catch {
        return '?'
    }
}

const instances = parseCount(instanceCount)
const browsers  = parseCount(browserCount)

console.log(`  instances:    ${instances} row(s)`)
console.log(`  browser_stats: ${browsers} row(s)\n`)

if (instances === 0 && browsers === 0) {
    console.log('Database is already empty. Nothing to do.')
    process.exit(0)
}

// ── Confirm ───────────────────────────────────────────────────────────────────

const force = process.env.FORCE === '1'
if (!force) {
    const ok = await confirm('Delete ALL telemetry data from the remote database?')
    if (!ok) {
        console.log('Aborted.')
        process.exit(0)
    }
}

// ── Delete ────────────────────────────────────────────────────────────────────

// browser_stats must be deleted first due to the FK constraint on instance_uuid
console.log('\nDeleting browser_stats …')
const delBrowsers = d1('DELETE FROM browser_stats')
if (delBrowsers.status !== 0) {
    console.error('Failed to delete browser_stats.')
    console.error(delBrowsers.stdout)
    process.exit(1)
}

console.log('Deleting instances …')
const delInstances = d1('DELETE FROM instances')
if (delInstances.status !== 0) {
    console.error('Failed to delete instances.')
    console.error(delInstances.stdout)
    process.exit(1)
}

console.log('\nDatabase cleared successfully.')
