// @ts-nocheck

/** Example of using the IIFE build of the uibuilder client library with VueJS v2
 * Note that uibuilder.start() should no longer be needed.
 * See the Tech docs if the client doesn't start on its own.
 */
'use strict'

// logLevel 2+ shows more built-in logging. 0=error,1=warn,2=info,3=log,4=debug,5=trace.
// uibuilder.set('logLevel', 2)
// uibuilder.log('info', 'a prefix', 'some info', {any:'data',life:42})

// eslint-disable-next-line no-unused-vars
const app = new Vue({
    el: '#app',

    data() { 
        return {

            lastMsg    : '[Nothing]',

        }
}, // --- End of data --- //

    computed: {

        // Show the last msg from Node-RED nicely formatted
        showLastReceivedMsg: function() {
            var lastMsg = this.lastMsg
            if (typeof lastMsg === 'string') return 'Last Message Received = ' + lastMsg
            return 'Last Message Received = ' + this.syntaxHighlight(lastMsg)
        },

    }, // --- End of computed --- //

    methods: {

        // return formatted HTML version of JSON object - No longer need custom code as now built into uibuilder client
        syntaxHighlight: uibuilder.syntaxHighlight,

    }, // --- End of methods --- //

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
