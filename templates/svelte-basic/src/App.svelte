<main>
	<h1>Svelte + uibuilder</h1>
	<h1 class="with-subtitle">uibuilder + Svelte</h1>
    <div role="doc-subtitle">Using the IIFE library - v6.1.0.</div>

	<div id="more"><!-- '#more' is used as a parent for dynamic HTML content in examples --></div>

	<p title="A dynamic greeting that can be update using a msg from Node-RED">{myGreeting}</p>
	<p title="Some other dynamic property that main.js might update">{anotherProp}</p>

	<!-- A form is an easy way to input data to send to Node-RED -->
	<form>
		<div>
			This is a form element, it is an easy way to get input and send it back to Node-RED.
		</div>

		<div><!-- Accessible form element -->
			<label for="quickMsg">Quick Message:</label>
			<!-- onchange is optional, it saves the previous value of the field -->
			<input id="quickMsg" value="A message from the browser" onchange="this.uib_newValue = this.value" onfocus="this.uib_oldValue = this.value">
		</div>

		<div>
			<!-- Send data back to Node-RED the simple way - automatically includes the form's inputs,
				`data-*` attributes, keyboard modifiers, etc. Also works with other event types. -->
			<!-- <button onclick="uibuilder.eventSend(event)" data-type="eventSend" data-foo="Bah">eventSend</button> -->
			<button on:click={uibsend} data-greeting="{myGreeting}"  data-type="eventSend" data-foo="Bah" 
					title="Uses the uibuilder.eventSend fn and sents both static and dynamic data back to Node-RED">
				eventSend
			</button>
		</div>
	</form>

	<!-- Another way to send custom data back to Node-RED. fnSendToNR is defined in index.js,
		it uses the standard `uibuilder.send` function -->
	<!-- <button onclick="fnSendToNR('A message from the sharp end!')">Send a custom msg back to Node-RED</button> -->
	<button on:click={ e => sendToNR('A message from the sharp end!') }>Send a msg back to Node-RED</button>


	<div id="more"><!-- '#more' is used as a parent for dynamic HTML content in examples --></div>	 
</main>

<!-- <pre id="msg" class="syntax-highlight" title="Uses @html because nrMsg contains html highlights">{@html nrMsg}</pre> -->

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
	 * This app is based on the sveltejs/template package and the uibuilder simple IIFE template.
	 * logLevel and showMsg can be controlled from Node-RED instead of here if preferred.
	 */

	// import { onMount } from 'svelte'

	//#region ---- These are "props" - variables that can be used in a parent component when mounting this component & used in the UI ----
	// Exported function props - only need to export fns if you want to use them outside this file
	export let uibsend
	export let sendToNR
	// Exported data props
	export let myGreeting = 'Hello there from App.svelte! Send me a msg containing msg.greeting to replace this text.'
	// Defined in main.js
	export let anotherProp = '--'
	//#endregion ---- ---- ----
	
	// logLevel 2+ shows more built-in logging. 0=error,1=warn,2=info,3=log,4=debug,5=trace.
	// uibuilder.set('logLevel', 2) // uibuilder.set('logLevel', 'info')
	// Using the log output yourself:
	// uibuilder.log('info', 'a prefix', 'some info', {any:'data',life:42})

	// Show the latest incoming msg from Node-RED
	uibuilder.showMsg(true, 'body')

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
		// Update the greeting if present in the msg
		if ( msg.greeting ) myGreeting = msg.greeting
	})

</script>
