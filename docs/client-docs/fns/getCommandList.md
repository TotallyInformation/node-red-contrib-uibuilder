---
created: 2026-03-17 12:47:40
updated: 2026-03-17 12:56:07
---
### `getCommandList` - Return a list of available commands that can be sent from Node-RED to the front-end client :id=getcommandlist

Simply returns a list of available command names that can be sent from Node-RED to the front-end client to control the UI or get information from it.

#### Example Node-RED message to change the logging level of the client library to `debug`:

```json
{
    "_uib": {
        "command": "set",
        "prop": "logLevel",
        "value": 5
    }
}
```
