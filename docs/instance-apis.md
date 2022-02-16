---
title: How to use Instance API's
description: >
   Instance API's can be defined for each uibuilder node added to your flows. They run on the Node-RED server and are 
   designed to provide server-side compute functions for your data-driven user interfaces.
created: 2022-01-17 01:45:24
lastUpdated: 2022-01-17 20:04:17
---

Notes:

* **WARNING** - This feature potentially allows flow authors and front-end developers to create API's that may access the internals of Node-RED and even the server it is running on. For this reason, you must enable it in settings.js by setting `uibuilder.instanceApiAllowed` to `true`. It is turned off by default. It is recommended that you leave it that way unless you know what you are doing.

* It is generally best practice to stick with computing things in Node-RED flows and sending to uibuilder nodes rather than
using separate API's. However, there may be times when an API will be useful. API endpoints can, of course be called from any front-end
code and so may also be used by other web apps.

Also note that it is best practice when using Node-RED to define API endpoints using http-in/out nodes rather than making use of this facility.

Bottom line is that Instance API's should be a facility of last resort and used sparingly.

## Controlling access to the Instance API features

Edit the settings.js file for the instance of Node-RED and change or add a `uibuilder` property with a `instanceApiAllowed` sub-property set to true.

```js
    /** Custom settings for all uibuilder node instances */
    uibuilder: {
        /** Controls whether the uibuilder instance API feature is enabled
         *  Off by default since uncontrolled instance api's are a security and 
         *  operational risk. Use with caution.
         */
        instanceApiAllowed: true,
    },
```

## Creating an API

To create instance API's, you create an `api` folder in the uibInstanceRoot folder for your uibuilder node. This will be `<uibRoot>/<url>/api`. Or, if using default settings for uibuilder and Node-RED and with a uibuilder node having a URL defined as "test1": `~/.node-red/uibuilder/test1/api/`.

Any `*.js` files in that folder will be loaded by the appropriate node and an attempt will be made to add the contained functions as endpoints to the instance URL.

If your .js file exports a single function, it will be applied to the `http(s)://<host>/<url>/api` path.

If your .js file exports and object, each property of the object that is a function and matches either an HTTP method (get, put, etc) or `use` will be applied to the `http(s)://<host>/<url>/api/*` path. If the object defines a `path` property, that will be used as the final part of the path instead of the default.

Where multiple API files are provided, each function is added to the appropriate path. Where overlapping functions are provided **all** functions are executed in order of loading except if the function provides a terminating function such as `res.send()` and as long as `next()` is the final function call. Note that it is not guarenteed that multiple files will be loaded in order, this is controlled by node.js and your host operating system, however, they will normally load in a usual sort order.

## Making changes to the API

The API .js files are loaded and integrated to the uibuilder instance at flow initialisation time. This means that, if you subsequently make changes, you must either restart node-red or at least use the deploy menu "Restart Flows".

## Order of operation

Because the instance API feature makes use of ExpressJS routing handler functions, the order of definition and the actions of your functions is very important.

You should always keep an eye on the Node-RED log when making changes because that's where any errors will show up.

Remember that if you have the same verb (method) on the same path, ALL of the functions get fired in order of definition when accessing that URL. Even when
the path is different, you might have a path like `/api/:something` and in a different file, a path like `/api/fred`, these will both be triggered if you go to the
`/api/fred` URL.

Also remember that if you use an ExpressJS function that sends the HTTP headers, what I've termed a terminating command, you cannot then use another function
that also does the same thing, that will give you an error (though the first function will already have worked). So if, in one file you had a `get` function
that does `res.send('hello')`, you cannot then have a second file with the same path and a get function that does `res.json({"message": "Hello"})` since both
send headers a completion code and some data.

## Allowed function names

The instance API feature will only process certain property names and will ignore all others.

* `path` - must be a string that will be used as the API path added to `<uibInstanceURL>/`.
* `get`, `put`, `post`, `head`, `delete`, `connect`, `options`, `trace`, `patch` - these are the 9 most common HTTP verbs.
* `use` - used to apply the function as ExpressJS middleware.
* `all` - will apply the function to all methods.
* `apiSetup` - will not be used as an ExpressJS router, it will be run at setup time and will pass the node and uib master variable (which also contains a reference to the `RED` object) into the function. Those references can be assigned to constants accessible to the other functions. See the examples below for details.

Note that the functions do not get direct access to the path normally used in the ExpressJS `router.get()` etc calls. The path will either be `<uibInstanceURL>/api/*` (default) or the path defined in the export added to `<uibInstanceURL>/`. THe functions match the function (2nd or 3rd parameter to the `router.<method>()` call) passed through to the router function.

## API function definitions

The functions in your API files must be valid ExpressJS route/middleware functions.

They will receive either 2 or 3 parameters. `res`, `req` and `next` in that order. Check the ExpressJS documentation for details.

If the function does not have a terminating function such as `res.send()`, it should end with a `next()` function call otherwise the page may never be
sent back to the client browser.

Please read the [ExpressJS documentation for details about routing handler functions](https://expressjs.com/en/guide/routing.html). Also the [ExpressJS v4 Router API details](https://expressjs.com/en/4x/api.html#router).

## Optional Setup Function (optional access to `node` and `uib` objects)



## Errors

The functions in your API files must be valid ExpressJS route/middleware functions. If they are not, it is highly likely that serious errors will occur and it
it possible that Node-RED will crash. Though crashes should be reported as bugs to the uibuilder GitHub issues log so that they can be eliminated.

## Examples

These examples use the following assumed settings: 

* `url`: `test1`
* host & port: `http://1.2.3.4:1880/`
* `userDir`: The default `~/.node-red/`
* `uibRoot`: The default `<userDir>/uibuilder/`
* Main API file name: `api1.js`
* 2nd API file name: `api2.js`

### Single Function

TBC

### Multiple functions with no path property

TBC

### Multiple functions with a path property

This example would provide a range of API URL's: `http://1.2.3.4:1880/test1/api/xxx`, ``http://1.2.3.4:1880/test1/api/yyy` and indeed any valid name after the `api/`. This is using the ExpressJS path params option.

`api1.js`

```js
/** Example uibuilder instance API file with multiple methods
 *  Each method will be applied to `<uibInstanceURL>/api/:something` path
 *  You have to reload Node-RED if you change this file.
 *  It is best to use named functions as shown because it makes debugging URL paths easier when using the uibindex page.
 *  See the ExpressJS documentation for details regarding these functions and the method names, parameter handling, etc.
 */
'use strict'

module.exports = {
    // Must be a valid ExpressJS URI path. It will be appended to the instance URL.
    path: '/api/one/:something',

    // route name='use', path='/api/', route=''
    use: function use(req, res, next) {
        console.log('>> api.js USE >>', req.params)
        // No terminating function in this middleware and so `next()` is REQUIRED
        next()
    },

    // route name='bound dispach', path='/api/', route='get:/^\/?$/i'
    get: function get(req, res, next) {
        // This is a terminating function because it returns data and a completion code back to the browser
        res.send('Woo Hoo')
        // But this is still run
        console.log('>> api.js GET >>', req.params)
        // However, this is not really needed - but it doesn't hurt to include it for safety.
        next()
    },

}
```

### A second API file with duplicate functions but a different path property

This example, will load the same `use` and `get` functions from the previous example onto a different path.
In this case onto `http://1.2.3.4:1880/test1/api`.

Assuming the `api1.js` file from the previous example.

`api2.js`

```js
const api1 = require('./api')

// Replace the path only
api1.path = '/api'

module.exports = api1
```

### Using the `apiSetup` function

```js
/** Example uibuilder instance API file with custom apiSetup()
 */
'use strict'

let uibNode, uibMaster

module.exports = {
    // Must be a valid ExpressJS URI path. It will be appended to the instance URL.
    path: '/api/three/',

    // This captures the node object and the uib master object
    apiSetup(node, uib) {
        //console.log('>> apiSetup >>', node.url, '>> node >>', node, '>> uib >>', uib, '<<<<')
        uibNode = node
        uibMaster = uib
    },

    // This displays some info from the captured objects & perhaps shows how dangerous
    // this could be if used incautiously.
    // route name='bound dispach', path='/api/three/', route='get:/^\/?$/i'
    get: function get(req, res, next) {
        let contexts = Object.keys(uibMaster.RED.settings.contextStorage)
        contexts = contexts.join(', ')

        res.send(
            `
            <div>
              Node ID: ${uibNode.id}, <br>
              uibuilder root path: ${uibMaster.nodeRoot}, <br>
              Node-RED context stores: [${contexts}]
            </div>
            <h2>Node-RED Settings</h2>
            <pre><code>${JSON.stringify(uibMaster.RED.settings)}</code></pre>
            `
        )

        console.log('>> api3.js GET >>', req.params)
        next()
    },

}
```
