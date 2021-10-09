
## Base data, folders, and files

### Folder: `<userDir>/`

This is usually `~/.node-red/` and is the main folder containing the settings and node packages for Node-RED.

Prio to v5 of uibuilder, this was used to install uibuilder front-end packages. As of v5+, this is no longer the case.

### Folder: `<uibRoot>/`

Needs a package.json file and will contain a `node_modules` folder if any packages are installed for all instances of uibuilder (the default location).

### Folder: `<uibRoot>/<url>/`

This is the local configuration folder for a uibuilder node instance (as defined by the node's `url` setting).

Needs a `package.json` file and will contain a `node_modules` folder if any packages are installed for this uibuilder node instance.

## System startup

## Editor

### Open panel for a uibuilder node instance

### Add a new package

### Remove a package