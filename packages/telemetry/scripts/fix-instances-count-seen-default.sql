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
