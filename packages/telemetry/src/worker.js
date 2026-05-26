/**
 * Cloudflare Worker — uibuilder telemetry endpoint
 *
 * Endpoints:
 *   POST /telemetry   — receive a telemetry report from a Node-RED instance
 *   GET  /stats       — retrieve aggregated stats (requires Bearer token)
 *
 * D1 binding:  DB          (database: uibuilder-telemetry)
 * Secret:      STATS_TOKEN (set via `wrangler secret put STATS_TOKEN`)
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// const RATE_LIMIT_SECONDS = 3600 // one report per instance per hour
const RATE_LIMIT_SECONDS = 60 // one report per instance per minute (for testing purposes)

/**
 * Sanitize a string input — truncate and reject non-strings.
 * @param {unknown} val - The value to sanitize.
 * @param {number} [maxLen=100] - Maximum allowed length.
 * @returns {string|null}
 */
const sanitizeStr = (val, maxLen = 100) => {
    if (typeof val !== 'string') return null
    const trimmed = val.trim().substring(0, maxLen)
    return trimmed.length > 0 ? trimmed : null
}

/**
 * Clamp an integer to a safe range, returning 0 for non-integers.
 * @param {unknown} val
 * @param {number} max
 * @returns {number}
 */
const safeInt = (val, max) => (Number.isInteger(val) ? Math.max(0, Math.min(val, max)) : 0)

/**
 * Build a JSON response.
 * @param {unknown} data
 * @param {number} [status=200]
 * @returns {Response}
 */
const jsonResponse = (data, status = 200) => new Response(
    JSON.stringify(data),
    { status, headers: { 'Content-Type': 'application/json' } },
)

export default {
    /**
     * Main fetch handler.
     * @param {Request} request
     * @param {object} env - Worker environment bindings.
     * @returns {Promise<Response>}
     */
    async fetch(request, env) {
        const { method } = request
        const { pathname } = new URL(request.url)

        if (method === 'POST' && pathname === '/telemetry') return handleTelemetry(request, env)
        if (method === 'GET' && pathname === '/stats') return handleStats(request, env)

        return new Response('Not Found', { status: 404 })
    },
}

/**
 * Handle POST /telemetry
 *
 * Expected body (JSON):
 * {
 *   uuid:          string,   // Instance UUID (required)
 *   uib_version:   string,   // uibuilder package version
 *   nr_version:    string,   // Node-RED version
 *   node_version:  string,   // Node.js version
 *   os_platform:   string,   // e.g. "linux", "win32", "darwin"
 *   uib_count:     number,   // Count of uibuilder nodes deployed
 *   markweb_count: number,   // Count of markweb nodes deployed
 *   browsers: [              // Pre-aggregated browser stats (NOT raw UA strings)
 *     { family: string, version: string, count: number }
 *   ]
 * }
 *
 * @param {Request} request
 * @param {object} env
 * @returns {Promise<Response>}
 */
async function handleTelemetry(request, env) {
    let body
    try {
        body = await request.json()
    } catch {
        return new Response('Bad Request: invalid JSON', { status: 400 })
    }

    if (!body?.uuid || !UUID_REGEX.test(body.uuid)) {
        return new Response('Bad Request: missing or invalid uuid', { status: 400 })
    }

    const now = Math.floor(Date.now() / 1000)

    // Rate-limit: reject if this instance reported within the last hour
    const existing = await env.DB
        .prepare('SELECT last_seen FROM instances WHERE uuid = ?')
        .bind(body.uuid)
        .first()

    if (existing && (now - existing.last_seen) < RATE_LIMIT_SECONDS) {
        return new Response('Too Many Requests', { status: 429 })
    }

    // Upsert the instance record
    await env.DB.prepare(`
        INSERT INTO instances
            (uuid, count_seen, first_seen, last_seen, uib_version, nr_version, node_version, os_platform, uib_count, markweb_count)
        VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(uuid) DO UPDATE SET
            count_seen    = instances.count_seen + 1,
            last_seen     = excluded.last_seen,
            uib_version   = excluded.uib_version,
            nr_version    = excluded.nr_version,
            node_version  = excluded.node_version,
            os_platform   = excluded.os_platform,
            uib_count     = excluded.uib_count,
            markweb_count = excluded.markweb_count
    `).bind(
        body.uuid,
        now,
        now,
        sanitizeStr(body.uib_version, 20),
        sanitizeStr(body.nr_version, 20),
        sanitizeStr(body.node_version, 20),
        sanitizeStr(body.os_platform, 20),
        safeInt(body.uib_count, 9999),
        safeInt(body.markweb_count, 9999),
    ).run()

    // Record pre-aggregated browser stats (max 20 entries per report)
    if (Array.isArray(body.browsers) && body.browsers.length > 0) {
        const stmts = []
        for (const b of body.browsers.slice(0, 20)) {
            const family = sanitizeStr(b?.family, 50)
            if (!family) continue
            const version = sanitizeStr(b?.version, 50)
            const count = safeInt(b?.count ?? 1, 9999) || 1
            stmts.push(
                env.DB.prepare(
                    'INSERT INTO browser_stats (instance_uuid, reported_at, browser_family, browser_version, count) VALUES (?, ?, ?, ?, ?)',
                ).bind(body.uuid, now, family, version, count),
            )
        }
        if (stmts.length > 0) await env.DB.batch(stmts)
    }

    return new Response('OK', { status: 200 })
}

/**
 * Handle GET /stats
 * Returns aggregated statistics for the last 30 days.
 * Requires `Authorization: Bearer <STATS_TOKEN>` header.
 *
 * @param {Request} request
 * @param {object} env
 * @returns {Promise<Response>}
 */
async function handleStats(request, env) {
    const auth = request.headers.get('Authorization')
    if (!env.STATS_TOKEN || auth !== `Bearer ${env.STATS_TOKEN}`) {
        return new Response('Unauthorized', { status: 401 })
    }

    const since = Math.floor(Date.now() / 1000) - 86400 * 30

    const [summary, browsers, uibVersions, platforms] = await env.DB.batch([
        env.DB.prepare(`
            SELECT
                COUNT(*)         AS active_instances,
                SUM(uib_count)   AS total_uib_nodes,
                SUM(markweb_count) AS total_markweb_nodes
            FROM instances
            WHERE last_seen > ?
        `).bind(since),

        env.DB.prepare(`
            SELECT
                browser_family,
                browser_version,
                SUM(count) AS total
            FROM browser_stats
            WHERE reported_at > ?
            GROUP BY browser_family, browser_version
            ORDER BY total DESC
            LIMIT 50
        `).bind(since),

        env.DB.prepare(`
            SELECT uib_version, COUNT(*) AS instances
            FROM instances
            WHERE last_seen > ? AND uib_version IS NOT NULL
            GROUP BY uib_version
            ORDER BY instances DESC
        `).bind(since),

        env.DB.prepare(`
            SELECT os_platform, COUNT(*) AS instances
            FROM instances
            WHERE last_seen > ? AND os_platform IS NOT NULL
            GROUP BY os_platform
            ORDER BY instances DESC
        `).bind(since),
    ])

    return jsonResponse({
        period: 'last_30_days',
        summary: summary.results[0],
        browsers: browsers.results,
        uib_versions: uibVersions.results,
        platforms: platforms.results,
    })
}
