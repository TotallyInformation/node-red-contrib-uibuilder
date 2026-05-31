# uibuilder Telemetry Service

A lightweight, privacy-conscious telemetry collector built on **Cloudflare Workers** and **D1** (SQLite at the edge). Designed to stay within Cloudflare's free tier for up to ~10,000 active Node-RED instances.

## Contents

| File            | Purpose |
|-----------------|---------|
| `src/worker.js` | Cloudflare Worker — HTTP handler |
| `schema.sql`    | D1 database schema |
| `wrangler.toml` | Wrangler project configuration |
| `setup.ps1`     | Automated setup script (Windows / PowerShell) |
| `setup.sh`      | Automated setup script (Linux / macOS) |

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free plan is sufficient)
- Internet access from the machine running the setup

The setup scripts will install **Wrangler CLI** automatically if it is not found.

---

## Quick Start

### Windows (PowerShell)

```powershell
cd packages/telemetry
.\setup.ps1
```

### Linux / macOS (bash)

```bash
cd packages/telemetry
chmod +x setup.sh
./setup.sh
```

Both scripts perform the same steps described in the [Manual Setup](#manual-setup) section below.

---

## Manual Setup

### 1. Install Wrangler

```bash
npm install -g wrangler
```

### 2. Authenticate with Cloudflare

```bash
wrangler login
```

A browser window will open for OAuth authentication.

### 3. Create the D1 database

```bash
wrangler d1 create uibuilder-telemetry
```

Wrangler will print a block like:

```toml
[[d1_databases]]
binding      = "DB"
database_name = "uibuilder-telemetry"
database_id  = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Copy the `database_id` value and update `wrangler.toml`:

```toml
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 4. Apply the database schema

```bash
wrangler d1 execute uibuilder-telemetry --file=schema.sql
```

Verify the tables were created:

```bash
wrangler d1 execute uibuilder-telemetry --command="SELECT name FROM sqlite_master WHERE type='table'"
```

### 5. Set the stats access token

Generate a strong random token:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Store it as a Worker secret (you will be prompted to paste the value):

```bash
wrangler secret put STATS_TOKEN
```

Keep this token safe — it is the only thing protecting the `/stats` endpoint.

### 6. Deploy the Worker

```bash
wrangler deploy
```

Wrangler will print the deployment URL, e.g.:

```
https://uibuilder-telemetry.<your-subdomain>.workers.dev
```

---

## API

### `POST /telemetry`

Receives a telemetry report from a Node-RED instance. Rate-limited to one accepted report per instance per hour.

**Request body** (JSON):

```json
{
  "uuid":          "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "uib_version":   "7.0.0",
  "nr_version":    "4.0.0",
  "node_version":  "20.11.0",
  "os_platform":   "linux",
  "uib_count":     3,
  "markweb_count": 1,
  "browsers": [
    { "family": "Chrome",  "version": "124", "count": 5 },
    { "family": "Firefox", "version": "125", "count": 2 }
}
```

`uuid` is the only required field. All other fields are optional.

> **Privacy note:** `browsers` must contain **pre-aggregated counts** (family + major version + how many connections), not raw user-agent strings. The worker will accept a maximum of 20 browser entries per report.

**Responses:**

| Status                  | Meaning |
|-------------------------|---------|
| `200 OK`                | Report accepted |
| `400 Bad Request`       | Missing or invalid `uuid`, or malformed JSON |
| `429 Too Many Requests` | This instance already reported within the last hour |

### `GET /stats`

Returns aggregated statistics for the last 30 days.

**Required header:** `Authorization: Bearer <STATS_TOKEN>`

**Example request:**

```bash
curl -H "Authorization: Bearer <your-token>" \
     https://uibuilder-telemetry.<your-subdomain>.workers.dev/stats
```

**Example response:**

```json
{
  "period": "last_30_days",
  "summary": {
    "active_instances": 8432,
    "total_uib_nodes": 21056,
    "total_markweb_nodes": 3104
  },
  "browsers": [
    { "browser_family": "Chrome",  "browser_version": "124", "total": 42100 },
    { "browser_family": "Firefox", "browser_version": "125", "total": 8300 }
  ],
  "uib_versions": [
    { "uib_version": "7.0.0", "instances": 5200 }
  ],
  "platforms": [
    { "os_platform": "linux",  "instances": 6100 },
    { "os_platform": "win32",  "instances": 1800 },
    { "os_platform": "darwin", "instances": 532 }
  ]
}
```

---

## Cost Estimate

At ~10,000 active instances sending data approximately 6 times per day (~60,000 requests/day):

| Resource         | Free tier limit | Expected usage | Cost |
|------------------|-----------------|----------------|------|
| Workers requests | 100,000 / day   | ~60,000 / day  | $0   |
| D1 row writes    | 100,000 / day   | ~80,000 / day  | $0   |
| D1 storage       | 5 GB            | ~200 MB / year | $0   |

If the project grows beyond free-tier limits, the Workers Paid plan is $5/month and covers 10 million requests per month.

---

## Redeployment

After changing `src/worker.js`:

```bash
cd packages/telemetry
wrangler deploy
```

After changing `schema.sql` (additive changes only — D1 does not support destructive migrations automatically):

```bash
wrangler d1 execute uibuilder-telemetry --file=schema.sql
```

---

## Privacy Considerations

- **No IP addresses are stored.** The Worker receives the client IP via Cloudflare headers but never writes it to D1.
- **No raw user-agent strings are stored.** The Node-RED client must aggregate browser data before sending (family + major version + count).
- **Instance UUIDs** are self-generated by the Node-RED instance. They identify an installation, not a person.
- **Opt-in recommended.** The uibuilder node should default telemetry to `off` and require explicit user consent before sending data.
- Depending on your jurisdiction, this data may still be subject to privacy regulations (e.g. GDPR). Consider publishing a privacy notice describing what is collected and why.

---

## Useful Wrangler Commands

```bash
# Tail live Worker logs
wrangler tail

# Query D1 directly
wrangler d1 execute uibuilder-telemetry --command="SELECT COUNT(*) FROM instances"

# List Worker secrets
wrangler secret list

# Delete a secret
wrangler secret delete STATS_TOKEN

wrangler d1 execute uibuilder-telemetry --command="SELECT sql FROM sqlite_master WHERE name='browser_stats'"
wrangler d1 execute uibuilder-telemetry --remote --command="SELECT sql FROM sqlite_master WHERE name='browser_stats'"
wrangler d1 execute uibuilder-telemetry --remote --file=schema.sql
```
