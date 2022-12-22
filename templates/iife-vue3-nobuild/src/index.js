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
            const lastMsgRecvd = this.lastMsgRecvd
            if (typeof lastMsgRecvd === 'string') return 'Last Message Received = ' + lastMsgRecvd
            return 'Last Message Received = ' + uibuilder.syntaxHighlight(lastMsgRecvd)
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
