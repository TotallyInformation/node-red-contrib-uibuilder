---
title: Node-RED as a live web development server
description: |
  We don't need complex build tools to deliver a live web development server with Node-RED and uibuilder. We can simply use existing Node-RED and uibuilder features.
created: 2025-08-06 11:28:14
updated: 2025-08-06 11:54:46
author: Julian Knight (Totally Information)
---

If you want to do some rapid development of your front-end UI, you probably want something that will reload your page whenever you make a change. This is commonly referred to as a *"development server"* and appears in many complex build tools.

But with Node-RED and uibuilder you can do the same thing for yourself. That's because *the uibuilder front-end library recognises a particular message type from Node-RED and will reload the page for you*.

All you need is a core <b>watch node</b> to watch for changes in the file(s) or folders you want, then a **change node** to create the correct message properties which are <code>_uib.reload</code> set to <code>true</code>. All linked and connected to the input of your uibuilder node.

<div style="display:flex;align-items:flex-start;gap:2rem;">
  <div style="flex:1;">
    <img src="./how-to/dev-server-watch-flow.png" alt="example flow" style="" />
  </div>
  <img src="./how-to/change-node-set_uib.png" alt="Change node to set uib.reload to true" style="max-width:40%;margin-left:auto;" />
</div>

