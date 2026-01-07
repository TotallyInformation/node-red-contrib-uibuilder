---
created: 2026-01-07 13:23:29
updated: 2026-01-07 13:23:29
---

1. **Sends a message to Node-RED** with a unique correlation ID (msg._uib.correlationId)
2. **Returns a Promise** that resolves when a matching response is received
3. **Matching logic**: The response must have the same msg.topic AND msg._uib.correlationId
4. **Timeout option**: Defaults to 60 seconds (60000ms), configurable via options.timeout
5. **onSuccess callback**: Optional function called on successful response
6. **Originator support**: Optional Node-RED node ID to return the message to

### Usage Examples

```javascript
// Basic usage - await the response
const responseMsg = await uibuilder.asyncSend({ topic: 'myTopic', payload: 'Hello' })

// With options
const responseMsg = await uibuilder.asyncSend(
    { topic: 'getData', payload: { id: 123 } },
    { timeout: 30000, onSuccess: (msg) => console.log('Got response:', msg) }
)

// Using .then()
uibuilder.asyncSend({ topic: 'query', payload: 'test' })
    .then(response => console.log('Response:', response))
    .catch(err => console.error('Failed:', err))
```

### Node-RED Side

For this to work, your Node-RED flow must echo back the msg._uib.correlationId in the response message with the same msg.topic.

The flow pattern would be:

```
[uibuilder] → [your processing] → [uibuilder]
                                    ↓
                        (preserve msg.topic and msg._uib.correlationId)
```
