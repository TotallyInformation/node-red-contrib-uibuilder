/**
 * Manual smoke-test script — POST dummy telemetry to the live Worker endpoint.
 *
 * Usage:
 *   node packages/telemetry/test/post-telemetry.mjs
 *   node packages/telemetry/test/post-telemetry.mjs http://localhost:8787/telemetry
 *
 * An optional first argument overrides the target URL.
 */

import { randomUUID } from 'node:crypto'

const TARGET = process.argv[2] ?? 'https://uibtelemetry.totallyinformation.net/telemetry'
// const TARGET = process.argv[2] ?? 'https://uibuilder-telemetry.totallyinfo.workers.dev/telemetry'

const payload = {
    uuid:          randomUUID(),
    uib_version:   '7.7.0',
    nr_version:    '4.1.10',
    node_version:  process.version,
    os_platform:   process.platform,
    uib_count:     2,
    markweb_count: 1,
    browsers: [
        { family: 'Chrome',  version: '124.0', count: 5 },
        { family: 'Firefox', version: '125.0', count: 2 },
    ],
}

console.log(`\nPOSTing to: ${TARGET}`)
console.log('Payload:')
console.log(JSON.stringify(payload, null, 2))
console.log()

try {
    const res = await fetch(TARGET, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
    })

    console.log(`HTTP ${res.status} ${res.statusText}`)
    console.log('Response headers:')
    for (const [k, v] of res.headers.entries()) {
        console.log(`  ${k}: ${v}`)
    }

    const text = await res.text()
    if (text) console.log(`\nBody: ${text}`)
} catch (err) {
    console.error(`\nFetch failed: ${err.message}`)
    if (err.cause) console.error(`Cause: ${err.cause}`)

    // Extra diagnostics: try a plain DNS lookup
    console.log('\nAttempting DNS lookup...')
    const { lookup } = await import('node:dns/promises')
    const hostname = new URL(TARGET).hostname
    try {
        const addr = await lookup(hostname)
        console.log(`DNS resolved ${hostname} →`, addr)
    } catch (dnsErr) {
        console.error(`DNS lookup failed for "${hostname}": ${dnsErr.message}`)
    }
}
