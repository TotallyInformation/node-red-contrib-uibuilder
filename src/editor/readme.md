This folder contains the source for uibuilder's Editor code (html file).

Each node has its own sub-folder.

It splits the code into the 3 `script` sections in a node's html. The JavaScript, the Editor panel definition and the help panel definition.
The build process re-assembles this.

This makes it much easier to apply proper linting and type checking.

If adding new nodes, create a new sub-folder and matching files **and** update the `./gulpfile.js` as well.