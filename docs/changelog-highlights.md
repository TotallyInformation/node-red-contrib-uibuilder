---
created: 2025-12-15 15:00:36
updated: 2026-05-31 13:17:25
version: 7.7.0
---
### Welcome to UIBUILDER v7.7.0
This is a feature & bug-fix release.

* Markweb now supports Mermaid diagrams and Markdown footnotes. The automatic status block has been corrected and moved to the main content.
* The `uib-sidebar` node is now working correctly which creates a mini-web-page in the Node-RED Editor's sidebar panel. It has been updated to allow multiple sidebar nodes to be used. Each will create a separate section in the sidebar and can have its own input and output for dynamic content.
* New `<json-viewer>` web component made available for displaying JSON data in a structured format. Accepts pretty much ALL JavaScript object data, not just JSON. The uibuilder client library's `syntaxHighlight()` and `showMsg()` functions have also been updated to use this new component if it is loaded, giving a much nicer output with collapsible sections for large objects and arrays.
* Updated `RED.util.uib` namespace for Node-RED Function nodes with new `saferSerialize()` and `renderToHTML()` functions for more robust JavaScript object handling and rendering.
* Easier CSP overrides. `uibuilder.contentSecurityPolicy` in settings.js.
* New anonymous telemetry feature.
* The uibuilder initial log summary nows starts just after the 'flows:started' event to ensure that telemetry data is available. Whether telemetry is active and the number of uibuilder and markweb node instances are now also shown.

