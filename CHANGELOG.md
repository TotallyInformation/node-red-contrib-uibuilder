v0.3.1

- Fixed issue when no config settings found. Added getProps() function
  Error prevented anything from working. Changed to use getProps to prevent.

v0.3.0

- Fixed incorrect line endings. Updated front-end manifest.json. Fixed minor error in uibuilder.js. Updated dependency versions.
- Breaking changes due to new major version of Socket.IO ([v2](https://socket.io/blog/socket-io-2-0-0/)) and Webpack. Shouldn't impact anything since you need to restart Node-RED anyway.
  However, you might need to force a full reload of any active clients.

v0.2.1

- Tweak this readme as the node seems to work OK. Removing the _Alpha_ label.
  You should consider this suitable for general hobby use. Production use would need good testing before trying to rely on it.
  Remember, this has been written just by me, I'm afraid I can provide no guarantees.

v0.2.0

- Fixed incorrect app.use logic which meant that the tree order was incorrect. Also improved app.use removal though still not perfect, seems to be a limitation of ExpressJS v4

v0.1.4

- Add logic to client to start retrying to connect after server closedown
- Final code and text tidying ready for wider use

v0.1.3

- Add control msgs from server to client on closedown of server (e.g. for redeploy)
- Add topic to node config
- Add userVendorPackages to node config

v0.1.2

- Simply dynamic front-end code using JQuery. Fixed typo's in docs. Fixed auto-respond test messages. Add path to Socket.IO to make sure the client loads the right version from the server.

v0.1.0

- Initial release to npm. Socket.IO namespace working, src/dist folders available and working. Only the most basic front-end template included.
