// @ts-nocheck

import '../uibuilder/uibuilder.esm.min.js'  // Adds `uibuilder` and `$` to globals

// For Vue v3
// import { createApp } from '../uibuilder/vendor/vue/dist/vue.esm-browser.js' // Dev ver local install. Chg to .prod.js for prod
import { createApp } from 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js' // As above but loaded remotely

// Import the custom component directly (Note that it is a .js file, not a .vue file)
import MyComponent from './mycomponent.js'

// Using the Vue options API style for beginner simplicity
// No need to pre-define Quasar's $q when working with the options API
const app = createApp({
    // Define Vue reactive variables
    data() { return {

        message: 'Hello Vue!',
        count: 0,
        input1: '',

    } },

    components: {
        mycomponent: MyComponent
    },

    // Dynamic data
    computed: {},

    // Supporting functions
    methods: {

        // Use the uib helper function to send something to NR
        doEvent(event) { uibuilder.eventSend(event) },

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
