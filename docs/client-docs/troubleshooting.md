---
title: Technical details for the modern, modular front-end client `uibuilder.esm.js` and `uibuilder.iife.js`
description: |
  In general, uibuilder is very robust and will rarely give any problems. However, here are a few issues that have been seen in the past.
created: 2022-06-11 14:15:26
updated: 2025-06-04 17:05:42
---

## Vendor files are not loading

If you are getting 404 errors on your vendor files (such as vue or some other front-end library), it is possible that your source file is in a sub-folder. For example, in many cases you will only have source files in `<uibRoot>/<url>/src`. However, if you try to use files in a sub-folder such as `<uibRoot>/<url>/src/myfolder/index.html`, you will need to adjust the URL references. 

As standard, it is recommended to access files using a relative URL as in `<script type="module" async src="../uibuilder/vendor/@totallyinformation/web-components/components/syntax-highlight.js"></script>` but this is incorrect for a file served from a sub-folder. In the previous example, you would need `<script type="module" async src="../../uibuilder/vendor/@totallyinformation/web-components/components/syntax-highlight.js"></script>` - note the extra level of `../`. This would need to be added to all relative URL's. 

Alternatively, you can, of course, use absolute URLs such as `<script type="module" async src="http://localhost:1880/uibuilder/vendor/@totallyinformation/web-components/components/syntax-highlight.js"></script>`, however *this isn't recommended* since it can make your code rather fragile. If you make any changes to your Node-RED environment, you might have to make changes to all of your URL's as well.

## Socket.IO poor performance

First thing to check is whether Socket.IO was able to upgrade its connection from `polling` to `websocket`. If it is still using `polling` after a few ms, then you will see a performance hit both at the client and potentially at the Node-RED server.

If you see the console error "Connected to Node-RED but NO SOCKET UPGRADE! ➡️ CHECK NETWORK and any PROXIES for issues. ⬅️", then you will need to check your network and any proxy servers that may be in the way. 

The most common cause of this is a proxy server that has not been correctly configured to proxy the websocket protocol.

The less common cause is that your network performing poorly (or with very high latency) such that the websocket connection cannot be maintained. In this case, you will want to check the Networks tab in your browser's developer tools. You may see the connection "upgrading" to websockets and then dropping back to `polling`.

The problem may be made worse if you are sending very large messages. In that case, it is possible to tune Socket.IO's settings to allow longer ping times.

## Socket.IO refuses to connect

This version of the uibuilder client library is much more robust than previous versions at working out the socket.io namespace, etc. However, it does rely on your browser allowing first-party cookies. If you are having issues with socket.io, first thing to check is the cookies for your page. Make sure they are correct.

This version of the library uses a simplified `options` object passed to `uibuilder.start()` should you need to pass the socket.io settings.

If Node-RED and uibuilder are on a different server to what is serving up your html and/or js code (e.g. if using a framework dev server), you need to pass the remote server as the ioNamespace parameter to the start function: `uibuilder.start({ioNamespace: 'https://remote.server/uib-instance-url'})`.

## Socket.IO repeatedly disconnects

This is usually due to you trying to pass too large a message. Socket.IO, by default, only allows messages up to 1Mb. If this is insufficient, you can change the default in Node-RED's `settings.js` file using the `uibuilder` property:

```javascript
    // ...
    uibuilder: {
        /** Optional: Socket.IO Server options
         * See https://socket.io/docs/v4/server-options/
         * Note that the `path` property will be ignored, it is set by uibuilder itself.
         * You can set anything else though you might break uibuilder unless you know what you are doing.
         * @type {Object}
         */
        socketOptions: {
            // Make the default buffer larger (default=1MB)
            maxHttpBufferSize: 1e8 // 100 MB
        },
    },
    // ...
```

Other similar issues may occur when using a slow network or one with excessive latency. In that case, you may need to adjust the Socket.IO server's timeout value.

## Event/onChange/onTopic callbacks don't fire

Because a lot of things happen asynchronously in JavaScript, it is possible that occasionally an event handler isn't fully registed by the time that an event fires (for example on an incoming msg or a `uibuilder.set`). In these cases, you may need to put your change code into `window.onload = (evt) => { ... }`. That ensures that everything is fully loaded before your code will run.

An alternative way to work would be to load the uibuilder library using a dynamic import as in `import('./uibuilder.esm.js').then( ... )` and do all of your custom processing from within the `then` callback. If your browser supports top-level async/await, you could also do `const uibuilder = await import('./uibuilder.esm.js')` which will pause until uibuilder is completely loaded and ready (top-level await wasn't ratified until 2022 however so not much browser support yet).

## The `uibuilder` JavaScript object does not seem to be loaded

Firstly check in your browser's dev tools, network tab, whether the library is actually loaded. See [Where is it?](../uibuilder.module.md#where-is-it) for more information.

If it is loaded, you may have forgotten that, when using ESM Modules, each module script is _isolated_. That means that you need to `include` the uibuilder client in the module script you want to work in.

Alternatively, you may no longer need to work directly with uibuilder client object at all! That is because the client now issues custom messages on the DOM `document` object for all important actions. So if you don't need to send anything back to Node-RED, you can just use those. They will work in other modules and scripts. as in:

```javascript
document.addEventListener('uibuilder:stdMsgReceived', evt => {
    // evt.detail contains the msg received
    console.log('>> (document) EVENT uibuilder:stdMsgReceived >>', evt.detail)
})
```

See [Custom Events](technical-reference.md#custom-events) for details.

## Browser logging

You can turn up the client library's log level using `uibuilder.logLevel = 5` on the browser developer tools console or in your `index.js` or other front-end script. You can also send a command from Node-RED to change the log level. Search for "logLevel" in the docs for more detail.

Levels run from the default 0 (error) up to 5 (trace).

> [!TIP]
> If you want to see what is happening in the uibuilder library's startup processing, you can add a `logLevel` attribute to the script tag. E.g.:
> ```
> <script defer src="../uibuilder/uibuilder.iife.min.js" logLevel="2"></script>
> ```
> This is mostly only useful for debugging the library itself. Note that you can only use numeric settings here.
