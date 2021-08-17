### New

- uibuilder is now able to work on its own webserver instead of using Node-RED's.

  ** The main purpose of this is that it lets you use a reverse proxy to securely expose _only_ uibuilder's endpoints without exposing Node-RED itself.** It also gives you more control over headers and other settings.

  It will still use Node-RED's Admin server but your own front-end code and all of the installed vendor packages and middleware (including Socket.IO) will now use a separate http(s) server and ExpressJS app.

  If you specify https for Node-RED, your custom server will also use https and will automatically pick up the certificate and key files from settings.js.

  **NOTE**: That _all_ instances of uibuilder nodes will all use the same webserver. Allowing multiple servers requires a significant development effort but is on the backlog (just a very long way down).

  To use a different webserver, you have to add the following into the `module.exports` part of your `settings.js` file:

  ```javascript
    /** Custom settings for all uibuilder node instances */
    uibuilder: {
        /** Optional HTTP PORT. 
         * If set and different to Node-RED's uiPort, uibuilder will create
         * a separate webserver for its own use.
         */
        port: process.env.UIBPORT || 3000,
    },
  ```

  Note that the above will let you use an environment variable called `UIBPORT` to set the port. This must be done before starting Node-RED. The port setting is not dynamic.


  # To Do

* Allow custom http(s) settings in settings.js
* Allow custom ExpressJS app settings in settings.js
* Add advanced setting to give the "real" external url for when using proxy.


```js
        /** */
        self.automap4 = function(context, topic, myvar) {
            if ( typeof topic !== 'string' ) {
                console.error('[uibuilder:automap] \'topic\' parameter is not a string. MAPPING NOT APPLIED FOR THIS ENTRY.')
                return false
            }
            if ( ! context.hasOwnProperty(myvar) ) {
                console.error('NO!')
                return
            }
            if ( self.msg.topic === topic ) {
                context[myvar] = self.msg.payload
                console.log(self.msg, context[myvar])
            }
        }
        self.automap3 = function(topic, myvar) {
            if ( typeof topic !== 'string' ) {
                console.error('[uibuilder:automap] \'topic\' parameter is not a string. MAPPING NOT APPLIED FOR THIS ENTRY.')
                return false
            }

            function cb() {
                console.log('topic', topic, 'msg', msg)
                myvar = msg.payload
                console.log('myvar', myvar)
            }

            // Create a msg listener that automatically maps
            return self.onChange('msg', function(msg) {
                if ( msg.topic && msg.topic === topic ) {
                    console.info(`[uibuilder:automap:${topic}:onChange] `, msg)
                    if ( !msg.payload ) {
                        console.warn(`[uibuilder:automap:${topic}:onChange] Incoming msg does not contain a 'payload', cannot assign value.`)
                        return
                    }
                    cb()
                    // try {
                    //     //eval(`${myvar} = ${msg.payload}`)
                    //     Function(`"use strict";${myvar} = ` + msg.payload)();
                    // } catch (e) {
                    //     console.warn(`[uibuilder:automap:${topic}:onChange] Could not assign value. ${e.message}`)
                    // }
                }
            })
        }

        /** Auto-map incoming msg.topic's to variables
         * @param {Object} context The owning context object that the map will be applied to. e.g. a Vue app object or `window` for global vars.
         * @param {Array.<{topic: string, var: string}>} mapArray Array of mapping objects
         * @return {boolean} True if successful else false
         */
        self.automap = function(context, mapArray) {
            // Input check
            if ( ! Array.isArray(mapArray) ){
                console.error('[uibuilder:automap] Input MUST be an array of mapping objects. MAPPING NOT APPLIED')
                return false
            }
            
            mapArray.forEach(function(entry, index){
                // Input checks
                console.log(`i: ${index}, topic: ${entry.topic}, `, entry.var)
                if ( !entry.topic ) {
                    console.error(`[uibuilder:automap] 'topic' property does not exist for map array entry #${index+1}. MAPPING NOT APPLIED FOR THIS ENTRY.`)
                    return false
                }
                if ( !entry.hasOwnProperty('var') ) {
                    console.error(`[uibuilder:automap] 'var' property does not exist for map array entry #${index+1}. MAPPING NOT APPLIED FOR THIS ENTRY.`)
                    return false
                }
                if ( typeof entry.topic !== 'string' ) {
                    console.error(`[uibuilder:automap] 'topic' property is not a string map array entry #${index+1}. MAPPING NOT APPLIED FOR THIS ENTRY.`)
                    return false
                }
                if ( typeof entry.var !== 'string' ) {
                    console.error(`[uibuilder:automap] 'var' property is not a string map array entry #${index+1}. MAPPING NOT APPLIED FOR THIS ENTRY.`)
                    return false
                }

                // Create a msg listener that automatically maps
                // self.onChange('msg', function(msg) {
                //     if ( msg.topic && msg.topic === entry.topic ) {
                //         if ( !msg.payload ) {
                //             console.warn(`[uibuilder:automap:onChange:${index+1}:${entry.topic}] Incoming msg does not contain a 'payload', cannot assign value.`)
                //             return
                //         }
                //         entry.var = msg.payload
                //         console.log('app x: ', app.x)
                //     }
                // })
                if ( self.msg.topic === entry.topic ) {
                    context[entry.var] = self.msg.payload
                    console.log(self.msg, context[entry.var])
                }
            })
        } // --- End of automap() --- //

```