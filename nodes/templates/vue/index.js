/*global document,Vue,window,uibuilder */
// @ts-nocheck
/*
  Copyright (c) 2019 Julian Knight (Totally Information)

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

/** @see https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Front-End-Library---available-properties-and-methods */

const app1 = new Vue({
    el: '#app',
    data: {
        startMsg    : 'Vue has started, waiting for messages',
        feVersion   : '',
        counterBtn  : 0,
        msgsReceived: 0,
        msgsControl : 0,
        msgsSent    : 0,
        msgRecvd    : '[Nothing]',
        msgSent     : '[Nothing]',
        msgCtrl     : '[Nothing]',
        inputText   : ''
    }, // --- End of data --- //
    computed: {
        hLastRcvd: function() {
            const msgRecvd = this.msgRecvd
            if (typeof msgRecvd === 'string') return 'Last Message Received = ' + msgRecvd
            else return 'Last Message Received = ' + this.syntaxHighlight(msgRecvd)
        },
        hLastSent: function() {
            const msgSent = this.msgSent
            if (typeof msgSent === 'string') return 'Last Message Sent = ' + msgSent
            else return 'Last Message Sent = ' + this.syntaxHighlight(msgSent)
        },
        hMsgCtrl: function() {
            const msgCtrl = this.msgCtrl
            if (typeof msgCtrl === 'string') return 'Last Message Sent = ' + msgCtrl
            //else return 'Last Message Sent = ' + this.callMethod('syntaxHighlight', [msgCtrl])
            else return 'Last Message Sent = ' + JSON.stringify(msgCtrl)
        }
    }, // --- End of computed --- //
    methods: {
        increment: function() {
            // Increment the count by one
            this.counterBtn = this.counterBtn + 1
            let topic = this.msgRecvd.topic || 'uibuilder/vue'
            uibuilder.send( { 'topic': topic, 'payload': { 'type': 'counterBtn', 'btnCount': this.counterBtn, 'message': this.inputText } } )
        },
        // return formatted HTML version of JSON object
        syntaxHighlight: function(json) {
            json = JSON.stringify(json, undefined, 4)
            json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                var cls = 'number'
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'key'
                    } else {
                        cls = 'string'
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'boolean'
                } else if (/null/.test(match)) {
                    cls = 'null'
                }
                return '<span class="' + cls + '">' + match + '</span>'
            })
        } // --- End of syntaxHighlight --- //
    }, // --- End of methods --- //

    // Available hooks: init,mounted,updated,destroyed
    mounted: function(){
        console.debug('[Vue.mounted] app mounted - setting up uibuilder watchers')

        var vueApp = this

        vueApp.feVersion = uibuilder.get('version')

        // If msg changes - msg is updated when a standard msg is received from Node-RED over Socket.IO
        // Note that you can also listen for 'msgsReceived' as they are updated at the same time
        // but newVal relates to the attribute being listened to.
        uibuilder.onChange('msg', function(newVal){
            console.info('[uibuilder.onChange] property msg changed!', newVal)
            vueApp.msgRecvd = newVal
        })
        // As noted, we could get the msg here too
        uibuilder.onChange('msgsReceived', function(newVal){
            console.info('[uibuilder.onChange] New msg sent FROM Node-RED over Socket.IO. Total Count: ', newVal)
            vueApp.msgsReceived = newVal
        })

        // If a message is sent back to Node-RED
        uibuilder.onChange('sentMsg', function(newVal){
            console.info('[uibuilder.onChange] property sentMsg changed!', newVal)
            vueApp.msgSent = newVal
        })
        uibuilder.onChange('msgsSent', function(newVal){
            console.info('[uibuilder.onChange] New msg sent TO Node-RED over Socket.IO. Total Count: ', newVal)
            vueApp.msgsSent = newVal
        })

        // If we receive a control message from Node-RED
        uibuilder.onChange('ctrlMsg', function(newVal){
            console.info('[uibuilder.onChange] property msgCtrl changed!', newVal)
            vueApp.msgCtrl = newVal
        })
        uibuilder.onChange('msgsCtrl', function(newVal){
            console.info('[uibuilder.onChange] New CONTROL msg sent FROM Node-RED over Socket.IO. Total Count: ', newVal)
            vueApp.msgsControl = newVal
        })

        // If Socket.IO connects/disconnects
        uibuilder.onChange('ioConnected', function(newVal){
            console.info('[uibuilder.onChange] Socket.IO Connection Status Changed: ', newVal)
            vueApp.socketConnectedState = newVal
        })

    } // --- End of mounted hook --- //

}) // --- End of app1 --- //

// EOF