---
title: Telemetry Process
description: |
  The process to handle telemetry data in uibuilder.
created: 2026-05-26 14:02:46
updated: 2026-05-27 15:22:21
---

> [!NOTE]
> UIBUILDER telemetry is optional and all data is anonymous.
>
> The main telemetry functions are kept in the uiblib library module.

## Whenever flows are (re)started

1. The uibuilder runtime plugin creates a listener for node-red's 'flows:started' event. It runs `uiblib.parseTelemetryFile()` (which should only be done once on startup).
2. `uiblib.parseTelemetryFile()` attempts to read the existing telemetry file and merge into the global config. It then calls `this.updateTelemetryData()`.
3. `updateTelemetryData()`:
   1. Does what it says. Removes/sets uuid as needed based on telemetryEnabled setting.
   2. Updates other core telemetry data as needed.
   3. If telemetryEnabled, calls `sendTelemetry()` which records telemetry to cloudflare if >1 month since last send.
   4. IF send is successfull, updates last send timestamp and clears down browser telemetry data.
   5. Calls `fileTelemetry()` to write back to the telemetry file.

## When a uibuilder client connects to socket.io server

1. In `libs/socket.cjs`, `addNs()` calls `this.updateBrowserTelemetry(socket)` when a user connects to a uibuilder node namespace.
2. `updateBrowserTelemetry` parses the user agent string of the connecting client browser via a call to `parseBrowserFromUserAgent()` and updates the browser telemetry data in the global config. It then calls `queueTelemetrySave()`.
3. `queueTelemetrySave()` calls `uiblib.fileTelemetry()` inside a 5s debounce queue.

## Telemetry global configuration

### Settings.js

`uibuilder.telemetryEnabled` defaults to `true`. If set to `false`, telemetry data will continue to be collected and stored locally but will not be sent to the cloudflare worker. The `uuid` property will also be removed from the telemetry data before it is saved locally or sent to the cloudflare worker.

### Global config
```js
{
    // ...

    /** UIBUILDER telemetry settings
     * Telemetry is optional and always anonymous. It is used to collect basic information about the usage
     * of uibuilder to help guide future development. It is not used for any other purpose and is not shared with any third parties.
     * See the privacy policy for more details.
     * Telemetry data is stored in a JSON file in the uibuilder config folder and is loaded and saved via the UibFs library.
     * It is sent to a Cloudflare work endpoint once a month if telemetry is enabled.
     */
    telemetryEnabled: true, // Set from settings.js uibuilder.telemetryEnabled. Default=true
    telemetryFilename: 'telemetry.json', // Name of the telemetry file in the config folder
    /** URL of the uibuilder Cloudflare Worker telemetry endpoint.
     * For local testing with wrangler dev, use http://localhost:8787/telemetry and
     * cd packages/telemetry && npx wrangler dev
     * @constant {string}
     */
    telemetryEndpoint: 'https://uibtelemetry.totallyinformation.net/telemetry',
    // telemetryEndpoint: 'http://localhost:8787/telemetry',
    telemetrySendInterval: 2592000, // 30*24*60*60=30d in secs, Number of days between telemetry sends
    /** Telemetry data
     * Loaded from and saved to `<uibRoot>/.config/telemetry.json` via UibFs.
     * See also uiblib.cjs:updateTelemetryData() for the data that is collected and sent to the telemetry endpoint.
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
     */
    telemetry: {
        // uuid will be set in uiblib.js:updateTelemetryData() when telemetry is sent
        uib_version: pkgJson.version,
        // nr_version: RED.settings.version,
        node_version: process.version,
        os_platform: process.platform,
        // uib_count: Object.keys(uib.instances).length,
        // markweb_count: Object.keys(uib.mwinstances).length,
        // browsers: [], // will be set ??
        // lastSent: 0, // timestamp of last telemetry send - set in uib-runtime-plugin:sendTelemetry()
    },

    // ...
}
```

### `<uibRoot>/.config/telemetry.json`
This file is used to store telemetry data locally so that it survives Node-RED restarts.

#### Example telemetry file content
```json
{
  "uib_version": "7.7.0",
  "nr_version": "4.1.10",
  "node_version": "v24.14.1",
  "os_platform": "win32",
  "uib_count": 46,
  "markweb_count": 2,
  "browsers": [
    {
      "family": "Chrome",
      "version": "148.0",
      "count": 34
    },
    {
      "family": "Firefox",
      "version": "151.0",
      "count": 1
    }
  ],
  "uuid": "3dbcf52f-8552-49f9-9f49-3801d1077bed",
  "lastSent": 1779822250
}
```

## Example cloud telemetry data

### Table: instances
| uuid                                 | count_seen | first_seen | last_seen  | uib_version | nr_version | node_version | os_platform | uib_count | markweb_count |
|--------------------------------------|------------|------------|------------|-------------|------------|--------------|-------------|-----------|---------------|
| 4c469f3d-4760-4d95-9d30-ca7b7c2f0e29 | 0          | 1779798146 | 1779798146 | 7.7.0       | 4.1.10     | v24.14.1     | win32       | 46        | 0             |
| ded83b26-ecd5-4c79-a52c-50a854230bdc | 0          | 1779802740 | 1779802740 | 7.7.0       | 4.1.10     | v24.14.1     | win32       | 46        | 2             |
| 3dbcf52f-8552-49f9-9f49-3801d1077bed | 8          | 1779808128 | 1779822250 | 7.7.0       | 4.1.10     | v24.14.1     | win32       | 46        | 2             |

### Table: browser_stats
| id  | instance_uuid                        | reported_at | browser_family | browser_version | count |
|-----|--------------------------------------|-------------|----------------|-----------------|-------|
| 1   | 3dbcf52f-8552-49f9-9f49-3801d1077bed | 1779820776  | Chrome         | 148.0           | 2     |
| 2   | 3dbcf52f-8552-49f9-9f49-3801d1077bed | 1779821231  | Chrome         | 148.0           | 1     |
| 3   | 3dbcf52f-8552-49f9-9f49-3801d1077bed | 1779822152  | Chrome         | 148.0           | 6     |
| 4   | 3dbcf52f-8552-49f9-9f49-3801d1077bed | 1779822250  | Chrome         | 148.0           | 3     |
| 5   | 3dbcf52f-8552-49f9-9f49-3801d1077bed | 1779822250  | Firefox        | 151.0           | 1     |
