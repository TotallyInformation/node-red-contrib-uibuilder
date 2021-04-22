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

//#region ----- Variable and parameter definitions - can be removed if not wanted ----- //
/**
 * Standard msg._auth object exchanged in msg's between front-end and server
 * @typedef {import('../../index').MsgAuth} MsgAuth
 */ 
/**
 * Validated user object returned by the userValidate function
 * typedef {import('./security').userValidation} userValidation 
 */

try { // Partially fixes #126
    const TYPEDEFS = require('../../typedefs.js')
} catch (e) {}
/**
 * typedef {TYPEDEFS.MsgAuth} MsgAuth
 * @typedef {TYPEDEFS.userValidation} userValidation
 * @typedef {TYPEDEFS.userMetadata} userMetadata
 */

//#endregion ----- ------------------------------------------------------------- ----- //

module.exports = {
    /** Validate user against your own user data.
     * The minimum input data is _auth.id which must represent a unique ID.
     * Called from the logon function (uiblib.js::logon) which is triggered by a uibuilder control msg from the client of type 'logon'.
     * May also be called to revalidate users at any time.
     * @param {MsgAuth} _auth Required. 
     * @return {boolean|userValidation} Either true/false or Object of type userValidation
     */
    userValidate: function(_auth) {
        console.log(`[uibuilder:security.js] userValidate Security from ${__filename} used. Replace this template with your own code. _auth:`, _auth)

        /** Manual "test" ID validates - this will be replaced with a suitable lookup in your code - maybe from a database or a file.
         * You will also want to pass through some kind of password to validate the user.
         */
        if ( _auth.id === 'test' ) {
            console.log(`[uibuilder:security.js] User id ${_auth.id} has been validated`)

            // Example of simple boolean return
            return true

            //Example of object return with additional data that gets passed back to the client
            // return {
            //     userValidated: true,
            //     authData: {
            //         name: 'Me',
            //         message: 'Hi you, don\'t forget to change your password :)'
            //     }
            // }
        }

        // In all other cases, fail the validation - optionally, you can include more info here by returning an object.
        return false
        // return {
        //     userValidated: false,
        //     authData: {
        //         message: `Login failed, User id ${_auth.id} not recognised.`
        //     }
        // }
        
    } // ---- End of userValidate ---- //

}

//EOF