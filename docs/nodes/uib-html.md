---
title: uib-html - Hydrate uibuilder msg._ui configuration data to HTML
description: >
   Usage and configuration.
created: 2023-02-05 16:31:39
lastUpdated: 2023-10-28 15:33:18
---

Available since uibuilder v6.6.0.

Simply send the node a msg containing a `msg._ui` in accordance with the specifications listed here: [Dynamic, configuration-driven UI's (low-code)](client-docs/config-driven-ui).

It will output a new msg containing the HTML in `msg.payload`. `msg._ui` is removed and all other msg properties are passed through.

## Optional template wrapper

Generally though, the no-code and low-code `_ui` configurations relate to a specific area of the `body` of your HTML page. So the resulting HTML output from this node will be the same. In such cases, you will often want to wrap the output in a template - perhaps one that is a complete web page. By selecting the "Merge HTML Template?" flag, the node will wrap the generated HTML in a template.

The template can be provided as an HTML string in the `msg.template` property. 

If that property does not exist on the incoming message, the node will use the current UIBUILDER "Blank" template which will give you a fully working UIBUILDER managed web page. In such a case, you can use the `uib-save` node to replace the existing `index.html` page or save as a new page as desired.

If passing a template, you can use the core Node-RED `template` node to create the text and even include some data from Node-RED as needed. Of course, you could also read the text from an external file or even get it from a remote server.

## Different uses for the output

Use with the `uib-save` node is mentioned above. Of course, you can save manually using the core `file-out` node instead.

However, you can use the output in other ways as well:

* As the HTML returned to an `http-out` core node.
* As the input to a Dashboard `ui-template` node for use with Dashboard.
