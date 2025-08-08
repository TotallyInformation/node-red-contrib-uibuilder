---
title: Differences in front-end code to frameworks
description: >
  UIBUILDER may seem initially to be limited compared to front-end frameworks such as VueJS and REACT. However, when taking into
  account use with Node-RED, we can see that all we need is a slightly different mindset and approach.
created: 2025-07-31 14:42:45
updated: 2025-08-08 15:31:44
author: Julian Knight (Totally Information)
status: draft
---

> [!NOTE]
>
> Front-end frameworks and UIBUILDER both require the browser to have JavaScript turned on. However, with UIBUILDER, it is often not necessary to have any custom JavaScript that you write yourself. With a framework, you will nearly always have to write custom JavaScript (though not when using a Node-RED Dashboard since, in that case, most of the JavaScript is hidden).

| UI Feature              | Framework approach [(1)](#notes01)                           | UIBUILDER approach                                           | What the feature does                                        |
| ----------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Dynamic HTML Attributes | Custom attribute with JavaScript, `<div :title=` `"someVarOrFn">`. Variables and functions are local to the framework app. [(3)](#notes03) | Standard HTML attributes updated by a `msg` (JavaScript is optional), `<div uib-topic="some/topic/name"` `title="default title">` [(2)](#notes02) | Allows HTML attributes to be dynamically changed from code.  |
| Dynamic Event Handlers  | Custom attribute with JavaScript. `<input @click="someFn">`. Functions are local to the framework app. [(3)](#n) | Standard HMTL attributes with JavaScript. `<input onclick="uibuilder` `.eventSend(event)">`. Functions must generally be attached to the `window` (`globalThis`) object. |                                                              |
| Dynamic content         | Largely depends on custom framework components. These mostly have to be pre-defined before or during page-load. Custom components do not fully follow HTML standards but define their own and must be learned per-framework.<br />Node-RED gets round this with the Dashboards by using complex nodes that send both code and data to the front-end which can be quite inefficient. | Easily accommodated using the Ui class library which is accessible both from front-end JavaScript and from Node-RED via the no-/low-code nodes or custom low-code data configuration. The low-code configuration used is both compact and follows vanilla HTML standards.<br />Dynamic content can even be built on the server using the `uib-html` node. | Allows the web page to change based on data. New elements might be added or removed. For example, only delivering some information after a user has logged in. |
| 2-way data binding      | Using `v-model` or other custom attribute. Data must be pre-defined within the framework instance app. | No direct equivalent needed. Can use a vanilla HMTL event handler to update a message with a specific topic. [(A)](#a-data-binding) | Allows variables to be altered by one element and the UI automatically updates. |
|                         |                                                              |                                                              |                                                              |

Notes:

1. <a id="notes01"></a>Examples given relate to VueJS but other frameworks have similar features.
2. <a id="notes02"></a>`uib-topic` messages can either come from Node-RED _or_ can be set in the browser using JavaScript `uibuilder.set('msg', {...})`.
3. <a id="notes03"></a>Framework functions and variables have to be defined local to the controlling framework instance (app). This always requires JavaScript.

## Examples

### (A) Data binding

#### Uibuilder

```html
<input id="name" onchange="nameChangeHandler(event)">
<div uib-topic="mytopic">Default Name</div>
```

```javascript
window.nameChangeHandler = (event) {
    uibuilder.set('msg', {
        topic: "mytopic",
        payload: event.target.value
    })
}
```

