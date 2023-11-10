---
title: uib-save - Save files to a uibuilder instance folder
description: >
   Usage and configuration.
created: 2023-02-05 16:31:39
lastUpdated: 2023-11-10 13:48:13
---

Available since uibuilder v6.6.

Makes it easy to output files to the folder structure of a uibuilder node.

This can be used for all manner of things.

* Use with the `uib-html` node to make a permenant copy of some zero-/low-code output.
* Use with the `htmlSend()` front-end function (`htmlSend` `_uib` cmd from Node-RED) to get a copy of the current state of the UI and save it back to the page file for future use.
* Use with HTML like `<input type="file" onchange="upload(this.files)" multiple />` to get one or more files from the user (e.g. images or anything else to save) and save the file.

Obviously, this means that all input must be carefully checked for safety.

An instance of a UIBUILDER node must be selected before the node can be used. This lets the node know where to save the files. It will save to the sub-folder currently being served. Change the advanced "Serve" setting in the uibuilder node

This node has a flow tab of examples. See Node-RED's import library.
