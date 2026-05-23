-- D1 schema for uibuilder telemetry
-- Apply with: wrangler d1 execute uibuilder-telemetry --file=schema.sql
-- Re-running this file is safe (all statements use IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS instances (
    uuid          TEXT    PRIMARY KEY,
    first_seen    INTEGER NOT NULL,
    last_seen     INTEGER NOT NULL,
    uib_version   TEXT,
    nr_version    TEXT,
    node_version  TEXT,
    os_platform   TEXT,
    uib_count     INTEGER NOT NULL DEFAULT 0,
    markweb_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_instances_last_seen
    ON instances (last_seen);

-- Browser stats are stored as pre-aggregated counts sent by the client,
-- not as individual user-agent strings. This keeps the data privacy-safe.
CREATE TABLE IF NOT EXISTS browser_stats (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    instance_uuid         TEXT    NOT NULL REFERENCES instances (uuid),
    reported_at           INTEGER NOT NULL,
    browser_family        TEXT    NOT NULL,
    browser_version       TEXT    NOT NULL,
    count                 INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_browser_stats_reported_at
    ON browser_stats (reported_at);

CREATE INDEX IF NOT EXISTS idx_browser_stats_family
    ON browser_stats (browser_family);
