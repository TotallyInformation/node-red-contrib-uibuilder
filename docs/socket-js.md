---
title: Developer documentation for `socket.js`
description: >
   A singleton class that manages the interactions with Socket.IO and so provides all of the communications between Node-RED and front-end code.
created: 2021-06-27 21:35:00
lastUpdated: 2022-04-02 17:14:51
---

- [Socket.IO Server Options](#socketio-server-options)
  - [Example](#example)
- [Socket.IO Middleware](#socketio-middleware)
  - [Namespace (client connection) Middleware - `sioMiddleware.js`](#namespace-client-connection-middleware---siomiddlewarejs)
  - [Client message Middleware - `sioUse.js`](#client-message-middleware---siousejs)
  - [Server message Middleware - `sioMsgOut.js`](#server-message-middleware---siomsgoutjs)
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

Three Socket.IO middleware functions are available for configuration in uibuilder.

They all use named files in the `<uibRoot>/.config/` folder. Templates for them are copied each time Node-RED (re)starts. The template files
are named with an `.js-template` extension to prevent them overwriting your live code. The template files contain some simplistic example code.

### Namespace (client connection) Middleware - `sioMiddleware.js`

This middleware runs on the server every time a client connects to the Socket.IO server using HTTP. Typically, this is just once when
the client initially connects. After that, the client is usually "upgraded" to a websockets connection and this middleware is no longer called.
However, it is possible that the client may connect over HTTP multiple times before the connection is upgraded. It offers a single function for all instances of uibuilder.

This middleware DOES have access to the Socket.IO server object. For convenience, the Node-RED `log` functions have been attached
to each Namespace object and are therefore accessible from within the code as `socket.nsp.log.info()`, etc.

The function in this middleware MUST `return next()` or `return next(new Error('Some Error ...'))` otherwise no client will be able to connect.

If you raise an error in this, the client will not be able to procede and the connection attempt will fail. No communications will be possible.
For this reason, you can use this middleware to assist with authentication and/or authorisation. **As long as you remember that it is only called
on the first connection** which means that you cannot use it to monitor for session timeouts.

This middleware has access to the `socket` object. The client adds the client ID (set by uibuilder on initial HTTP connection from client) to `socket.handshake.auth.clientId`

### Client message Middleware - `sioUse.js`

This middleware runs on the server every time a message from a client is sent to the server. It offers a single function for all instances of uibuilder.

A template for this file is updated in your live `<uibRoot>/.config` folder each time Node-RED (re)starts. This ensures that you always have the latest version to hand. You should recheck the template each time you update uibuilder.

This middleware does NOT have access to any of the Socket.IO, uibuilder or Node-RED properties. However, it can make changes to the inbound msg before it is processed by uibuilder.

The function in this middleware MUST `return next()` or `return next(new Error('Some Error ...'))` otherwise no client will be able to connect.

If you raise an error in this, it is shown in the Node-RED log _and_ an attempt is made to send an error message back to the client.

Example:

```javascript
/**
 * Template Socket.IO `use` middleware for uibuilder. Fn will be called for EVERY inbound msg from a client to Node-RED/uibuilder.
 * UPDATED: 2022-04-01
 *
 * NOTES & WARNINGS:
 *   1) This function is called when a client sends a "packet" of data to the server.
 *   2) Failing to either return or call `next()` will mean that your clients will never be able to get responses.
 *   3) You can amend the incoming msg in this middleware.
 *   4) An error in this function will probably cause Node-RED to fail to start at all.
 *   5) You have to restart Node-RED if you change this file.
 *   6) If you call `next( new Error('blah') )` The error is sent back to the client and further proessing of the incoming msg stops.
 *   7) To use for authentication/authorisation with Express and sio connection middleware, create a common node.js module.
 *
 * Allows you to process incoming data from clients.
 * 
 * see: https://socket.io/docs/v4/server-api/#socketusefn
 * see also: uibRoot/.config/sioMiddleware.js & sioMsgOut.js
 *           and https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#websocket-implementation-hints
 * 
 * @param {[string,Array<Object>]} data The channel name (strictly the event name) and args send by a client (Socket.IO calls it a "packet"). data[0] is the channel/event name, data[args][0] is the actual msg
 * @param {function} next The callback to hand off to the next middleware
 */
function sioUseMw([ channel, ...args ], next) {

    const msg = args[0]

    console.log('[uibuilder:Socket.IO:sioUse.js] msg from client: ', 'Channel Name:', channel, ' Msg:', msg)

    // Simplistic error example - looking for specific property on the inbound msg
    if ( msg.i_am_an_error ) {
        // The error is sent back to the client and further processing of the msg stops
        next(new Error('Oops! Some kind of error happened'))
        return
    }

    // You can amend the incoming msg
    msg._test = 'added by sioUse.js middleware'
    
    next()

} // Do not forget to end with a call to `next()` or clients will not be able to connect

module.exports = sioUseMw
```

This results in a msg like the following being sent back to the client:

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

The msg does not get sent into Node-RED other than to the Node-RED log.

Of course, some errors may result in the client being unable to connect and therefore they will not get the message. However, the Node-RED log will still show an error.

### Server message Middleware - `sioMsgOut.js`

This middleware runs on the server every time a message from the server is being sent to a client. It offers a single function for all instances of uibuilder.

A template for this file is updated in your live `<uibRoot>/.config` folder each time Node-RED (re)starts. This ensures that you always have the latest version to hand. You should recheck the template each time you update uibuilder.

This middleware does NOT have access to any of the Socket.IO, uibuilder or Node-RED properties.

If you raise an error in this, it is shown in the Node-RED log only. The function may make changes to the msg before it is sent.

Example:

```javascript
/**
 * Template Socket.IO outbound per-msg middleware for uibuilder. Fn will be called for EVERY outbound msg from Node-RED/uibuilder to a client.
 * UPDATED: 2022-04-01
 *
 * NOTES & WARNINGS:
 *   1) This function is called whenever any instance of uibuilder sends a msg to any client.
 *   2) You have to restart Node-RED if you change this file.
 *   3) You can use this to make changes to the msg before it is sent.
 *
 * Allows you to process outgoing data to clients. Use it to add security/user data or anything else.
 * 
 * @param {object} msg The msg being seny by uibuilder to a client
 * @param {string} url The uibuilder instance url
 * @param {string} channel The socket.io channel being used
 */
 function sioMsgOutMw( msg, url, channel ) {

    console.log('[uibuilder:Socket.IO:sioMsgOut.js] msg from server: ', msg, url, channel)

}

module.exports = sioMsgOutMw
```


## Socket.IO Options

You can override the default Socket.IO server options by using the `uibuilder.socketOptions` property in settings.js. All Socket.IO server options can be
overridden. This can be useful for changing the default buffer size (which limits message sizes) and for changing the default CORS options.

## Default CORS Options

These are set by default to allow requests from any source. This is not terribly secure. It is strongly recommended to change this if allowing
communications over the Internet or other un-/semi-trusted network.