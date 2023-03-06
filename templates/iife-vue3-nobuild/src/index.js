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
        input1: '',

    } },

    // Dynamic data
    computed: {},

    // Supporting functions
    methods: {

        // REALLY Simple method to return DOM events back to Node-RED.
        doEvent: (event) => uibuilder.eventSend(event),

    },

    // Lifecycle hooks
    mounted() {
        // If msg changes - msg is updated when a standard msg is received from Node-RED
        uibuilder.onChange('msg', (msg) => {
            console.log('>> msg recvd >>', msg, this)

            // If the msg.payload is a string, show in on the page
            if (typeof msg.payload === 'string') this.message = msg.payload
        })
    },
})

app.mount('#app')
