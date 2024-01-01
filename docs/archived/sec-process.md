---
created: 2022-04-02 19:09:31
updated: 2023-12-30 17:01:41
---

Changes

* Editor
  * Flag to allow flow-based security (ignores loading custom security middleware, passes all id/authentication/authorisation in ctrl msgs). Have override flag in settings.js

---

## Core Info

uib control msgs allowed.
WARNING: a client JWT is NOT an assumption of client validity.

### Data

* client ip
* client id
* user id
* user pw

## Flow-based process

### On client connect

1. only control msgs allowed until authenticated
2. initial control msg to client
3. client sends logon info
4. logon info exposed in control msg (port 2) to flow
5. Flow has to return an authentication msg to uibuilder with success/fail details.
6. If fail, return to client in control msg
7. If success, uib creates JWT & sends to client in control msg
8. Client must include at least the ids used by the flow and the token in all future msgs or they are rejected with a msg to the client and a control msg on port 2.
9. The flow is responsible for tracking ongoing use of the session and deciding when to terminate the session.
10. At end of session or client disconnect (if desired) the flow must send a logoff control msg to uib - uib will fwd to the client if it can.

NOTE: The flow is responsible for checking client validity. This process potentially allows a client to disconnect but retain the JWT. That JWT could be passed by the client on reconnection..

---

## Custom Security Middleware Process

### On Load

* Use uib node's jwt secret, token expiry and session expiry
* 


### On Client connect

1. If sec on, tell client on initial connect so client can process. Only allow control msgs until *authenticated*.
2. On receipt of logon control msg, 




-----------------------------------------------------------

# Security sequences

On an initial client web connection, uibuilder adds 2 cookies & 1 custom header to the response. This is done in the `masterMiddleware` function of `web.js`.

* Cookie 1: `uibuilder-namespace`. Tells the client what Socket.IO namespace is in use. As this is only based on the URL for the uibuilder instance, it may be incorrect in some circumstances. This is the reason that the client function `uibuilder.start()` can take a namespace parameter. Use the parameter if serving front-end files from a sub-folder or a different server.
* Cookie 2: `uibuilder-client-id`. Gives a unique identifier string to the client. This allows tracking of the client even if the Socket.IO id changes which happens if the client page reloads or has a temporary loss of websocket connection.
* Custom HTTP Header: `uibuilder-namespace`. As for cookie 1. This is only accessible on client side via an XHR call or a web worker script but would work even if cookies are blocked.

> Both cookies are session cookies, they are destroyed if the client page is closed. They have strict same-path settings and will be marked as secure if the server is using HTTPS/HTTP2.

After the web connection, the `uibuilder.start()` process attempts to connect back to Node-RED using Socket.IO. When it does so and _only while in polling mode_ (usually before the "upgrade" to websockets after the initial handshake), it adds a custom HTTP header and an auth property to the response:

* Custom HTTP Header: `x-clientid` which takes the form: `uibuilderfe; Dn8IWInlSnCqChzraiZYh` where `uibuilderfe; ` is fixed and the remainder is the client ID.
* Auth property: `clientId`. Available as `socket.handshake.auth.clientId` in server-side handlers such as the `<uibRoot>/.config/sioMiddleware.js` file.

The client ID is available in your front-end code as `uibuilder.get('clientId')`. You may therefore use it in your own processing and may pass it back to Node-RED in your own messages. It may be used in authentication processing in the future. The ID is cryptographically secure with a 1 in several billion chance of an id clash (slightly better than a standard UUID. It uses the `nanoid` package).

_Use the client id in your own code with caution as it is very likely to change in the future_.

Notes:

* "client" means a browser tab. You may therefore have multiple clients connected from a single device.
* The client ID will change if a user reloads the client page. I will be attempting to stop this but how is uncertain.
* The client ID is included in the uibuilder control messages for connect and disconnect of clients as well.

---

>! This is a work in progress. Do not assume the following is correct.

If this is not a login msg
   If no JWT
      Check for session db for _auth.id
      If session exists
         remove session
      Request Logon

   Else check JWT
      JWT signature valid, JWT sub = _auth.id, JWT IP = request IP
      If JWT sub != _auth.id OR JWT sig invalid OR JWT invalid
         Check & delete session if possible
         Delete JWT and fail hard (Dont request logon)

      Else If JWT expired (OR If JWT IP != request IP)
         Check session db for current session for ID
         If current session
            Refresh JWT
            return
         Else
            If no _auth.password provided
               delete jwt
               Request Logon
            Else
               Check if ID exists in user DB & hashed pw matches
               If valid

      Else (everything is valid and jwt not expired)
         refresh JWT if required
         update session info if required
         (continue with server processes)

Else (it is a login msg)


## On page load

Nothing

## (A) On initial client connection (includes if NR restarts with existing client open)

1. => Server sends 'client connect' control msg to client - tells client if security is on. ~~If so, includes a dummy msg._auth~~

2. If security is NOT on

3. If security is ON
   1. ++ Client checks localstore for auth
      1. If store present
         1. <= Send 'auth' control message to server with auth details
      2. Otherwise
         1. <= Send 'auth' control message to server with dummy auth details (maybe not do this? could not do anything more until logon sent?)
      3. GOTO (B)

   .. From here, every message must have a `msg._auth` included

   2. ++ Client waits for 'authorised' or 'not authorised' msg from server
      1. If 'authorised'
      2. If 'not authorised'
         1. If server allows unAuth msgs
            1. <= Client sends cache request message
            2. +++
         2. If server blocks unAuth msgs
            1. ++ Client signals not auth
            2. +++

## (B) On server receives 'auth' control message

1. == Server receives 'auth' control message. Checks auth
   1. == Server validates msg._auth (*1). Only succeeds if client was already auth and send a valid _auth with JWT (due to node redeploy since nr restart invalidates all JWT's).
      1. => Server returns either an 'authorised' or 'request for logon' message to client.
      2. If auth failed
         1. => Send 'request for logon' to client
         2. ++ client must prompt user for logon
         3. <= Client must send 'auth' control message to server
         4. GOTO 1.0

## On client receives auth confirmation

4. <= Client sends 'ready for content' control msg to server.
5. == Server validates msg._auth (*1). Only succeeds if client was already auth and send a valid _auth with JWT (due to node redeploy since nr restart invalidates all JWT's).
6. => Server returns either an 'authorised' or 'not authorised' message to client.
7. ++ If auth failed, client must prompt user for logon, user must send logon to server

## On client receives request for logon

1. ++ Client triggers 'logon-request' event
2. If Vue
   1. 

### (*1) Server _auth (re)validation - excluding logon

1. == Check if JWT present
   
   1. IF JWT present
      
      1. == Validate JWT
      2. If JWT valid
      
         1. If auto-extend, 
            
            1. == extend JWT
         
         2. goto step (2.0)

      3. If JWT not valid, 
      
         1. == remove JWT
         2. goto step (2.0)

   2. IF JWT not present
   
      1. goto step (2.0)

2. == Validate user (`security.js/validateUser()`)
   
   1. If user id NOT present - give up, 
   
      1. <= Return 'auth failed' with updated `msg._auth`
   
   2. == Check if usr id exists in logged-in user list
   
      1. If in list and JWT present
      
         1. <= return 'auth succeded' with updated `msg._auth`

   3. == Check if user id present in main user list

      1. If in list
      
         1. == Check if pw is present and valid
         2. If yes, 

            1. IF JWT present
               
               1. == update JWT if auto-extend is on
               2. <= return 'auth succeded' with updated `msg._auth`

            2. Otherwise, 
            
               1. == create JWT
               2. <= return 'auth succeded' with updated msg._auth

         3. If no,

            1. == delete JWT
            2. <= Return 'auth failed' with updated `msg._auth`

      2. If not in list
      
         1. == delete JWT
         2. <= Return 'auth failed' with updated `msg._auth`

## On NR Receives logon


## On msg send from NR to client


## On msg received from client to NR