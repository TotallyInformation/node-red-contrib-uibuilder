<script>
	/** This .svelte file is the master, top-level App. Use it to define everything else.
	 * It is treated as a module so no need to 'use strict' and you can use the import statement.
	 * This app is based on the sveltejs/template package.
	 */

	import { onMount } from 'svelte'

	// These are "props" - variables that can be used in a parent component when mounting this component & used in the UI
	export let uibsend
	export let nrMsg = ''
	export let myGreeting = 'Hello there from App.svelte!'
	// Defined in main.js
	export let anotherProp = '--'


	/** Simple HTML JSON formatter
	 * @param {json} json The JSON or JS Object to highlight
	 */
	function syntaxHighlight(json) {
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
	} // --- End of syntaxHighlight --- //

	// Only runs when this component is being mounted (e.g. once, when the page is loaded)
    onMount(() => {
		// Start up the uibuilderfe library
        uibuilder.start()

		// A convenient send function that can be wired direct to events - defined as a prop above
		uibsend = uibuilder.eventSend

		// Listen for new messages from Node-RED/uibuilder
        uibuilder.onChange('msg', function(msg){
            console.info('msg received from Node-RED server:', msg)
			// Push an HTML highlighted visualisation of the msg to a prop so we can display it
            nrMsg = syntaxHighlight(msg)
			// Update the greeting if present in the msg
			if ( msg.greeting ) myGreeting = msg.greeting
        })

    }) // --- End of onMount --- //

</script>

<main>
	<h1>Svelte + uibuilder</h1>

	<p title="A dynamic greeting that can be update using a msg from Node-RED">{myGreeting}</p>
	<p title="Some other dynamic property that main.js might update">{anotherProp}</p>

	<button on:click={uibsend} data-greeting="{myGreeting}" data-something="this is something" 
			title="Uses the uibsend fn and sents both static and dynamic data back to Node-RED">
		Click Me
	</button>
</main>
<pre id="msg" class="syntax-highlight" title="Uses @html because nrMsg contains html highlights">{@html nrMsg}</pre>

<style>
	/* These styles will be constrained just to this component by Svelte.
	 * Use the dist/global.css file for any definitions you want shared by all components.
	 *   That is a good place to import uibuilder's uib-styles.css for example.
	 *   If you do, then you can use the CSS variables defined there in here as shown.
	 */
	
	main {
		text-align: center;
		padding: 1em;
		max-width: 720px;
		margin: 0 auto;
	}

	h1 {
		/* Assumes you've loaded ./uib-styles.css */
		color: rgb(var(--uib-color-primary));
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	p {
		text-align: center;
		width: fit-content;
		margin: auto;
	}

	pre {
		margin: auto;
		width: fit-content;
		max-width: 720px;
		overflow-x: auto;
	}
</style>