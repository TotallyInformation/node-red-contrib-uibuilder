---
title: Create a live-reloading dev server with uibuilder
description: >
   Many build tools provide live dev servers. When working with uibuilder, we can craft that in Node-RED!
created: 2023-08-26 16:21:23
lastUpdated: 2023-08-26 16:21:40
---

All that is needed is a small flow using 1 or more `watch` nodes to listen for changes to key files. When a change is detected, send a reload ._ui command to your uibuilder node.

## Limitations

* No "HMR". HMR injects changes into a live-running browser page without a reload. This is not currently possible.

## Alternative 1: Svelte

The Svelte framework's development server works with Node-RED/uibuilder with no code overrides needed.

## Alternative 2: browser-sync

Browser-Sync can successfully proxy Node-RED/uibuilder's connections. However, it can only do HMR on CSS files (though an additional plugin should be able to do it with HTML files as well).

Here is an example configuration:

```javascript
/** Example script to run browser-sync with Node-RED and uibuilder
 * With this configuration, browser-sync will auto-reload when any critical files change.
 * No changes to your front-end code are required.
 * To use:
 * 1) cd <instanceRoot>
 * 2) npm install browser-sync --save-dev
 * 3) cp <this file> ./
 * 4) node ./<this file>
 * 
 * Plugins: https://www.npmjs.com/search?q=browser%20sync%20plugin
 */
const browserSync = require('browser-sync').create()

// https://browsersync.io/docs/options/
browserSync.init({
    // This needs to be the URL for your uibuilder end points (minus http(s):// on the front)
    proxy: "127.0.0.1:3001/iife-client-tests/",
    // Optionally, you can proxy websockets too - but this isn't really needed:
    // proxy: {target: "127.0.0.1:3001/iife-client-tests/", ws: true},
    // Plenty of other options also available for proxy.

    // defaults to 3000 so if you are using this with uibuilder, Node-RED, etc, then change here
    // port: 3003,
    
    // Watch for changes in files - upd css & imgs get live injected, other files cause page reload
    files: ['src/**', 'dist/**', 'routes/**', 'api/**'],
    watch: true,
})

/** Other ideas
 * GET http://localhost:3000/iife-client-tests/__browser_sync__?method=reload - will trigger a reload on that page
 *   Not really needed with uibuilder since we have commands to do that.
 * Plugins:
 *   browser-sync-logger: Will take browser console output and display on the console where browser-sync started
 *   bs-html-injector: Inject HTML changes instead of reloading the page
 */

```

## See also

* * [Optimise & transpile (build)](front-end-builds.md)
