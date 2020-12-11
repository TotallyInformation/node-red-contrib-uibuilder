/**
 * @typedef {object} uibNode Local copy of the node instance config + other info
 * @property {String} id Unique identifier for this instance
 * @property {String} type What type of node is this an instance of? (uibuilder)
 * @property {String} name Descriptive name, only used by Editor
 * @property {String} topic msg.topic overrides incoming msg.topic
 * @property {String} url The url path (and folder path) to be used by this instance
 * @property {boolean} fwdInMessages Forward input msgs to output #1?
 * @property {boolean} allowScripts Allow scripts to be sent to front-end via msg? WARNING: can be a security issue.
 * @property {boolean} allowStyles Allow CSS to be sent to the front-end via msg? WARNING: can be a security issue.
 * @property {boolean} copyIndex Copy index.(html|js|css) files from templates if they don't exist?
 * @property {boolean} showfolder Provide a folder index web page?
 * @property {boolean} useSecurity Use uibuilder's built-in security features?
 * @property {boolean} tokenAutoExtend Extend token life when msg's received from client?
 * @property {Number} sessionLength Lifespan of token (in seconds)
 * @property {String} jwtSecret Seed string for encryption of JWT
 * @property {String} customFolder Name of the fs path used to hold custom files & folders for THIS INSTANCE
 * @property {Number} ioClientsCount How many Socket clients connected to this instance?
 * @property {Number} rcvMsgCount How many msg's received since last reset or redeploy?
 * @property {Object} ioChannels The channel names for Socket.IO
 * @property {String} ioChannels.control SIO Control channel name 'uiBuilderControl'
 * @property {String} ioChannels.client SIO Client channel name 'uiBuilderClient'
 * @property {String} ioChannels.server SIO Server channel name 'uiBuilder'
 * @property {String} ioNamespace Make sure each node instance uses a separate Socket.IO namespace
 * @property {Function} send Send a Node-RED msg to an output port
 * @property {Function=} done Dummy done function for pre-Node-RED 1.0 servers
 * @property {Function=} on Event handler
 * @property {Function=} removeListener Event handling
 * z, wires
 */

/**
 * @typedef {Object} MsgAuth The standard auth object used by uibuilder security. See docs for details.
 * Note that any other data may be passed from your front-end code in the _auth.info object.
 * _auth.info.error, _auth.info.validJwt, _auth.info.message, _auth.info.warning
 * @property {String} id Required. A unique user identifier.
 * @property {String} [password] Required for login only.
 * @property {String} [jwt] Required if logged in. Needed for ongoing session validation and management.
 * @property {Number} [sessionExpiry] Required if logged in. Milliseconds since 1970. Needed for ongoing session validation and management.
 * @property {boolean} [userValidated] Required after user validation. Whether the input ID (and optional additional data from the _auth object) validated correctly or not.
 * @property {Object=} [info] Optional metadata about the user.
 */

/**
 * @typedef {Object} userValidation Optional return object that is able to pass on additional use metadata back to the client.
 * @property {boolean} userValidated Required. Whether the input ID (and optional additional data from the _auth object) validated correctly or not.
 * @property {userMetadata} [authData] Optional return metadata about the user. Will be added to the output msg's _auth object
 */

/**
 * @typedef {Object} userMetadata Optional. Metadata about the user. Will be added to the output msg's _auth object.
 * This is just an example of what you might want to return, you can send anything you like.
 * @property {String} [name] Users full name or screen name.
 * @property {String} [message] A message that the front-end code could use to display to the user when they log in.
 * @property {String} [level] Users authorisation level (admin, gold, silver, reader, editor, author, ...).
 * @property {String} [location] Users location.
 * @property {Date} [passwordExpiry] Date/time the users password expires.
 * @property {Date} [subsExpiry] Date/time the users subscription expires.
 */

module.exports = {}