export default {

    template: `
       <div style="border: 1px solid silver;">
          <p>Ooh, my very own Vue component! No build step was required. 😁</p>
          <p>
            Pressing the button not only increments the counter but also sends the
            data back to Node-RED.
          </p>
          <p>A component counter: {{ count }} <button data-value="0" @click="doEvent">Count</button></p>
       </div>
    `,

    data() {
        return { 
            count: 0,
        }
    },

    // Supporting functions
    methods: {

        // Use the uib helper function to send something to NR
        doEvent(event) {
            // Set the data-value attribute to the new count
            // so that it is sent back to node-red in the msg.payload
            event.target.dataset.value = ++this.count
            
            uibuilder.eventSend(event)
        },

    },
}
