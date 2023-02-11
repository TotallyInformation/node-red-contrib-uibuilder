// @ts-nocheck
'use strict'

/** Simple example of using the uibuilder IIFE client build
 *  with Vue and bootstrap-vue.
 *
 * Note that uibuilder.start() should no longer be needed.
 * See the docs if the client doesn't start on its own.
 */

// logLevel 2+ shows more built-in logging. 0=error,1=warn,2=info,3=log,4=debug,5=trace.
// uibuilder.set('logLevel', 2)
// uibuilder.log('info', 'a prefix', 'some info', {any:'data',life:42})

const app = new Vue({ // eslint-disable-line no-unused-vars
    el: '#app',

    data() { return {

        startMsg: 'Vue has started, waiting for messages',
        feVersion: '',
        counterBtn: 0,
        inputText: null,
        inputChkBox: false,
        imgProps: { width: 75, height: 75 },

        msgRecvd: '[Nothing]',
        msgsReceived: 0,

        msgSent: '[Nothing]',
        msgsSent: 0,

    } }, // --- End of data --- //

    computed: {

        hLastRcvd: function() {
            const msgRecvd = this.msgRecvd
            if (typeof msgRecvd === 'string') return 'Last Message Received = ' + msgRecvd
            return 'Last Message Received = ' + this.syntaxHighlight(msgRecvd)
        },
        hLastSent: function() {
            const msgSent = this.msgSent
            if (typeof msgSent === 'string') return 'Last Message Sent = ' + msgSent
            return 'Last Message Sent = ' + this.syntaxHighlight(msgSent)
        },

    }, // --- End of computed --- //

    methods: {

        // Called from the increment button - sends a msg to Node-RED
        increment: function(event) {
            console.log('Button Pressed. Event Data: ', event)

            // Increment the count by one
            this.counterBtn += 1
            const topic = this.msgRecvd.topic || 'uibuilder/vue'
            uibuilder.send( {
                'topic': topic,
                'payload': {
                    'type': 'counterBtn',
                    'btnCount': this.counterBtn,
                    'message': this.inputText,
                    'inputChkBox': this.inputChkBox
                }
            } )

        }, // --- End of increment --- //

        // REALLY Simple method to return DOM events back to Node-RED. See the 2nd b-button on the default html
        doEvent: (event) => uibuilder.eventSend(event),

        // return formatted HTML version of JSON object - No longer need custom code as now built into uibuilder client
        syntaxHighlight: uibuilder.syntaxHighlight,

        /** Workaround to show "toast" notifications dynamically using bootstrap-vue's toast notifications.
         * This overrides uibuilder's default notification overlay which needs one of the uib CSS files.
         * @param {object} msg msg from Node-RED
         */
        showToast: function(msg) {
            // Only works with global notification msg's
            if ( !(msg._uib && msg._uib.componentRef && msg._uib.componentRef === 'globalNotification') ) return

            // Is bootstrap-vue loaded? If not, show error
            if (!window['BootstrapVue']) {
                uibuilder.log('error', 'showToast Method', 'Bootstrap-vue not loaded, cannot show toast notification')
                return
            }

            const options = Object.assign({}, msg._uib.options)

            // $createElement is a Vue function that lets you create Vue virtual DOM
            // elements. We use it here to let us render HTML in the toast.
            const h = this.$createElement
            // Assume that the input content is or could be HTML. create a virtual DOM element
            const vNodesContent = h(
                'p', {
                    domProps: {
                        innerHTML: options.content
                    }
                }
            )

            // The title is also allowed to have HTML
            if ( options.title ) {
                options.title = h(
                    'p', {
                        domProps: {
                            innerHTML: options.title
                        }
                    }
                )
            }

            if (options.variant === 'error') options.variant = 'danger'
            if (options.variant === 'warn') options.variant = 'warning'
            if (!options.solid) options.solid = true

            // Dynamically insert the toast to the virtual DOM
            // Will show at top-right of the HTML element that is the app root
            // unless you include a <b-toaster> element
            this.$bvToast.toast(vNodesContent, options)
        },

    }, // --- End of methods --- //

    // Available hooks: beforeCreate,created,beforeMount,mounted,beforeUpdate,updated,beforeDestroy,destroyed, activated,deactivated, errorCaptured

    /** Called after the Vue app has been created. A good place to put startup code */
    created: function() {

        // Example of retrieving data from uibuilder
        this.feVersion = uibuilder.get('version')

        // If msg changes - msg is updated when a standard msg is received from Node-RED over Socket.IO
        uibuilder.onChange('msg', (msg) => {
            this.msgRecvd = msg
            this.msgsReceived = uibuilder.get('msgsReceived')

            // Workaround to show "toast" notifications dynamically. See methods above.
            this.showToast(msg)
        })

        /** If a message is sent back to Node-RED, we can grab a copy here if we want to. Useful for debugging. */
        uibuilder.onChange('sentMsg', (msg) => {
            // console.info('[indexjs:uibuilder.onChange:sentMsg] msg sent to Node-RED server:', msg)
            this.msgSent = msg
            this.msgsSent = uibuilder.get('msgsSent')
        })

    }, // --- End of created hook --- //

}) // --- End of app1 --- //

// EOF
