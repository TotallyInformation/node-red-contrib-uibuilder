Before logging an issue, please make sure that you are either on the latest npm version or the latest GitHub version.

Please ensure that as much of the following information is included as possible.

### Software and Package Versions

> Node.JS, Node-RED and uibuilder back-end versions are listed in the Node-RED log on startup. 
  `npm --version` shows the installed version of npm.
  From your browser's developer console (F12), the uibuilder front-end
  version can be seen by issuing the command `uibuilder.get('version').
  Please include all 5. Node.JS needs to be at least 4 but realistically, anything less than 6 is unlikely to work.

> Please also include your Operating System name and version and your browser's name and version. Any browser version less than n-2 or IE < v11 very unlikely to work without help from [polyfill.io](https://polyfill.io).

> I know it seems like a lot but it saves time in the long run

Software       | Version
-------------- | -------
Node.JS        | 
npm            | 
Node-RED       | 
uibuilder node | 
uibuilderFE    | 
OS             | 
Browser        | 


### How is Node-RED installed? Where is uibuilder installed?

> Often, issues with nodes occur because of non-standard installations.
  This may still indicate a bug so it is fine to report an issue. Just be sure you understand the consequences of how you have installed things.
  
> A very common set of issues come from installing nodes as root instead of the user that runs Node-RED (e.g. using sudo on Mac/Linux). You will most likely be asked to undo that before we can analyse the issue.

> Also quite common is to install the uibuilder node in the wrong folder. It is best to install using the Node-RED admin interface "Manage Palette". If installing manually, make sure you are in your `userDir` folder before installing (typically `~/.node-red`).
