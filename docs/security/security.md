---
title: uibuilder Security Documentation
description: |
  Some thoughts on how to correctly and safely secure a uibuilder app.
created: 2020-01-05 20:45:00
updated: 2024-03-23 16:53:05
---

As at uibuilder v5, many of the security features in uibuilder have been removed as they were never complete and were holding back other development. Security of web apps is best done using a dedicated service anyway. Typically a reverse-proxy using a web server can be used to provided integrated security and authentication. Such services can be independently tested and verified.

However, there are a number of supporting features in uibuilder that let you control information flow into and out-of a uibuilder-based front-end. They assume, however, that you have either provided authentication externally or written your own middleware-based security functions.

> [!WARNING]
> I am **not** a professional developer, nor am I an operational DevOps person. I make no claims nor do I provide any warrenties or guarantees about the fundamental security of a web app developed with uibuilder. If you are unsure, you need to pay a professional to audit and penetration test your specific configuration as well as my code.

> [!NOTE]
> Having said that, if you or anyone else discovers flaws in the programming, I will work with you/them as well as I can in order to fix things. But this is not a paid-for development and I don't always have much time. I'm also open to Pull Requests to fix specific issues.

- [Terminology](#terminology)
- [How do I secure my uibuilder app?](#how-do-i-secure-my-uibuilder-app)
- [Configuring Node-RED for TLS](#configuring-node-red-for-tls)
- [Configuring the uibuilder custom server for TLS](#configuring-the-uibuilder-custom-server-for-tls)
- [Standard Schema for `msg._auth`](#standard-schema-for-msg_auth)
- [Additional Information](#additional-information)
- [Ideas for custom authentication schemes using uibuilder](#ideas-for-custom-authentication-schemes-using-uibuilder)


## Terminology

IT Security in general is a complex and specialist area. As such it comes with its own terms, a few of which are particularly relavent here.

* **TLS** (Transport Layer Security) - provides an encrypted, over-the-wire channel of data exchange using a Public Key Infrastructure (a private key and public certificate). It is the method used to secure HTTPS and WSS protocols. Its predecessor was SSL (Secure Sockets Layer) though this should no longer be used.
* **HTTPS**, **WSS**, **FTPS** - are all examples of information exchange protocols protected by TLS.
* **IDAM** (or _IDM_, Identity and Access Management) - these are the tools and practices involved in identifying, authenticating and authorising users or other systems.
* **PKI** (Public Key Infrastructure) - are a set of tools used to manage the issuing and revoking of certificates and keys used for TLS and other strong security. [Let's Encrypt](https://letsencrypt.org/) is a good example of a public, free PKI service (please consider donating to them if you use them in commercial tools or services).

## How do I secure my uibuilder app?

Before you even get started trying to secure Node-RED or a uibuilder app, you must note that all of the steps below are _worthless_ if an attacker can simply bypass your security by gaining access to your network and servers. So everthing is dependent on ensuring that they are also secured. However, that is outside the scope of this page.

1. Step #1 is to make sure that all access to both the Node-RED Editor and your UI is encrypted using TLS (e.g. using HTTPS not HTTP and WSS not WS). If you don't do this, any other work on security is meaningless.

2. Step #2 is to make sure that any information provided by a user (or another system) is **sanitised**. That's to say, that input is restricted to a sensible length and character set as a minimum. Ideally restricting input to a specific format where that makes sense (e.g. emails). This is to ensure that your system cannot be broken or hacked by someone or something entering invalid information. There are many attacks based on abusing input, so don't overlook this step, it is critical.

3. Step #3 is to have a means to record the *identities* of users and a means to enable those users to prove that they are who they claim to be. This is the _identity_ and _authentication_ step. You can hand-off user identities to a 3rd-party if you prefer or keep your own record. Authentication can also be handed-off by using a standard such as OAuth/OIDC (for public cloud services such as Google, Azure, GitHub, Facebook, etc) or SAML (typically for enterprise systems).

4. An optional step #4 is _authorisation_. For many web apps, authentication is sufficient, but if you want to be able to have different levels of protection for different areas of your app, you may need a way to give users different levels of access.

5. Step #5 is to ensure that any restricted data can only be accessed by authenticated and authorised identities. For uibuilder, this may be done using Node-RED flows and uibuilder ExpressJS and Socket.IO middleware.

6. Step #6 is **Test, Test, Test!**. Your system is not secure unless you have proven it to be so. Obviously, for low-value, small-target systems such as a home automation system, you won't be able to hire a professional to do Penetration Testing. However, for a commercial service and for anything of value, you **must** do professional grade security testing.

7. Step #7 is _Monitoring_. If you think you have secured your web app but don't monitor it, you will never actually _know_ whether you are successful. You also need to remember that something that is secure now may not be tomorrow. So record & check access, monitor data quality.


Some additional information about these steps is given below.

### Step #1: TLS (HTTPS)

If you can run a *reverse proxy* on the same device as Node-RED or on another device connected to the Node-RED server via a secured, internal-only network, then you should configure that proxy to handle the TLS encryption as this will almost certainly always be more secure, easier to manage and more performant. See the [Securing apps using NGINX](uib-security-nginx.md) page for an example. 

If you cannot run a reverse proxy at all, then you will have to configure Node-RED to use TLS. uibuilder can use the same ExpressJS web server that Node-RED creates or it can create a new instance. In that case, you can either still use Node-RED's settings for HTTPS or you can configure uibuilder to use its own.

If you can run a reverse proxy but it or Node-RED is on a network that may get lots of different traffic, it is strongly recommended that you still use the proxy for external security but also configure Node-RED to use TLS as well.

> [!TIP]
> A reverse proxy provides a number of advantages and is the recommended approach.

### Step #2: Sanitising Inputs

Step #2 of securing any web app is to make sure that a potential attacker or just a ham-fisted user cannot break, damage or gain unwarrented access simply by what they enter into a form or select on a URL.

* Restrict the length of data that can be provided from your UI. For text fields, 255 characters is about the maximum you should ever allow. Unrestricted inputs can result in buffer-overflow attacks.
* Restrict what characters can be entered. Where you don't need the full Unicode character set, don't allow it. For example, if asking for an email address, only allow valid characters.
* Restrict specific inputs to a sensible format. For example, email addresses have a prefix, an `@` symbol followed by a domain name. A date needs `99/99/9999` or `9999-99-99`, a time in hours and minutes needs `99:99` and so on.

Don't forget that API inputs need to be sanitised as well as user inputs.

> [!TIP]
> For simple systems, doing this step via Node-RED and/or uibuilder middleware may be sufficient. In more secure systems, sanitisation of inputs may be done at multiple levels for additional protection and may use tools such as a *Web Application Firewall* or an *Intrusion Protection System*. For a full analysis of best practice, try the [OWASP](https://owasp.org/) documentation.

### Step #3: Identity and authentication

Step #3 of securing any web app is generally working out secure methods for identifying users and authenticating them.

For anything other than simple, low-value apps, it is strongly recommended that you get some expert help for this. There are lots of people who will tell you _how_ but many of them actually don't understand the details. Getting security right and keeping it right are **hard problems** and should not be under-estimated.

The guidance here is generic and should only be used on low-security, low-value apps.

**_NOTE_: The rest of this section is TBC**.

> [!NOTE]
> While identity and authorisation _may_ be done using uibuilder ExpressJS/Socket.IO middleware, it is strongly recommended to use a separate service such as a reverse proxy with an authentication extension and then pass through appropriate information to Node-RED/uibuilder via HTTP headers and similar mechanisms.

### Step #4: Authorisation

This step for securing web apps isn't always needed. It controls authorisation for what each user or group of users can and cannot do.

For simple IoT home automation, this is probably overkill. For entrprise production and customer-facing apps, this will certainly be needed.

Authorisation controls however are a whole other topic beyond the scope of this document. At some point, I will try to create some guidance documents for doing authorisation with uibuilder apps.

### Step #5: Restricting access to data

Once you have ensured that you have a secure way to prove the identity of a person or system accessing your app, you then need to provide some mechanisms to prevent access except where it is allowed.

Typically, for inexperienced developers, this step is where they may start but as you can see, there are several important steps before this.

> [!NOTE]
> It is worth noting here that steps 2, 3, and 4 _can_ all be done in Node-RED and uibuilder. However, it is not recommended. It is better to have a "separation of concerns" and keep specialist tasks such as identity and authorisation in their own tools.

For Node-RED and uibuilder-based apps, controlling access is done by writing flows and/or ExpressJS/Socket.IO middleware to make use of the identity (and authorisation if configured) that has been authenticated. 

Of course, that requires that any external security services are passing suitable data down to Node-RED.

> [!NOTE]
> It is important to remember that uibuilder apps are *web pages* - they *run in the browser*, not in Node-RED. You cannot make things secure in the front-end code of a web app since the user will _always_ be able to make changes. So security _must_ be done at the server. Node-RED flows and uibuilder middleware run on the server. <br>It is also important to remember that uibuilder makes extensive use of websockets to send and recieve data between Node-RED and the browser. This presents some technical challenges for ensuring data security.

This topic is covered in more detail on a separate page: [Securing Data](securing-data.md).

### Step #6: Security Testing

This is a whole subject area of its own and I can't do it full justice here. However, obviously, how much and what type of security testing you do is going to depend on the value of your system, its visibility to the outside world and many other factors.

### Step #7: Logging & Monitoring

Do not assume that you have got security right. Also do not assume that good security at one point in time will still be good later on. 

So ensure that you log when someone accesses your app. The date/time and the identity. For high-value systems, also log critical changes to both settings and dat. 

Then make sure that you regularly **Review the logs**! Security logging is pretty useless unless you actually check the logs periodically.

In addition, it is a good idea to have separate scripts or processes for *monitoring data quality*. Security isn't just about inappropriate acceess to the system, it is about ensuring the data is good over time. Data can be spoiled either by deliberate attack or by accidental mistakes. Even by random error events in the system. If your data has value, make sure it is good.

### Securing the Infrastructure

As mentioned, keeping unwanted people out of your network and servers is also important. 

Even a home automation system accessible from the Internet should have a firewall (normally as part of your Internet Router). Better still, make use of the excellent free tier of [Cloudflare](https://www.cloudflare.com/) by restricting inbound access to your app to _only_ Cloudflare's servers and forcing all external access via them. This gives you another layer of security that filters out many attacks - use this with a local reverse proxy, you still need TLS between you and Cloudflare. Cloudflare gives you many advantages and is well worth the time to set it up.

Also, don't neglect securing your server, even on a home network. Ideally have Node-RED and the reverse proxy running as their own, dedicated non-root users and have a separate user id for remote access to the server. Remove all unnecessary software and ideally follow the OWASP server hardening guides. If your server is a Raspberry Pi, do yourself a favour and change the default user/password.

For higher-value systems and services, you should obviously invest more in infrastructure security. Neglecting this is like locking the front-door but leaving the kitchen window open.

## Configuring Node-RED for TLS

> Note that using a Reverse Proxy such as NGINX, Caddy, or HAproxy can often give better performance and security when using TLS.

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

## Configuring the uibuilder custom server for TLS

As mentioned above, if you chose to create a separate ExpressJS instance for your uibuilder apps, you can either choose to use Node-RED's https configuration or you can have a separate configuration.

To create a separate configuration, in the `settings.js` file for Node-RED, the instructions are pretty much the same as for configuring Node-RED except that you define the `https` property inside the `uibuilder` property:


```javascript
//...
uibuilder: {
   /** Tells uibuilder to stand up a separate instance of ExpressJS and use it
    *  as the uibuilder web server. Also defines the TCP port to use which
    *  has to be different to Node-RED's port. Adjust to meet your own requirements.
    */
   port: process.env.UIBPORT || 3001,
   /** Tells uibuilder to use https instead of http */
   customType: 'https',
   /** Tells uibuilder what private key and public certificate to use for TLS encryption */
   https: {
      key:  fs.readFileSync( path.join( 'each', 'folder', 'to', 'your', 'privatekey.pem' ) ),
      cert: fs.readFileSync( path.join( 'each', 'folder', 'to', 'your', 'certificate.pem' ) ),
   },
},
//...
```

## Standard Schema for `msg._auth`

> [!NOTE]
> Although much of the built-in security processing has been removed from uibuilder in v5, I am leaving this in place as a recommendation because it is useful as a potential standard not only for uibuilder. When creating your own security processing in Node-RED and uibuilder middleware, please use this schema for campatibility and consistency.


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

* [Safely accessing Node-RED over the Internet](https://discourse.nodered.org/t/safely-accessing-node-red-over-the-internet/45024) is an FAQ thread in the Node-RED Discourse forum. 
* How to set up Node-RED to use TLS is documented in the [Runtime Configuration](https://nodered.org/docs/user-guide/runtime/configuration#runtime-configuration) document.
* "[How to create secure certificates](https://it.knightnet.org.uk/kb/nr-qa/https-valid-certificates/)" for use with TLS is an article on my blog.
* Some ideas on ["safely" exposing Node-RED to the Internet](https://github.com/node-red/cookbook.nodered.org/wiki/How-to-safely-expose-Node-RED-to-the-Internet) are documented in the WIKI for the Node-RED Cookbook.
* "[How to secure Node-RED](https://it.knightnet.org.uk/kb/nr-qa/securing-node-red/)" is another of my blog articles (only a draft though I'm afraid). It provides some security background.
* Node-RED security is documented in the [Securing Node-RED](https://nodered.org/docs/user-guide/runtime/securing-node-red) doc.
  Note that this documentation has no bearing on uibuilder security.


## Ideas for custom authentication schemes using uibuilder

Because uibuilder lets you create custom middleware for both Express and Socket.IO, it is still possible to implement custom security just using uibuilder and Node-RED. Middleware can be added for ExpressJS (https) connections, Socket.IO connections, and for each sent and recieved Socket.IO message (only the message itself can be changed for these). Note that full security and client information for Socket.IO is only available on a (re)connection, it is not available with each message. So if you need to do any session management and want to protect from credential hijack attacks, you will need to add custom information to every message.

The uibuilder front-end clients also create a stable clientId that is stored in a session cookie which lasts until the browser is restarted. That id along with the real IP of the client is sent in control messages and optionally in standard messages. These can also help with custom authentication, authorisation and session management.

> [!NOTE]
> When managing sessions, do not forget that your users will rarely load a web page. Most communication happens via websockets, not http(s). Because of this, full, secure session management is actually quite hard.<br><br> To help with this, uibuilder now implements a new HTTP(S) `ping` URL along with a `setPing` function in the front-end library. By passing an integer number of milliseconds argument to setPing, the client will access the ping endpoint every n ms. This could be used to keep a client session alive.

Here are some other libraries that might be helpful in security middleware for uibuilder:

* [iron-session](https://www.npmjs.com/package/iron-session#express) - Uses encrypted cookies for stateless sessions.
* [Passport.js](https://www.passportjs.org/) - in theory, it should be possible to implement passport using express middleware.
