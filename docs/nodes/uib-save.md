---
title: uib-save - Save files to a uibuilder instance folder
description: >
   Usage and configuration.
created: 2023-02-05 16:31:39
lastUpdated: 2023-09-16 19:05:29
---

Due to land in uibuilder v6.6.

TBC.

Makes it easy to output files to the folder structure of a uibuilder node.

This can be used for all manner of things.

* Use with the `uib-html` node to make a permenant copy of some zero-/low-code output.
* Use with the `htmlSend()` front-end function (`htmlSend` `_uib` cmd from Node-RED) to get a copy of the current state of the UI and save it back to the page file for future use.
* Use with HTML like `<input type="file" onchange="upload(this.files)" multiple />` to get one or more files from the user (e.g. images or anything else to save) and save the file.

Obviously, this means that all input must be carefully checked for safety.
