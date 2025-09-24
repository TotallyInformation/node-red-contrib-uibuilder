---
created: 2025-09-24 16:32:29
updated: 2025-09-24 16:35:54
---
How do you deal with clients that may be offline for periods of time? This could be a mobile device that goes out of signal range, or a device that is turned off for periods of time. Node-RED may be continuously gathering data that you want to display on the client when it next connects.

UIBUILDER provides the [`uib-cache` node](nodes/uib-cache) to deal with this. It will respond automatically to the client connection control message from the uibuilder node by sending the cache to the client. Or you can manually trigger it. If you need more complex cache management, you can use multiple `uib-cache` nodes.
