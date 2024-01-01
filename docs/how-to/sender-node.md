---
title: Using the Sender node
description: |
  Describes how and why to use the uib-sender node and how to return messages from your front-end code.
created: 2021-12-31 15:31:06
lastUpdated: 2021-12-31 15:31:11
updated: 2023-12-30 17:01:41
---

The sender node was added in uibuilder v5. It provides an easy method of sending messages to your front-end
from anywhere in your flows and a method of easily getting a response back again.

On a simple level, you can simply use it as a simplified replacement for a pair of link nodes. Link nodes require
a dedicated "wire" between them and you have to have a link-in node in front of your uibuilder node.

## Advantages of the sender node

* No extra `-in` node needed, just select an existing uibuilder node.
* Integrated method that lets you send a response back to your sender node from your front-end.
* Allows optional pass-through of source messages.

## Advantages of the link nodes

* Inbound messages can be passed into a caching node - this is not possible with the sender node as it goes directly.

## Using the sender node

Make sure you have at least one uibuilder node set up and deployed.

Add a `uib-sender` node with an input flow. Select the appropriate uibuilder node to send to.

In your front-end JavaScript, make sure you have a `uibuilder.onChange('msg', function(msg){ .... })` function set up.

In that function output the content of incoming messages. You will find that a message from the sender node looks something like:

```json
{
    "_msgid": "c633e8a0504770f1",
    "payload": "SENT",
    "topic": "From the sender node",
    "_uib": {
        "originator": "85fee74096237ff3"
    }
}
```

By retaining the `_uib.originator` property, any message you send from your front end will return back to the sender node as long as you set that node to allow returns. Note that you can send a message from the browser dev tools console.

```js
uibuilder.send({
    "_msgid": "c633e8a0504770f1",
    "payload": "RESPONDED!",
    "topic": "From the front-end",
    "_uib": {
        "originator": "85fee74096237ff3"
    }
})
```

That's it.