## Members

<dl>
<dt><a href="#logLevel">logLevel</a></dt>
<dd><p>Default log level - Error &amp; Warn</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#Uib">Uib</a></dt>
<dd><p>Define and export the Uib class - note that an instance of the class is also exported in the wrap-up</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#log">log()</a> ΓçÆ <code>function</code></dt>
<dd><p>Custom logging. e.g. log(2, &#39;here:there&#39;, &#39;jiminy&#39;, {fred:&#39;jim&#39;})()</p>
</dd>
<dt><a href="#makeMeAnObject">makeMeAnObject(thing, [property])</a> ΓçÆ <code>object</code></dt>
<dd><p>Makes a null or non-object into an object
If not null, moves &quot;thing&quot; to {payload:thing}</p>
</dd>
<dt><a href="#urlJoin">urlJoin()</a> ΓçÆ <code>string</code></dt>
<dd><p>Joins all arguments as a URL string
see <a href="http://stackoverflow.com/a/28592528/3016654">http://stackoverflow.com/a/28592528/3016654</a>
since v1.0.10, fixed potential double // issue
arguments {string} URL fragments</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#html">html</a> : <code>string</code></dt>
<dd><p>A string containing HTML markup</p>
</dd>
<dt><a href="#ioSetupFromServer">ioSetupFromServer</a> : <code>function</code></dt>
<dd><p>Callback handler for messages from Node-RED
NOTE: <code>this</code> is the class here rather the <code>socket</code> as would be normal since we bind the correct <code>this</code> in the call.
      Use this._socket if needing reference to the socket.</p>
</dd>
</dl>

<a name="logLevel"></a>

## logLevel
Default log level - Error & Warn

**Kind**: global variable  
<a name="Uib"></a>

## Uib
Define and export the Uib class - note that an instance of the class is also exported in the wrap-up

**Kind**: global constant  

* [Uib](#Uib)
    * [.clientId](#Uib+clientId)
    * [.cookies](#Uib+cookies)
    * [.ctrlMsg](#Uib+ctrlMsg)
    * [.ioConnected](#Uib+ioConnected)
    * [.msg](#Uib+msg)
    * [.msgsSent](#Uib+msgsSent)
    * [.msgsReceived](#Uib+msgsReceived)
    * [.msgsSentCtrl](#Uib+msgsSentCtrl)
    * [.msgsCtrlReceived](#Uib+msgsCtrlReceived)
    * [.online](#Uib+online)
    * [.sentCtrlMsg](#Uib+sentCtrlMsg)
    * [.sentMsg](#Uib+sentMsg)
    * [.serverTimeOffset](#Uib+serverTimeOffset)
    * [.socketError](#Uib+socketError)
    * [.originator](#Uib+originator) : <code>string</code>
    * [.topic](#Uib+topic) : <code>string</code> \| <code>undefined</code>
    * [.$](#Uib+$)
    * [.clientId](#Uib+clientId)
    * [.tabId](#Uib+tabId)
    * [.set(prop, val)](#Uib+set) ΓçÆ <code>\*</code> \| <code>undefined</code>
    * [.get(prop)](#Uib+get) ΓçÆ <code>\*</code> \| <code>undefined</code>
    * [.setStore(id, value)](#Uib+setStore) ΓçÆ <code>boolean</code>
    * [.getStore(id)](#Uib+getStore) ΓçÆ <code>\*</code> \| <code>null</code> \| <code>undefined</code>
    * [.removeStore(id)](#Uib+removeStore)
    * [._dispatchCustomEvent(title, details)](#Uib+_dispatchCustomEvent)
    * [.onChange(prop, callback)](#Uib+onChange) ΓçÆ <code>number</code>
    * [.onTopic(topic, callback)](#Uib+onTopic) ΓçÆ <code>number</code>
    * [._checkTimestamp(receivedMsg)](#Uib+_checkTimestamp) ΓçÆ <code>void</code>
    * [.setOriginator([originator])](#Uib+setOriginator)
    * [.setPing(ms)](#Uib+setPing)
    * [.syntaxHighlight(json)](#Uib+syntaxHighlight) ΓçÆ [<code>html</code>](#html)
    * [.ui(json)](#Uib+ui)
    * [.replaceSlot(el, component)](#Uib+replaceSlot)
    * [.replaceSlotMarkdown(el, component)](#Uib+replaceSlotMarkdown)
    * [.loadScriptSrc(url)](#Uib+loadScriptSrc)
    * [.loadStyleSrc(url)](#Uib+loadStyleSrc)
    * [.loadScriptTxt(textFn)](#Uib+loadScriptTxt)
    * [.loadStyleTxt(textFn)](#Uib+loadStyleTxt)
    * [.showDialog(type, ui, [msg])](#Uib+showDialog) ΓçÆ <code>void</code>
    * [.loadui(url)](#Uib+loadui)
    * [._uiComposeComponent(el, comp)](#Uib+_uiComposeComponent)
    * [._uiExtendEl(parentEl, components)](#Uib+_uiExtendEl)
    * [._uiAdd(ui, isRecurse)](#Uib+_uiAdd)
    * [._uiRemove(ui)](#Uib+_uiRemove)
    * [._uiReplace(ui)](#Uib+_uiReplace)
    * [._uiUpdate(ui)](#Uib+_uiUpdate)
    * [._uiLoad(ui)](#Uib+_uiLoad)
    * [._uiReload()](#Uib+_uiReload)
    * [._uiManager(msg)](#Uib+_uiManager)
    * [.showMsg(showHide, parent)](#Uib+showMsg)
    * [.clearHtmlCache()](#Uib+clearHtmlCache)
    * [.restoreHtmlFromCache()](#Uib+restoreHtmlFromCache)
    * [.saveHtmlCache()](#Uib+saveHtmlCache)
    * [.watchDom(startStop)](#Uib+watchDom)
    * [._send(msgToSend, [channel], [originator])](#Uib+_send)
    * [.send(msg, [originator])](#Uib+send)
    * [.sendCtrl(msg)](#Uib+sendCtrl)
    * [.eventSend(domevent, [originator])](#Uib+eventSend)
    * [.beaconLog(txtToSend, logLevel)](#Uib+beaconLog)
    * [.logToServer()](#Uib+logToServer)
    * [._getIOnamespace()](#Uib+_getIOnamespace) ΓçÆ <code>string</code>
    * [._checkConnect([delay], [factor], [depth])](#Uib+_checkConnect) ΓçÆ <code>boolean</code> \| <code>undefined</code>
    * [._ioSetup()](#Uib+_ioSetup) ΓçÆ <code>boolean</code>
    * [.start([options])](#Uib+start) ΓçÆ <code>void</code>

<a name="Uib+clientId"></a>

### uibuilder.clientId
Client ID set by uibuilder on connect

**Kind**: instance property of [<code>Uib</code>](#Uib)  
<a name="Uib+cookies"></a>

### uibuilder.cookies
The collection of cookies provided by uibuilder

**Kind**: instance property of [<code>Uib</code>](#Uib)  
<a name="Uib+ctrlMsg"></a>

### uibuilder.ctrlMsg
Copy of last control msg object received from sever

**Kind**: instance property of [<code>Uib</code>](#Uib)  
<a name="Uib+ioConnected"></a>

### uibuilder.ioConnected
Is Socket.IO client connected to the server?

**Kind**: instance property of [<code>Uib</code>](#Uib)  
<a name="Uib+msg"></a>

### uibuilder.msg
Last std msg received from Node-RED

**Kind**: instance property of [<code>Uib</code>](#Uib)  
<a name="Uib+msgsSent"></a>

### uibuilder.msgsSent
number of messages sent to server since page load

**Kind**: instance property of [<code>Uib</code>](#Uib)  
<a name="Uib+msgsReceived"></a>

### uibuilder.msgsReceived
number of messages received from server since page load

**Kind**: instance property of [<code>Uib</code>](#Uib)  
<a name="Uib+msgsSentCtrl"></a>

### uibuilder.msgsSentCtrl
number of control messages sent to server since page load

**Kind**: instance property of [<code>Uib</code>](#Uib)  
<a name="Uib+msgsCtrlReceived"></a>

### uibuilder.msgsCtrlReceived
number of control messages received from server since page load

**Kind**: instance property of [<code>Uib</code>](#Uib)  
<a name="Uib+online"></a>

### uibuilder.online
Is the client online or offline?

**Kind**: instance property of [<code>Uib</code>](#Uib)  
<a name="Uib+sentCtrlMsg"></a>

### uibuilder.sentCtrlMsg
last control msg object sent via uibuilder.send() @since v2.0.0-dev3

**Kind**: instance property of [<code>Uib</code>](#Uib)  
<a name="Uib+sentMsg"></a>

### uibuilder.sentMsg
last std msg object sent via uibuilder.send()

**Kind**: instance property of [<code>Uib</code>](#Uib)  
<a name="Uib+serverTimeOffset"></a>

### uibuilder.serverTimeOffset
placeholder to track time offset from server, see fn socket.on(ioChannels.server ...)

**Kind**: instance property of [<code>Uib</code>](#Uib)  
<a name="Uib+socketError"></a>

### uibuilder.socketError
placeholder for a socket error message

**Kind**: instance property of [<code>Uib</code>](#Uib)  
<a name="Uib+originator"></a>

### uibuilder.originator : <code>string</code>
Default originator node id - empty string by default

**Kind**: instance property of [<code>Uib</code>](#Uib)  
<a name="Uib+topic"></a>

### uibuilder.topic : <code>string</code> \| <code>undefined</code>
Default topic - used by send if set and no topic provided

**Kind**: instance property of [<code>Uib</code>](#Uib)  
<a name="Uib+$"></a>

### uibuilder.$
Simplistic jQuery-like document CSS query selector, returns an HTML Element

**Kind**: instance property of [<code>Uib</code>](#Uib)  
<a name="Uib+clientId"></a>

### uibuilder.clientId
Client ID set by uibuilder - lasts until browser profile is closed, applies to all tabs

**Kind**: instance property of [<code>Uib</code>](#Uib)  
<a name="Uib+tabId"></a>

### uibuilder.tabId
Tab ID - lasts while the tab is open (even if reloaded)
WARNING: Duplicating a tab retains the same tabId

**Kind**: instance property of [<code>Uib</code>](#Uib)  
<a name="Uib+set"></a>

### uibuilder.set(prop, val) ΓçÆ <code>\*</code> \| <code>undefined</code>
Function to set uibuilder properties to a new value - works on any property except _* or #*
Also triggers any event listeners.
Example: this.set('msg', {topic:'uibuilder', payload:42});

**Kind**: instance method of [<code>Uib</code>](#Uib)  
**Returns**: <code>\*</code> \| <code>undefined</code> - Input value  

| Param | Type | Description |
| --- | --- | --- |
| prop | <code>string</code> | Any uibuilder property who's name does not start with a _ or # |
| val | <code>\*</code> | _ |

<a name="Uib+get"></a>

### uibuilder.get(prop) ΓçÆ <code>\*</code> \| <code>undefined</code>
Function to get the value of a uibuilder property
Example: uibuilder.get('msg')

**Kind**: instance method of [<code>Uib</code>](#Uib)  
**Returns**: <code>\*</code> \| <code>undefined</code> - The current value of the property  

| Param | Type | Description |
| --- | --- | --- |
| prop | <code>string</code> | The name of the property to get as long as it does not start with a _ or # |

<a name="Uib+setStore"></a>

### uibuilder.setStore(id, value) ΓçÆ <code>boolean</code>
Write to localStorage if possible. console error output if can't write
Also uses this.storePrefix

**Kind**: instance method of [<code>Uib</code>](#Uib)  
**Returns**: <code>boolean</code> - True if succeeded else false  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | localStorage var name to be used (prefixed with 'uib_') |
| value | <code>\*</code> | value to write to localstore |

**Example**  
```js
uibuilder.setStore('fred', 42)
  console.log(uibuilder.getStore('fred'))
```
<a name="Uib+getStore"></a>

### uibuilder.getStore(id) ΓçÆ <code>\*</code> \| <code>null</code> \| <code>undefined</code>
Attempt to get and re-hydrate a key value from localStorage
Note that all uib storage is automatically prefixed using this.storePrefix

**Kind**: instance method of [<code>Uib</code>](#Uib)  
**Returns**: <code>\*</code> \| <code>null</code> \| <code>undefined</code> - The re-hydrated value of the key or null if key not found, undefined on error  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>\*</code> | The key of the value to attempt to retrieve |

<a name="Uib+removeStore"></a>

### uibuilder.removeStore(id)
Remove a given id from the uib keys in localStorage

**Kind**: instance method of [<code>Uib</code>](#Uib)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>\*</code> | The key to remove |

<a name="Uib+_dispatchCustomEvent"></a>

### uibuilder.\_dispatchCustomEvent(title, details)
Standard fn to create a custom event with details & dispatch it

**Kind**: instance method of [<code>Uib</code>](#Uib)  

| Param | Type | Description |
| --- | --- | --- |
| title | <code>string</code> | The event name |
| details | <code>\*</code> | Any details to pass to event output |

<a name="Uib+onChange"></a>

### uibuilder.onChange(prop, callback) ΓçÆ <code>number</code>
Register on-change event listeners for uibuilder tracked properties
Make it possible to register a function that will be run when the property changes.
Note that you can create listeners for non-existant properties

**Kind**: instance method of [<code>Uib</code>](#Uib)  
**Returns**: <code>number</code> - A reference to the callback to cancel, save and pass to uibuilder.cancelChange if you need to remove a listener  
**Example:**: uibuilder.onChange('msg', function(msg){ console.log('uibuilder.msg changed! It is now: ', msg) })  

| Param | Type | Description |
| --- | --- | --- |
| prop | <code>string</code> | The property of uibuilder that we want to monitor |
| callback | <code>function</code> | The function that will run when the property changes, parameter is the new value of the property after change |

<a name="Uib+onTopic"></a>

### uibuilder.onTopic(topic, callback) ΓçÆ <code>number</code>
Register a change callback for a specific msg.topic
Similar to onChange but more convenient if needing to differentiate by msg.topic.

**Kind**: instance method of [<code>Uib</code>](#Uib)  
**Returns**: <code>number</code> - A reference to the callback to cancel, save and pass to uibuilder.cancelTopic if you need to remove a listener  
**Example:**: let otRef = uibuilder.onTopic('mytopic', function(){ console.log('Received a msg with msg.topic=`mytopic`. msg: ', this) })
To cancel a change listener: uibuilder.cancelTopic('mytopic', otRef)  

| Param | Type | Description |
| --- | --- | --- |
| topic | <code>string</code> | The msg.topic we want to listen for |
| callback | <code>function</code> | The function that will run when an appropriate msg is received. `this` inside the callback as well as the cb's single argument is the received msg. |

<a name="Uib+_checkTimestamp"></a>

### uibuilder.\_checkTimestamp(receivedMsg) ΓçÆ <code>void</code>
Check supplied msg from server for a timestamp - if received, work out & store difference to browser time

**Kind**: instance method of [<code>Uib</code>](#Uib)  
**Returns**: <code>void</code> - Updates self.serverTimeOffset if different to previous value  

| Param | Type | Description |
| --- | --- | --- |
| receivedMsg | <code>object</code> | A message object recieved from Node-RED |

<a name="Uib+setOriginator"></a>

### uibuilder.setOriginator([originator])
Set the default originator. Set to '' to ignore. Used with uib-sender.

**Kind**: instance method of [<code>Uib</code>](#Uib)  

| Param | Type | Description |
| --- | --- | --- |
| [originator] | <code>string</code> | A Node-RED node ID to return the message to |

<a name="Uib+setPing"></a>

### uibuilder.setPing(ms)
HTTP Ping/Keep-alive - makes a call back to uibuilder's ExpressJS server and receives a 204 response
Can be used to keep sessions alive.

**Kind**: instance method of [<code>Uib</code>](#Uib)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| ms | <code>number</code> | <code>0</code> | Repeat interval in ms |

**Example**  
```js
uibuilder.setPing(2000) // repeat every 2 sec. Re-issue with ping(0) to turn off repeat.
  uibuilder.onChange('ping', function(data) {
     console.log('pinger', data)
  })
```
<a name="Uib+syntaxHighlight"></a>

### uibuilder.syntaxHighlight(json) ΓçÆ [<code>html</code>](#html)
Convert JSON to Syntax Highlighted HTML

**Kind**: instance method of [<code>Uib</code>](#Uib)  
**Returns**: [<code>html</code>](#html) - Object reformatted as highlighted HTML  

| Param | Type | Description |
| --- | --- | --- |
| json | <code>object</code> | A JSON/JavaScript Object |

<a name="Uib+ui"></a>

### uibuilder.ui(json)
Directly manage UI via JSON

**Kind**: instance method of [<code>Uib</code>](#Uib)  

| Param | Type | Description |
| --- | --- | --- |
| json | <code>object</code> | Either an object containing {_ui: {}} or simply simple {} containing ui instructions |

<a name="Uib+replaceSlot"></a>

### uibuilder.replaceSlot(el, component)
Replace or add an HTML element's slot from text or an HTML string
Will use DOMPurify if that library has been loaded to window.
param {*} ui Single entry from the msg._ui property

**Kind**: instance method of [<code>Uib</code>](#Uib)  

| Param | Type | Description |
| --- | --- | --- |
| el | <code>Element</code> | Reference to the element that we want to update |
| component | <code>\*</code> | The component we are trying to add/replace |

<a name="Uib+replaceSlotMarkdown"></a>

### uibuilder.replaceSlotMarkdown(el, component)
Replace or add an HTML element's slot from a Markdown string
Only does something if the markdownit library has been loaded to window.
Will use DOMPurify if that library has been loaded to window.

**Kind**: instance method of [<code>Uib</code>](#Uib)  

| Param | Type | Description |
| --- | --- | --- |
| el | <code>Element</code> | Reference to the element that we want to update |
| component | <code>\*</code> | The component we are trying to add/replace |

<a name="Uib+loadScriptSrc"></a>

### uibuilder.loadScriptSrc(url)
Attach a new remote script to the end of HEAD synchronously
NOTE: It takes too long for most scripts to finish loading
      so this is pretty useless to work with the dynamic UI features directly.

**Kind**: instance method of [<code>Uib</code>](#Uib)  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | The url to be used in the script src attribute |

<a name="Uib+loadStyleSrc"></a>

### uibuilder.loadStyleSrc(url)
Attach a new remote stylesheet link to the end of HEAD synchronously
NOTE: It takes too long for most scripts to finish loading
      so this is pretty useless to work with the dynamic UI features directly.

**Kind**: instance method of [<code>Uib</code>](#Uib)  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | The url to be used in the style link href attribute |

<a name="Uib+loadScriptTxt"></a>

### uibuilder.loadScriptTxt(textFn)
Attach a new text script to the end of HEAD synchronously
NOTE: It takes too long for most scripts to finish loading
      so this is pretty useless to work with the dynamic UI features directly.

**Kind**: instance method of [<code>Uib</code>](#Uib)  

| Param | Type | Description |
| --- | --- | --- |
| textFn | <code>string</code> | The text to be loaded as a script |

<a name="Uib+loadStyleTxt"></a>

### uibuilder.loadStyleTxt(textFn)
Attach a new text stylesheet to the end of HEAD synchronously
NOTE: It takes too long for most scripts to finish loading
      so this is pretty useless to work with the dynamic UI features directly.

**Kind**: instance method of [<code>Uib</code>](#Uib)  

| Param | Type | Description |
| --- | --- | --- |
| textFn | <code>string</code> | The text to be loaded as a stylesheet |

<a name="Uib+showDialog"></a>

### uibuilder.showDialog(type, ui, [msg]) ΓçÆ <code>void</code>
Show a pop-over "toast" dialog or a modal alert
Refs: https://www.w3.org/WAI/ARIA/apg/example-index/dialog-modal/alertdialog.html,
      https://www.w3.org/WAI/ARIA/apg/example-index/dialog-modal/dialog.html,
      https://www.w3.org/WAI/ARIA/apg/patterns/dialogmodal/

**Kind**: instance method of [<code>Uib</code>](#Uib)  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>&quot;notify&quot;</code> \| <code>&quot;alert&quot;</code> | Dialog type |
| ui | <code>object</code> | standardised ui data |
| [msg] | <code>object</code> | msg.payload/msg.topic - only used if a string. Optional. |

<a name="Uib+loadui"></a>

### uibuilder.loadui(url)
Load a dynamic UI from a JSON web reponse

**Kind**: instance method of [<code>Uib</code>](#Uib)  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | URL that will return the ui JSON |

<a name="Uib+_uiComposeComponent"></a>

### uibuilder.\_uiComposeComponent(el, comp)
Enhance an HTML element that is being composed with ui data
 such as ID, attribs, event handlers, custom props, etc.

**Kind**: instance method of [<code>Uib</code>](#Uib)  

| Param | Type | Description |
| --- | --- | --- |
| el | <code>HTMLElement</code> | HTML Element to enhance |
| comp | <code>\*</code> | Individual uibuilder ui component spec |

<a name="Uib+_uiExtendEl"></a>

### uibuilder.\_uiExtendEl(parentEl, components)
Extend an HTML Element with appended elements using ui components
NOTE: This fn follows a strict hierarchy of added components.

**Kind**: instance method of [<code>Uib</code>](#Uib)  

| Param | Type | Description |
| --- | --- | --- |
| parentEl | <code>HTMLElement</code> | The parent HTML Element we want to append to |
| components | <code>\*</code> | The ui component(s) we want to add |

<a name="Uib+_uiAdd"></a>

### uibuilder.\_uiAdd(ui, isRecurse)
Handle incoming msg._ui add requests

**Kind**: instance method of [<code>Uib</code>](#Uib)  

| Param | Type | Description |
| --- | --- | --- |
| ui | <code>\*</code> | Standardised msg._ui property object. Note that payload and topic are appended to this object |
| isRecurse | <code>boolean</code> | Is this a recursive call? |

<a name="Uib+_uiRemove"></a>

### uibuilder.\_uiRemove(ui)
Handle incoming _ui remove requests

**Kind**: instance method of [<code>Uib</code>](#Uib)  

| Param | Type | Description |
| --- | --- | --- |
| ui | <code>\*</code> | Standardised msg._ui property object. Note that payload and topic are appended to this object |

<a name="Uib+_uiReplace"></a>

### uibuilder.\_uiReplace(ui)
Handle incoming _ui replace requests

**Kind**: instance method of [<code>Uib</code>](#Uib)  

| Param | Type | Description |
| --- | --- | --- |
| ui | <code>\*</code> | Standardised msg._ui property object. Note that payload and topic are appended to this object |

<a name="Uib+_uiUpdate"></a>

### uibuilder.\_uiUpdate(ui)
Handle incoming _ui update requests

**Kind**: instance method of [<code>Uib</code>](#Uib)  

| Param | Type | Description |
| --- | --- | --- |
| ui | <code>\*</code> | Standardised msg._ui property object. Note that payload and topic are appended to this object |

<a name="Uib+_uiLoad"></a>

### uibuilder.\_uiLoad(ui)
Handle incoming _ui load requests

**Kind**: instance method of [<code>Uib</code>](#Uib)  

| Param | Type | Description |
| --- | --- | --- |
| ui | <code>\*</code> | Standardised msg._ui property object. Note that payload and topic are appended to this object |

<a name="Uib+_uiReload"></a>

### uibuilder.\_uiReload()
Handle a reload request

**Kind**: instance method of [<code>Uib</code>](#Uib)  
<a name="Uib+_uiManager"></a>

### uibuilder.\_uiManager(msg)
Handle incoming _ui messages and loaded UI JSON files
Called from start()

**Kind**: instance method of [<code>Uib</code>](#Uib)  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>\*</code> | Standardised msg object containing a _ui property object |

<a name="Uib+showMsg"></a>

### uibuilder.showMsg(showHide, parent)
Show/hide a display card on the end of the visible HTML that will dynamically display the last incoming msg from Node-RED
The card has the id `nrmsg`.

**Kind**: instance method of [<code>Uib</code>](#Uib)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| showHide | <code>boolean</code> |  | true=show, false=hide |
| parent | <code>string</code> \| <code>undefined</code> | <code>&quot;body&quot;</code> | Optional. If not undefined, a CSS selector to attach the display to. Defaults to `body` |

<a name="Uib+clearHtmlCache"></a>

### uibuilder.clearHtmlCache()
Clear the saved DOM from localStorage

**Kind**: instance method of [<code>Uib</code>](#Uib)  
<a name="Uib+restoreHtmlFromCache"></a>

### uibuilder.restoreHtmlFromCache()
Restore the complete DOM (the whole web page) from browser localStorage if available

**Kind**: instance method of [<code>Uib</code>](#Uib)  
<a name="Uib+saveHtmlCache"></a>

### uibuilder.saveHtmlCache()
Save the current DOM state to browser localStorage.
localStorage is persistent and so can be recovered even after a browser restart.

**Kind**: instance method of [<code>Uib</code>](#Uib)  
<a name="Uib+watchDom"></a>

### uibuilder.watchDom(startStop)
Use the Mutation Observer browser API to watch for and save changes to the HTML
Once the observer is created, it will be reused.
Sending true or undefined will turn on the observer, false turns it off.
saveHtmlCache is called whenever anything changes in the dom. This allows
users to call restoreHtmlFromCache() on page load if desired to completely reload
to the last saved state.

**Kind**: instance method of [<code>Uib</code>](#Uib)  

| Param | Type | Description |
| --- | --- | --- |
| startStop | <code>boolean</code> | true=start watching the DOM, false=stop |

<a name="Uib+_send"></a>

### uibuilder.\_send(msgToSend, [channel], [originator])
Internal send fn. Send a standard or control msg back to Node-RED via Socket.IO
NR will generally expect the msg to contain a payload topic

**Kind**: instance method of [<code>Uib</code>](#Uib)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| msgToSend | <code>object</code> |  | The msg object to send. |
| [channel] | <code>string</code> | <code>&quot;uiBuilderClient&quot;</code> | The Socket.IO channel to use, must be in self.ioChannels or it will be ignored |
| [originator] | <code>string</code> |  | A Node-RED node ID to return the message to |

<a name="Uib+send"></a>

### uibuilder.send(msg, [originator])
Send a standard message to NR

**Kind**: instance method of [<code>Uib</code>](#Uib)  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>object</code> | Message to send |
| [originator] | <code>string</code> | A Node-RED node ID to return the message to |

**Example**  
```js
uibuilder.send({payload:'Hello'})
```
<a name="Uib+sendCtrl"></a>

### uibuilder.sendCtrl(msg)
Send a control msg to NR

**Kind**: instance method of [<code>Uib</code>](#Uib)  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>object</code> | Message to send |

<a name="Uib+eventSend"></a>

### uibuilder.eventSend(domevent, [originator])
Easily send a msg back to Node-RED on a DOM event

**Kind**: instance method of [<code>Uib</code>](#Uib)  

| Param | Type | Description |
| --- | --- | --- |
| domevent | <code>MouseEvent</code> \| <code>any</code> | DOM Event object |
| [originator] | <code>string</code> | A Node-RED node ID to return the message to |

**Example**  
```js
In plain HTML/JavaScript
   `<button id="button1" name="button 1" data-fred="jim"></button>`
   $('#button1').onclick = (evt) => {
     uibuilder.eventSend(evt)
   }
```
**Example**  
```js
In VueJS: `<b-button id="myButton1" @click="doEvent" data-something="hello"></b-button>`
In VueJS methods: `doEvent: uibuilder.eventSend,`

All `data-` attributes will be passed back to Node-RED,
   use them instead of arguments in the click function.
   All target._ui custom properties are also passed back to Node-RED.
```
<a name="Uib+beaconLog"></a>

### uibuilder.beaconLog(txtToSend, logLevel)
Send log text to uibuilder's beacon endpoint (works even if socket.io not connected)

**Kind**: instance method of [<code>Uib</code>](#Uib)  

| Param | Type | Description |
| --- | --- | --- |
| txtToSend | <code>string</code> | Text string to send |
| logLevel | <code>string</code> \| <code>undefined</code> | Log level to use. If not supplied, will default to debug |

<a name="Uib+logToServer"></a>

### uibuilder.logToServer()
Send log info back to Node-RED over uibuilder's websocket control output (Port #2)
-@param {...*} arguments All arguments passed to the function are added to the msg.payload

**Kind**: instance method of [<code>Uib</code>](#Uib)  
<a name="Uib+_getIOnamespace"></a>

### uibuilder.\_getIOnamespace() ΓçÆ <code>string</code>
Return the Socket.IO namespace
The cookie method is the most reliable but this falls back to trying to work it
out from the URL if cookies not available. That won't work if page is in a sub-folder.
since 2017-10-21 Improve method to cope with more complex paths - thanks to Steve Rickus @shrickus
since 2017-11-10 v1.0.1 Check cookie first then url. cookie works even if the path is more complex (e.g. sub-folder)
since 2020-01-25 Removed httpRoot from namespace to prevent proxy induced errors

**Kind**: instance method of [<code>Uib</code>](#Uib)  
**Returns**: <code>string</code> - Socket.IO namespace  
<a name="Uib+_checkConnect"></a>

### uibuilder.\_checkConnect([delay], [factor], [depth]) ΓçÆ <code>boolean</code> \| <code>undefined</code>
Function used to check whether Socket.IO is connected to the server, reconnect if not (recursive)

**Kind**: instance method of [<code>Uib</code>](#Uib)  
**Returns**: <code>boolean</code> \| <code>undefined</code> - Whether or not Socket.IO is connected to uibuilder in Node-RED  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [delay] | <code>number</code> |  | Initial delay before checking (ms). Default=2000ms |
| [factor] | <code>number</code> |  | Multiplication factor for subsequent checks (delay*factor). Default=1.5 |
| [depth] | <code>number</code> | <code>1</code> | Recursion depth |

<a name="Uib+_ioSetup"></a>

### uibuilder.\_ioSetup() ΓçÆ <code>boolean</code>
Setup Socket.io
since v2.0.0-beta2 Moved to a function and called by the user (uibuilder.start()) so that namespace & path can be passed manually if needed

**Kind**: instance method of [<code>Uib</code>](#Uib)  
**Returns**: <code>boolean</code> - Attaches socket.io manager to self._socket and updates self.ioNamespace & self.ioPath as needed  
<a name="Uib+start"></a>

### uibuilder.start([options]) ΓçÆ <code>void</code>
Start up Socket.IO comms and listeners
This has to be done separately because if running from a web page in a sub-folder of src/dist, uibuilder cannot
necessarily work out the correct ioPath to use.
Also, if cookies aren't permitted in the browser, both ioPath and ioNamespace may need to be specified.

**Kind**: instance method of [<code>Uib</code>](#Uib)  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>object</code> | The start options object. |

<a name="log"></a>

## log() ΓçÆ <code>function</code>
Custom logging. e.g. log(2, 'here:there', 'jiminy', {fred:'jim'})()

**Kind**: global function  
**Returns**: <code>function</code> - Log function @example log(2, 'here:there', 'jiminy', {fred:'jim'})()  
<a name="makeMeAnObject"></a>

## makeMeAnObject(thing, [property]) ΓçÆ <code>object</code>
Makes a null or non-object into an object
If not null, moves "thing" to {payload:thing}

**Kind**: global function  
**Returns**: <code>object</code> - _  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| thing | <code>\*</code> |  | Thing to check |
| [property] | <code>string</code> | <code>&quot;&#x27;payload&#x27;&quot;</code> | property that "thing" is moved to if not null and not an object |

<a name="urlJoin"></a>

## urlJoin() ΓçÆ <code>string</code>
Joins all arguments as a URL string
see http://stackoverflow.com/a/28592528/3016654
since v1.0.10, fixed potential double // issue
arguments {string} URL fragments

**Kind**: global function  
**Returns**: <code>string</code> - _  
<a name="html"></a>

## html : <code>string</code>
A string containing HTML markup

**Kind**: global typedef  
<a name="ioSetupFromServer"></a>

## ioSetupFromServer : <code>function</code>
Callback handler for messages from Node-RED
NOTE: `this` is the class here rather the `socket` as would be normal since we bind the correct `this` in the call.
      Use this._socket if needing reference to the socket.

**Kind**: global typedef  
**this**: [<code>Uib</code>](#Uib)  

| Param | Type | Description |
| --- | --- | --- |
| receivedMsg | <code>object</code> | The msg object from Node-RED |

