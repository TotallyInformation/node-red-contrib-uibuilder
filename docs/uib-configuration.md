---
title: Configuring uibuilder
description: >
   Describes how to change uibuilder's configuration, options and settings.
created: 2021-12-30 17:38:33
lastUpdated: 2022-01-02 20:11:26
---

uibuilder is configured in a number of places.

Obviously, each node instance you add to your flows has its own configuration which is set in the Node-RED Editor by double-
clicking on the node.

However, there are some additional places you may need to make changes to.

- [`settings.js`](#settingsjs)
- [`<uibRoot>/.config/`](#uibrootconfig)
  - [`<uibRoot>/.config/uibMiddleware.js`](#uibrootconfiguibmiddlewarejs)
  - [`<uibRoot>/.config/sioMiddleware.js`](#uibrootconfigsiomiddlewarejs)
  - [`<uibRoot>/.config/sioUse.js`](#uibrootconfigsiousejs)
  - [`<uibRoot>/.config/security.js`](#uibrootconfigsecurityjs)
- [`<uibRoot>/<instance-url>/`](#uibrootinstance-url)

* **`settings.js`** - may optionally have a property called `uibuilder` with a number of settings that are global to
  all uibuilder nodes.

* **`<uibRoot>/.config/`** - contains a number of files that are global to all instances of uibuilder nodes.

* **`uibRoot>/<instance-url>/`** - contains the settings, build modules and front-end code for the specific instance
  of uibuilder nodes.

## `settings.js`

This file contains the global settings for Node-RED. You can add a new property to it called `uibuilder` as in the following
example that describes all of the current options.

```js
   /** Custom settings for all uibuilder node instances */
   uibuilder: {
      /** Optional HTTP PORT. 
       * If set and different to Node-RED's uiPort, uibuilder will create
       * a separate webserver for its own use.
       */
      port: process.env.UIBPORT || 3001,
      /** Optional: Change location of uibRoot
       * If set, instead of something like `~/.node-red/uibuilder`, the uibRoot folder can be anywhere you like.
       */
      uibRoot: process.env.UIBROOT || path.join(os.homedir(), 'myuibroot')',
      /** Optional: Socket.IO Server Options. See https://socket.io/docs/v4/server-options/
       * Note that the `path` property will be ignored, it is set by uibuilder itself.
       * You can set anything else though you might break uibuilder unless you know what you are doing.
       * @type {Object}
      */
      sioOptions: {
         // Make the default buffer larger (default=1MB)
         maxHttpBufferSize: 1e8 // 100 MB
      },
   },
```

## `<uibRoot>/.config/`

Master uibuilder configuration files. Created and pre-populated with template examples upon installation.

### `<uibRoot>/.config/uibMiddleware.js`

ExpressJS middleware, called for all uibuilder node instances whenever a client connection is made (for user-facing API calls as well as UI's).

This should be kept as short and efficient as possible since it will be called many times for all client connections.

It may be used to provide custom authentication and authorisation processing if desired or to add/change custom headers, etc.

### `<uibRoot>/.config/sioMiddleware.js`

Per-client-connection server Socket.IO middleware. See [Developer documentation for `socket.js`](socket-js.md) for more details.

### `<uibRoot>/.config/sioUse.js`

Per-message server Socket.IO middleware. See [Developer documentation for `socket.js`](socket-js.md) for more details.

### `<uibRoot>/.config/security.js`

>! **WARNING** uibuilder's built-in security features are not yet ready for use.

Standard security functions needed for the built-in security features of uibuilder.

## `<uibRoot>/<instance-url>/`

TBC

