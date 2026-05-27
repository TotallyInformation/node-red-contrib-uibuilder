-- Fix: browser_stats.instance_uuid FK was left pointing at dropped table instances_old.
-- Safe to run: browser_stats is empty (no data to migrate).
PRAGMA foreign_keys=off;
DROP TABLE IF EXISTS browser_stats;
CREATE TABLE browser_stats (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    instance_uuid         TEXT    NOT NULL REFERENCES instances (uuid),
    reported_at           INTEGER NOT NULL,
    browser_family        TEXT    NOT NULL,
    browser_version       TEXT    NOT NULL,
    count                 INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_browser_stats_reported_at ON browser_stats (reported_at);
CREATE INDEX IF NOT EXISTS idx_browser_stats_family ON browser_stats (browser_family);
PRAGMA foreign_keys=on;
