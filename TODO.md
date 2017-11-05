# Completed
See the [Change Log](CHANGELOG.md) for details of what has been completed

# In progress
These are things that have been started but I'm not quite happy to fully sign off as yet. They probably need further enhancing.

- All passing of code & css from the backend.
  This is live but only in a very simplistic way. Suggested enhancements:

  - Passed code should _replace_ the previous.
    Currently, it is always added.

  - HTML cannot yet be passed

# Next
This is what needs working on next.

- Add switch to node to allow prevention of template css/js being copied.
- Add ability to pass HTML and maybe library code (e.g. Vue/Riot/Moon templates) to the front-end.

# Enhancements
These would be nice to do at some point and would make the node more robust and a easier to use in places.

Please feel free to contribute a pull request if you would like to.

- Add validation to `url` setting
  Allow A-Z, a-z, 0-9, _, - and / only. Limit to 50 characters (maybe less)

- Add safety validation checks to `msg` before allowing it to be sent/received to/from front-end
  Started: script/style is removed if disallowed in settings

- Add integrated ExpressJS security to Socket.IO

- Process `httpNodeAuth`

- Add ability to auto-install missing modules.

- Add ability to create resources from the Node-RED admin UI - currently all resources have
  to be created in the file system. Ideally, we would have editors in the node that allowed HMTL, JavaScript and CSS content to be created. We would also possibly allow such content to be passed on the msg though that could be somewhat dangerous so probably should be an option.

  **In the short term, this could simply be a published sub-flow that takes input and writes to file(s)**

- Use webpack to "compile" resources into distribution folders upon (re)deployment -
  allowing for the use of more resource types such as: less/scss; UI frameworks such as Bootstrap, Foundation, Material UI; jsx or other dynamic templating; front-end frameworks such as VueJS, Angular or REACT.

- If using `dist` code, Add a check for new file changes in local `src` folder

# Possibilities for further thought
These are random thoughts that might make it into the To Do list but really need more thought before committing to them.

- Tidy up Socket.IO control messages so they add value. When the client receives its first
  control msg, it should respond so that the server can track the socketID's of connected clients (see "Show Connection" flag idea below).

- Add "Show Connection" flag to admin ui. Would output a message on each connection that would
  include the socketId. Allowing for processing of messages back to a specific client instance.

- Add sender IP address when sending msg from browser - so that Node-RED can
  differentiate where things are coming from.
  The `_socketId` obviously already identifies the originator technically but additional info might be helpful.
  _Possibly make this optional. Maybe have other optional data too such as device_

- _(Maybe compile template resources to dist folder?)_

- _We might need to add some checks for updated master templates? Maybe issue a warning? Not sure._

- Auto-create an index page with links to each uibuilder instance
  Could add a description field to the node.
