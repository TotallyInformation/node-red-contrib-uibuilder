/** uibuilder standard object definitions
 * Used by code editors & typescript to validate data.
 */

/// <reference types="node" />
/// <reference types="node-red" />

import { Node } from 'node-red';

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
export interface uibNode extends Node {}

/** The standard msg.auth object used by uibuilder security. See uibuilder docs for details.
 * typedef {Object} _auth The standard auth object used by uibuilder security. See docs for details.
 * Note that any other data may be passed from your front-end code in the _auth.info object.
 * _auth.info.error, _auth.info.validJwt, _auth.info.message, _auth.info.warning
 * @param id Required. A unique user identifier.
 * @param password Required for login only.
 * @param jwt Required if logged in. Needed for ongoing session validation and management.
 * @param sessionExpiry Required if logged in. Milliseconds since 1970. Needed for ongoing session validation and management.
 * @param userValidated Required after user validation. Whether the input ID (and optional additional data from the _auth object) validated correctly or not.
 * @param info Optional metadata about the user.
 */
export interface MsgAuth {
    /** Required. A unique user identifier. */
    id: string;
    /** Required for login only. */
    password: string | undefined;
    /** Required if logged in. Needed for ongoing session validation and management. */
    jwt: string | undefined;
    /** Required if logged in. Milliseconds since 1970. Needed for ongoing session validation and management. */
    sessionExpiry: string | undefined;
    /** Required after user validation. Whether the input ID (and optional additional data from the _auth object) validated correctly or not. */
    userValidated: string | undefined;
    /** Optional. Any other data may be passed from your front-end code in the _auth.info object. 
     * @examples _auth.info.error, _auth.info.validJwt, _auth.info.message, _auth.info.warning
     */
    info: string | undefined;
}

