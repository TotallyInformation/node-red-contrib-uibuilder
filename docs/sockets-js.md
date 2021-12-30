---
title: Developer documentation for `sockets.js`
description: >
   A singleton class that manages the interactions with Socket.IO and so provides all of the communications between Node-RED and front-end code.
created: 2021-06-27 21:35:00
lastUpdated: 2021-12-30 17:33:26
---

## Socket.IO Server Options

The [Socket.IO server options](https://socket.io/docs/v4/server-options/) can be changed by adding a custom
property (`uibuilder.sioOptions`) to your Node-RED `settings.js` file.

You can override anything except the `path` property. However, use caution as careless settings may break
communications between Node-RED and your front-end code.

### Example

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
   uibRoot: process.env.UIBROOT || '/src/uibRoot', //path.join(os.homedir(), 'myuibroot')',
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