After a recent announcement about the use of Svelte, it looked interesting enough to see how easy it might be to use with uibuilder.

As it happens - pretty easy :grin: 

1) Create a new uibuilder instance and change the url to `svelte` (or whatever you want). Click on Deploy.
2) Re-open the node's configuration panel and change the "Serve" setting from `src` to `dist` and re-deploy.

3) Open a command line to the instance root folder, e.g. `~/.node-red/uibuilder/svelte`

4) Install the default svelte template with the command `npx degit sveltejs/template . --force`.
   
   **WARNING**: This will overwrite any existing `package.json` and `README.md` files in the instance root folder. So rename those first if you want to retain them. The `src` folder is also updated with `App.svelte` and `main.js` files. A `scripts` folder and `.gitignore`, `rollup.config.js` files are also added.

5) Rename the `public` folder to `dist`.

6) Make some very minor changes to the rollup config: Just change the output file destination from `public/build/bundle.js` to `dist/build/bundle.js` and the line `!production && livereload('public')` to `!production && livereload('dist')`.

7) Change the `dist/index.html` - noting the leading `.` or `..` added to the various resources.

   Note that the html file is simply a template. All of the content is dynamically created.

    ```html
    <!DOCTYPE html><html lang="en"><head>
        <meta charset='utf-8'>
        <meta name='viewport' content='width=device-width,initial-scale=1'>

        <title>Svelte+uibuilder app</title>

        <link rel='icon' type='image/png' href='./favicon.png'>

        <link rel='stylesheet' href='./global.css'>
        <link rel='stylesheet' href='./build/bundle.css'>

        <script defer src="../uibuilder/vendor/socket.io/socket.io.js"></script>
        <script defer src="./uibuilderfe.min.js"></script>
        <script defer src='./build/bundle.js'></script>
    </head><body>
    </body></html>
    ```

    You may also want to add `@import url("./uib-styles.css");` if you want to pick up the default uibuilder styles.

    And in `src/App.svelte`:

    ```html
    <script>
        import { onMount } from 'svelte'

        export let uibsend
        export let nrMsg = ''
        export let myGreeting = 'Hello there!'

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
                nrMsg = msg.payload
            })

        }) // --- End of onMount --- //

    </script>

    <main>
        <h1>Svelte + uibuilder</h1>

        <p>{myGreeting}</p>

        <button on:click={uibsend} data-greeting="{myGreeting}" data-something="this is something">
            Click Me
        </button>
    </main>
    <pre id="msg" class="syntax-highlight">{@html nrMsg}</pre>

    <style>
        main {
            text-align: center;
            padding: 1em;
            max-width: 240px;
            margin: 0 auto;
        }

        main > h1 {
            /* Assumes you've loaded ./uib-styles.css */
            color: rgb(var(--uib-color-primary));
            text-transform: uppercase;
            font-size: 4em;
            font-weight: 100;
        }

        @media (min-width: 640px) {
            main {
                max-width: none;
            }
        }

        pre {
            margin: auto;
            max-width:fit-content;
        }
    </style>
    ```

8) From the instance root folder run the command `npm install && npm run dev`

    Note that the dev process creates its own web server but you should ignore that. Just leave it running if you want to have your web page auto-reload when you make changes to the files in `src`.

9)  Now load the uibuilder page with `http://127.0.0.1:1880/svelte/` (or wherever yours ends up)

   Marvel at the amazing dynamic, data-driven web app you just made!

---

OK, so not the most amazing thing. But lets note a couple of important points.

* Make a change to the text in the `App.svelte` page and save it - notice anything on your web page? 

   Yup, it changed without you having to reload it! Just like Svelte's own dev server :grin: 

* Attach a debug node to the output of your uibuilder node. Make sure it is set to show the whole msg object. Now click on the button on your page. Notice that you get a message just by clicking the button, no code required (other than the HTML for the button itself).

   That uses the new eventSend function in uibuilder v3.2

   Note how the `data-xxxx` attributes are sent back to node-red in the payload, one of which is dynamic thanks to Svelte. Also note that the `msg.uibDomEvent.sourceId` in node-red contains the text of the button. Try adding an id attribute to the button to see what difference it makes.

* Send a msg to the uibuilder node and note how the payload appears on the page

   5 lines of code in total to do that :grin: 

19 lines of actual code for a simple, data-driven web page. Not too bad I think.

---

When I get a chance, I will create a GitHub repository with a uibuilder-specific Svelte template to get rid of some of the above steps.

I will also be adding some features to uibuilder in a future release that will make installing your own (or anyone elses) templates to a uibuilder instance. Also, there will be an `install` and a `build` button. So that most of the above steps will be reduced to a couple of clicks. These changes will help anyone who needs a build step for their web app, not just for Svelte users.