---
title: Websocket Handling Library
description: |
  A singleton class that manages the interactions with Socket.IO and so provides all of the realtime communications between Node-RED server and front-end browser client.
created: 2021-06-27 21:35:00
updated: 2026-01-02 15:16:13
---

`nodes/libs/socket.js`

## Socket.IO Rooms and Namespaces

A Socket.IO [Namespace](https://socket.io/docs/v4/namespaces/) is created for each `uibuilder` and `uib-markweb` instance.

Namespaces and channels (rooms) ensure that message channels are isolated.

Within each Namespace, 3 standard Socket.IO [Channels/Rooms](https://socket.io/docs/v4/rooms/) are created. These are:
* `client` - For messages sent from the server to the client.
* `server` - For messages sent from the client to the server.
* `ctrl` - For control messages sent between client and server.

Additional rooms can also be created as required. However, as of v7.6, these are still poorly tested. Additional rooms might be used to create client-to-client messaging for example.

### Control messages

These are mostly from the client to the server to indicate status changes such as page load, visibility changes, network reconnects etc. They also can trigger cache replay's for the `uib-cache` node.

An initial control message is also send from the server to a connecting client when the socket.io connection is established. This message contains important metadata about the instance such as version numbers, instance URL, server timestamp, etc.

Most client-to-server control messages are forwarded to output port #2 of the `uibuilder`/`uib-markweb` nodes for processing by Node-RED flows. Input messages containing the `msg.uibuilderCtrl` property are ignored to prevent control loops.

There are also some client-to-server control messages that request server-side actions, these are never forwarded to output port #2. These include:

* `msg.uibuilderCtrl = "get page meta"` - Requests the server to return the metadata for a specified page in the instance's source folder. The server responds with a control message containing the metadata. (This does not work for `uib-markweb` instances currently.)

* `msg.uibuilderCtrl = "internal"` - Can be used by a node to trigger node-specific actions. The node must define its own internal control message handlers in the `node.internalControls` object. The message must include a `controlType` property to specify which internal control action to invoke.

Control messages from the client are always enhanced with extra metadata upon receipt by the server, via the `this.getClientDetails` method. The extra data is added to `msg._uib`. This includes:
```js
{
   _socketId: socket.id,
   /** What was the originating uibuilder URL */
   url: node.url,
   /** Is this client reconnected after temp loss? */
   recovered: socket.recovered,
   /** Do our best to get the actual IP addr of client despite any Proxies */
   ip: realClientIP,
   /** The referring webpage, should be the full URL of the uibuilder page */
   referer: headers.referer,
   // Let the flow know what v of uib client is in use
   version: handshake.auth.clientVersion,
   /** What is the stable client id (set by uibuilder, retained till browser restart) */
   clientId: handshake.auth.clientId,
   /** What is the client tab identifier (set by uibuilder modern client) */
   tabId: handshake.auth.tabId,
   /** What was the originating page name (for SPA's) */
   pageName: pageName,
   /** The browser's URL parameters */
   urlParams: handshake.auth.urlParams,
   /** How many times has this client reconnected (e.g. after sleep) */
   connections: handshake.auth.connectedNum,
   /** True if https/wss */
   tls: handshake.secure,
   /** When the client connected to the server */
   connectedTimestamp: (new Date(handshake.issued)).toISOString(),
   // HTTP Header info
   connectHeaders: headers,
}
```
The `handshake` data comes from Socket.IO and contains information provided by the client when it connects.

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
