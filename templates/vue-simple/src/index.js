/* jshint browser: true, esversion: 5, asi: true */
/*globals Vue, uibuilder */
// @ts-nocheck
/*
  Copyright (c) 2021 Julian Knight (Totally Information)

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
'use strict'

/** @see https://totallyinformation.github.io/node-red-contrib-uibuilder/#/front-end-library */

// eslint-disable-next-line no-unused-vars
const app = new Vue({
    el: '#app',
    data() { return {

        lastMsg    : '[Nothing]',

    }}, // --- End of data --- //

    computed: {

        /** Show the last msg from Node-RED nicely formatted */
        showLastReceivedMsg: function() {
            var lastMsg = this.lastMsg
            if (typeof lastMsg === 'string') return 'Last Message Received = ' + lastMsg
            else return 'Last Message Received = ' + this.syntaxHighlight(lastMsg)
        },

    }, // --- End of computed --- //

    methods: {

        // return formatted HTML version of JSON object
        syntaxHighlight: function(json) {
            json = JSON.stringify(json, undefined, 4)
            json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            json = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
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
            return json
        }, // --- End of syntaxHighlight --- //

    }, // --- End of methods --- //

    /** Called after the Vue app has been created. A good place to put startup code */
    created: function() {

        uibuilder.start(this) // Single param passing vue app to allow Vue extensions to be used.

    }, // --- End of created hook --- //

    /** Called once all Vue component instances have been loaded and the virtual DOM built */
    mounted: function(){

        const app = this  // Reference to `this` in case we need it for more complex functions

        // If msg changes - msg is updated when a standard msg is received from Node-RED
        uibuilder.onChange('msg', function(msg){
            app.lastMsg = msg
        })

    }, // --- End of mounted hook --- //

}) // --- End of app definition --- //

// EOF