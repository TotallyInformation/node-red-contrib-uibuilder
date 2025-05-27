/* eslint-disable jsdoc/valid-types */
/* eslint-disable jsdoc/no-undefined-types */
// @ts-nocheck
/* eslint-disable no-irregular-whitespace */
/** Define typedefs for linting and JSDoc/ts checks - does not actually contain live code
 *
 * Copyright (c) 2017-2025 Julian Knight (Totally Information)
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

'use strict'

/** editorRED
 * typedef {object} editorRED The Node-RED core object available to a custom node's .html file
 *
 */

/** Node-RED runtimeSettings - See settings.js for static settings.
 * @typedef {object} runtimeSettings Static and Dynamic settings for Node-RED runtime
 *
 * @property {string} uiPort The port used by Node-RED (default=1880)
 * @property {string} uiHost The host IP used by Node-RED (default=0.0.0.0)
 * @property {string} userDir The userDir folder
 * @property {string} httpNodeRoot Optional base URL. All user url's will be under this. Default empty string.
 * @property {object} FunctionGlobalContext Add values, Functions, packages to the Global context variable store.
 * @property {Function} mqttReconnectTime : [Getter/Setter],
 * @property {Function} serialReconnectTime : [Getter/Setter],
 * @property {Function} debugMaxLength : [Getter/Setter],
 * @property {Function} debugUseColors : [Getter/Setter],
 * @property {string} flowFile : [Getter/Setter],
 * @property {Function} flowFilePretty : [Getter/Setter],
 * @property {string} credentialSecret : [Getter/Setter],
 * @property {string} httpAdminRoot : [Getter/Setter],
 * @property {string} httpStatic : [Getter/Setter],
 * @property {Function} adminAuth : [Getter/Setter],
 * @property {Function} httpNodeMiddleware : [Getter/Setter],
 * @property {Function} httpAdminMiddleware : [Getter/Setter],
 * @property {Function} httpServerOptions : [Getter/Setter],
 * @property {Function} webSocketNodeVerifyClient : [Getter/Setter],
 * @property {Function} exportGlobalContextKeys : [Getter/Setter],
 * @property {Function} contextStorage : [Getter/Setter],
 * @property {Function} editorTheme : [Getter/Setter],
 * @property {string} settingsFile : [Getter/Setter],
 * @property {string} httpRoot : [Getter/Setter],
 * @property {Function} disableEditor : [Getter/Setter],
 * @property {Function} httpAdminAuth : [Getter/Setter],
 * @property {Function} httpNodeAuth : [Getter/Setter],
 * @property {object|Function} [https] If present, https will be used for ExpressJS servers.
 *
 * @property {object} [uibuilder] Optional uibuilder specific Node-RED settings
 * @property {number} [uibuilder.port] Port number if uib is using its own ExpressJS instance
 * @property {string} [uibuilder.uibRoot] Folder name that will hold all uib runtime and instance folders
 * @property {('http'|'https')} [uibuilder.customType] Connection type - only if using custom ExpressJS instance
 * @property {object|Function} [uibuilder.https] Override https server settings (key/cert) - if not specified, uses main NR https prop
 * @property {object} [uibuilder.serverOptions] Optional ExpressJS server options for uib custom server
 * @property {object} [uibuilder.socketOptions] Override Socket.IO options if desired. See https://socket.io/docs/v4/server-options/
 * @property {boolean} [uibuilder.instanceApiAllowed] Allow instance-level custom API's to be loaded. Could be a security issue so it is controlled in settings.js
 * @property {Function} [uibuilder.hooks] Provide hook functions
 *
 * @property {string} coreNodesDir Folder containing Node-RED core nodes
 * @property {string} version Node-RED version
 *
 * @property {object} logging Controls the type and amount of logging output
 * @property {object} logging.console Controls output levels and types to the console log
 * @property {string} logging.console.level What level of output? (fatal, error, warn, info, debug, trace)
 * @property {boolean} logging.console.metrics Should metrics also be shown?
 * @property {boolean} logging.console.audit Should audit also be shown?
 *
 * @property {Function} get Get dynamic settings. NB: entries in settings.js are read-only and shouldn't be read using RED.settings.get, that is only for settings that can change in-flight.
 * @property {Function} set Set dynamic settings
 * @property {Function} delete .
 * @property {Function} available .
 *
 * @property {Function} registerNodeSettings : [Function: registerNodeSettings],
 * @property {Function} exportNodeSettings : [Function: exportNodeSettings],
 * @property {Function} enableNodeSettings : [Function: enableNodeSettings],
 * @property {Function} disableNodeSettings : [Function: disableNodeSettings],
 *
 * @property {Function} getUserSettings : [Function: getUserSettings],
 * @property {Function} setUserSettings : [Function: setUserSettings],
 */

/** Node-RED runtimeLogging
 * @typedef {object} runtimeLogging Logging. Levels that are output to the Node-RED log are controlled by the logging.console.level setting in settings.js
 * @property {Function} fatal Lvel 0. Lowest level, things that have broken Node-RED only.
 * @property {Function} error Level 1. Copy is sent to Editor debug panel as well as error log.
 * @property {Function} warn Level 2.
 * @property {Function} info Level 3.
 * @property {Function} debug Level 4.
 * @property {Function} trace Level 5. Very verbose output. Should tell the operator everything that is going on.
 * @property {Function} metric Log metrics (timings)
 * @property {Function} audit Audit log
 * @property {Function} addHandler Adds a log handler
 * @property {Function} removeHandler Removes a log handler
 * @property {10} FATAL : 10,
 * @property {20} ERROR : 20,
 * @property {30} WARN  : 30,
 * @property {40} INFO  : 40,
 * @property {50} DEBUG : 50,
 * @property {60} TRACE : 60,
 * @property {98} AUDIT : 98,
 * @property {99} METRIC: 99,
 */

/** Node-RED runtimeNodes: RED.nodes
 * obsidian://open?vault=Obsidian%20Vault&file=Programming%2FNode-RED%2FRuntime%20API's%2FRED.nodes
 * @typedef {object} runtimeNodes Gives access to other active nodes in the flows.
 * @property {Function} registerType Register a new type of node to Node-RED.
 * @property {Function} registerSubflow .
 * @property {Function} createNode Create a node instance (called from within registerType Function).
 * @property {Function} getNode Get a reference to another node instance in the current flows. Can then access its properties.
 * @property {Function} eachNode Walk through each node
 * @property {Function} addCredentials .
 * @property {Function} getCredentials .
 * @property {Function} deleteCredentials .
 */

/** runtimeRED
 * @typedef {object} runtimeRED The core Node-RED runtime object
 * @property {expressApp} httpAdmin Reference to the ExpressJS app for Node-RED Admin including the Editor
 * @property {expressApp} httpNode Reference to the ExpressJS app for Node-RED user-facing nodes including http-in/-out and Dashboard
 * @property {Server} server Node.js http(s) Server object
 * @property {runtimeLogging} log Logging.
 * @property {runtimeNodes} nodes Gives access to other active nodes in the flows.
 * @property {runtimeSettings} settings Static and Dynamic settings for Node-RED runtime
 *
 * @property {Function} version Get the Node-RED version [Function: getVersion],
 * @property {Function} require : [Function: requireModule],
 * @property {Function} import : [Function: importModule],
 *
 * @property {object} auth :
 * @property {Function} auth.needsPermission : [Function: needsPermission]
 *
 * @property {object} library :
 * @property {Function} library.register : [Function: register],
 *
 * @property {object} comms Communicate with admin pages
 * @property {Function} comms.publish : [Function: publish],
 *
 * @property {EventEmitter} events Event handler object
 * @property {Function} events.on Event Listener Function. Types: 'nodes-started', 'nodes-stopped'
 * @property {Function} events.once .
 * @property {Function} events.addListener .
 * @property {((name:string, opts:object)=>void)} events.emit Emit a new event
 *
 * @property {object} hooks .
 * @property {Function} hooks.has .
 * @property {Function} hooks.clear .
 * @property {Function} hooks.add .
 * @property {Function} hooks.remove .
 * @property {Function} hooks.trigger .
 *
 * @property {object} util .
 * @property {Function} util.encodeObject : [Function: encodeobject],
 * @property {Function} util.ensureString : [Function: ensurestring],
 * @property {Function} util.ensureBuffer : [Function: ensureBuffer],
 * @property {Function} util.cloneMessage : [Function: cloneMessage],
 * @property {Function} util.compareObjects : [Function: compareobjects],
 * @property {Function} util.generateId : [Function: generateId],
 * @property {Function} util.getMessageProperty : [Function: getMessageProperty],
 * @property {Function} util.setMessageProperty : [Function: setMessageProperty],
 * @property {Function} util.getObjectProperty : [Function: getobjectProperty],
 * @property {Function} util.setObjectProperty : [Function: setobjectProperty],
 * @property {Function} util.evaluateNodeProperty : [Function: evaluateNodeProperty],
 * @property {Function} util.normalisePropertyExpression : [Function: normalisePropertyExpression],
 * @property {Function} util.normaliseNodeTypeName : [Function: normaliseNodeTypeName],
 * @property {Function} util.prepareJSONataExpression : [Function: prepareJSONataExpression],
 * @property {Function} util.evaluateJSONataExpression : [Function: evaluateJSONataExpression],
 * @property {Function} util.parseContextStore : [Function: parseContextStore]
 * @property {Function} util.getSetting ??
 *
 * @property {object} util.uib : Added by uibuilder.js - utility functions made available to function nodes
 * @property {Function} util.uib.deepObjFind : Recursive object deep find - https://totallyinformation.github.io/node-red-contrib-uibuilder/#/client-docs/config-driven-ui?id=manipulating-msg_ui
 * @property {Function} util.uib.listAllApps : Return a list of all uibuilder instances
 * @property {Function} util.uib.dp : Return a formatted number using a specified locale and number of decimal places
 * @property {Function} util.uib.send : Send a message to a client via a uibuilder instance
 * @property {Function} util.uib.truthy : Returns true/false or a default value for truthy/falsy and other values
 *
 * @property {object} plugins Node-RED plugins
 * @property {Function} plugins.registerPlugin : [Function: registerPlugin],
 * @property {Function} plugins.get: [Function: get],
 * @property {Function} plugins.getByType: [Function: getByType]
 */

/** runtimeNode
 * @typedef {object} runtimeNode Local copy of the node instance config + other info
 * @property {Function} send Send a Node-RED msg to an output port
 * @property {Function} done Dummy done Function for pre-Node-RED 1.0 servers
 * @property {Function} context get/set context data. Also .flow and .global contexts
 * @property {Function} on Event listeners for the node instance ('input', 'close')
 * @property {Function} removeListener Event handling
 * @property {Function} log General log output, Does not show in the Editor's debug panel
 * @property {Function} warn Warning log output, also logs to the Editor's debug panel
 * @property {Function} error Error log output, also logs to the Editor's debug panel
 * @property {Function} trace Trace level log output
 * @property {Function} debug Debug level log output
 * @property {Function} status Show a status message under the node in the Editor
 * @property {object=} credentials Optional secured credentials
 * @property {string=} name Internal.
 * @property {string=} id Internal. uid of node instance.
 * @property {string=} type Internal. Type of node instance.
 * @property {string=} z Internal. uid of ???
 * @property {string=} g Internal. uid of ???
 * @property {[Array<string>]=} wires Internal. Array of Array of strings. The wires attached to this node instance (uid's)
 * @property {number=} _wireCount Count of connected wires
 * @property {string=} _wire ID of connected wire
 * @property {[Array<Function>]=} _closeCallbacks ??
 * @property {[Array<Function>]=} _inputCallback Input callback fn
 * @property {[Array<Function>]=} _inputCallbacks ??
 * @property {number=} _expectedDoneCount ??
 * @property {Flow=} _flow Full definition of this node's containing flow
 * @property {*=} _alias ??
 */

/** runtimeNodeConfig
 * @typedef {object} runtimeNodeConfig Configuration of node instance. Will also have Editor panel's defined variables as properties.
 * @property {object=} id Internal. uid of node instance.
 * @property {object=} type Internal. Type of node instance.
 * @property {object=} x Internal
 * @property {object=} y Internal
 * @property {object=} z Internal. ID of the flow the node belongs to.
 * @property {object=} wires Internal. The wires attached to this node instance (uid's)
 */

/** uibuilderEditorVars
 * @typedef {object} uibuilderEditorVars The node instance variables accessible from the Editor config panel
 *
 * @property {string} name Descriptive name, only used by Editor
 * @property {string} topic msg.topic overrides incoming msg.topic
 * @property {string} url The url path (and folder path) to be used by this instance
 * @property {boolean} okToGo Is the url valid for this node or not? Not passed into the node, only used to stop processing.
 * @property {string} oldUrl The PREVIOUS url path (and folder path) after a url rename
 * @property {boolean} fwdInMessages Forward input msgs to output #1?
 * @property {boolean} allowScripts Allow scripts to be sent to front-end via msg? WARNING: can be a security issue.
 * @property {boolean} allowStyles Allow CSS to be sent to the front-end via msg? WARNING: can be a security issue.
 * @property {boolean} copyIndex DEPRECATED Copy index.(html|js|css) files from templates if they don't exist?
 * @property {string}  templateFolder Folder name for the source of the chosen template
 * @property {string}  extTemplate Degit url reference for an external template (e.g. from GitHub)
 * @property {boolean} showfolder Provide a folder index web page?
 * @property {boolean} reload If true, notify all clients to reload on a change to any source file
 * @property {string} sourceFolder (src or dist) the instance FE code folder to be served by ExpressJS
 * @property {string} deployedVersion The version of uibuilder when this node was last deployed
 * @property {boolean} showMsgUib Whether to include msg._uib (clientId/real IP/page name) in std output msgs
 *
 * @property {string} customFolder Name of the fs path used to hold custom files & folders for THIS INSTANCE
 * @property {number} ioClientsCount How many Socket clients connected to this instance?
 * @property {number} rcvMsgCount How many msg's received since last reset or redeploy?
 * @property {object} ioChannels The channel names for Socket.IO
 * @property {string} ioChannels.control SIO Control channel name 'uiBuilderControl'
 * @property {string} ioChannels.client SIO Client channel name 'uiBuilderClient'
 * @property {string} ioChannels.server SIO Server channel name 'uiBuilder'
 * @property {string} ioNamespace Make sure each node instance uses a separate Socket.IO namespace
 * @property {string} title Short descriptive title for the instance
 * @property {string} descr Longer description for the instance
 * @property {string} editurl Shortcut URL that will open a code editor at the node instance folder
 */

/** uibNode
 * @typedef {object} uibNode Local copy of the node instance config + other info
 * @property {string} id Unique identifier for this instance
 * @property {string} type What type of node is this an instance of? (uibuilder)
 *
 * @property {string} name Descriptive name, only used by Editor
 * @property {string} topic msg.topic overrides incoming msg.topic
 * @property {string} url The url path (and folder path) to be used by this instance
 * @property {string} oldUrl The PREVIOUS url path (and folder path) after a url rename
 * @property {boolean} fwdInMessages Forward input msgs to output #1?
 * @property {boolean} allowScripts Allow scripts to be sent to front-end via msg? WARNING: can be a security issue.
 * @property {boolean} allowStyles Allow CSS to be sent to the front-end via msg? WARNING: can be a security issue.
 * @property {boolean} copyIndex DEPRECATED Copy index.(html|js|css) files from templates if they don't exist?
 * @property {string}  templateFolder Folder name for the source of the chosen template
 * @property {string}  extTemplate Degit url reference for an external template (e.g. from GitHub)
 * @property {boolean} showfolder Provide a folder index web page?
 * @property {boolean} reload If true, notify all clients to reload on a change to any source file
 * @property {string} sourceFolder (src or dist) the instance FE code folder to be served by ExpressJS
 * @property {string} deployedVersion The version of uibuilder when this node was last deployed
 * @property {boolean} showMsgUib Whether to include msg._uib (clientId/real IP/page name) in std output msgs
 *
 * @property {string} instanceFolder Name of the fs path used to hold custom files & folders for THIS INSTANCE
 * @property {number} ioClientsCount How many Socket clients connected to this instance?
 * @property {number} rcvMsgCount How many msg's received since last reset or redeploy?
 * @property {object} ioChannels The channel names for Socket.IO
 * @property {string} ioChannels.control SIO Control channel name 'uiBuilderControl'
 * @property {string} ioChannels.client SIO Client channel name 'uiBuilderClient'
 * @property {string} ioChannels.server SIO Server channel name 'uiBuilder'
 * @property {string} ioNamespace Make sure each node instance uses a separate Socket.IO namespace
 *
 * @property {Function} send Send a Node-RED msg to an output port
 * @property {Function=} done Dummy done Function for pre-Node-RED 1.0 servers
 * @property {Function=} on Event handler
 * @property {Function=} removeListener Event handling
 * @property {Function=} context Function that accesses the nodes context vars or the flow/global vars
 * @property {Function=} emit Function that emits an event
 * @property {Function=} receive Function that ???
 * @property {object=} credentials Optional secured credentials
 * @property {object=} z Internal
 * @property {object=} wires Internal. The wires attached to this node instance (uid's)
 *
 * @property {boolean} commonStaticLoaded Whether the common static folder has been added
 * @property {boolean} initCopyDone Has the initial template copy been done?
 *
 * @property {Function} warn Output warn level info to node-red console and to editor debug
 *
 * @property {object} statusDisplay Settings for the uibuilder node status
 * @property {string} statusDisplay.text Text to display
 * @property {string} statusDisplay.fill Fill colour: black, blue, red, yellow, ...
 * @property {string} statusDisplay.shape dot or ring
 *
 * @property {string} title Short descriptive title for the instance
 * @property {string} descr Longer description for the instance
 * @property {string} editurl Shortcut URL that will open a code editor at the node instance folder
 *
 * @property {Function} sendToFe Ref to sockets.sendToFe
 * @property {Function} sender Ref to uib-sender event sending function
 */

/** uibConfig - THe module-level `uib` configuration variable
 * @typedef {object} uibConfig Local copy of the node master config + other module-level info
 * @property {object} me Contents of uibuilder's `package.json` file
 * @property {string} moduleName Module name must match this nodes html file.
 *
 *  Default 'uibuilder'
 * @property {string} nodeRoot URL path prefix set in `settings.js` - prefixes all URL's -
 *  equiv of httpNodeRoot from settings.js.
 *
 *  Default `empty string`.
 * @property {object} deployments Track across redeployments
 * @property {object} instances When nodeInstance is run, add the node.id as a key with the value being the
 *  url then add processing to ensure that the URL's are unique.
 *
 *  Schema: `{<node.id>: <url>}`
 * @property {object} apps Instance details
 *  Schema: `{url: {node.id, node.title, node.desc}}
 * @property {string} masterTemplateFolder Location of master template folders (containing default front-end code).
 *
 *  Default `../template`
 * @property {string} masterStaticFeFolder Location of master FE folder (containing built core front-end code).
 *
 *  Default `../front-end`
 * @property {string|null} rootFolder Folder on the server FS to hold common & custom files & folders for all instances of uibuilder.
 *
 *  Cannot be set until we have the RED object and know if projects are being used.
 *
 *  **Can be changed by `settings.js`**
 *
 *  Default `<userDir>/<uib.moduleName>` or `<userDir>/projects/<currProject>/<uib.moduleName>`
 * @property {string|null} configFolder Location for uib config folder - set once rootFolder is finalised
 * @property {string} configFolderName Name of the config folder. Default `.config`
 * @property {string|null} commonFolder Location for uib common folder - set once rootFolder is finalised
 * @property {string} commonFolderName URI name of the common folder for shared resources. Default `common`
 * @property {string} sioUseMwName Name of the optional Socket.IO per-msg input `use` middleware. Default 'sioUse.js' in the uibRoot/.config folder
 * @property {string} sioMsgOutMwName Name of the optional Socket.IO per-msg output middleware. Default 'sioMsgOut.js' in the uibRoot/.config folder
 * @property {object} ioChannels The channel names for Socket.IO.
 * @property {string} ioChannels.control Channel for control messages. Default `uiBuilderControl`
 * @property {string} ioChannels.client Channel for messages to front-end clients. Default `uiBuilderClient`
 * @property {string} ioChannels.server Channel for messages from clients to server. Default `uiBuilder`
 * @property {Array<number|string>} nodeVersion What version of Node.JS are we running under? Impacts some file processing.
 * @property {object} staticOpts Options for serveStatic. See https://expressjs.com/en/resources/middleware/serve-static.html
 * @property {{url:string,value:boolean}|{}} deleteOnDelete Set of instances that have requested their local instance folders be
 *  deleted on deploy - see html file oneditdelete, updated by admin api.
 *  Actually set in admin-api-v3.js/put and consumed in uiblib.js/instanceClose
 * @property {object}           customServer Set in libs/web.js:_webSetup()
 *  Parameters for custom webserver if required. Port is undefined if using Node-RED's webserver.
 * @property {undefined|number} customServer.port TCP/IP port number.
 *
 *  If defined, uibuilder will use its own ExpressJS server/app.
 *
 *  If undefined, uibuilder will use the Node-RED user-facing ExpressJS server
 * @property {('http'|'https'|'http2')} customServer.type Node.js server type. One of ['http', 'https', 'http2']
 * @property {undefined|string} customServer.host uibuilder Host. sub(domain) name or IP Address
 * @property {undefined|string} customServer.hostName The host name of the Node-RED server
 * @property {boolean}          customServer.isCustom Is uibuilder using a custom ExpressJS server?
 * @property {object}           customServer.serverOptions Optional ExpressJS server options
 *
 * @property {undefined|object} degitEmitter Event emitter for degit, populated on 1st use. See POST admin API
 * @property {runtimeRED|null} RED Keep a reference to RED for convenience. Set at the start of Uib
 * @property {string=} version The deployed version of uibuilder (from `package.json`)
 * @property {string=} httpRoot Copy of RED.settings.httpRoot for ease of use
 * @property {string=} reDeployNeeded If the last deployed version is this version or earlier and the current version is greater than this, tell the Editor that a redeploy is needed
 * @property {boolean} instanceApiAllowed Are instance-level API's allowed to be loaded? Could be a security issue so controlled from settings.js uibuilder.instanceApiAllowed. Default=false
 */

/** senderNode1
 * @typedef {{
 *   name: string;
 *   topic: string;
 *   passthrough: boolean;
 *   return: boolean;
 *   url: string;
 *   uibId: string;
 * }} senderNode1
 */

/** cacheNode1
 * @typedef {object} cacheNode1 Local copy of the node instance config + other info
 * @property {string}  name only used for labelling the node in the flow
 * @property {boolean} cacheall Flag indicating each individual msg is cached
 * @property {string|undefined}  cacheKey msg property to use to group cached msgs
 * @property {boolean}  newcache Only replay cache if client is actually new, not a reconnection
 * @property {number}  num number of cached msgs to retain
 * @property {string}  storeName Which store to use for the context variable
 * @property {'context'|'flow'|'node'}  storeContext Which store to use for the context variable
 * @property {object}  cache A reference to the actual cache for this node instance
 * @property {string} varName The variable name in use in the store
 * @property {Function} getC A reference to the context get function for this node instance
 * @property {Function} setC A reference to the context set function for this node instance
 */

/** uibListNode
 * @typedef {{
 *   name: string;
 *   url: string;
 *   elementid: string;
 *   elementtype: string;
 *   parent: string;
 *   passthrough: boolean;
 *   cacheOn: boolean;
 *   storeName: string;
 *   storeContext: 'context'|'flow'|'node';
 *   varName: string;
 *   newcache: boolean;
 *   cache: object;
 *   getC: Function;
 *   setC: Function;
 *   _ui: any;
 * }} uibListNode
 */

/** uibElNode (Element Node)
 * @typedef {{
 *   name: string;
 *   topic: string;
 *   elementtype: string;
 *   parent: string;
 *   parentSource: string;
 *   parentSourceType: string;
 *   elementid: string;
 *   elementId: string;
 *   elementIdSource: string;
 *   elementIdSourceType: string;
 *   heading: string;
 *   headingSource: string;
 *   headingSourceType: string;
 *   headingLevel: string;
 *   data: any;
 *   dataSource: string|number;
 *   dataSourceType: string;
 *   position: string|number;
 *   positionSource: string|number;
 *   positionSourceType: string;
 *   confData: object;
 *   passthrough: boolean;
 *   _ui: any;
 *   tag: string;
 * }} uibElNode
 */

/** uibTagNode (Tag Node)
 * @typedef {{
 *   name: string;
 *   topic: string;
 *   tag: string;
 *   tagSource: string;
 *   tagSourceType: string;
 *   elementId: string;
 *   elementIdSource: string;
 *   elementIdSourceType: string;
 *   parent: string;
 *   parentSource: string;
 *   parentSourceType: string;
 *   position: string|number;
 *   positionSource: string|number;
 *   positionSourceType: string;
 *
 *   slotContent: string;
 *   slotSourceProp: string;
 *   slotContentSource: string;
 *   slotContentSourceType: string;
 *   slotSourcePropType: string;
 *   attribs: object;
 *   attribsSource: string;
 *   attribsSourceType: string;
 *   slotPropMarkdown: boolean;
 *   _ui: any;
 * }} uibTagNode
 */

/** uibHtmlNode (HTML Node)
 * @typedef {{
 *   name: string;
 *   topic: string;
 *   useTemplate: boolean;
 *   _ui: any;
 * }} uibHtmlNode
 */

/** uibSaveNode (Save Node)
 * @typedef {{
 * url: string;
 * folder: string;
 * fname: string;
 * createFolder: boolean;
 * reload: boolean;
 * usePageName: boolean;
 * encoding: string;
 * mode: number;
 * uibId: string;
 * instanceRoot: string;
 * name: string;
 * topic: string;
 * counters: object;
 * statusDisplay: object;
 * }} uibSaveNode
 */

/** uibFileListNode (File List Node)
 * @typedef {{
 * name: string;
 * topic: string;
 * url: string;
 * uibId: string;
 * folder: string;
 * filter: Array<string>;
 * exclude: string;
 * urlOut: boolean;
 * live: boolean;
 * fullPrefix: boolean;
 * statusDisplay: object;
 * }} uibFileListNode
 */

/** uibUpdNode (Update Node)
 * @typedef {{
 *   name: string;
 *   topic: string;
 *   mode: 'update'|'delete'|'remove'|'msg.mode';
 *   modeSource: string;
 *   modeSourceType: string;
 *   cssSelector: string;
 *   cssSelectorSource: string;
 *   cssSelectorType: string;
 *   cssSelectorSourceType: string;
 *   slotContent: string;
 *   slotSourceProp: string;
 *   slotContentSource: string;
 *   slotContentSourceType: string;
 *   slotSourcePropType: string;
 *   attribs: object;
 *   attribsSource: string;
 *   attribsSourceType: string;
 *   slotPropMarkdown: boolean;
 *   _ui: any;
 * }} uibUpdNode
 */

/** LibLowCodeNode (nodes/libs/low-code.js)
 * @typedef {{
 * _ui: any;
 * elementId: string;
 * parent: string;
 * tag: string;
 * position: string|number;
 * slotPropMarkdown: boolean;
 * slotContent: string;
 * attribs: object;
 * }} LibLowCodeNode
 */

/** MsgAuth
 * @typedef {object} MsgAuth The standard auth object used by uibuilder security. See docs for details.
 * Note that any other data may be passed from your front-end code in the _auth.info object.
 * _auth.info.error, _auth.info.validJwt, _auth.info.message, _auth.info.warning
 * @property {object} MsgAuth .
 * @property {string|null} MsgAuth.id Required. A unique user identifier.
 * @property {string} [MsgAuth.password] Required for login only.
 * @property {string} [MsgAuth.jwt] Required if logged in. Needed for ongoing session validation and management.
 * @property {number} [MsgAuth.sessionExpiry] Required if logged in. Milliseconds since 1970. Needed for ongoing session validation and management.
 * @property {boolean} [MsgAuth.userValidated] Required after user validation. Whether the input ID (and optional additional data from the _auth object) validated correctly or not.
 * @property {object=} [MsgAuth.info] Optional metadata about the user.
 */

/** userValidation
 * @typedef {object} userValidation Optional return object that is able to pass on additional use metadata back to the client.
 * @property {object} userValidation Optional return object that is able to pass on additional use metadata back to the client.
 * @property {boolean} userValidation.userValidated Required. Whether the input ID (and optional additional data from the _auth object) validated correctly or not.
 * @property {userMetadata} [userValidation.authData] Optional return metadata about the user. Will be added to the output msg's _auth object
 */

/** userMetadata
 * @typedef {object} userMetadata Optional. Metadata about the user. Will be added to the output msg's _auth object.
 * This is just an example of what you might want to return, you can send anything you like.
 * @property {object} userMetadata Optional. Metadata about the user. Will be added to the output msg's _auth object.
 * @property {string} [userMetadata.name] Users full name or screen name.
 * @property {string} [userMetadata.message] A message that the front-end code could use to display to the user when they log in.
 * @property {string} [userMetadata.level] Users authorisation level (admin, gold, silver, reader, editor, author, ...).
 * @property {string} [userMetadata.location] Users location.
 * @property {Date} [userMetadata.passwordExpiry] Date/time the users password expires.
 * @property {Date} [userMetadata.subsExpiry] Date/time the users subscription expires.
 */

/** uibPackageJsonPackage
 * @typedef {{
 *      estimatedEntryPoint?: string;
 *      homepage?: string;
 *      installedFrom?: string;
 *      installedVersion?: string;
 *      installFolder?: string;
 *      latestVersion?: string;
 *      missing?: boolean;
 *      outdated?: object;
 *      packageUrl?: string;
 *      problems?: Array<string>;
 *      scope?: string;
 *      spec?: string;
 *      url?: string;
 * }} uibPackageJsonPackage
 */

/** uibPackageJson
 * The package.json file in the uibRoot folder. Contains uibuilder extensions
 * @typedef {{
 *      name?: string;
 *      version?: string;
 *      description?: string;
 *      scripts?: {} | {
 *          [key: string]: string;
 *      };
 *      dependencies?: {} | {
 *          [key: string]: string;
 *      };
 *      homepage?: string;
 *      bugs?: string;
 *      author?: string;
 *      license?: string;
 *      repository?: object;
 *      uibuilder?: {
 *          packages?: {} | {
 *              [key: string]: uibPackageJsonPackage;
 *          };
 *      };
 * }} uibPackageJson
 */

/** routeDefinition
 * @typedef {object} routeDefinition Single route configuration
 * @property {string} id REQUIRED. Route ID
 * @property {string} src REQUIRED for external, optional for internal (default=route id). CSS Selector for template tag routes, url for external routes
 * @property {"url"|undefined} [type] OPTIONAL, default=internal route. "url" for external routes
 * @property {string} [title] OPTIONAL, default=route id. Text to use as a short title for the route
 * @property {string} [description] OPTIONAL, default=route id. Text to use as a long description for the route
 * @property {"html"|"md"|"markdown"} [format] OPTIONAL, default=html. Route content format, HTML or Markdown (md). Markdown requires the Markdown-IT library to have been loaded.
 */
/** UibRouterConfig
 * @typedef {object} UibRouterConfig Configuration for the UiBRouter class instances
 * @property {routeDefinition[]} routes REQUIRED. Array of route definitions
 * @property {Array<string|object>} [mdPlugins] OPTIONAL. Array of Markdown-IT plugins
 * @property {string} [defaultRoute] OPTIONAL, default=1st route. If set to a route id, that route will be automatically shown on load
 * @property {string} [routeContainer] OPTIONAL, default='#uibroutecontainer'. CSS Selector for an HTML Element containing routes
 * @property {boolean} [hide] OPTIONAL, default=false. If TRUE, routes will be hidden/shown on change instead of removed/added
 * @property {boolean} [templateLoadAll] OPTIONAL, default=false. If TRUE, all external route templates will be loaded when the router is instanciated. Default is to lazy-load external templates
 * @property {boolean} [templateUnload] OPTIONAL, default=true. If TRUE, route templates will be unloaded from DOM after access.
 * @property {otherLoadDefinition[]} [otherLoad] OPTIONAL, default=none. If present, router start will pre-load other external templates direct to the DOM. Use for menu's, etc.
 */
/** otherLoadDefinition
 * @typedef {object} otherLoadDefinition Single external load configuration
 * @property {string} id REQUIRED. Unique (to page) ID. Will be applied to loaded content.
 * @property {string} src REQUIRED. url of external template to load
 * @property {string} container REQUIRED. CSS Selector defining the parent element that this will become the child of. If it doesn't exist on page, content will not be loaded.
 */

/** Node-RED WidgetTypedInputType
 * @typedef { Array<"bin"|"bool"|"date"|"env"|"flow"|"global"|"json"|"jsonata"|"msg"|"num"|"re"|"str"> } WidgetTypedInputType
 */

/** Props define attributes on a virtual node.
 * @typedef {{string, any} | {}} Props
 * @property {object} Props .
 * @property {Children} Props.children .
 */
/** The vnode children of a virtual node.
 * @typedef {VNode[]} Children
 */
/** Define a custom type for virtual nodes:
 * @typedef {string | number | Function} Type
 */
/** Define a custom type for virtual nodes:
 * @typedef {{string, any}} VNode
 * @property {{string, any}} VNode .
 * @property {Type} VNode.type .
 * @property {Props} VNode.props .
 * @property {Children} VNode.children .
 * @property {string} [VNode.key] .
 */

// ==== vvv These need some work vvv ==== //

/** ExpressJS App
 * @typedef {object} expressApp ExpessJS `app` object
 * @property {object} _events : [object: null prototype] { mount: [Function: onmount] },
 * @property {number} _eventsCount : 1,
 * @property {number} _maxListeners : undefined,
 * @property {Function} setMaxListeners : [Function: setMaxListeners],
 * @property {Function} getMaxListeners : [Function: getMaxListeners],
 * @property {Function} emit : [Function: emit],
 * @property {Function} addListener : [Function: addListener],
 * @property {Function} on : [Function: addListener],
 * @property {Function} prependListener : [Function: prependListener],
 * @property {Function} once : [Function: once],
 * @property {Function} prependOnceListener : [Function: prependOnceListener],
 * @property {Function} removeListener : [Function: removeListener],
 * @property {Function} off : [Function: removeListener],
 * @property {Function} removeAllListeners : [Function: removeAllListeners],
 * @property {Function} listeners : [Function: listeners],
 * @property {Function} rawListeners : [Function: rawListeners],
 * @property {Function} listenerCount : [Function: listenerCount],
 * @property {Function} eventNames : [Function: eventNames],
 * @property {Function} init : [Function: init],
 * @property {Function} defaultConfiguration : [Function: defaultConfiguration],
 * @property {Function} lazyrouter : [Function: lazyrouter],
 * @property {Function} handle : [Function: handle],
 * @property {Function} use : [Function: use],
 * @property {Function} route : [Function: route],
 * @property {Function} engine : [Function: engine],
 * @property {Function} param : [Function: param],
 * @property {Function} set : [Function: set],
 * @property {Function} path : [Function: path],
 * @property {Function} enabled : [Function: enabled],
 * @property {Function} disabled : [Function: disabled],
 * @property {Function} enable : [Function: enable],
 * @property {Function} disable : [Function: disable],
 * @property {Function} acl : [Function (anonymous)],
 * @property {Function} bind : [Function (anonymous)],
 * @property {Function} checkout : [Function (anonymous)],
 * @property {Function} connect : [Function (anonymous)],
 * @property {Function} copy : [Function (anonymous)],
 * @property {Function} delete : [Function (anonymous)],
 * @property {Function} get : [Function (anonymous)],
 * @property {Function} head : [Function (anonymous)],
 * @property {Function} link : [Function (anonymous)],
 * @property {Function} lock : [Function (anonymous)],
 * @property {Function} "m-search" : [Function (anonymous)],
 * @property {Function} merge : [Function (anonymous)],
 * @property {Function} mkactivity : [Function (anonymous)],
 * @property {Function} mkcalendar : [Function (anonymous)],
 * @property {Function} mkcol : [Function (anonymous)],
 * @property {Function} move : [Function (anonymous)],
 * @property {Function} notify : [Function (anonymous)],
 * @property {Function} options : [Function (anonymous)],
 * @property {Function} patch : [Function (anonymous)],
 * @property {Function} post : [Function (anonymous)],
 * @property {Function} pri : [Function (anonymous)],
 * @property {Function} propfind : [Function (anonymous)],
 * @property {Function} proppatch : [Function (anonymous)],
 * @property {Function} purge : [Function (anonymous)],
 * @property {Function} put : [Function (anonymous)],
 * @property {Function} rebind : [Function (anonymous)],
 * @property {Function} report : [Function (anonymous)],
 * @property {Function} search : [Function (anonymous)],
 * @property {Function} source : [Function (anonymous)],
 * @property {Function} subscribe : [Function (anonymous)],
 * @property {Function} trace : [Function (anonymous)],
 * @property {Function} unbind : [Function (anonymous)],
 * @property {Function} unlink : [Function (anonymous)],
 * @property {Function} unlock : [Function (anonymous)],
 * @property {Function} unsubscribe : [Function (anonymous)],
 * @property {Function} all : [Function: all],
 * @property {Function} del : [Function (anonymous)],
 * @property {Function} render : [Function: render],
 * @property {Function} listen : [Function: listen],
 * @property {Function} request : IncomingMessage { app: [Circular *1] },
 * @property {Function} response : ServerResponse { app: [Circular *1] },
 *
 * @property {object} cache : {},
 * @property {object} engines : {},
 *
 * @property {{
 *   'x-powered-by': boolean,
 *   etag: string,
 *   "etag fn": Function,
 *   env: string,
 *   'query parser' : string,
 *   'query parser fn' : Function,
 *   'subdomain offset': number,
 *   view: Function,
 *   views: string,
 *   'jsonp callback name' : string
 * }} settings ExpressJS App Settings
 *
 * property {boolean}  settings.'x-powered-by' : true,
 * property {string}   settings.etag : 'weak',
 * property {Function} settings."etag fn" : [Function: generateETag],
 * property {string}   settings.env : 'development',
 * property {string}   settings.'query parser' : 'extended',
 * property {Function} settings.'query parser fn' : [Function: parseExtendedQuerystring],
 * property {number}   settings.'subdomain offset' : 2,
 * property {Function} settings.view : [Function: View],
 * property {string}   settings.views : 'C:\\src\\nr2\\views',
 * property {string}   settings.'jsonp callback name' : 'callback'
 *
 * @property {object} locals : [object: null prototype] { settings: [object] },
 * @property {string} mountpath : '/nr/',
 *
 * @property {Function} parent : [Function: app] {
 * @property {Function}   parent._events : [object: null prototype],
 * @property {Function}   parent._eventsCount : 1,
 * @property {Function}   parent._maxListeners : undefined,
 * @property {Function}   parent.setMaxListeners : [Function: setMaxListeners],
 * @property {Function}   parent.getMaxListeners : [Function: getMaxListeners],
 * @property {Function}   parent.emit : [Function: emit],
 * @property {Function}   parent.addListener : [Function: addListener],
 * @property {Function}   parent.on : [Function: addListener],
 * @property {Function}   parent.prependListener : [Function: prependListener],
 * @property {Function}   parent.once : [Function: once],
 * @property {Function}   parent.prependOnceListener : [Function: prependOnceListener],
 * @property {Function}   parent.removeListener : [Function: removeListener],
 * @property {Function}   parent.off : [Function: removeListener],
 * @property {Function}   parent.removeAllListeners : [Function: removeAllListeners],
 * @property {Function}   parent.listeners : [Function: listeners],
 * @property {Function}   parent.rawListeners : [Function: rawListeners],
 * @property {Function}   parent.listenerCount : [Function: listenerCount],
 * @property {Function}   parent.eventNames : [Function: eventNames],
 * @property {Function}   parent.init : [Function: init],
 * @property {Function}   parent.defaultConfiguration : [Function: defaultConfiguration],
 * @property {Function}   parent.lazyrouter : [Function: lazyrouter],
 * @property {Function}   parent.handle : [Function: handle],
 * @property {Function}   parent.use : [Function: use],
 * @property {Function}   parent.route : [Function: route],
 * @property {Function}   parent.engine : [Function: engine],
 * @property {Function}   parent.param : [Function: param],
 * @property {Function}   parent.set : [Function: set],
 * @property {Function}   parent.path : [Function: path],
 * @property {Function}   parent.enabled : [Function: enabled],
 * @property {Function}   parent.disabled : [Function: disabled],
 * @property {Function}   parent.enable : [Function: enable],
 * @property {Function}   parent.disable : [Function: disable],
 * @property {Function}   parent.acl : [Function (anonymous)],
 * @property {Function}   parent.bind : [Function (anonymous)],
 * @property {Function}   parent.checkout : [Function (anonymous)],
 * @property {Function}   parent.connect : [Function (anonymous)],
 * @property {Function}   parent.copy : [Function (anonymous)],
 * @property {Function}   parent.delete : [Function (anonymous)],
 * @property {Function}   parent.get : [Function (anonymous)],
 * @property {Function}   parent.head : [Function (anonymous)],
 * @property {Function}   parent.link : [Function (anonymous)],
 * @property {Function}   parent.lock : [Function (anonymous)],
 * @property {Function}   parent.'m-search' : [Function (anonymous)],
 * @property {Function}   parent.merge : [Function (anonymous)],
 * @property {Function}   parent.mkactivity : [Function (anonymous)],
 *
 * @property {Function}   _router :  [Function]
 */

module.exports = {}

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

        "get": Function,
        init: Function,
        load: Function,
        loadUserSettings: Function,
        remove: Function,
        set: Function,
        theme: Function,
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
