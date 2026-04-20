---
created: 2023-12-30 20:20:58
updated: 2025-06-13 11:22:47
title: Rejected ideas
description: These are kept for reference so I don't repeat them.
author: Julian Knight (Totally Information)
---

* NEW NODE - `uib-get` - Gets data from a page's DOM. Will use the `uiGet` function. **No longer needed, use `msg._uib` commands in std msg.**
* Web worker - for sharing Socket.IO connections between pages
  * Would require a shared-worker which is only supported on Safari since 2022 & still not supported on Android.
  * Standard worker creates a new instance on load to each page so would not share the connection.
  * Might be a use in the future for offloading some work to a separate thread.
  * https://sharedworker.okikio.dev - a pony-/polly-fill library
  * https://groups.google.com/a/chromium.org/g/blink-dev/c/H73tticuudc?pli=1

## Dynamic attributes

Do we actually NEED additional `uib-*` dynamic attributes? With `uib-topic`, we can already control any content/attributes/properties simply by sending a msg. We can also use `uibuilder.set('msg', ....)` from front-end code so really we don't need anything else? `uib-show` could simply be adding/removing a class. Inputs might be dealt with by simply using the `set` method. Not true 2-way binding but is that really needed?

Even `uib-on` isn't really needed since we can just use the HTML `onchange`, `onclick`, etc. attributes.

NB: `uib-var` can already bind to a variable other than `msg`.
