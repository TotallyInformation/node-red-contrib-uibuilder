/** uibuilder global settings file */

module.exports = {
    // List of npm packages to be made available to any uibuilder instance.
    // These are the default packages, add others as needed
    "packages": [
        "vue",
        "bootstrap-vue",
        "bootstrap",
    ],
    // Default master template files to use (currently on "vue" is possible)
    "template": "vue",
    // Back-end debugging: error, warn, info, verbose, debug, silly; true = silly, false = none
    "debug": false,
}

/** Template examples This is an example, change the module.exports as needed */
/* templateExample = {
    // List of npm packages to be made available to any uibuilder instance.
    // These are the default packages, add others as needed
    "packages": [
        "vue",
        "bootstrap-vue",
        "bootstrap",
    ],
    // Default master template files to use (currently on "vue" is possible)
    "template": "vue",
    // Back-end debugging: error, warn, info, verbose, debug, silly; true = silly, false = none
    "debug": false,

    // Optionally provide an ExpressJS middleware hook. Used for custom authentication/authorisation
    //   or anything else you like.
    // @see https://expressjs.com/en/guide/using-middleware.html
    middleware: function(req,res,next) {
        console.log('I am run whenever a web request is made to ANY of the uibuilder instances')
        // ... do some user auth checks ...
        // if auth checks fail: next(new Error('Authentication error')) otherwise:
        next()
    },
    // Optionally provide a Socket.IO middleware hook. Used for custom authentication/authorisation or 
    // anything else you like.
    // * WARNING: This will be called ONLY when the initial connection happens,
    // *          it is NOT run on every message exchange.
    // *          This means that websocket connections can NEVER be as secure.
    // *          since token expiry and validation is only run once
    socketmiddleware: function(socket, next) {
        // Some SIO related info that might be useful in security checks:
        // console.log('--socket.request.connection.remoteAddress--', socket.request.connection.remoteAddress)
        // console.log('--socket.handshake.address--', socket.handshake.address)
        // console.dir('-- Sockets connected --', io.sockets.connected)
        console.log('Socket.IO middleware: I am only run when a client FIRST connects')
        console.log('Socket Middleware. ID:', socket.conn.id, ' Remote Addr:', socket.conn.remoteAddress)
        // ... do some user auth checks ...
        // if auth checks fail: next(new Error('Authentication error')) otherwise:
        next()
    },
} */