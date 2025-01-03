---
title: Enhancements to the Node-RED function node
description: |
  UIBUILDER adds some functional extensions to Node-RED's Function Node. This page describes them.
created: 2024-06-14 20:53:10
updated: 2025-01-03 15:16:23
---

## Send message to clients

`RED.util.uib.send(uibname, msg)` will send a message to all connected clients of the specified uibuilder instance. The usual message routing, middleware and filtering rules apply.

 ### Parameters
 
 * `uibname` is the name (url) of a uibuilder instance. Sends a message to any connected clients of that instance.
 * `msg` is any valid Node-RED message object.

> [!NOTE]
> This obviously bypasses any `uib-cache` nodes you might be using so messages sent this way will not be cached for new clients.

## List all uibuilder instances (Apps)

`RED.util.uib.listAllApps()` returns a list object containing all of the uibuilder nodes and some details about them.

### Example output

```json
{
  "uib-element-test": {
    "node":"90794d03f65a40d4",
    "url":"uib-element-test",
    "title":"Zero-code examples",
    "descr":"A collection of flows that demonstrate and test all of the uib-element node's output types."
  },
  // ...
}
```

> [!NOTE]
> The title and description for an instance is set in the uibuilder node's advanced configuration tab.

## Decimal places

`RED.util.uib.dp(inp, dp, int)` returns a _string representation_ of an input _number_ formatted to the given number of decimal places and locale.

### Parameters

* `inp` is the input number.
* `dp` defaults to 1 decimal place.
* `int` defaults to `en-GB` locale.

### Example

```javascript
// Assuming msg.payload = 1234.5678
msg.payload = RED.util.uib.dp(msg.payload, 2, 'en-GB')

return msg
// Returns "1,234.57" in the payload
```

## Deep object find

`RED.util.uib.deepObjFind(obj, matcher, cb)` will search into a deeply nested object for a match and then call a callback function with the object that matched.

If the `matcher` function finds a match, the `cb` function will be called. The search will continue down any number of nested object levels to find a match.

> [!WARNING]
> Take care not to run this against an recursive JavaScript object structure as it will eventually cause a stack overflow.

### Parameters

* `obj` is the object to be searched.
* `matcher` is a function that receives the object as its only parameter, if the function returns TRUE, the callback function will be called.
* `cb` is a callback function that takes a single argument `obj`.

### Example

```javascript
/**
 * Update the STYLE of the uib low-code table definition
 * if the NoRead column is >= 20
 * 
 * Using CSS variables from uib-brand.css.
 * 
 * In the example, we use a style attribute
 * but in live, best to define and use a class.
 */

// Search for the first `tbody` definition
const matcher = (obj) => obj.type === 'tbody'

// If found, process each row of the table body
const cb = (obj) => {
  // node.warn(obj.components)
  const tblRows = obj.components

  // Process every table row
  tblRows.forEach(row => {
    // ref to the row's NoRead column (10th column)
    const noRead = row.components[9]

    // Get the "slot" which is the data displayed in the cell
    if (noRead.slot >= 20) {
      // If the data >= 20, add some extra style just to the cell
      noRead.attributes.style = 'background-color: var(--failure); font-weight: bold;'

      // And/OR add formatting to the whole row
      row.attributes.style = 'background-color: var(--warning);'
    }
  })

  node.send(msg)
}

RED.util.uib.deepObjFind(msg._ui, matcher, cb)
```

