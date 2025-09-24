---
created: 2025-09-06 16:59:41
updated: 2025-09-06 17:02:19
---
`uibuilder.eventSend(event)` and `uibuilder.send({...})` are two of the client library's built in functions and both send information back from the browser client to the Node-RED server. `eventSend` is specifically designed for sending data from browser events such as a button click and will automatically include relavent event information. It will also gather additional information if embeded in an HTML form. `send` mirror's Node-RED's own send function and can used to send any information.
