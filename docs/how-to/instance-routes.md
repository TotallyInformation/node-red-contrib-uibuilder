---
title: Instance-specific Routes
description: >
   How to make ExpressJS routes for an individual instance of a uibuilder node.
created: 2023-05-07 13:27:12
lastUpdated: 2023-05-07 13:27:17
---

## Summary

* Create a `routes` sub-folder in the `<instanceRoot>` folder.
* Add one or more `.js` files that export route definitions.
* Restart Node-RED after changing route definitions.

## Why would I use an instance route?

uibuilder natively provides dynamic, data-driven web pages using data sent from Node-RED over websockets. It also has always let you tweak the Express web server settings and even use a custom Express web server (separate to the normally used Node-RED one). That lets you define all manner of middleware to be applied to all uibuilder instances. Sometimes, however, you may wish to have a single instance of Node-RED providing multiple web endpoints, each with unique capabilities. This is what instance routes allow.

Here is a list of some of the things you may find instance routes useful for - it is not exhaustive:

* Add specific url sub-paths defined by code instead of static pages
* Custom logging
* Authentication
* Authorisation
* Add common elements to web pages (e.g. a footer)
* Add instance-specific HTTP headers

## Route js file schema

> [!NOTE]
>
> Instance routes are constrained to the instance url. e.g. if your uibuilder node has its
> url defined as `test`, a path defined as `/foo` would be `/test/foo`.
>
> If your paths don't appear to be working - make sure that they:
> * start with a leading `'/xxx'` for string paths.
> * Are anchored to the start for regex paths: `/^\/xxxxx/`.
> 
> See https://github.com/pillarjs/path-to-regexp for detailed help with ExpressJS string paths
 
Each object in the export becomes a new defined route.

Each route is applied in order. Routes can overlap.

Each object in the export object must contain `method`, `path` and `callback` named properties.

* `method`: Any method recognised by Express.js - e.g. use, all, get, put, post, delete, etc.
* `path`: A string or regular expression Express.js path
* `callback`: Must be EITHER a function OR an *array of* functions.

If you have overlapping routes, don't forget that the next callback will NOT be called unless you include a call to `next()`. In particular, if you want a common error handler, don't forget to pass an error object: `next(err)`.

If your routes are not working, check the Node-RED log for errors. Errors in route files will prevent them from being loaded and used but do not crash Node-RED.

```javascript
/** Example uibuilder instance route file */

// Anything defined outside the export is available to this module
// but is NOT available to uibuilder.
// You could, for example have your PassportJS and user database lookups
// defined here.

// If you need another Node.js package such as PassportJS, it must be installed
// to the instance root folder (e.g. 1 level above where your front-end source code lives)

module.exports = {

    // It does not matter what name you give here except that it must be unique within the export
    all: {
        // method `all` or `use` will be applied to all methods for the path
        method: 'all',
        // String paths can have wildcards
        path: '/*',
        callback: function testroute(req, res, next) {
            console.log('CUSTOM ALL WILDCARD', req.params)
            next()
        },
    },

    testroute: {
        method: 'all',
        // String paths can have parameters
        path: '/testroute/:thing',
        callback: function testroute(req, res, next) {
            console.log('uibuilder /iife-client-tests/testroute', req.params)
            // This will fall through to the next overlapping route ...
            next()
            // ... but it will output a response
            res.statusMessage = 'testroute success'
            res.status(200).json( {params: req.params, query: req.query, body: req.body} )
            // which means that the next callback cannot provide a response itself
        },
    },

    // This route overlaps with the previous one
    testroute2: {
        method: 'get',
        // Paths can be regular expressions
        path: /^\/testroute\/what/,
        // Note that this is an array - array's of functions are handled.
        callback: [function testroute(req, res, next) {
            console.log('uibuilder /iife-client-tests/testroute/what')
            next()
            // You cannot return another response in an overlapping route because ExpressJS
            // has already sent the headers.
            // This route overlaps with the previous one.

            // res.status(200).json( {params: req.params, query: req.query, body: req.body} )
        }],
    },
}
```

See the [Express.js Router documentation](https://expressjs.com/en/4x/api.html#router) for more details about defining routes, their paths and callbacks.

## Paths

TBC

## Redirections

TBC

## Server-side rendering

You can, of course, return all manner of data types in a callback response. Including HTML, JSON, images, etc. However, ExpressJS views cannot be configured for specific routes so you cannot easily use uibuilder's optional EJS views unless you are happy to make them available to all instances of uibuilder (not a problem if you are only using a single uibuilder node of course).

Instead, you can install a render engine such as EJS, Jade, etc to your instance root folder can all it manually from your callback function.
