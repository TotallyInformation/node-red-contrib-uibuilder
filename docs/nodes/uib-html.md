---
title: uib-html - Hydrate uibuilder msg._ui configuration data to HTML
description: >
   Usage and configuration.
created: 2023-02-05 16:31:39
lastUpdated: 2023-08-28 18:22:08
---

Available from uibuilder v6.6.0.

Initial release has no real configuration.

Simply send the node a msg containing a `msg._ui` in accordance with the specifications listed here: [Dynamic, configuration-driven UI's (low-code)](Dynamic, configuration-driven UI's (low-code)).

It will output a new msg containing the HTML in `msg.payload`. `msg._ui` is removed and all other msg properties are passed through.


