<script>
	import { onMount } from 'svelte'

	export let uibsend
	export let nrMsg = ''
	export let myGreeting = 'Hello there from App.svelte!'
	// Defined in main.js
	export let anotherProp


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

    onMount(() => {
        uibuilder.start()

		uibsend = uibuilder.eventSend

        uibuilder.onChange('msg', function(msg){
            console.info('msg received from Node-RED server:', msg)
            nrMsg = syntaxHighlight(msg)
			if ( msg.greeting ) myGreeting = msg.greeting
        })

    }) // --- End of onMount --- //

</script>

<main>
	<h1>Svelte + uibuilder</h1>

	<p>{myGreeting}</p>
	<p>{anotherProp}</p>

	<button on:click={uibsend} data-greeting="{myGreeting}" data-something="this is something">
		Click Me
	</button>
</main>
<pre id="msg" class="syntax-highlight">{@html nrMsg}</pre>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 720px;
		margin: 0 auto;
	}

	main > h1 {
		/* Assumes you've loaded ./uib-styles.css */
		color: rgb(var(--uib-color-primary));
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	main > p {
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