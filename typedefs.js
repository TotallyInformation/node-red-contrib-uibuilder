/* eslint-disable no-irregular-whitespace */
/** Define typedefs for linting and JSDoc/ts checks - does not actually contain live code
 * 
 * Copyright (c) 2017-2021 Julian Knight (Totally Information)
 * https://it.knightnet.org.uk, https://github.com/TotallyInformation/node-red-contrib-uibuilder
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** editorRED
 * @typedef {Object} editorRED The Node-RED core object available to a custom node's .html file
 * 
 */
/* RED
 {
    "loader": {},
    "events": {},
    "i18n": {},
    "settings": {
        "apiRootUrl": "",
        "httpNodeRoot": "/nr/",
        "version": "1.2.7",
        "user": {
            "anonymous": true,
            "permissions": "*"
        },
        "context": {
            "default": "default",
            "stores": [
                "default",
                "file"
            ]
        },
        "flowFilePretty": true,
        "flowEncryptionType": "user",
        "tlsConfigDisableLocalFiles": false,
        "uibuilderNodeEnv": "development", // === CUSTOM ===
        "uibuilderTemplates": {}, // === CUSTOM ===
        "uibuilderPort": 3000, // === CUSTOM ===
        "editorTheme": {},

        "get": function,
        init: function,
        load: function,
        loadUserSettings: function,
        remove: function,
        set: function,
        theme: function,
    "user": {},
    "comms": {},
    "text": {},
    "state": {},
    "nodes": {},
    "history": {},
    "validators": {},
    "utils": {},
    "menu": {},
    "panels": {},
    "popover": {},
    "tabs": {},
    "stack": {},
    "colorPicker": {},
    "actions": {},
    "deploy": {},
    "diff": {},
    "keyboard": {},
    "workspaces": {},
    "statusBar": {},
    "view": {
        "navigator": {},
        "tools": {}
    },
    "sidebar": {},
    "palette": {},
    "editor": {},
    "eventLog": {},
    "tray": {},
    "clipboard": {},
    "library": {},
    "notifications": {},
    "search": {},
    "actionList": {},
    "typeSearch": {},
    "subflow": {},
    "group": {},
    "userSettings": {},
    "projects": {},
    "touch": {},
    "debug": {}
}
 */
/* this
{ 
    name: ""
    topic: ""
    //... other vars ...//

    credentials: { has_jwtSecret: false, _: { … } }

    changed: false
    dirty: false
    icon: undefined
    id: "b18a50dd.f7e5c"
    info: undefined
    infoEditor: w { $toDestroy: Array(46), container: div.red - ui - editor - text - container.ace_editor.ace_hidpi.red - ui - editor - text - container - toolbar.ace - tomo…, renderer: y, id: "editor2", commands: o, … } 
    inputLabels: ""
    inputs: 1
    outputLabels: ['','']
    outputs: 2
    resize: false
    selected: true
    status: { text: "Node Initialised", fill: "blue", shape: "dot" } 
    type: "uibuilder"
    valid: true
    validationErrors: []

    g: "c49c82f3.7e716"
    h: 30
    l: true
    w: 120
    x: 530
    y: 120
    z: "18cb249f.38bafb"

    _: ƒ()
    __outputs: 2
    _config: { name: """", topic: """", url: ""vue - file"", fwdInMessages: "false", allowScripts: "false", … } 
    _def: { category: "uibuilder", color: "#E6E0F8", defaults: { … }, credentials: { … }, inputs: 1, … }
}
 */

/** runtimeSettings - See settings.js for static settings.
 * @typedef {Object} runtimeSettings Static and Dynamic settings for Node-RED runtime
 * 
 * @property {string} uiPort The port used by Node-RED (default=1880)
 * @property {string} uiHost The host IP used by Node-RED (default=0.0.0.0)
 * @property {string} userDir The userDir folder
 * @property {string} httpNodeRoot Optional base URL. All user url's will be under this. Default empty string.
 * @property {Object} functionGlobalContext Add values, functions, packages to the Global context variable store.
 * @property {function} mqttReconnectTime: [Getter/Setter],
 * @property {function} serialReconnectTime: [Getter/Setter],
 * @property {function} debugMaxLength: [Getter/Setter],
 * @property {function} debugUseColors: [Getter/Setter],
 * @property {string} flowFile: [Getter/Setter],
 * @property {function} flowFilePretty: [Getter/Setter],
 * @property {string} credentialSecret: [Getter/Setter],
 * @property {string} httpAdminRoot: [Getter/Setter],
 * @property {string} httpNodeRoot: [Getter/Setter],
 * @property {string} httpStatic: [Getter/Setter],
 * @property {function} adminAuth: [Getter/Setter],
 * @property {function} httpNodeMiddleware: [Getter/Setter],
 * @property {function} httpAdminMiddleware: [Getter/Setter],
 * @property {function} httpServerOptions: [Getter/Setter],
 * @property {function} webSocketNodeVerifyClient: [Getter/Setter],
 * @property {function} functionGlobalContext: [Getter/Setter],
 * @property {function} exportGlobalContextKeys: [Getter/Setter],
 * @property {function} contextStorage: [Getter/Setter],
 * @property {function} logging: [Getter/Setter],
 * @property {function} editorTheme: [Getter/Setter],
 * @property {string} settingsFile: [Getter/Setter],
 * @property {string} httpRoot: [Getter/Setter],
 * @property {function} disableEditor: [Getter/Setter],
 * @property {function} httpAdminAuth: [Getter/Setter],
 * @property {function} httpNodeAuth: [Getter/Setter],
 * @property {Object|function} [https] If present, https will be used for ExpressJS servers.
 * @property {Object} [uibuilder] Optional uibuilder specific Node-RED settings
 * @property {number} [uibuilder.port] Port number if uib is using its own ExpressJS instance
 * @property {string} [uibuilder.uibRoot] Folder name that will hold all uib runtime and instance folders
 * 
 * @property {string} coreNodesDir Folder containing Node-RED core nodes
 * @property {string} version Node-RED version
 * 
 * @property {Object} logging Controls the type and amount of logging output
 * @property {Object} logging.console Controls output levels and types to the console log
 * @property {string} logging.console.level What level of output? (fatal, error, warn, info, debug, trace)
 * @property {boolean} logging.console.metrics Should metrics also be shown?
 * @property {boolean} logging.console.audit Should audit also be shown?
 * 
 * @property {function} get Get dynamic settings. NB: entries in settings.js are read-only and shouldn't be read using RED.settings.get, that is only for settings that can change in-flight.
 * @property {function} set Set dynamic settings
 * @property {function} delete
 * @property {function} available
 * 
 * @property {function} registerNodeSettings: [Function: registerNodeSettings],
 * @property {function} exportNodeSettings: [Function: exportNodeSettings],
 * @property {function} enableNodeSettings: [Function: enableNodeSettings],
 * @property {function} disableNodeSettings: [Function: disableNodeSettings],
 * 
 * @property {function} getUserSettings: [Function: getUserSettings],
 * @property {function} setUserSettings: [Function: setUserSettings],
 */

/** runtimeLogging
 * @typedef {Object} runtimeLogging Logging. Levels that are output to the Node-RED log are controlled by the logging.console.level setting in settings.js
 * @property {function} fatal Lvel 0. Lowest level, things that have broken Node-RED only.
 * @property {function} error Level 1. Copy is sent to Editor debug panel as well as error log.
 * @property {function} warn Level 2.
 * @property {function} info Level 3.
 * @property {function} debug Level 4.
 * @property {function} trace Level 5. Very verbose output. Should tell the operator everything that is going on.
 * @property {function} metric
 * @property {function} audit
 * @property {function} addHandler
 * @property {function} removeHandler
 */

/** runtimeNodes
 * @typedef {Object} runtimeNodes Gives access to other active nodes in the flows.
 * @property {function} registerType Register a new type of node to Node-RED.
 * @property {function} createNode Create a node instance (called from within registerType function).
 * @property {function} getNode Get a reference to another node instance in the current flows. Can then access its properties.
 * @property {function} eachNode: [Function: eachNode],
 * @property {function} addCredentials: [Function: add],
 * @property {function} getCredentials: [Function: get],
 * @property {function} deleteCredentials: [Function: delete],
 */

/** runtimeRED
 * @typedef {Object} runtimeRED The core Node-RED runtime object
 * @property {expressApp} httpAdmin Reference to the ExpressJS app for Node-RED Admin including the Editor
 * @property {expressApp} httpNode Reference to the ExpressJS app for Node-RED user-facing nodes including http-in/-out and Dashboard
 * @property {Object} server Node.js http(s) Server object
 * @property {runtimeLogging} log Logging.
 * @property {runtimeNodes} nodes Gives access to other active nodes in the flows.
 * @property {runtimeSettings} settings Static and Dynamic settings for Node-RED runtime
 * 
 * @property {function} version Get the Node-RED version
 * @property {function} require: [Function: requireModule],
 * @property {function} comms: { publish: [Function: publish] },
 * @property {function} library: { register: [Function: register] },
 * @property {function} auth: { needsPermission: [Function: needsPermission] },
 * 
 * @property {Object} events Event handler object
 * @property {function} events.on Event Listener function. Types: 'nodes-started', 'nodes-stopped'
 * @property {function} events.once
 * @property {function} events.addListener
 * 
 * @property {Object} hooks
 * @property {function} hooks.has
 * @property {function} hooks.clear
 * @property {function} hooks.add
 * @property {function} hooks.remove
 * @property {function} hooks.trigger
 * 
 * @property {Object} util
 * @property {function} util.encodeObject: [Function: encodeObject],
 * @property {function} util.ensureString: [Function: ensureString],
 * @property {function} util.ensureBuffer: [Function: ensureBuffer],
 * @property {function} util.cloneMessage: [Function: cloneMessage],
 * @property {function} util.compareObjects: [Function: compareObjects],
 * @property {function} util.generateId: [Function: generateId],
 * @property {function} util.getMessageProperty: [Function: getMessageProperty],
 * @property {function} util.setMessageProperty: [Function: setMessageProperty],
 * @property {function} util.getObjectProperty: [Function: getObjectProperty],
 * @property {function} util.setObjectProperty: [Function: setObjectProperty],
 * @property {function} util.evaluateNodeProperty: [Function: evaluateNodeProperty],
 * @property {function} util.normalisePropertyExpression: [Function: normalisePropertyExpression],
 * @property {function} util.normaliseNodeTypeName: [Function: normaliseNodeTypeName],
 * @property {function} util.prepareJSONataExpression: [Function: prepareJSONataExpression],
 * @property {function} util.evaluateJSONataExpression: [Function: evaluateJSONataExpression],
 * @property {function} util.parseContextStore: [Function: parseContextStore]
 */

/** runtimeNode
 * @typedef {object} runtimeNode Local copy of the node instance config + other info
 * @property {Function} send Send a Node-RED msg to an output port
 * @property {Function} done Dummy done function for pre-Node-RED 1.0 servers
 * @property {function} context get/set context data. Also .flow and .global contexts
 * @property {function} on Event listeners for the node instance ('input', 'close')
 * @property {Function} removeListener Event handling
 * @property {function} error Error log output, also logs to the Editor's debug panel
 * @property {Object=} credentials Optional secured credentials
 * @property {Object=} name Internal.
 * @property {Object=} id Internal. uid of node instance.
 * @property {Object=} type Internal. Type of node instance.
 * @property {Object=} z Internal. uid of ???
 * @property {[Array<string>]=} wires Internal. Array of Array of Strings. The wires attached to this node instance (uid's)
 */

/** runtimeNodeConfig
 * @typedef {object} runtimeNodeConfig Configuration of node instance. Will also have Editor panel's defined variables as properties.
 * @property {Object=} id Internal. uid of node instance.
 * @property {Object=} type Internal. Type of node instance.
 * @property {Object=} x Internal
 * @property {Object=} y Internal
 * @property {Object=} z Internal
 * @property {Object=} wires Internal. The wires attached to this node instance (uid's)
 */

/** uibNode
 * @typedef {object} uibNode Local copy of the node instance config + other info
 * @property {String} uibNode.id Unique identifier for this instance
 * @property {String} uibNode.type What type of node is this an instance of? (uibuilder)
 * @property {String} uibNode.name Descriptive name, only used by Editor
 * @property {String} uibNode.topic msg.topic overrides incoming msg.topic
 * @property {String} uibNode.url The url path (and folder path) to be used by this instance
 * @property {String} uibNode.oldUrl The PREVIOUS url path (and folder path) after a url rename
 * @property {boolean} uibNode.fwdInMessages Forward input msgs to output #1?
 * @property {boolean} uibNode.allowScripts Allow scripts to be sent to front-end via msg? WARNING: can be a security issue.
 * @property {boolean} uibNode.allowStyles Allow CSS to be sent to the front-end via msg? WARNING: can be a security issue.
 * @property {boolean} uibNode.copyIndex DEPRECATED Copy index.(html|js|css) files from templates if they don't exist? 
 * @property {String}  uibNode.templateFolder Folder name for the source of the chosen template
 * @property {String}  uibNode.extTemplate Degit url reference for an external template (e.g. from GitHub)
 * @property {boolean} uibNode.showfolder Provide a folder index web page?
 * @property {boolean} uibNode.useSecurity Use uibuilder's built-in security features?
 * @property {boolean} uibNode.tokenAutoExtend Extend token life when msg's received from client?
 * @property {Number} uibNode.sessionLength Lifespan of token (in seconds)
 * @property {boolean} uibNode.reload If true, notify all clients to reload on a change to any source file
 * @property {String} uibNode.sourceFolder (src or dist) the instance FE code folder to be served by ExpressJS
 * @property {String} uibNode.jwtSecret Seed string for encryption of JWT
 * @property {String} uibNode.customFolder Name of the fs path used to hold custom files & folders for THIS INSTANCE
 * @property {Number} uibNode.ioClientsCount How many Socket clients connected to this instance?
 * @property {Number} uibNode.rcvMsgCount How many msg's received since last reset or redeploy?
 * @property {Object} uibNode.ioChannels The channel names for Socket.IO
 * @property {String} uibNode.ioChannels.control SIO Control channel name 'uiBuilderControl'
 * @property {String} uibNode.ioChannels.client SIO Client channel name 'uiBuilderClient'
 * @property {String} uibNode.ioChannels.server SIO Server channel name 'uiBuilder'
 * @property {String} uibNode.ioNamespace Make sure each node instance uses a separate Socket.IO namespace
 * @property {Function} uibNode.send Send a Node-RED msg to an output port
 * @property {Function=} uibNode.done Dummy done function for pre-Node-RED 1.0 servers
 * @property {Function=} uibNode.on Event handler
 * @property {Function=} uibNode.removeListener Event handling
 * @property {Object=} uibNode.credentials Optional secured credentials
 * @property {Object=} uibNode.z Internal
 * @property {Object=} uibNode.wires Internal. The wires attached to this node instance (uid's)
 * 
 * @property {boolean} uibNode.commonStaticLoaded Whether the common static folder has been added
 * @property {boolean} uibNode.initCopyDone Has the initial template copy been done?
 */

/** MsgAuth
 * @typedef {Object} MsgAuth The standard auth object used by uibuilder security. See docs for details.
 * Note that any other data may be passed from your front-end code in the _auth.info object.
 * _auth.info.error, _auth.info.validJwt, _auth.info.message, _auth.info.warning
 * @property {String} MsgAuth.id Required. A unique user identifier.
 * @property {String} [MsgAuth.password] Required for login only.
 * @property {String} [MsgAuth.jwt] Required if logged in. Needed for ongoing session validation and management.
 * @property {Number} [MsgAuth.sessionExpiry] Required if logged in. Milliseconds since 1970. Needed for ongoing session validation and management.
 * @property {boolean} [MsgAuth.userValidated] Required after user validation. Whether the input ID (and optional additional data from the _auth object) validated correctly or not.
 * @property {Object=} [MsgAuth.info] Optional metadata about the user.
 */

/** userValidation
 * @typedef {Object} userValidation Optional return object that is able to pass on additional use metadata back to the client.
 * @property {boolean} userValidation.userValidated Required. Whether the input ID (and optional additional data from the _auth object) validated correctly or not.
 * @property {userMetadata} [userValidation.authData] Optional return metadata about the user. Will be added to the output msg's _auth object
 */

/** userMetadata
 * @typedef {Object} userMetadata Optional. Metadata about the user. Will be added to the output msg's _auth object.
 * This is just an example of what you might want to return, you can send anything you like.
 * @property {String} [userMetadata.name] Users full name or screen name.
 * @property {String} [userMetadata.message] A message that the front-end code could use to display to the user when they log in.
 * @property {String} [userMetadata.level] Users authorisation level (admin, gold, silver, reader, editor, author, ...).
 * @property {String} [userMetadata.location] Users location.
 * @property {Date} [userMetadata.passwordExpiry] Date/time the users password expires.
 * @property {Date} [userMetadata.subsExpiry] Date/time the users subscription expires.
 */

/** Props define attributes on a virtual node.
 * @typedef {Object.<string, any> | {}} Props
 * @property {Children} Props.children
 */
/** The vnode children of a virtual node.
 * @typedef {VNode[]} Children
 */
/** Define a custom type for virtual nodes:
 * @typedef {string | number | Function} Type
 * @typedef {Object.<string, any>} VNode
 * @property {Type} VNode.type
 * @property {Props} VNode.props
 * @property {Children} VNode.children
 * @property {Key} [VNode.key]
 */

// ==== vvv These need some work vvv ==== //

// ExpressJS App
/**
 * @typedef {Object} expressApp ExpessJS `app` object
 * @property {Object} _events: [Object: null prototype] { mount: [Function: onmount] },
 * @property {number} _eventsCount: 1,
 * @property {number} _maxListeners: undefined,
 * @property {function} setMaxListeners: [Function: setMaxListeners],
 * @property {function} getMaxListeners: [Function: getMaxListeners],
 * @property {function} emit: [Function: emit],
 * @property {function} addListener: [Function: addListener],
 * @property {function} on: [Function: addListener],
 * @property {function} prependListener: [Function: prependListener],
 * @property {function} once: [Function: once],
 * @property {function} prependOnceListener: [Function: prependOnceListener],
 * @property {function} removeListener: [Function: removeListener],
 * @property {function} off: [Function: removeListener],
 * @property {function} removeAllListeners: [Function: removeAllListeners],
 * @property {function} listeners: [Function: listeners],
 * @property {function} rawListeners: [Function: rawListeners],
 * @property {function} listenerCount: [Function: listenerCount],
 * @property {function} eventNames: [Function: eventNames],
 * @property {function} init: [Function: init],
 * @property {function} defaultConfiguration: [Function: defaultConfiguration],
 * @property {function} lazyrouter: [Function: lazyrouter],
 * @property {function} handle: [Function: handle],
 * @property {function} use: [Function: use],
 * @property {function} route: [Function: route],
 * @property {function} engine: [Function: engine],
 * @property {function} param: [Function: param],
 * @property {function} set: [Function: set],
 * @property {function} path: [Function: path],
 * @property {function} enabled: [Function: enabled],
 * @property {function} disabled: [Function: disabled],
 * @property {function} enable: [Function: enable],
 * @property {function} disable: [Function: disable],
 * @property {function} acl: [Function (anonymous)],
 * @property {function} bind: [Function (anonymous)],
 * @property {function} checkout: [Function (anonymous)],
 * @property {function} connect: [Function (anonymous)],
 * @property {function} copy: [Function (anonymous)],
 * @property {function} delete: [Function (anonymous)],
 * @property {function} get: [Function (anonymous)],
 * @property {function} head: [Function (anonymous)],
 * @property {function} link: [Function (anonymous)],
 * @property {function} lock: [Function (anonymous)],
 * @property {function} 'm-search': [Function (anonymous)],
 * @property {function} merge: [Function (anonymous)],
 * @property {function} mkactivity: [Function (anonymous)],
 * @property {function} mkcalendar: [Function (anonymous)],
 * @property {function} mkcol: [Function (anonymous)],
 * @property {function} move: [Function (anonymous)],
 * @property {function} notify: [Function (anonymous)],
 * @property {function} options: [Function (anonymous)],
 * @property {function} patch: [Function (anonymous)],
 * @property {function} post: [Function (anonymous)],
 * @property {function} pri: [Function (anonymous)],
 * @property {function} propfind: [Function (anonymous)],
 * @property {function} proppatch: [Function (anonymous)],
 * @property {function} purge: [Function (anonymous)],
 * @property {function} put: [Function (anonymous)],
 * @property {function} rebind: [Function (anonymous)],
 * @property {function} report: [Function (anonymous)],
 * @property {function} search: [Function (anonymous)],
 * @property {function} source: [Function (anonymous)],
 * @property {function} subscribe: [Function (anonymous)],
 * @property {function} trace: [Function (anonymous)],
 * @property {function} unbind: [Function (anonymous)],
 * @property {function} unlink: [Function (anonymous)],
 * @property {function} unlock: [Function (anonymous)],
 * @property {function} unsubscribe: [Function (anonymous)],
 * @property {function} all: [Function: all],
 * @property {function} del: [Function (anonymous)],
 * @property {function} render: [Function: render],
 * @property {function} listen: [Function: listen],
 * @property {function} request: IncomingMessage { app: [Circular *1] },
 * @property {function} response: ServerResponse { app: [Circular *1] },
 * @property {Object} cache: {},
 * @property {Object} engines: {},
 * 
 * @property {Object} settings: {
 * @property {boolean}  settings.'x-powered-by': true,
 * @property {string}   settings.etag: 'weak',
 * @property {function} settings.'etag fn': [Function: generateETag],
 * @property {string}   settings.env: 'development',
 * @property {string}   settings.'query parser': 'extended',
 * @property {function} settings.'query parser fn': [Function: parseExtendedQueryString],
 * @property {number}   settings.'subdomain offset': 2,
 * @property {function} settings.view: [Function: View],
 * @property {string}   settings.views: 'C:\\src\\nr2\\views',
 * @property {string}   settings.'jsonp callback name': 'callback'
 * 
 * @property {Object} locals: [Object: null prototype] { settings: [Object] },
 * @property {string} mountpath: '/nr/',
 * 
 * @property {function} parent: [Function: app] {
 * @property {function}   parent._events: [Object: null prototype],
 * @property {function}   parent._eventsCount: 1,
 * @property {function}   parent._maxListeners: undefined,
 * @property {function}   parent.setMaxListeners: [Function: setMaxListeners],
 * @property {function}   parent.getMaxListeners: [Function: getMaxListeners],
 * @property {function}   parent.emit: [Function: emit],
 * @property {function}   parent.addListener: [Function: addListener],
 * @property {function}   parent.on: [Function: addListener],
 * @property {function}   parent.prependListener: [Function: prependListener],
 * @property {function}   parent.once: [Function: once],
 * @property {function}   parent.prependOnceListener: [Function: prependOnceListener],
 * @property {function}   parent.removeListener: [Function: removeListener],
 * @property {function}   parent.off: [Function: removeListener],
 * @property {function}   parent.removeAllListeners: [Function: removeAllListeners],
 * @property {function}   parent.listeners: [Function: listeners],
 * @property {function}   parent.rawListeners: [Function: rawListeners],
 * @property {function}   parent.listenerCount: [Function: listenerCount],
 * @property {function}   parent.eventNames: [Function: eventNames],
 * @property {function}   parent.init: [Function: init],
 * @property {function}   parent.defaultConfiguration: [Function: defaultConfiguration],
 * @property {function}   parent.lazyrouter: [Function: lazyrouter],
 * @property {function}   parent.handle: [Function: handle],
 * @property {function}   parent.use: [Function: use],
 * @property {function}   parent.route: [Function: route],
 * @property {function}   parent.engine: [Function: engine],
 * @property {function}   parent.param: [Function: param],
 * @property {function}   parent.set: [Function: set],
 * @property {function}   parent.path: [Function: path],
 * @property {function}   parent.enabled: [Function: enabled],
 * @property {function}   parent.disabled: [Function: disabled],
 * @property {function}   parent.enable: [Function: enable],
 * @property {function}   parent.disable: [Function: disable],
 * @property {function}   parent.acl: [Function (anonymous)],
 * @property {function}   parent.bind: [Function (anonymous)],
 * @property {function}   parent.checkout: [Function (anonymous)],
 * @property {function}   parent.connect: [Function (anonymous)],
 * @property {function}   parent.copy: [Function (anonymous)],
 * @property {function}   parent.delete: [Function (anonymous)],
 * @property {function}   parent.get: [Function (anonymous)],
 * @property {function}   parent.head: [Function (anonymous)],
 * @property {function}   parent.link: [Function (anonymous)],
 * @property {function}   parent.lock: [Function (anonymous)],
 * @property {function}   parent.'m-search': [Function (anonymous)],
 * @property {function}   parent.merge: [Function (anonymous)],
 * @property {function}   parent.mkactivity: [Function (anonymous)],
 * @property {function}   mkcalendar: [Function (anonymous)],
 * @property {function}   mkcol: [Function (anonymous)],
 * @property {function}   move: [Function (anonymous)],
 * @property {function}   notify: [Function (anonymous)],
 * @property {function}   options: [Function (anonymous)],
 * @property {function}   patch: [Function (anonymous)],
 * @property {function}   post: [Function (anonymous)],
 * @property {function}   pri: [Function (anonymous)],
 * @property {function}   propfind: [Function (anonymous)],
 * @property {function}   proppatch: [Function (anonymous)],
 * @property {function}   purge: [Function (anonymous)],
 * @property {function}   put: [Function (anonymous)],
 * @property {function}   rebind: [Function (anonymous)],
 * @property {function}   report: [Function (anonymous)],
 * @property {function}   search: [Function (anonymous)],
 * @property {function}   source: [Function (anonymous)],
 * @property {function}   subscribe: [Function (anonymous)],
 * @property {function}   trace: [Function (anonymous)],
 * @property {function}   unbind: [Function (anonymous)],
 * @property {function}   unlink: [Function (anonymous)],
 * @property {function}   unlock: [Function (anonymous)],
 * @property {function}   unsubscribe: [Function (anonymous)],
 * @property {function}   all: [Function: all],
 * @property {function}   del: [Function (anonymous)],
 * @property {function}   render: [Function: render],
 * @property {function}   listen: [Function: listen],
 * @property {function}   request: [IncomingMessage],
 * @property {function}   response: [ServerResponse],
 * @property {function}   cache: {},
 * @property {function}   engines: {},
 * @property {function}   settings: [Object],
 * @property {function}   locals: [Object: null prototype],
 * @property {function}   mountpath: '/',
 * @property {function}   _router: [Function]
 */

module.exports = {}