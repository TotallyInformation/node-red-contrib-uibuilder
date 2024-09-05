---
title: Standardised msg._client properties for authenticated clients
description: |
  msg._client is a standardised message property added to both UIBUILDER and FlowFuse's Dashboard 2.0 outputs when an authenticated client is detected. Authentication happens using an external tool such as FlowFuse authentication, Cloudflare access, Authelia, Authentik, Keycloak, etc.
created: 2024-08-04 12:49:35
updated: 2024-09-05 17:30:06
---

> [!NOTE]
> For the `msg._client` property to appear in output messages, BOTH the `authProvider` AND the `userID` have to be detectable.

> [!TIP]
> The use of `msg._client` for security **only impacts messages** between Node-RED and connected clients.
> It does **not** impact the ability to load a uibuilder web page.
>
> In general, try to make web pages loadable by anyone but do not output any sensitive data.
>
> Alternatively, you can also block and redirect access to the web page(s) as well. Either via a standard proxy or by using [uibuilder's ExpressJS middleware feature](/uib-configuration#ltuibrootgtconfiguibmiddlewarejs).

## msg._client properties

The content of `msg._client` will vary slightly depending on the external tool doing the authentication but it has a number of key properties and some optional ones:

```json
{
    // --- REQUIRED ---
    // One of `Cloudflare Access`, `FlowFuse`, `Keycloak`, `Authentik`, 
    // `Custom`, or `Proxied Custom`. Others may be added in the future.
    "provider": authProvider,
    // Derived from specific tooling headers or the more generic
    // 'remote-user', 'x-remote-user', 'x-forwarded-user', or 'x-user-id' headers
    "userId": userID,
    // The Socket.IO socket id (which changes on each (re)connection)
    "socketId": socket.id,
    // User email address derived from specific tooling headers or the more generic
    // 'remote-email' or 'x-user-email' headers
    "email": email,
    // Users name derived from specific tooling headers or the more generic
    // 'remote-name', or 'x-remote-name' headers
    "name": name,
    // uibuilder performs checks on various headers to attempt to get
    // the actual client source IP address. The process used can be
    // reviewed at https://github.com/pbojinov/request-ip/blob/master/src/index.js
    "ip": realClientIP,
    // The client browser's user agent string
    "agent": headers['user-agent'],
    // The server's host name/ip and optionally the port number for the request.
    "host": headers['host'],

    // --- OPTIONAL ---
    // Authorisation groups that the user belongs to. Authelia & Authentik,
    // or anything else that sets the 'x-forwarded-groups' header
    "groups": "",
    // Authorisation roles that the user belongs to.
    // Anything that sets the 'x-user-role' header
    "role": "",
    // Only for Authentik
    "username": "",
    // Only for FlowFuse, user icon image
    "image": ...,
}
```

> [!NOTE]
> "headers" here refers to [HTTP web server or proxy server headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers).

> [!WARNING]
> It is vital to ensure that any web proxy server or web server's configuration is kept secure. Make sure that you have a monitor that constantly checks for and alerts on changes to configuration. Also perform periodic manual checks.

## Enhance or override the data

UIBUILDER allows the `msg._client` data to be enhanced or altered through the use of a "hook" function added to Node-RED's settings.js.

To use this, add something like the following to settings.js:

```javascript
  uibuilder: {
    hooks: {
        /** Hook fn run whenever uibuilder looks up a connected client's details. NOTE:
         * This will be run every time a client connects and every time it sends a msg to Node-RED.
         * This lets you amend the details including out._client which can contain authenticated user details.
         * @param {object} data
         *   @param {object} data.client Key client information - this can be amended in this fn
         *     @param {object} data.client._uib Standard uibuilder client meta info
         *     @param {object=} data.client._client Only if a recognised authenticated client
         *   @param {socketio.Socket} data.socket Reference to client socket connection
         * @param {object} data.node READ-ONLY! The settings of the node sending the message
         */
        clientDetails: (data) {
                const {out: client, socket, node} = data

                // node.log(`[uibuilder:hooks:clientDetails] for ${node.url}`)
                // console.log(socket.request.headers, socket.handshake.auth)

                // Simplistic e.g. to block a specific user from being logged in
                if (client?._client?.userId === 'horrible.user') delete client._client
        },
    },
  },
```

> [!WARNING]
> It is vital to secure Node-RED's `settings.js` file from unauthorised change.

## Simulating user authentication or authorisation

UIBUILDER provides a hook function that allows headers to be added/altered when a client connects.

To use this, add something like the following to settings.js:

```javascript
  uibuilder: {
    hooks: {
        /** Hook fn that allows overrides of Socket.IO connection headers. NOTE:
         * Connection headers will only ever update when a client (re)connects or
         * possibly also for long-polling requests.
         * @see https://socket.io/docs/v4/server-api/#event-headers for details
         * @param {object} data 
         * @param {object<string:string>} data.headers Response Headers
         * @param {Express.Request} data.req ExpressJS Request object
         */
        socketIoHeaders: (data) => {
            const { headers, req } = data

            // headers contains the response headers that go back to the client.
            headers['x-wowser'] = 'The Client gets this'

            // Simulate an authenticated user
            // If these are set, a msg._client object is added to uibuilder output messages
            // req.headers['remote-user'] = 'test-user'
            // req.headers['remote-name'] = 'Test User'
            // req.headers['remote-email'] = 'test.user@example.com'
            // req.headers['x-user-role'] = 'test-role'
            // req.headers['x-forwarded-groups'] = 'group1,group2'

            // NB: This is NOT suitable for session controls since it will only update
            //     when a client (re)connects, not when otherwise sending/receiving msgs.
            //     Use the msgReceived amd msgSending hooks for session management.
        },
    },
  },
```

## Blocking uibuilder message send/receive

The `msg._client` property makes it simple to control whether messages to/from conencted clients get through.

This can be done in flows simply by checking for the presence or absence of `msg._client`.

In addition, if you want to enforce this without needing additional flow complexity, two more hooks are provided:

```javascript
  uibuilder: {
    hooks: {
            /** Hook fn run every time any uibuilder node receives a message from the front-end client.
             * You CAN:
             * - Stop the inbound msg by returning false.
             * - Change the msg that is received before it is output.
             * You _could_ change the node's values BUT DO NOT! Bad things likely to happen if you do.
             * @param {object} data
             * @param {object} data.msg READ/WRITE. The msg that is being sent
             * @param {object} data.node READ-ONLY! The settings of the node sending the message
             * @returns {boolean} true = receive the msg. false = block the msg.
             */
            msgReceived: (data) => {
                const {msg, node} = data

                // console.log('hooks:msgReceived - msg: ', msg)
                // console.log('hooks:msgReceived - uibuilder url: ', node.url)

                if (msg.blockme) return false // simplistic example

                // Example of altering the msg
                // msg._hook = 'I WAS HOOKED!'

                // Block inputs except from logged in users
                // if (!msg._client) return false

                // Default, allows msgs to flow
                return true
            },
            /** Hook fn run every time any uibuilder node is sending a msg to a front-end client
             * This could therefore get run thousands of times! So best to filter up front as shown.
             * You CAN:
             * - stop the outbound msg by returning false.
             * - Change the msg that is sent
             * You _could_ change the node's values BUT DO NOT! Bad things likely to happen if you do.
             * @param {object} data
             * @param {object} data.msg READ/WRITE. The msg that is being sent
             * @param {uibNode} data.node READ-ONLY! The settings of the node sending the message
             * @returns {boolean} true = receive the msg. false = block the msg.
             */
            msgSending: (data) => {
                const {msg, node} = data

                // Filter to restrict by topic
                // if (msg.topic !== 'test') return false

                // console.log('hooks:msgReceived - msg: ', msg)
                // console.log('hooks:msgReceived - uibuilder url: ', node.url)

                if (msg.blockme) return false // simplistic example

                // Block outputs except to logged in users
                // if (!msg._client) return false

                // Default, allows msgs to flow
                return true
            },
        },
  },
```

## Redirecting unauthenticated users

If using message blocking, you may wish to redirect unauthenticated users to your user login page.

To do this in your flow is easy. For std and control outputs from the uibuilder node, add a check for `msg._client` not being present. In that case, send the following message back to the uibuilder node's input (do not cache this message):

```json
{
  "_uib": {
    "command": "navigate",
    "prop": "login.html",
    "quiet": true
  }
}
```

Where `prop` should be the appropriate login page URL.

> [!NOTE]
> Connecting clients may result in multiple initial messages being sent which could create a loop.
>
> To avoid this, keep track of connecting/disconnecting clients and only send them to login once, setting a flag against the msg.clientId on connection & resetting the flag on disconnection.

## Rules controlling discovery of authenticated users

`msg._client` is only shown if certain rules are met when receiving a connection from a client browser.

`authProvider` Rules:

```js
if (headers['cf-access-authenticated-user-email']) authProvider = 'CloudFlare Access'
else if (handshake.auth?.user?.userId) authProvider = 'FlowFuse'
else if (headers['x-user-id']) authProvider = 'Keycloak'
else if (headers['x-authentik-uid']) authProvider = 'Authentik'
else if (headers['remote-user'] || headers['x-remote-user']) authProvider = 'Custom'
else if (headers['x-forwarded-user']) authProvider = 'Proxied Custom'
```

If `authProvider` has been set, then the following rules apply.

```js
const email = headers['cf-access-authenticated-user-email'] || headers['x-authentik-email'] || headers['remote-email'] || headers['x-user-email'] || undefined
const name = headers['x-authentik-name'] || headers['remote-name'] || headers['x-remote-name'] || handshake.auth?.user?.name

if (headers['x-forwarded-groups']) client._client.groups = headers['x-forwarded-groups']
if (headers['x-authentik-groups']) client._client.groups = headers['x-authentik-groups']
if (headers['x-authentik-username']) client._client.username = headers['x-authentik-username']
if (headers['x-user-role']) client._client.role = headers['x-user-role']
if (handshake.auth?.user?.image) client._client.image = handshake.auth.user.image
```
