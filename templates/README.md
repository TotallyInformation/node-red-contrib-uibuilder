# UIBUILDER Templates master folder

This folder contains the master templates for:

* UIBUILDER blobal common shared files. `/common/` - copied to `<uibRoot>/common/` when UIBUILDER is installed.

* UIBUILDER global configuration files. `/.config/` - copied to `<uibRoot>/.config/` when UIBUILDER is installed.

* `uibroot-package.json` - The package.json file that is copied to the root of the global UIBUILDER folder.

* uibuilder node templates:
  * Blank template. `/blank/` - the default template for `uibuilder` nodes.
  * `template_dependencies.js` Contains the list of front-end templates for `uibuilder` nodes. This includes the blank template but also some standard external templates.

* `uib-markweb` node default configuration files. `/markweb-defaults/` - not copied unless requested when configuring a `uib-markweb` node. Used in-place when an instance config folder is not specified or inaccessible.

When UIBUILDER is installed, these templates are copied to the Node-RED user directory under `<uibRoot>/templates/`.

When a new `uibuilder` or `uib-markweb` node is added to a Node-RED flow, the selected template is copied from `<uibRoot>/templates/` to the new instance folder for that node.
