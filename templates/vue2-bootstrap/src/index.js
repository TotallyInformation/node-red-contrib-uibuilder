// @ts-nocheck
'use strict'

/** Simple example of using the uibuilder IIFE client build
 *  with Vue and bootstrap-vue.
 *
 * Note that uibuilder.start() should no longer be needed.
 * See the docs if the client doesn't start on its own.
 */

const app = new Vue({ // eslint-disable-line no-unused-vars
    el: '#app',

    data() { return {
        // Add reactive data variables here

        counterBtn: 0,
        inputText: null,
        inputChkBox: false,
        imgProps: { width: 75, height: 75 },

    } }, // --- End of data --- //

    methods: {

        // Called from the increment button - sends a msg to Node-RED
        increment: function(event) {
            console.log('Button Pressed. Event Data: ', event)

            // Increment the count by one
            this.counterBtn += 1
            // const topic = this.msgRecvd.topic || 'uibuilder/vue'
            uibuilder.eventSend(event)

        }, // --- End of increment --- //

        // REALLY Simple method to return DOM events back to Node-RED.
        doEvent: (event) => uibuilder.eventSend(event),

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

        // If msg changes - msg is updated when a standard msg is received from Node-RED over Socket.IO
        uibuilder.onChange('msg', (msg) => {

            // Workaround to show "toast" notifications dynamically. See methods above.
            this.showToast(msg)
        })

    }, // --- End of created hook --- //

}) // --- End of app1 --- //

// EOF
