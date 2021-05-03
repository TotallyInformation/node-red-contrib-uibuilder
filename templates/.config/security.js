/* globals module */
/**
 * Copyright (c) 2020-2021 Julian Knight (Totally Information)
 * https://it.knightnet.org.uk
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
 **/
/**
 * Template security functions for uibuilder.
 * Only used if the node.useSecurity flag is set.
 * Please replace with your own code.
 * 
 * You MUST export the following functions:
 *   - userValidate - based on an id, lookup the user data to see if the user is valid.
 *                    MUST return a boolean or object of type userValidation.
 *                    Called from the server's logon process. (uiblib.js::logon)
 *      
 * 
 * Each function MUST at least return true/false. See each function for more details.
 *
 * NOTES & WARNINGS:
 *   1) IF there is an error in this JavaScript, it is very likely that Node-RED will terminate.
 *   2) You can use different security.js files for different instances of uibuilder.
 *      Simply, place a securiy.js file in the instances root folder (e.g ~/.node-red/uibuilder/<url>/security.js)
 *      Note, however, that this means that the security.js file can be edited using the admin Editor.
 *      You have to restart Node-RED to pick up the new file.
 */
'use strict'

/** Define the _auth object
 * @typedef {Object} _auth The standard auth object used by uibuilder security. See docs for details.
 * Note that any other data may be passed from your front-end code in the uibAuth object.
 * @property {String} id Required. A unique user identifier.
 * @property {String} [password] Required for input to login only.
 * @property {String} [jwt] Required if logged in. Needed for ongoing session validation and management.
 * @property {String} [sessionExpiry] Required if logged in. ISO8601 formatted date/time string. Needed for ongoing session validation and management.
 * @property {boolean} [userValidated] Required after user validation. Whether the input ID (and optional additional data from the _auth object) validated correctly or not.
 * @property {Object=} [info] Optional metadata about the user.
 */

module.exports = {
    /** Validate user against your own user data.
     * The minimum input data is _auth.id which must represent a unique ID.
     * Called from the logon function (uiblib.js::logon) which is triggered by a uibuilder control msg from the client of type 'logon'.
     * May also be called to revalidate users at any time.
     * @param {_auth} _auth Required. 
     * @return {_auth} Object of type _auth
     */
    userValidate: function(_auth) {
        console.log(`[uibuilder:.common/security.js] userValidate Security from '${__filename}' used. Replace this template with your own code. _auth:`, _auth)

        // Always start by invalidating the user credentials
        _auth.userValidated = false
        
        /** Manual "test" ID validates - this will be replaced with a suitable lookup in your code - maybe from a database or a file.
         * You will also want to pass through some kind of password to validate the user.
         */
        if ( _auth.id === 'test' ) {

            console.log(`[uibuilder:.common/security.js] User id '${_auth.id}' has been validated`)

            _auth.userValidated = true
            _auth.info = {
                name: 'Jimbob',
                message: 'Hi Jimbob, don\'t forget to change your password :)'
            }

        } else {

            // In all other cases, fail the validation - optionally, you can include more info here as well.
            _auth.userValidated = false
            _auth.info = {
                message: 'Ouch! Sorry, that login is not valid'
            }
        }
        
        return _auth

    } // ---- End of userValidate ---- //

}

//EOF