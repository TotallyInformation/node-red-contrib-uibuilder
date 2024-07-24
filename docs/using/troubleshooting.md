---
title: Troubleshooting
description: |
  UIBUILDER should generally be very stable and reliable since it sticks as closely as possible to standards.
  However, if something isn't working as expected, please start here to look for issues.
created: 2024-06-20 15:17:49
updated: 2024-07-21 15:52:17
---

## Software versions

UIBUILDER v7 requires Node.js v18+, Node-RED v 3+ on the server. Linux, Windows and MacOS OS's should all work fine.

> [!NOTE]
> UIBUILDER currently requires access to a filing system on the server. Some cloud environments do not provide full filing system access and it may not be easy (or even possible sometimes) to use those environments. However, nearly all cloud environments, as well as virtual, shared and dedicated server environments do provide suitable filing systems.

For the browser, an ES6 (ECMA2015) capable version (Not IE. All modern browsers) is required. Some features do rely on ECMA2019 however (All modern browsers since early 2019. For Apple mobiles, iOS 12+).

Without these, you are likely to hit issues with compatibility or outright error. Please contact the author or raise a GitHub issue if you need something outside of these specifications though. It is possible that something could be put together.

[This w3schools JavaScript versions page](https://www.w3schools.com/js/js_versions.asp) shows which browsers support which versions of JavaScript.

For the VueJS templates and examples, VueJS v2 (not v3) needs to be installed along with the `bootstrap-vue` package. You can install v2 by simply giving the name `vue@2` to the library manager.

## A white page

This usually indicates that an error has crashed whatever front-end framework you are using. In the browser, open the Developer Tools and look at the Console tab for errors.

## An ugly page

Assuming you didn't design your page that way 😁, this generally means that you have made an error in one of the URL's in your `index.html` page and so a resource file hasn't loaded. Check the Developer Tools Console and Network tabs for "404" errors (page not found).

Check uibuilder's "uibuilder details" page (button on any `uibuilder` node in the Editor) to see the exact URL's you should be specifying.

## Socket.IO errors

If your browser is reporting an error in Socket.IO, the most likely reason is that you are serving your front-end code from a different web server and not from Node-RED. In that case, see [the documentation](client-docs/troubleshooting?id=socketio-refuses-to-connect) for details about the correct function and parameters you need in your front-end javascript to get round this issue. This may occur if you are developing with a front-end framework that includes its own development server.

Otherwise, the next most likely reason is that you are using a web proxy such as NGINX, Caddy, Apache, etc and have forgotten to proxy the websocket connections. There is an [example for NGINX in the documentation](uib-security-nginx?id=websockets).

After that, the most likely explanation is that you have a network issue between your client and the Node-RED server. That is beyond the remit of this documentation though I'm afraid.

## Logs

When troubleshooting, please check both the Node-RED server log and the browser's developer console log for errors.

The Node-RED server log will show any runtime issues with nodes.

In the browser, you may need to turn up the uibuilder client library logging. By default, it only outputs errors and warnings. To increase logging output, in the browser developer console, type `uibuilder.logLevel = 5` to get all output. `0` is only error output, `5` is everything.

If you are having issues with uibuilder nodes in the Node-RED editor, please open the dev console in the browser for that page as well. If you are running the browser on the same device as the Node-RED server (in a development envionment for example), the uibuilder nodes will output additional information.

> [!TIP]
> If you want to see what is happening in the uibuilder client library's startup processing, you can add a `logLevel` attribute to the script tag. E.g.:
> ```
> <script defer src="../uibuilder/uibuilder.iife.min.js" logLevel="5"></script>
> ```
> This will give a lot more information on your browser's developer tools console. This is mostly only useful for debugging the library itself. Note that you can only use numeric settings here.
