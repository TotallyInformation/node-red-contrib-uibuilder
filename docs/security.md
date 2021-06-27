---
title: uibuilder Security Documentation
description: >
   Some thoughts on how to correctly and safely secure a uibuilder app.
created: 2020-01-05 20:45:00
lastUpdated: 2021-06-27 18:19:13
---

uibuilder provides its own security process based on simple standards.

This enables anyone to implement simple but effective multi-user security on their uibuilder based front-end's. You don't have to be an expert in ExpressJS or PassportJS. Nor do you need to understand much about web security, JWT, etc - though you will need some basic understanding if you really want to be sure about securing your user interfaces.

!> **WARNING**: I am **not** a professional developer, nor am I an operational DevOps person. I make no claims nor do I provide any warrenties or guarantees about the fundamental security of a web app developed with uibuilder. If you are unsure, you need to pay a professional to audit and penetration test your specific configuration as well as my code.

?> Having said that, if you or anyone else discovers flaws in the programming, I will work with you/them as well as I can in order to fix things. But this is not a paid-for development and I don't always have much time. I'm also open to Pull Requests to fix specific issues.

* [How do I secure my uibuilder app?](#how-do-i-secure-my-uibuilder-app)
* [Configuring Node-RED for TLS](#configuring-node-red-for-tls)
* [Standard Schema for `msg._auth`](#standard-schema-for-msg_auth)
* [Additional Information](#additional-information)

## How do I secure my uibuilder app?

1. Configure Node-RED to use TLS. The security documentation for Node-RED contains the details. There are also various threads on the Node-RED Discourse forum that explain what people have done to make use of Let's Encrypt or self-signed certificates.
   
   !> **WARNING**: Do not - EVER - use any kind of web login process without first setting up TLS. It is unsafe and sends your sensitive user data unencrypted over the network (potentially over the Internet).

   If you have configured Node-RED to work in a non-development mode (e.g. the NODE_ENV environment variable was set to somethnig other than "development"), uibuilder will _refuse_ to turn on security unless TLS is properly configured. In development mode, it will allow it but will output a security warning every time a user connects.

2. Open the configuration of your uibuilder Node in the Node-RED admin Editor. Turn on the security flag.
   
3. Edit your `security.js` file according to your needs. See the [separate document](./securityjs.md) on how to make changes to this file.
   
4. Add suitable logon/logoff processing to your user interface (front-end code).

   Remember that everything is controlled via messages between your front-end and the Node-RED server. When security is turned on, only control messages will flow between the front-end and the server.

   Security is **not** applied to your web resources (html, css, javascript, images, etc). It is always assumed that these are "public" in the sense that anyone with access to your web server is able to load them. So make sure that nothing sensitive is made available via a web resource.

   The front-end `uibuilder.logon()` function allows you to include a single object as a parameter. This object can contain any extra data that you want to make available to the `validateUser()` function in `security.js`. That data is added to `msg._auth`. It is passed as the only parameter to `validateUser()`. As a minimum, you _must_ include an `id` property which is used to identify the user. See below for more information about `msg._auth`.

   The front-end `uibuilder.logoff()` function allows you to allow a user to log off. It takes no parameters. An equivalent automatic process happens if the authentication token expires. uibuilderfe will clear its own authentication data in this case but you are responsible for clearing any other sensitive or protected information.

   When writing a UI to allow a user to provide login information, you should think carefully about whether you need to keep any of the data. The best and most secure process is to clear the data from the DOM and from memory as soon as you have received acknowledgement from the server that the logon was successful.
   
5. Test that everything is working as expected.

   As previously mentioned, nothing beats professional cyber-security testing at this point. 
   
   However, if you are using Node-RED non-professionally, just make sure that you cannot access sensitive data if you are not logged on and that you can access it when you are logged on. Also make sure that you cannot access someone else's sensitive information.

   Node-RED should not be able to send messages to any client that isn't logged on (see the separate information for making use of an "anonymous" pseudo-user). Nor should the client be able to send anything to Node-RED. However, control messages should work in both directions.

   Note also that if your UI has received information that should be secured, you will need to add processes to ensure that it is deleted from the DOM and from memory when the logout event occurs. Logout may occur manually or may happen automatically if a timeout such as the token expiry is exceeded.

## Configuring Node-RED for TLS

After you have done this, you will need to access your Node-RED web pages using `https` instead of `http`. All websocket and Socket.IO interfaces will automatically use their TLS encrypted equivalents as well.

1. Create secure certificates and keys.
   
   This is an entire subject in its own right and beyond the scope of this document. Please see the [Additional Information](#additional-information) section below for some ideas.

2. Change `<userDir>/settings.js`.
   
   * Add `const fs = require('fs')` and  `const path = require('path')` on lines before the part that says `module.exports`.
   * In the `module.exports` part, search for the line that says `https: {`. Uncomment the object and change it like so:

     ```javascript
    https: {
        key:  fs.readFileSync( path.join( 'each', 'folder', 'to', 'your', 'privatekey.pem' ) ),
        cert: fs.readFileSync( path.join( 'each', 'folder', 'to', 'your', 'certificate.pem' ) ),
    },
     ```

    Make sure that you use the correct folder names. If the key & cert files are not kept in your `<userDir>` folder (e.g. `~/.node-red`), use absolute path references.

    You may also want to check out the other properties that you can include in the `https` setting. They come from [Node.js's `https.createServer` options](https://nodejs.org/docs/latest-v8.x/api/https.html#https_https_createserver_options_requestlistener).

3. Restart Node-RED.
   
4. Test that you can now only access the admin Editor, Dashboard and uibuilder instances only using `https` and not `http`.

## Standard Schema for `msg._auth`

**NOTE**: _The name of this property is likely to change to something like `msg._auth` so that other tools needing front-end authentication and authorisation can use a common schema._

uibuilder proposes a standard(ish) schema for exchanging authentication, authorisation and session data.

This uses the `_auth` object property on exchanged `msg`s. The actual content of the object is likely to be different depending on what the message is.

Some control msg types would be:

- `logon` (client to server)
- `logoff` (client to server)
- `unauthorized` (server to client)
- `logon success` (server to client)
- `logon failure` (server to client)
- `session expiry` (server to client)
- `session invalid` (server to client)

Example `msg` structure:

```json
{
   "payload": ... ,
   "topic": ... ,
   "_msgId": ... ,
   "_socketId": ... ,

   "_auth": {
      "id": ...unique user identifier... ,
      // Other potential information depending on need.
      // e.g. for a login:
      "password": ...encoded password... ,
      // or for ongoing session management:
      "jwt": ... JWT token (base 64 encoded) ... ,
      "sessionExpiry": "2020-06-14T20:42:50.000Z",
      // Optional additional data about the user and/or session
      "info": {
          ... other metadata ... can be any data, some ideas shown ...
          "fullName": "John Smith",
          "givenName": "John",
          "familyName": "Smith",
          "expiry": "2020-10-25", // maybe when this users account expires
          "message": "Welcome John, you have successfully logged in",
      }
   }
}
```

Here is the JSDoc type definition for the `_auth` schema:

```javascript
/**
 * @typedef {Object} _auth The standard auth object used by uibuilder security. See docs for details.
 * Note that any other data may be passed from your front-end code in the _auth.info object.
 * @property {String} id Required. A unique user identifier.
 * @property {String} [password] Required for login only.
 * @property {String} [jwt] Required if logged in. Needed for ongoing session validation and management.
 * @property {Number} [sessionExpiry] Required if logged in. Seconds since 1970. Needed for ongoing session validation and management.
 * @property {boolean} [userValidated] Required after user validation. Whether the input ID (and optional additional data from the _auth object) validated correctly or not.
 * @property {Object=} [info] Optional metadata about the user.
 */
```

The same msg property is also used when sending information from the Node-RED server to the client as well. For example, on a successful login, you might return a message for the user from the server such as "Welcome to xxxxx, please remember to change your password" or whatever, you might also pass back other "meta-data" such as a timestamp when the users subscription expires.

## Additional Information

* The [security design is documented in the WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Security-Design-v2).
* How to set up Node-RED to use TLS is documented in the [Runtime Configuration](https://nodered.org/docs/user-guide/runtime/configuration#runtime-configuration) document.
* "[How to create secure certificates](https://it.knightnet.org.uk/kb/nr-qa/https-valid-certificates/)" for use with TLS is an article on my blog.
* Some ideas on ["safely" exposing Node-RED to the Internet](https://github.com/node-red/cookbook.nodered.org/wiki/How-to-safely-expose-Node-RED-to-the-Internet) are documented in the WIKI for the Node-RED Cookbook.
* "[How to secure Node-RED](https://it.knightnet.org.uk/kb/nr-qa/securing-node-red/)" is another of my blog articles (only a draft though I'm afraid). It provides some security background.
* Node-RED security is documented in the [Securing Node-RED](https://nodered.org/docs/user-guide/runtime/securing-node-red) doc.
  Note that this documentation has no bearing on uibuilder security.
