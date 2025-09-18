---
created: 2025-09-06 16:46:50
updated: 2025-09-06 16:47:55
---
As of v7, clients automatically filter incoming messages based on `pageName`, `clientId`, and `tabId` properties either in `msg._ui` or `msg._uib`. This means that you can send messages to specific clients or pages without needing to filter them in your flows. This is particularly useful when you have multiple clients connected to the same Node-RED instance.
