/** TS Definition file for security.js
 * May be used in a code editor such as VScode to help ensure
 * that the file and the data is correctly formed
 */

import { MsgAuth } from "../../index";

/**
 * typedef {Object} userValidation Optional return object that is able to pass on additional use metadata back to the client.
 * property {boolean} userValidated Required. Whether the input ID (and optional additional data from the _auth object) validated correctly or not.
 * property {userMetadata} [authData] Optional return metadata about the user. Will be added to the output msg's _auth object
 */
/** Validated User object */
export interface userValidation {
    /** Required. Whether the input ID (and optional additional data from the _auth object) validated correctly or not. */
    userValidated: boolean;
    /** Optional. return metadata about the user. Will be added to the output msg's _auth object. */
    authData: any;
}

/** User-defined security.js file
 * Required by uibuilder if its security feature is turned on.
 * The version in <userDir>/uibuilder/.common is used by ALL instances of uibuilder
 * unless overridden by a local version in <userDir>/uibuilder/<url>/.common
 */
declare namespace security {
    /** Validate user against your own user data.
     * The minimum input data is _auth.id which must represent a unique ID.
     * Called from the logon function (uiblib.js::logon) which is triggered by a uibuilder control msg from the client of type 'logon'.
     * May also be called to revalidate users at any time.
     * param {MsgAuth} _auth Required. 
     * return {boolean|userValidation} Either true/false or Object of type userValidation
     */
    function userValidate(_auth: MsgAuth): boolean | userValidation;
}

