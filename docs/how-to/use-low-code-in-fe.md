---
title: Define and update elements in the browser using low-code
description: >
   Some front-end code as an example of using UIBUILDER's low-code capabilities in your front-end (browser) code to create an on-screen element dynamically.
   In this case, a single select drop-down box.
created: 2023-11-18 17:38:16
lastUpdated: 2023-11-18 17:38:22
---



```javascript
// Create the outline select element
uib.ui([
    {
        "method":"replace",
        "components": [
            {
                "id":"myselect",
                "type":"select",
                "parent":"#more",
                "position":"last",
                "components": [
                    {
                        "type":"option",
                        "attributes": {"value": null},
                        "slot": 'Waiting for data ...'
                    },
                ],
            },
        ],
    },
])

uib.onChange('msg', (msg) => {
    if (msg.topic === 'doSelect') {
        /** @type {HTMLElement} */
        const mySelectElement = $('#myselect')
        mySelectElement.replaceChildren()
        
        const _ui = {
            method: 'add',
            parent: '#myselect',
            components: [],
        }

        msg.payload.forEach( opt => {
            _ui.components.push({
                type: 'option',
                attributes: {value: opt.value},
                slot: opt.name,
            })
            let newopt = document.createElement("option")
            newopt.value = opt.val
            newopt.innerText = opt.name
            mySelectElement.append(opt)
        })
        console.log('doing', _ui.components, _ui)
        uib.ui(_ui)
    }
})

// Simulate getting msg from node-red
uib.set('msg', {
    topic: 'doSelect',
    payload: [
        {value: 1, name: 'Number 1'},
        {value: 2, name: 'Number 2'},
    ]
})
```

This could, of course be done in a single step but that would probably be less common when doing the processing in the browser like this.

The same approach will also work direct from Node-RED. Simply send the JSON data direct to the uibuilder node.

> [!NOTE]
> This is a copy of [an FAQ in the Node-RED Forum](https://discourse.nodered.org/t/uibuilder-example-create-a-selection-drop-down-using-low-code-configuration/82994).
