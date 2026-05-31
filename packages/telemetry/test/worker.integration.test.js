/**
 * Integration tests for the uibuilder telemetry Cloudflare Worker.
 *
 * Tests run against a live (or locally running) Worker via HTTP.
 *
 * Configuration — set these before running:
 *   WORKER_URL   URL of the deployed Worker, e.g.
 *                  https://uibuilder-telemetry.<subdomain>.workers.dev
 *                Defaults to http://localhost:8787 (wrangler dev)
 *   STATS_TOKEN  The secret set via `wrangler secret put STATS_TOKEN`
 *
 * Recommended: create a .env.test.local file in this directory:
 *   WORKER_URL=https://uibuilder-telemetry.<subdomain>.workers.dev
 *   STATS_TOKEN=<your-token>
 *
 * Then run: npm test
 * Or for live watch: npm run test:watch
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { randomUUID } from 'node:crypto'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// ── Load .env.test.local if present (no external dependency needed) ───────────

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

// ── Configuration ─────────────────────────────────────────────────────────────

const WORKER_URL = (process.env.WORKER_URL ?? 'http://localhost:8787').replace(/\/$/, '')
const STATS_TOKEN = process.env.STATS_TOKEN ?? ''

if (!STATS_TOKEN) {
    console.warn(
        '\n⚠  STATS_TOKEN is not set. Stats-endpoint tests will be skipped.\n' +
        '   Set it in .env.test.local or as an environment variable.\n',
    )
}

// ── Test fixture data — five pseudo Node-RED instances ────────────────────────

/**
 * @typedef {object} Instance
 * @property {string} uuid
 * @property {string} uib_version
 * @property {string} nr_version
 * @property {string} node_version
 * @property {string} os_platform
 * @property {number} uib_count
 * @property {number} markweb_count
 * @property {Array<{family: string, version: string, count: number}>} browsers
 */

/** @type {Instance[]} */
const INSTANCES = [
    {
        uuid: randomUUID(),
        uib_version: '7.7.0', nr_version: '4.0.3', node_version: '20.11.0',
        os_platform: 'linux',
        uib_count: 3, markweb_count: 1,
        browsers: [
            { family: 'Chrome',  version: '124.0.0', count: 8 },
            { family: 'Firefox', version: '125.0',   count: 2 },
        ],
    },
    {
        uuid: randomUUID(),
        uib_version: '7.7.0', nr_version: '4.0.3', node_version: '20.11.0',
        os_platform: 'win32',
        uib_count: 1, markweb_count: 0,
        browsers: [
            { family: 'Chrome', version: '124.0.0', count: 3 },
            { family: 'Edge',   version: '124.0.0', count: 1 },
        ],
    },
    {
        uuid: randomUUID(),
        uib_version: '7.6.0', nr_version: '3.1.9', node_version: '18.20.0',
        os_platform: 'darwin',
        uib_count: 2, markweb_count: 2,
        browsers: [
            { family: 'Safari', version: '17.4', count: 5 },
        ],
    },
    {
        uuid: randomUUID(),
        uib_version: '7.7.0', nr_version: '4.0.2', node_version: '22.1.0',
        os_platform: 'linux',
        uib_count: 5, markweb_count: 0,
        browsers: [
            { family: 'Chrome', version: '123.0.0', count: 15 },
        ],
    },
    {
        uuid: randomUUID(),
        uib_version: '7.5.0', nr_version: '3.1.9', node_version: '18.20.0',
        os_platform: 'linux',
        uib_count: 0, markweb_count: 3,
        browsers: [
            { family: 'Firefox', version: '124.0', count: 4 },
        ],
    },
]

// A separate UUID used only for rate-limit testing — never submitted beforehand
const RATE_LIMIT_UUID = randomUUID()

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * POST a telemetry body to the Worker.
 * @param {object} body
 * @returns {Promise<Response>}
 */
const postTelemetry = (body) => fetch(`${WORKER_URL}/telemetry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
})

/**
 * GET /stats with an Authorization header.
 * @param {string} [token]
 * @returns {Promise<Response>}
 */
const getStats = (token = STATS_TOKEN) => fetch(`${WORKER_URL}/stats`, {
    headers: { 'Authorization': `Bearer ${token}` },
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('POST /telemetry', () => {
    describe('valid submissions', () => {
        it.each(INSTANCES.map((inst, i) => [i + 1, inst]))(
            'accepts instance %i (%s)',
            async (_, inst) => {
                const res = await postTelemetry({
                    uuid:          inst.uuid,
                    uib_version:   inst.uib_version,
                    nr_version:    inst.nr_version,
                    node_version:  inst.node_version,
                    os_platform:   inst.os_platform,
                    uib_count:     inst.uib_count,
                    markweb_count: inst.markweb_count,
                    browsers:      inst.browsers,
                })
                expect(res.status).toBe(200)
                expect(await res.text()).toBe('OK')
            },
        )

        it('accepts a minimal payload (uuid only)', async () => {
            const res = await postTelemetry({ uuid: randomUUID() })
            expect(res.status).toBe(200)
        })

        it('silently ignores extra unknown fields', async () => {
            const res = await postTelemetry({
                uuid: randomUUID(),
                totally_unknown_field: 'should be ignored',
                another: 12345,
            })
            expect(res.status).toBe(200)
        })

        it('accepts browser entries up to the maximum of 20', async () => {
            const browsers = Array.from({ length: 25 }, (_, i) => ({
                family: `Browser${i}`, version: '1.0', count: 1,
            }))
            const res = await postTelemetry({ uuid: randomUUID(), browsers })
            expect(res.status).toBe(200)
        })
    })

    describe('input validation', () => {
        it('rejects a missing uuid with 400', async () => {
            const res = await postTelemetry({ uib_version: '7.7.0' })
            expect(res.status).toBe(400)
        })

        it('rejects a non-UUID string uuid with 400', async () => {
            const res = await postTelemetry({ uuid: 'not-a-uuid' })
            expect(res.status).toBe(400)
        })

        it('rejects an empty uuid with 400', async () => {
            const res = await postTelemetry({ uuid: '' })
            expect(res.status).toBe(400)
        })

        it('rejects malformed JSON with 400', async () => {
            const res = await fetch(`${WORKER_URL}/telemetry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: '{ this is not json }',
            })
            expect(res.status).toBe(400)
        })

        it('rejects an empty body with 400', async () => {
            const res = await fetch(`${WORKER_URL}/telemetry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: '',
            })
            expect(res.status).toBe(400)
        })
    })

    describe('rate limiting', () => {
        beforeAll(async () => {
            // First submission for this UUID — must succeed before we can test the limit
            const first = await postTelemetry({
                uuid: RATE_LIMIT_UUID, uib_version: '7.7.0', uib_count: 1,
            })
            expect(first.status, 'Pre-condition: first submission must succeed').toBe(200)
        })

        it('rejects a second submission within the rate-limit window with 429', async () => {
            const res = await postTelemetry({ uuid: RATE_LIMIT_UUID, uib_count: 1 })
            expect(res.status).toBe(429)
        })
    })

    describe('unknown routes', () => {
        it('returns 404 for an unknown GET path', async () => {
            const res = await fetch(`${WORKER_URL}/unknown`)
            expect(res.status).toBe(404)
        })

        it('returns 404 for GET /telemetry (wrong method + path)', async () => {
            const res = await fetch(`${WORKER_URL}/telemetry`)
            expect(res.status).toBe(404)
        })
    })
})

describe('GET /stats', () => {
    it('returns 401 with no Authorization header', async () => {
        const res = await fetch(`${WORKER_URL}/stats`)
        expect(res.status).toBe(401)
    })

    it('returns 401 with a wrong token', async () => {
        const res = await getStats('definitely-wrong-token')
        expect(res.status).toBe(401)
    })

    it.skipIf(!STATS_TOKEN)('returns 200 with the correct token', async () => {
        const res = await getStats()
        expect(res.status).toBe(200)
    })

    it.skipIf(!STATS_TOKEN)('returns valid JSON with expected top-level keys', async () => {
        const res = await getStats()
        const data = await res.json()

        expect(data).toHaveProperty('period', 'last_30_days')
        expect(data).toHaveProperty('summary')
        expect(data).toHaveProperty('browsers')
        expect(data).toHaveProperty('uib_versions')
        expect(data).toHaveProperty('platforms')
    })

    it.skipIf(!STATS_TOKEN)('summary contains numeric aggregate fields', async () => {
        const { summary } = await getStats().then(r => r.json())

        expect(typeof summary.active_instances).toBe('number')
        expect(typeof summary.total_uib_nodes).toBe('number')
        expect(typeof summary.total_markweb_nodes).toBe('number')
        // We submitted 5 instances in this run; total should be at least that
        expect(summary.active_instances).toBeGreaterThanOrEqual(5)
    })

    it.skipIf(!STATS_TOKEN)('browsers array contains entries matching submitted data', async () => {
        const { browsers } = await getStats().then(r => r.json())

        expect(Array.isArray(browsers)).toBe(true)
        const families = browsers.map(b => b.browser_family)
        // Chrome was submitted by three different instances
        expect(families).toContain('Chrome')
        // Firefox was submitted by two instances
        expect(families).toContain('Firefox')
    })

    it.skipIf(!STATS_TOKEN)('uib_versions array contains submitted versions', async () => {
        const { uib_versions } = await getStats().then(r => r.json())

        expect(Array.isArray(uib_versions)).toBe(true)
        const versions = uib_versions.map(v => v.uib_version)
        expect(versions).toContain('7.7.0')
        expect(versions).toContain('7.6.0')
        expect(versions).toContain('7.5.0')
    })

    it.skipIf(!STATS_TOKEN)('platforms array contains submitted OS platforms', async () => {
        const { platforms } = await getStats().then(r => r.json())

        expect(Array.isArray(platforms)).toBe(true)
        const oses = platforms.map(p => p.os_platform)
        expect(oses).toContain('linux')
        expect(oses).toContain('win32')
        expect(oses).toContain('darwin')
    })
})
