# Regression tests for uibuilder

Here are some simple, manual tests that try to ensure that uibuilder is working as expected.

## Quick test of basic features

The default configuration of a new uibuilder node gives a single page that uses VueJS & bootstrap-vue. That page shows incoming/outgoing messages from/to the Node-RED server, keeps count, shows some flags and contains a counter button that will send a message back to Node-RED.

1. Check that initial load triggers a control message from the server and a corresponding control message back to the server. 
2. Check that pressing the button sends a message to the server. 
3. Check that a msg flowing into the uibuilder node is seen in the front-end.
4. Also test that a msg from Node-RED that includes a specific `msg._socketId` only goes to the correct client.
5. a msg sent without the `msg._socketId` property goes to all clients.
6. index.html and other files in `<uibRoot>/<url>/src`  should be accessible to client on URL `./`
7. Index.html in `<uibRoot>/<url>/dest` should override index.html in the src folder.
8. Files in `<uibRoot>/common/` should be available to the client on the URL `./common`

Notes: `<uibRoot>` = `~/.node-red/uibuilder` on a standard installation. `<uibRoot>` = `~/.node-red/projects/<projectName>/uibuilder/` on a standard install with projects active. `~` = user home folder. `~/.node-red/` is referred to as the `userDir` and can be changed on Node-RED startup. `<url>` refers to the url setting in the admin ui for uibuilder nodes.

Initial control msg from server to client on connect:

```json
{"uibuilderCtrl":"client connect","cacheControl":"REPLAY","_socketId":"/nr/uib#W4bY7aTZ6WC1M_9MAAAG","from":"server","serverTimestamp":"2019-05-26T13:01:19.997Z","_msgid":"211cf057.572ef"}
```

Initial control msg reply from client to server after connect:

```json
{"uibuilderCtrl":"ready for content","cacheControl":"REPLAY","from":"client","_socketId":"/nr/uib#W4bY7aTZ6WC1M_9MAAAG","_msgid":"320a6821.6a6208"}
```

Control message from server on client disconnection:

```json
{"uibuilderCtrl":"client disconnect","reason":"transport close","_socketId":"/nr/uib#W4bY7aTZ6WC1M_9MAAAG","from":"server","_msgid":"672af72f.170d18"}
```

## Admin UI: Package Handling

Load the admin ui for any uibuilder node. Click on the "Manage Front End Libraries" button.

1. Add a new package
2. Remove a package
3. Add then remove the same package

## Vendor paths correct after deploy

Load the index API page, make a change in the admin ui, deploy, reload index API page.

1. "uibuilder Vendor ExpressJS Paths" section of the index should be correct for the installed vendor packages.

## Pages in sub-paths load correctly

Create a page in a sub-path, adjust the URL's accordingly. Alter the JS, change `uibuilder.start()` to `uibuilder.start(<namespace>, <ioPath>)`.

1. Page should load all resources correctly 
2. socket.io communications should start successfully.

