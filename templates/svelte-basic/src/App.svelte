<main>
	<h1>Svelte + uibuilder</h1>

	<p title="A dynamic greeting that can be update using a msg from Node-RED">{myGreeting}</p>
	<p title="Some other dynamic property that main.js might update">{anotherProp}</p>

	<div id="more"><!-- '#more' is used as a parent for dynamic HTML content in examples --></div>

	<!-- Two different ways to send data back to Node-RED via buttons.
		fnSendToNR uses standard `uibuilder.send`.
		eventSend includes `data-*` attributes, keyb modifiers, etc. Works with any event. -->
	<button on:click={ e => sendToNR('A message from the sharp end!') }>Send a msg back to Node-RED</button>
	<button on:click={uibsend} data-greeting="{myGreeting}"  data-type="eventSend" data-foo="Bah" 
			title="Uses the uibuilder.eventSend fn and sents both static and dynamic data back to Node-RED">
			eventSend
	</button>	 
</main>

<pre id="msg" class="syntax-highlight" title="Uses @html because nrMsg contains html highlights">{@html nrMsg}</pre>

<style>
	/* These styles will be constrained just to this component by Svelte.
	 * Use the dist/global.css file for any definitions you want shared by all components.
	 *   That is a good place to import uibuilder's uib-styles.css for example.
	 *   If you do, then you can use the CSS variables defined there in here as well.
	 */
</style>

<script>
	// @ts-nocheck
	// NOTE: uibuilder.start() is not needed when using the new client builds - even when using Svelte's standard for the dev server.
	
	/** This .svelte file is the master, top-level App. Use it to define everything else.
	 * It is treated as a module so no need to 'use strict' and you can use the import statement.
	 * This app is based on the sveltejs/template package.
	 */

	// import { onMount } from 'svelte'

	//#region ---- These are "props" - variables that can be used in a parent component when mounting this component & used in the UI ----
	// Exported function props - only need to export fns if you want to use them outside this file
	export let uibsend
	export let sendToNR
	// Exported data props
	export let nrMsg = ''
	export let myGreeting = 'Hello there from App.svelte! Send me a msg containing msg.greeting to replace this text.'
	// Defined in main.js
	export let anotherProp = '--'
	//#endregion ---- ---- ----
	
	// A global helper function to send a message back to Node-RED using the standard uibuilder send function
	sendToNR = function fnSendToNR(payload) {
		uibuilder.send({
			'topic': 'msg-from-uibuilder-front-end',
			'payload': payload,
		})
	}

	// A convenient global send function that can be wired direct to events - defined as a prop above
	// Has to bind to the correct `this` object and send the hidden `event` property
	uibsend = uibuilder.eventSend.bind(uibuilder)

	// Listen for new messages from Node-RED/uibuilder
	uibuilder.onChange('msg', (msg) => {
		// Push an HTML highlighted visualisation of the msg to a prop so we can display it
		nrMsg = uibuilder.syntaxHighlight(msg)
		
		// Update the greeting if present in the msg
		if ( msg.greeting ) myGreeting = msg.greeting
	})

</script>
