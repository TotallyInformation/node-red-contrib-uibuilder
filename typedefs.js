/**
 * @typedef {object} uibNode Local copy of the node instance config + other info
 * @property {String} uibNode.id Unique identifier for this instance
 * @property {String} uibNode.type What type of node is this an instance of? (uibuilder)
 * @property {String} uibNode.name Descriptive name, only used by Editor
 * @property {String} uibNode.topic msg.topic overrides incoming msg.topic
 * @property {String} uibNode.url The url path (and folder path) to be used by this instance
 * @property {boolean} uibNode.fwdInMessages Forward input msgs to output #1?
 * @property {boolean} uibNode.allowScripts Allow scripts to be sent to front-end via msg? WARNING: can be a security issue.
 * @property {boolean} uibNode.allowStyles Allow CSS to be sent to the front-end via msg? WARNING: can be a security issue.
 * @property {boolean} uibNode.copyIndex Copy index.(html|js|css) files from templates if they don't exist?
 * @property {boolean} uibNode.showfolder Provide a folder index web page?
 * @property {boolean} uibNode.useSecurity Use uibuilder's built-in security features?
 * @property {boolean} uibNode.tokenAutoExtend Extend token life when msg's received from client?
 * @property {Number} uibNode.sessionLength Lifespan of token (in seconds)
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
 * z, wires
 */

/**
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

/**
 * @typedef {Object} userValidation Optional return object that is able to pass on additional use metadata back to the client.
 * @property {boolean} userValidation.userValidated Required. Whether the input ID (and optional additional data from the _auth object) validated correctly or not.
 * @property {userMetadata} [userValidation.authData] Optional return metadata about the user. Will be added to the output msg's _auth object
 */

/**
 * @typedef {Object} userMetadata Optional. Metadata about the user. Will be added to the output msg's _auth object.
 * This is just an example of what you might want to return, you can send anything you like.
 * @property {String} [userMetadata.name] Users full name or screen name.
 * @property {String} [userMetadata.message] A message that the front-end code could use to display to the user when they log in.
 * @property {String} [userMetadata.level] Users authorisation level (admin, gold, silver, reader, editor, author, ...).
 * @property {String} [userMetadata.location] Users location.
 * @property {Date} [userMetadata.passwordExpiry] Date/time the users password expires.
 * @property {Date} [userMetadata.subsExpiry] Date/time the users subscription expires.
 */
