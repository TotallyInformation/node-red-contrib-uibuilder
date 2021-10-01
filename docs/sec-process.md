# Security sequences

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