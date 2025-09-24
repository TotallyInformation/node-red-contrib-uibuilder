---
created: 2025-09-06 16:57:58
updated: 2025-09-06 16:58:59
---
Remember that the Node-RED server and the browser client page run in completely *separate contexts* (even if they both run on the same device). The only communication between them happens because the `uibuilder` node talks to the uibuilder client library.
