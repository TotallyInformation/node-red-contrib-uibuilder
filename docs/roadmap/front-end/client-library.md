---
title: Front-end client library roadmap
description: >
    This page is a working document to track the development of the front-end client library for uibuilder. It is not intended to be a comprehensive list of all features or changes, but rather a high-level overview of the main areas of development.
    It is expected that this page will be updated frequently as development progresses and new features are added or changed.
created: 2026-04-19 14:45:25
updated: 2026-04-19 14:45:33
author: Julian Knight (Totally Information)
---

## To finish

* [ ] [**STARTED**] Ability to visually show all uibuilder managed variables.

* [ ] [**STARTED**] Add individual class handling to _ui processing. [ref](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList).

* [ ] [**STARTED**] FILTERs (text formaters) on `<uib-var>`
  * [x] They should be a collection of JS functions that are auto-given the var as a value, add any other args and return a formatted version of the value.

  * [ ] Filters should be chainable. `reflect.apply(target, thisArgument, argumentsList)`

* [ ] [**STARTED**]  Add ability to save the current DOM.
  * [x] Manual send to Node-RED (with remote control option) as std msg
  * [ ] To local storage - with option to reload on reload
  * [ ] Auto-send to Node-RED as a control msg (whole HTML or from a CSS Selector)

## To Do

  * [ ] Reduce number of `[info]` log messages (demote to `[debug]`)
  * [ ] Improve socket.io dis-/re-/connect handling and messaging. 

  * [ ] When handling attribute updates from msg, if msg.attributes is a string, attempt to parse it as JSON before giving up. [ref](https://discourse.nodered.org/t/what-am-i-doing-wrong-or-help/99960/3)

  * [ ] Check that FE updates allow attributes to be set to `null` to unset them.

  * [ ] Dialog (modal/non-modal overlay)
    * [ ] component(?) that can consume a template and display it as a dialog. [ref](https://discourse.nodered.org/t/uibuilder-help-in-developing-a-dashboard/97478/18)

  * [ ] For the `uib-topic` attribute, allow msg.payload to be an array or object. Consider adding a `uib-fmt` attribute to allow output specification:
    * `uib-fmt="json"` - output as a syntax highlighted JSON object.
    * `uib-fmt="list"` - output as an HTML list.
    * `uib-fmt="table"` - output as an HTML table.

  * [ ] Reactivity - phase 1
    * [x] Create a reactive wrapper `uibuilder.reactive()`.
      * [x] Move to separate class file
      * [ ] Add `reactive` and `getReactiveClass` to function reference.
  * [ ] Reactivity - phase 2
    * [ ] Compare the `uib-topic` attribute processing with the `<uib-var>` processing and see if they can be unified. NB: Can only be partial since `uib-var` consumes the whole variable/msg, whereas `uib-topic` only consumes msg.payload as data.
      * [ ] At least add the `filter` attribute processing to `uib-topic`?
      * [ ] Consider adding a specific property for uib-var to allow setting html attributes/properties. e.g. `._data`?
    * [ ] Extend to allow for a `msg.props` object that automatically updates element properties.
    * [ ] Supported msg props should be: `topic`, `payload`, `attributes`, `dataset`, `props`, `styles`, and `classes`.
  * [ ] Reactivity - phase 3
    * [ ] Create a MutationObserver for any DOM attributes that start with `:` (`uib-bind` - binds an attribute to a variable) or `@` (`uib-on` - binds an event to a function).
      * [ ] Extend to allow `uib-show` (show/hide elements).
      * [ ] Extend to allow `uib-text` (innerText).
      * [ ] Extend to allow `uib-model` (two-way data binding for input elements).
    * [ ] Add a `uib-repeat` directive to allow easy creation of lists from arrays.
    * [ ] Add a `uib-if` directive to allow conditional rendering of elements.
    * [ ] Add a `uib-switch` directive to allow conditional rendering of one-of-many elements.
    * [ ] Add a `uib-component` directive to allow easy creation of web components.
    
  * Toaster improvements
    * [x] Initial rework
    * [ ] More work needed - probably delayed now that new showOverlay is available.
    * [ ] Test


## Other

* Maybe think about having a control msg from NR to clients that will re-arrange elements on the page. Possibly an array (map?) of element selectors in a set order. Would probably need a "root" element that is the parent of all the elements to be re-arranged. Could also be used to show/hide elements.
* Sending events from client to server using beacons.
* FE: Write a template parser capable of parsing `<b>{{myvar}}</b>` into `<b><uib-var variable="myvar"></uib-var></b>`.
* Move table handling to use older HTMLTableElement API. [ref1](https://christianheilmann.com/2025/10/08/abandonware-of-the-web-do-you-know-that-there-is-an-html-tables-api/), [ref2](https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement)
* For onTopic and uib-topic, allow wildcards in the topic name.

* Use document fragments (`document.createDocumentFragment()`) to build components then use `appendChild` when the component is built.
* Use textContent over innerText - but only where you know that the text cannot be hidden as textContent ignores that.
* Use `insertAdjacentHTML` over `innerHTML`
* Prefer hiding/showing content over creating new elements. [Accessibility ref.](https://www.a11yproject.com/posts/how-to-hide-content/).
* For element references, use `WeakMap`  to make it easier to remove and allow garbage collection earlier. [ref](https://frontendmasters.com/blog/patterns-for-memory-efficient-dom-manipulation/#associate-data-to-dom-nodes-with-weakmap).

* Consider whether we need a `uib-loop` custom attribute to dynamically create repeating elements. This is the one thing that the other custom attributes can't really do. It would be a bit like Vue's `v-for` or Angular's `*ngFor`. It would take an array and create a new element for each item in the array. It would also need to be able to update the elements when the array changes. This is a bit more complex than the other attributes but it is a common use case.

* Move FE logger to separate library to make it easier to use with ui.js without using uibuilder.

* `uib-topic` attribute processing
  * [ ] Need std innerHTML process to account for MD and sanitize. Align with `<uib-var>`
  * [ ] Allow msg.value - including for checkboxes (to avoid el.checked confusion)
  * [ ] Add TABLE renderer
  * [ ] Add LIST renderer
  * [ ] MAYBE: Allow msg.classes
  * [ ] MAYBE: Allow msg.styles
  * [ ] MAYBE: Allow msg._ui

* Add `getPages()` function - sends control msg to Node-RED to fetch all of the current folders & html files. Will allow menu's to be created. Consider adding a `createMenu(entries)` function as well which would create a nav menu.

* Look at the uib-router menu handling js and copy to FE.

* [ ] Enhance JSON viewing using my own interpretation of the [json-view](https://github.com/pgrabovets/json-view) library.

* [ ] Add detail prop to eventSend to capture multi-clicks. [ref](https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event#usage_notes).

* [ ] Add debounce for click to correspond to detail prop reset time.

* Consider adding a template literal renderer. [Ref](https://github.com/WebReflection/hyperHTML/tree/master).

* Add pre-config variable option. Allowing `window.uibConfig` as an object containing configuration settings. Adjust the start fn to look for it. Allow comms settings (e.g. turn off websocket or polling), pre-setup of managed uib variables, options to turn off "heavy" options such as the observers. Early loading of UI (e.g. from a JSON resource). Maybe early loading of dependency libraries?

* Add client msg filter for URL Hash. To allow sending of data only to a specific router route.

* Consider special variable `managedTags`? where each entry update will automatically update the matching element ID and if the element doesn't yet exist, will watch for it and update as soon as it is added. E.g. setting value on `uib.managedTags.mytag` would update `<xxxx id="mytag"></xxxx>`. ?? Just the slot content? Or attributes as well (perhaps making the value an object).

* Add client `tag()` function that creates a new HTML element similar to the Node-RED side `uib-tag` node. (See https://redom.js.org for refs)

* A way to show and change uib-brand variables visually?

* Add Node-RED command to find out if a front-end library is installed.

* Add small button to showStatus output to allow user to turn off the display.

* Make sure that all watch/monitor fns emit custom events

* ==Add reactive data feature== (see [arrow.js](https://www.arrow-js.com/docs/#reactive-data))

* msgShow - add a message counter (optional?)

* Allow setting of [hooks for DOMPurify](https://github.com/cure53/DOMPurify/tree/main/demos#what-is-this).

* Forms (eventSend):

  * Allow for multi-select sending array of selected options.
  * Allow for multi-select pre-selecting array of options.
  * Allow for "selected" `true` on option entries.

* Get _uib/_ui notify features to use Notification API if available

* *New Functions*:

  * [ ] `moveElement` - see ui.js
  * [ ] `formatDate` - Use INTL std lib, usable as a `<uib-var>` filter function. [ref](https://discourse.nodered.org/t/format-date-at-yyyydd-hh-mm-ss/83130/12?u=totallyinformation)
  * [ ] `uibuilder.cacheSend()` and `uibuilder.cacheClear()` - send ctrl msgs back to node-red - reinstate in uib-cache fn now we've removed extra ctrl send.
  * [ ] Expand/collapse all details, expand previous/next (with/without collapsing others) buttons. [ref](https://codereview.stackexchange.com/questions/192138/buttons-that-expand-or-collapse-all-the-details-within-the-document)
  * [ ] **HARD - may be impossible?** `uibuilder.convertToUI(cssSelector)` - convert part/all of the DOM to `_ui` json structure. [ref](https://stackoverflow.com/questions/2303713/how-to-serialize-dom-node-to-json-even-if-there-are-circular-references)

* Control from Node-RED. Functions to implement:

  * [ ] watchDom(startStop), uiWatch(cssSelector) [add custom event outputs]
  * [ ] setPing
  * [ ] `loadui()`
  * [ ] `clearHtmlCache()`, `saveHtmlCache()`, `restoreHtmlFromCache()`
  * [ ] getStore, setStore, removeStore - control browser local storage
  * [ ] Expand/collapse all details, expand previous/next (with/without collapsing others)

  * Add `info` outputs to commands. Allow the fns that commands call to have auto-send & info.

* Add a `jsonImport` option to the _ui `load` method. The `jsonImport` property being an object where the keys are variable names to load to and the values are the URL's to load the JSON from.

* Add JSON treeview formatting to syntaxHighlight. [ref1](https://iamkate.com/code/tree-views/), [ref2](https://github.com/williamtroup/JsonTree.js).

* Option for a pop-over notification to manually reconnect the websocket.

* Extend logging functions:

  * Send log outputs back to Node-RED via control messages
  * Report socket.io setup/config issues back to Node-RED using `beaconLog(txtToSend, logLevel)`.
  * [ ] [**STARTED**]  Add showLog function similar to showMsg - showing log output to the UI instead of the console.
  * Add option to send log events back to node-red via the `navigator.sendBeacon()` method.

    * `uibuilder` node will output control msg of type `Client Log` when client sends a beacon.
    * Make optional via flag in Editor with start msg enabling/disabling in client.
    * ? window and document events - make optional via uibuilder fe command.

* Add a standard tab handler fn to handle tab changes. Are DOM selectors dynamic (do they update with new DOM elements)? If not, will need to include a DOM observer.

* Extend clearHtmlCache, restoreHtmlFromCache, saveHtmlCache fns to allow *sessionCache*.

* Add a [resizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) to report resize events back to Node-RED as a control msg.

* Look at [`window.prompt`](https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt), [`window.confirm`](https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm) and [`<dialog>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog) - should _ui implement these?

* Get better control over what control messages can be sent. Centralise the list of control messages in use.

* Consider adding a client library setting to auto-reload the page after loosing connection to the server. Would be useful for development.

* Add functions for manipulating SVG's.

* Allow for PWA use:

  * Check for OFFLINE use and suppress transport errors
  * Add check for online/offline - make available to user code
  * Auto-generate sw.js - need icon and to set names/urls/etc - manifest has to be manually generated (via button in Editor)
  * https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/web-app-manifests
  * Allow push API interface as well as websocket. https://developer.mozilla.org/en-US/docs/Web/API/Push_API
  * See following about Push Notifications: https://github.com/FlowFuse/node-red-dashboard/issues/589, https://github.com/FlowFuse/node-red-dashboard/pull/708, https://github.com/bartbutenaers/node-red-contrib-ui-web-push/blob/master/web_push_client.js, https://web.dev/articles/push-notifications-overview, https://vite-pwa-org.netlify.app/guide/

* Accessibility

  * Need to add a dismiss button to toasts
  * Check all auto-added elements for accessibility
  * Add count of current errors to title
