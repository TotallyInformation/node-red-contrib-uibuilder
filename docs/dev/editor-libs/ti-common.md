---
title: UIBUILDER's Common Node-RED Editor support library
description: |
  Provides common, standard, functions and data to all UIBUILDER nodes in the Node-RED Editor.
created: 2023-12-19 16:22:27
lastUpdated: 2023-12-19 16:22:32
updated: 2023-12-30 17:01:42
---

## Editor page globals

`uibuilder` is added to the globals for the Node-RED Editor page. It is only ever added once.

```javascript
{
  // Standard palette category for all uibuilder nodes
  paletteCategory: 'uibuilder',
  // Standard width for typed input fields
  typedInputWidth: '68.5%',
  // Are we running on a local device?
  localHost: ['localhost', '127.0.0.1', '::1', ''].includes(window.location.hostname) || window.location.hostname.endsWith('.localhost'),
  // URL root if needed (set below to '' if using a custom uib server)
  nodeRoot: RED.settings.httpNodeRoot.replace(/^\//, ''),
  // URL prefix for all uib nodes - set below
  urlPrefix: undefined,
  // uib server type
  serverType: undefined,
  /** Tracks ALL uibuilder editor instance URL's by node id by tracking changes to the Node-RED Editor - ONLY USE FOR URL TRACKING
   * These URL's may not actually be deployed. They also include disabled nodes (node.d=true) AND disabled flows.
   * NOTE: Nodes on disabled flows are not directly detectable and node.d will not be set.
   * @type {{string,string}|{}}
   */
  editorUibInstances: {},
  /** Tracks all DEPLOYED uibuilder instances url's by node id @type {{string,string}|{}} */
  deployedUibInstances: {},
  /** Tracks uibuilder's installed front-end packages - changes as packages added/removed (in uibuilder node) */
  packages: [],
  /** List of uib node names */
  uibNodeTypes: ['uibuilder', 'uib-cache', 'uib-element', 'uib-html', 'uib-save', 'uib-sender', 'uib-tag', 'uib-update'],

  // Debug output via log() - turn on/off with true/false
  get debug() { return _dbg },
  set debug(dbg) { /* ... */ },
  log: function(...args) {},

  /** Add jQuery UI formatted tooltips - add as the last line of oneditprepare in a node
   * @param {string} baseSelector CSS Selector that is the top of the hierarchy to impact
   */
  doTooltips: function doTooltips(baseSelector) { /* ... */ },
  /** Get all of the currently deployed uibuilder URL's & updates this.deployedUibInstances
   * NOTE that the uibuilder.editorUibInstances cannot be used as that includes disabled nodes/flows
   * @returns {{string,string}} URLs by node id of deployed uibuilder nodes
   */
  getDeployedUrls: function getDeployedUrls() { /* ... */ },
  /** Sort an instances object by url instead of the natural order added
   * @param {*} instances The instances object to sort
   * @returns {*} instances sorted by url
   */
  sortInstances: function sortInstances(instances) { /* ... */ },
}
```
