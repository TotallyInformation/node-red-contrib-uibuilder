# security.js Technical Documentation

The `security.js` file is the custom part of uibuilder's security architecture. 
It allows you to provide custom security functions without needing to understand
the complexities of security programming.

uibuilder provides a very simple master template version of security.js that you can (and should)
alter for your own needs.

## Summary

The file is a node.js module which means that it needs a `module.exports` section that contains the various
functions that uibuilder requires in order to be able to validate users and sessions.

### Exported functions

* `userValidate(_auth)` - based on an id, lookup the user data to see if the user is valid.
  
  It **MUST** return a boolean or object of type userValidation (which is documented in the template).

  It is called from the server's logon process. (uiblib.js::logon) but might also be called at any
  other time in order to revalidate user credentials.

* TBC

## Standard Schema for `msg._auth`

uibuilder proposes a standard(ish) schema for exchanging authentication, authorisation and session data.

This uses the `_auth` object property on exchanged `msg`s. The actual content of the object is likely to be different depending on what the message is.

Please refer to the [Security doc](./security.md) for details.

## NOTES & WARNINGS

* If there is an error in this JavaScript, it is very likely that Node-RED will terminate with an error. Check the Node-RED log if this happens.
  
* You can use different security.js files for different instances of uibuilder.
  
  Simply, place a security.js file in the instances root folder (e.g ~/.node-red/uibuilder/<url>/security.js).
  Note, however, that this means that the security.js file can be edited using the admin Editor.

  You have to restart Node-RED to pick up the new file.
