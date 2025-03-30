---
title: Generate input forms from simple input data
description: |
  Turns an array/object of objects into a simple, accessible form.
created: 2023-02-24 16:49:49
lastUpdated: 2023-08-19 17:01:20
updated: 2025-03-29 13:31:09
---

The `uib-element` node, set to the "Simple Form" type, outputs a simple but accessible Form with inputs and buttons. Most HTML features of inputs and forms are supported.

> [!INFO]
> For an overview of form handing with UIBUILDER, please see the [How to handle user input using forms and other input elements](how-to/form-handling.md) document.

## Input data

Set the incoming msg.payload to an Array of Objects. Each array entry will be a new form input or button. An Object of Objects can also be used where the outer object is key'd by the ID of the entry. See below for an example input array showing input properties.

Note that `msg.payload` as the data input can be changed to any msg property, a context variable, manually defined JSON or dynamic JSONata as desired in the node's settings.

### Example input message payload

```json
[
    {
        "id": "r1",
        "type": "text",
        // Optional. Additional highlighting is provided for required inputs.
        "required": false,
        // Optional. `${type}:` will be used if not provided
        "label": "Label for form row 1",
        // Optional. A default value
        "value": "Foo",
        // Optional. Acts as a tooltip
        //   `Type: ${type}` is used if not provided.
        //   `Required. ` is added as prefix if needed.
        "title": "Some helpful text",
        // Optional. `Disabled. ` is added as prefix to the title if needed.
        "disabled": true
        // Other valid input attributes also allowed
        // and are passed through to the input element.
        // Including: pattern, placeholder, readonly, etc
        // See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#attributes
    },
    {
        "id": "r2",
        "type": "range",
        "required": true,
        "label": "Label for form row 1",
        "value": "Foo"
    },
    // Buttons are optional. If not provided, a default pair
    // of buttons - Send and Reset - are added.
    {
        "id": "r3",
        "type": "button",
        "label": "Text on button",
        "value": "Buttons can have values as well"
    }
]
```

## Available input types

Available input types are: `button`, `checkbox`, [`color`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/color), `date`, `detetime-local`, `email`, `hidden`, `month`, `number`, `password`, `radio`, [`range`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range), `select`, `tel`, `text`, `textarea`, `time`, `url`, `week`. See [this explanation of the types and properties](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#input_types) for more details.

Some additional types will be made available in the future: `combo`, `file`, `image`. Auto-complete will also be added eventually.

If a `button` type is included, pressing the button will automatically send a message from the client back to Node-RED All of the form data will be included in that message in `msg._ui.form`. If no button is included, a pair of default buttons will be added to the end of the form: "Send" will use the `eventSend` function to provide details of the form data and its validation state. "Reset" will set all of the inputs back to their default state.

> [!NOTE]
> Buttons send data even if the form inputs are invalid. In that case, the buttons are highlighted with the `--warning` colour but the data is still sent back so that you can process errors in Node-RED flows if you wish to. See the output details below for more information.

Input types and possible attributes can be found on the [MDN Input page](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input).

## Default formatting

Default formatting is provided by the `uib-brand.css` file assuming that you have loaded it. You will find a "forms" section in that file. As normal, colours are set using CSS variables to allow easy overrides. Both light and dark modes are supported.

* The form is horizontally laid out (label to the left, input to the right) if space allows. It collapses to a vertical format on narrow screens.
* Each input is on its own line.
* Required inputs have an "*" shown after the label.
* Valid inputs are outlined in the `--success` colour. Invalid inputs are outlined in the `--failure` colour.
* If the form is invalid (e.g. one of its inputs is invalid), any buttons are given a `--warning` colour.

## Getting form inputs back to Node-RED

As mentioned above, any buttons added to the form (or the default "Send" button) use the `eventSend` function. That function collects all pertinent form data and sends it back to Node-RED. The resulting `msg._ui.form` property contains all of the details. In addition, `msg.payload` is an object containing the values for each input element.

### Example output message

```json
// Example eventSend output (incomplete)
// from a button embedded in a form.
{
    // All of the input element values
    "payload": {
        "r1-text":"FooBah",
        "r6-email-req":""
        // ...
    },
    "_ui": {
        "type":"eventSend",
        "id":"sform1-btn-send",
        "slotText":"Send",
        // Form details
        "form": {
            // Was the form valid? No, because a field was invalid.
            "valid":false,
            "r1-text": {
                "id":"r1-text",
                "name":"r1-text", // Name can be different to ID
                "value":"FooBah",
                // Was the input field valid?
                "valid":true,
                // uib-element forms track the previous value as well
                "data": { "oldValue":"Foo", "newValue":"FooBah" }
            },
            "r6-email-req": {
                "id":"r6-email-req",
                "name":"r6-email-req",
                "value":"",
                // This input is not valid
                "valid":false,
                // This tells us why it isn't valid
                // See: https://developer.mozilla.org/en-US/docs/Web/API/ValidityState
                "validity": {
                    "valueMissing":true
                },
                "data":{}
            },
            // ...
        },
        // Other standard properties
        // ...
    }
    // ...
}
```

## Form element type specifics

Some of the form elements have specific requirements or additional settings. Specific settings are defined in the input message.

Also remember that any property supplied will be turned into an attribute on the corresponding input HTML tag. So any attributes available for that input type should be usable.

### Checkbox

Either the `value` or `checked` properties can be used to pre-set the default.

By default, HTML checkbox inputs do not set the `value` attribute (which is totally mad and inconsistent!). uibuilder sets the `value` attribute for you and also adds some code to each checkbox to ensure that the `value` attribute is always correct. If you use low-code to create your own forms, you should replicate this if you want to use the `uibuilder.eventSend(event)` function.

```json
{
    {
        "id": "r4-check",
        "label": "Checkbox (true/false):",
        "type": "checkbox",
        "value": "false"
    },
    {
        "id": "r5-check",
        "label": "Checkbox selected (true/false):",
        "type": "checkbox",
        "checked": true
    },
}
```

### Range

```json
{
    {
        "id": "r4-range",
        "type": "range",
        "required": false,
        "label": "Range (0-100):",
        "value": "20",
        "min": 0,
        "max": 100
    }
}
```

### Select (drop-down)

> [!NOTE]
> As of uibuilder v6.5.0-Dev, multi-select can be defined but only the first selected option is returned.
> In addition, you cannot currently pre-select multiples.
> Hopefully this will be fixed before v6.5 is released.

When an option is selected, the option's `value` entry is returned, not the label. Except when a value is not specified on an option. In that case, the label is returned.

The `value` property is used to pre-select one of the options. For this to work, the pre-selected option must also have a matching `value` property.

```json
{
    {
        "id": "r6-select",
        "label": "Select (pre-selected option):",
        "type": "select",
        "options": [
            {
                "label": "Option 1",
                "value": "one"
            },
            {
                "label": "Option 2",
                "value": "two"
            },
            {
                "label": "Option 3"
            }
        ],
        "value": "two"
    },
    {
        "id": "r7-select",
        "label": "Select (no pre-selected option, multiple select is true):",
        "type": "select",
        "options": [
            {
                "label": "Option 1a",
                "value": "one a"
            },
            {
                "label": "Option 2a",
                "value": "two a"
            },
            {
                "label": "Option 3a",
                "value": "three a"
            }
        ],
        "multiple": true
    }
}
```
