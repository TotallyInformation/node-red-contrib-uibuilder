# Security sequences

## On initial client connection (includes if NR restarts with existing client open)

1. => Server sends 'client connect' control msg to client - tells client if security is on. If so, includes a dummy msg._auth
2. <= Client sends 'ready for content' control msg to server - updated msg._auth is used if available. NB: doesn't have a JWT here unless client had previous valid session.
4. == Server validates msg._auth (*1). Only succeeds if client was already auth and send a valid _auth with JWT (due to node redeploy since nr restart invalidates all JWT's).
5. => Server returns either an 'auth succeded' or 'auth failed' message to client.
6. ++ If auth failed, client must prompt user for logon, user must send logon to server

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