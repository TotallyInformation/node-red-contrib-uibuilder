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
