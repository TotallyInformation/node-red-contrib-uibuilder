---
title: Quick Start Guide
description: A quick start guide to get you quickly up and running with UIBUILDER for Node-RED.
created: 2024-05-02 11:17:20
updated: 2025-09-24 17:14:32
author: Julian Knight
---

Install `node-red-config-uibuilder` using Node-RED's Palette Manager. Then *choose one of the following approaches* to get started with UIBUILDER:

<!-- <div>
  <label><input type="radio" name="approach" value="no-code" checked>I'm happy with Node-RED flows, I prefer to avoid coding.</label>
  <label><input type="radio" name="approach" value="some-code">I'm comfortable with some coding, I want to customize my UI.</label>
</div> -->

<details name="approach-group">
<summary><h2>I'm happy with Node-RED flows, I prefer to avoid coding.</h2></summary>

#### Goal
Build a simple web page driven entirely from Node-RED nodes (no hand-written HTML/CSS/JS).

#### Why this works
UIBUILDER includes dedicated no-code nodes (`uib-element`, `uib-update`, `uib-tag`) that let you describe UI (user interface) elements in Node-RED and have the UIBUILDER front-end client library build and change them for you. You can also send simple control messages from Node-RED to change those elements at runtime.

#### Quick steps

1. Add a uibuilder node to your flow: pick a URL path (for example myui) in the node settings and **deploy**. You’ll now have a page at `http<s>://<node-red-host>:<node-red-port>/myui`.

   > [!NOTE]
   > You **must** do an initial deploy after setting the URL path and *before doing anything else*. This creates the folder structure and URL's for your uibuilder instance.

3. Use the no-code nodes:

   Drag in a `uib-element` node from the palette. Configure it's output type (list, table, card, etc. — options shown in the node).

   Feed it data via normal Node-RED nodes (Inject, function, MQTT, HTTP in, etc.). The uib-element converts your data into the UI element config and the uibbuilder node serves it to the browser.

   Try a simple example: wire an inject node (payload = a string or JSON) → uib-element (configured to create a “card” or “list”) → uibuilder. Open the page URL in a browser and you should see the element appear. (Example inject flows that include _uib and payload show how Node-RED can push notifications or updates without front-end code).

   > [!TIP]
   > <div class="flex-container">
   > <div class="flex-left" style="width:21rem;"><img src="images/import-no-code.png" alt="import no-code uibuilder example"></div>
   > <div>Use the no-code example flow in Node-RED's import menu to get started quickly.</div>
   > </div>

4. Update at runtime:

   Send another message into the uibuilder node via a `uib-update` node to change text, disable a button, update a table row, etc. The example flows show how to do this.

#### Practical tips

* Start by importing the built-in example flows — they show no-code usage so you can step through what each node does.
* If a change doesn’t appear, check the browser console and the Node-RED debug pane. There is a good chance you targeted the wrong element.
* The output of no-code and low-code nodes is standardised JSON configuration data. You can examine it in a debug node and modify it yourself if you want to. This lets you build more complex outputs.

</details>


<details name="approach-group">
<summary><h2>I'm comfortable with some coding, I want to customize my UI.</h2></summary>

#### Goal
Use uibuilder’s built-in helpers + a tiny bit of HTML/JS so your page can display live data from Node-RED.

#### Why this approach
You get the polish and flexibility of small front-end edits (a custom layout, an output area to show data, user inputs, etc.) while using Node-RED to feed live data. UIBUILDER gives a lightweight front-end library and templates you can edit from your Node-RED user directory.

#### Quick steps

1. Install & add a uibuilder node (same as above). Open the page using the provided link to confirm the default template has loaded.

2. Edit the front-end code:

  UIBUILDER stores front-end files under `~/.node-red/uibuilder/<your-url>/src`. A minimum of 3 files are provided already for you. `index.html`, and `index.css` define the structure and style of the page. The optional `index.js` is commented out by default.

  A tiny `index.html` body could be just `<div id="more">Waiting…</div>` — that’s all you need to start.

  > [!TIP]
  > You will find a `<div id="more"></div>` element already defined in all of the template and example `index.html` files. You can use this element to add your own content. Examples also use it. To use it with no-code and low-code nodes, note that you use the CSS selector `#more` to target it.

3. (Optional) Use the uibuilder client API or other JavaScript

  Inside `index.js` (don't forget to enable it in `index.html`) you can react to messages from Node-RED and update DOM elements. Example minimal code (works with the uibuilder client shipped with the node):

  ```javascript
  // callback when a message arrives from Node-RED
  uibuilder.onChange('msg', (msg) => {
    // $(...) is a shorthand for document.querySelector(...)
    $('#more').textContent = msg.payload
  })
  ```

  To send data from Node-RED, wire an inject or function node with the value to the uibuilder node (msg.payload = 42). The JS above will update the `<div>` automatically.

  > [!TIP]
  > There are other ways that UIBUILDER lets you update you UI without writing JavaScript. In addition to the no-code/low-code nodes, there is the `uib-topic` attribute you can add to any HTML element and the `<uib-var>` custom component. See [Easy UI Updates](/using/easy-ui-updates.md) for more detail.

4. (Optional) Add a control

  In index.html:
  ```html
  <button id="btn1" onclick="uibuilder.eventSend(event)">Automatic feedback</button>
  <button id="btn2">Custom feedback</button>
  ```

  In index.js:
  ```javascript
  $('#btn2').addEventListener('click', () => {
    uibuilder.send({topic:'button', payload:'clicked'})
  })
  ```

  In Node-RED, wire the uibuilder node’s first output port to a debug node to see the message when the button is pressed.

  > [!NOTE]
  > The `uibuilder.eventSend(event)` function automatically sends a message with standardised information about what was clicked and any attributes. No JavaScript is needed in `index.js` for this button.

With UIBUILDER, a small HTML is often enough, you usually don’t need frameworks. Though you can use them if you want to.

Quite often, no JavaScript will be needed at all, but if you need to do something custom, a few DOM elements and a few lines of JS will already let you display and control live data. Use `uibuilder.send()` to talk back to Node-RED and `uibuilder.onChange()` to receive.

#### Practical tips

* Use the default template files as a starting point — they include sample code and patterns you can amend as desired. External templates are also supported, you can create you own and easily share them.

* Remember that HTML is a _hierarchy_. Try to keep markup [semantic](https://developer.mozilla.org/en-US/curriculum/core/semantic-html/). Use unique HTML IDs for elements you intend to update.

* UIBUILDER lets you easily add front-end libraries via the node’s “front-end libraries” tab. These are made available to your front-end code automatically. Great for adding charting libraries, etc.
</details>

Try out ["A first-timers walkthough of using UIBUILDER"](walkthrough1) to walk through a complete example to get you going. Then check out the built-in *example flows* to see how to do more complex things (Using Node-RED's import menu). Also check out the [video series on YouTube](https://www.youtube.com/watch?v=IVWR_3cx05A&list=PL9IEADRqAal3mG3RcF0cJaaxIgFh3GdRQ).

[tip:rotate]
