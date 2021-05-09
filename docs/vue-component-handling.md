# Special VueJS component handling in uibuilderfe

Since VueJS is the default framework that is included with the install of uibuilder,
some special features are starting to be built into the uibuilderfe library.

Note that these do not impact the use of uibuilder with other (or no) frameworks
and in those cases, the extra features will do nothing and won't get in the way.

## "Toast" Notifications

This feature allows you to send a msg with standard properties that will result
in a pop-up notification appearing in the front-end user interface.

No front-end code is required for this to work. However, you can also access the feature
from your front-end code should you wish to do so.

This feature requires **`bootstrap-vue`** to be loaded.

See the [Toasts documentation for bootstrap-vue](https://bootstrap-vue.org/docs/components/toast)
and the [Toasts documentation for bootstrap](https://bootstrap-vue.org/docs/components/toast)
for more details in the use of notifications.

Note that toasts will stack so that multiple can be visible.

### Message schema

This is the structure of the `msg` to send through the uibuilder node in Node-RED.

```json
{
    "topic": "Optional. Can be anything",
    "_uib": { // Required
        // This is a pseudo ref, you don't have to actually put it in your HTML
        "componentRef": "globalNotification",
        // Optional.
        "options": {
            "title": "Notification Title", // Optional. String or HTML. Title is not bolded by default, add style or surround with h4 if needed.
            "content": "Optional. A string. Will appear second in the resulting pop-up. Can be HTML.",
            "append": false, // Optional. If TRUE, new notifications are added to the END of the list instead of the start.
            "autoHideDelay": 500, // Optional. If set, must be the number of milliseconds to display the notification. Default is 500ms
            "noAutoHide": true, // Optional. If set to true, the toast will not auto-hide.

            // Other Toasts options may also be included, see the bootstrap-vue and bootstrap documentation for details.
        }
    },
    "payload": "Optional. A string. Will appear first in the resulting pop-up. Can be HTML."
}
```

### Example

```json
{
    "componentRef": "globalNotification",
    "options": {
        "title": "<h4>Notification <u>Title</u></h4>",
        "content": "<span style='color:red;background-color:yellow;'>Optional</span>. A string. Will appear second in the resulting pop-up. Can be HTML.",
        "noAutoHide": true
    }
}
```

## Discover a Vue components capabilities

This allows you to send a msg from Node-RED that results in an output msg showing what
properties can be set or controlled in the specified Vue component. This information
can then be used to craft messages for the next feature.

### Message schema

```json
{
    "topic": "Optional. Can be anything",
    // Required
    "_uib": {
        "requestDetails": true,    // Required.
        "componentRef": "refName", // The ref attribute on the component instance to target
    }
}
```

## Control Vue components direct from a Node-RED message

Instead of the [following feature](#alternative-no-code-solution), it is better to make use of the following native VueJS features. 
However they do require a little more code.

* `v-bind` object
* Dynamic components

### `v-bind="objAllProps"`

Using the v-bind attribute lets you pass a single JavaScript object who's properties map to the props
supported by the component. This lets you keep your HTML super-simple while letting Node-RED do the heavy lifting.

Also note that you can [add arbitrary attributes](https://vuejs.org/v2/guide/components-props.html#Non-Prop-Attributes) to the rendered component this way.

See [Passing the Properties of an Object](https://vuejs.org/v2/guide/components-props.html#Passing-the-Properties-of-an-Object) in the VueJS docs for more details.

I will try to add a uibuilder function to make this simpler in a future release.

#### Example

##### HTML

```html
<!doctype html><html lang="en"><head>
    <link type="text/css" rel="stylesheet" href="../uibuilder/vendor/bootstrap/dist/css/bootstrap.min.css" />
    <link type="text/css" rel="stylesheet" href="../uibuilder/vendor/bootstrap-vue/dist/bootstrap-vue.css" />    
    <link type="text/css" rel="stylesheet" href="./index.css" media="all">
</head><body>

    <div id="app">
        <!-- Note the use of the raw v-bind. alert1props has to be an Object with prop names matching the component props -->
        <b-alert ref="alert1" v-bind="alert1props">Default Alert</b-alert>
    </div>

    <!-- Dev versions, please use minimised versions for production use -->
    <script src="../uibuilder/vendor/socket.io/socket.io.js"></script>
    <script src="../uibuilder/vendor/vue/dist/vue.js"></script> <!-- dev version with component compiler -->
    <script src="../uibuilder/vendor/bootstrap-vue/dist/bootstrap-vue.js"></script>
    <script src="./uibuilderfe.js"></script>
    <script src="./index.js"></script>

</body></html>
```

##### JavaScript

```javascript
new Vue({
    el: '#app',
    data: {
        alert1props : {},
    },
    created: function() {
        uibuilder.start()
        // Use the following syntax if you want to use uibuilder's Vue extensions (see the no-code solution)
        //uibuilder.start(this) // Single param passing vue app to allow uibuilder Vue extensions to be used.
    },  // --- End of created hook --- //

    mounted: function(){
        self = this  // Keep a reference to `this` in case we need it for more complex functions

        // Handle incoming messages from Node-RED
        uibuilder.onChange('msg', function(msg){
            if ( msg.topic === 'alert1props' ) {
                // Make sure we can handle new as well as updated properties
                Object.keys(msg.payload).forEach( key => {
                    // Make sure that even new properties are reactive
                    vueApp.$set(vueApp.alert1props, key, msg.payload[key])
                })
            }
        })
    } // --- End of mounted hook --- //

}) // --- End of app1 --- //
```

##### Msg

```json
{
    "topic": "alert1props",
    "payload": {
        "show": true,
        "variant": "primary",
        // Adds an extra attribute to the resulting HTML
        "title": "Hover over the alert area to see this"
    }
}
```

### Dynamically change components

Using the VueJS native `<component>` component, you can specify the template component to be rendered at runtime and can dynamically change the template.

See [Dynamic Components](https://vuejs.org/v2/guide/components.html#Dynamic-Components) in the VueJS docs for more details.



### Alternative no-code solution

**WARNINGS**: 

* Does **NOT** work with all Vue components - See the experimental module [uibuilder-vuejs-component-extras](https://github.com/TotallyInformation/uibuilder-vuejs-component-extras) for some example components that do work.
* This only works if you have **NOT** specified `v-bind="someObj"` in the HTML.
* It generates `[Vue warn]` messages in development mode as we are doing things that Vue doesn't really like.
* It most likely has edge-cases that will error. Please raise as issues if you find any.

This feature allows you to send a msg from Node-RED to uibuilder that is received in
the front-end and passed directly to a component instance.

No front-end code is required for this other than adding a `ref` attribute to the
component instance and changing `uibuilder.start()` to `uibuilder.start(this)`

### Message schema

```json
{
    "topic": "Optional. Can be anything",
    // Required
    "_uib": {
        // Required. The ref attribute on the component instance to target
        "componentRef": "refName",
    }
}
```
