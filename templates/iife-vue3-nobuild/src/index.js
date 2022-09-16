// @ts-nocheck
'use strict'

const { createApp } = Vue

// Using the Vue options API style for beginner simplicity
// No need to pre-define Quasar's $q when working with the options API
const app = createApp({
    // Define Vue reactive variables
    data() { return {

        message: 'Hello Vue!',
        count: 0,
        lastMsgRecvd: '[Nothing]',
        input1: '',
        
    } },

    // Dynamic data
    computed: {

        // This is auto-recalculated by Vue when lastMsgRecvd changes
        formatLastRcvd() {
            let lastMsgRecvd = this.lastMsgRecvd
            if (typeof lastMsgRecvd === 'string') return 'Last Message Received = ' + lastMsgRecvd
            return 'Last Message Received = ' + this.syntaxHighlight(lastMsgRecvd)
        },

    },

    // Supporting functions
    methods: {

        // Use the uib helper function to send something to NR
        doEvent(event) { uibuilder.eventSend(event) },

        /** Runs when the change event for the source field is fired
         * @param {InputEvent} event The event object is passed by the browser automatically
         */
        doInputChange(event) {
            console.log('input1 text has changed: ', event.target.value )
            // Send the new text to Node-RED
            uibuilder.send({
                'topic': 'input1-changed',
                'payload': event.target.value,
            })
        },

        // return formatted HTML version of JSON object
        syntaxHighlight: function(json) {
            json = JSON.stringify(json, undefined, 4)
            json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            json = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                let cls = 'number'
                if ((/^"/).test(match)) {
                    if ((/:$/).test(match)) {
                        cls = 'key'
                    } else {
                        cls = 'string'
                    }
                } else if ((/true|false/).test(match)) {
                    cls = 'boolean'
                } else if ((/null/).test(match)) {
                    cls = 'null'
                }
                return '<span class="' + cls + '">' + match + '</span>'
            })
            return json
        }, // --- End of syntaxHighlight --- //

    },

    // Lifecycle hooks
    mounted() {
        // If msg changes - msg is updated when a standard msg is received from Node-RED
        uibuilder.onChange('msg', (msg) => {
            console.log('>> msg recvd >>', msg, this)
            this.lastMsgRecvd = msg
        })
    },
})

app.mount('#app')
