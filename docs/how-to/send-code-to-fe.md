---
title: Sending JavaScript code from Node-RED to the front-end
description: |
  Sometimes, you may want to dynamically send some code from Node-RED to your browser clients, this shows you how.
created: 2024-02-24 14:59:36
updated: 2024-02-24 15:26:09
---

It is not possible to simply transfer JavaScript code from Node-RED to the browser. This is because to get to the browser, the data being transferred has to be "stringified" and functional code is excluded from that. This is a limitation of JavaScript.

In addition, browsers must protect themselves from "randomly" inserted code. As such, you cannot simply send code in HTML `<script>...</script>` tags using UIBUILDER's no-code nodes.

However, UIBUILDER allows for this by providing a low-code capability. The low-code `load` method allows both scripts and CSS styling to be dynamically loaded. Either from external resource endpoints (URL's) but also as text that will be correctly interpreted in the browser.

## How to send live code to the browser

The `load` method is documented on the [Config-driven UI](client-docs/config-driven-ui?id=method-load) page.

In Node-RED, convert your JavaScript function to text as in this simplistic example that will work in a function node:

```js
function fred() {
    var temp = context.get("last_update"); //create a node variable
    var current = new Date();  //capture the current date
    msg.payload = Number(current) - temp;  //set the payload to the time date of the last update
    context.set("last_update",current);  //save the node variable
}

msg._ui = {
    "method": "load",
    // Add script tag to HTML converting the text to JavaScript
    "txtScripts": [
        // Will be able to do `fred()` in the browser dev console.
        fred.toString(),
        // But of course, we can execute immediately as well.
        "fred()"
    ]
}

return msg
```

Sending that msg to your uibuilder node will send it to the front-end and the function will be available to your front-end code in the browser.

> [!TIP]
> * Please do note the warnings in the detailed documentation. And make sure you only send trusted code.
>
> * Also note that you can use the core `template` node if you need to merge information or settings into your code before sending it.
>   You can, of course do that manually as well but using the template node is generally a lot easier.
