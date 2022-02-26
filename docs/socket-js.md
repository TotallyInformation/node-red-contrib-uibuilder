---
title: Developer documentation for `socket.js`
description: >
   A singleton class that manages the interactions with Socket.IO and so provides all of the communications between Node-RED and front-end code.
created: 2021-06-27 21:35:00
lastUpdated: 2022-01-02 20:11:42
---

- [Socket.IO Server Options](#socketio-server-options)
  - [Example](#example)
- [Socket.IO Middleware](#socketio-middleware)
  - [Namespace Middleware - `sioMiddleware.js`](#namespace-middleware---siomiddlewarejs)
  - [Client message Middleware - `sioUse.js`](#client-message-middleware---siousejs)
- [Socket.IO Options](#socketio-options)
- [Default CORS Options](#default-cors-options)

## Socket.IO Server Options

The [Socket.IO server options](https://socket.io/docs/v4/server-options/) can be changed by adding a custom
property (`uibuilder.socketOptions`) to your Node-RED `settings.js` file.

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
   socketOptions: {
      // Make the default buffer larger (default=1MB)
      maxHttpBufferSize: 1e8 // 100 MB
   },
},

```

## Socket.IO Middleware

Two Socket.IO middleware functions are available for configuration in uibuilder.

Both use named files in the `<uibRoot>/.config/` folder. Templates for both are copied when uibuilder is installed. The template files
have their exports commented out though so that nothing runs unless you make changes to them. Both files have some simplistic
example code.

### Namespace Middleware - `sioMiddleware.js`

This middleware runs on the server every time a client connects to the Socket.IO server using HTTP. Typically, this is just once when
the client initially connects. After that, the client is usually "upgraded" to a websockets connection and this middleware is no longer called.
However, it is possible that the client may connect over HTTP multiple times before the connection is upgraded.

This middleware DOES have access to the Socket.IO server object. For convenience, the Node-RED `log` functions have been attached
to each Namespace object and are therefore accessible from within the code as `socket.nsp.log.info()`, etc.

The function in this middleware MUST `return next()` or `return next(new Error('Some Error ...'))` otherwise no client will be able to connect.

If you raise an error in this, the client will not be able to procede and the connection attempt will fail. No communications will be possible.
For this reason, you can use this middleware to assist with authentication and/or authorisation. **As long as you remember that it is only called
on the first connection** which means that you cannot use it to monitor for session timeouts.

This middleware has access to the `socket` object. The client adds the client ID (set by uibuilder on initial HTTP connection from client) to `socket.handshake.auth.clientId`

### Client message Middleware - `sioUse.js`

This middleware runs on the server every time a message from a client is sent.

This middleware does NOT have access to any of the Socket.IO, uibuilder or Node-RED properties.

The function in this middleware MUST `return next()` or `return next(new Error('Some Error ...'))` otherwise no client will be able to connect.

If you raise an error in this, it is shown in the Node-RED log _and_ an attempt is made to send an error message back to the client.

Example:

```json
{
    "uibuilderCtrl": "socket error",
    "error": "Oops! Some kind of error happened",
    "_socketId": "I02mCJZ1oKGGYiK8AAAu",
    "from": "server"
}
```

This can be watched for by using something like the following in your front-end JavaScript code:

```js
uibuilder.onChange('ctrlMsg', function(msg){
   if ( msg.uibuilderCtrl === 'socket error' ) {
      // ... do something ...
   }
})
```

Of course, some errors may result in the client being unable to connect and therefore they will not get the message. However, the Node-RED log will still show an error.

## Socket.IO Options

You can override the default Socket.IO server options by using the `uibuilder.socketOptions` property in settings.js. All Socket.IO server options can be
overridden. This can be useful for changing the default buffer size (which limits message sizes) and for changing the default CORS options.

## Default CORS Options

These are set by default to allow requests from any source. This is not terribly secure. It is strongly recommended to change this if allowing
communications over the Internet or other un-/semi-trusted network.