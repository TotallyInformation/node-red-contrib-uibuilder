#!/usr/bin/env bash
# setup.sh — Sets up the Cloudflare Workers + D1 telemetry service for uibuilder.
#
# Steps:
#   1. Verify Node.js and Wrangler CLI are available.
#   2. Authenticate with Cloudflare.
#   3. Create the D1 database and apply the schema.
#   4. Patch wrangler.toml with the real database ID.
#   5. Store STATS_TOKEN as a Worker secret.
#   6. Deploy the Worker.
#
# Run from: packages/telemetry/

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CYAN='\033[0;36m' GREEN='\033[0;32m' YELLOW='\033[1;33m' RED='\033[0;31m' NC='\033[0m'

step()    { echo -e "\n${CYAN}==> $*${NC}"; }
success() { echo -e "${GREEN}    OK  $*${NC}"; }
warn()    { echo -e "${YELLOW}    WARN  $*${NC}"; }
fail()    { echo -e "${RED}    FAIL  $*${NC}"; exit 1; }

assert_cmd() {
    command -v "$1" &>/dev/null || fail "'$1' not found. Please install it and re-run."
    success "'$1' is available."
}

# ── 1. Prerequisites ──────────────────────────────────────────────────────────

step "Checking prerequisites"
assert_cmd node
assert_cmd npm

if ! command -v wrangler &>/dev/null; then
    step "Installing Wrangler CLI globally"
    npm install -g wrangler
fi
assert_cmd wrangler

# ── 2. Cloudflare login ───────────────────────────────────────────────────────

step "Authenticating with Cloudflare (browser window will open)"
cd "$SCRIPT_DIR"
wrangler login
success "Authenticated."

# ── 3. Create D1 database ─────────────────────────────────────────────────────

step "Creating D1 database 'uibuilder-telemetry'"
DB_OUTPUT="$(wrangler d1 create uibuilder-telemetry 2>&1)" || true
echo "$DB_OUTPUT"

DB_ID="$(echo "$DB_OUTPUT" | grep -oP 'database_id\s*=\s*"\K[^"]+')" || true

if [[ -z "$DB_ID" ]]; then
    warn "Could not auto-detect database_id from wrangler output."
    read -rp "Paste the database_id shown above: " DB_ID
fi

[[ -n "$DB_ID" ]] || fail "No database_id provided. Aborting."
success "Database ID: $DB_ID"

# ── 4. Patch wrangler.toml ────────────────────────────────────────────────────

step "Updating wrangler.toml with database_id"
TOML="$SCRIPT_DIR/wrangler.toml"

if grep -q 'REPLACE_WITH_YOUR_DATABASE_ID' "$TOML"; then
    # Use perl for in-place replacement to avoid BSD/GNU sed differences
    perl -pi -e "s/REPLACE_WITH_YOUR_DATABASE_ID/$DB_ID/g" "$TOML"
    success "wrangler.toml updated."
else
    warn "wrangler.toml already has a database_id — skipping patch."
fi

# ── 5. Apply D1 schema ────────────────────────────────────────────────────────

step "Applying database schema to remote database"
wrangler d1 execute uibuilder-telemetry --remote --file="$SCRIPT_DIR/schema.sql"
success "Schema applied."

# ── 6. Set STATS_TOKEN secret ─────────────────────────────────────────────────

step "Setting STATS_TOKEN Worker secret"
echo "    Enter a strong random token (used to access the /stats endpoint)."
echo "    Tip: generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
wrangler secret put STATS_TOKEN
success "STATS_TOKEN set."

# ── 7. Deploy ─────────────────────────────────────────────────────────────────

step "Deploying Worker"
wrangler deploy

echo -e "\n${GREEN}========================================================"
echo "  Setup complete!"
echo -e "========================================================${NC}"
echo ""
echo "  Telemetry endpoint:"
echo "    POST https://uibuilder-telemetry.<your-subdomain>.workers.dev/telemetry"
echo ""
echo "  Stats endpoint (requires Bearer token):"
echo "    GET  https://uibuilder-telemetry.<your-subdomain>.workers.dev/stats"
echo ""
echo "  To redeploy after changes:"
echo "    cd packages/telemetry && wrangler deploy"
echo ""
