/* eslint-disable object-shorthand */
// @ts-nocheck

/** Example of using the IIFE build of the uibuilder client library with VueJS v2
 * Note that uibuilder.start() should no longer be needed.
 * See the docs if the client doesn't start on its own.
 */
'use strict'

// eslint-disable-next-line no-unused-vars
const app = new Vue({
    el: '#app',

    data() {
        return {
            // Add reactive data variables here
        }
    }, // --- End of data --- //

    /** Called after the Vue app has been created. A good place to put startup code */
    created: function() {

        // If msg changes - msg is updated when a standard msg is received from Node-RED over Socket.IO
        uibuilder.onChange('msg', (msg) => {
            this.lastMsg = msg

            // Workaround to show "toast" notifications.
            if (msg._uib && msg._uib.componentRef && msg._uib.componentRef === 'globalNotification') {
                this.$bvToast.toast(msg._uib.options.content, msg._uib.options)
                console.log(msg)
            }
        })

    }, // --- End of created hook --- //

}) // --- End of app definition --- //

// EOF
