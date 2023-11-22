This folder contains the source code for both the current
uibuilder front-end library and the low-code `ui.js` library
that hydrates low-code UI definitions into full HTML.

The GULP `watchme` process watches for changes and automatically
builds the distribution files which are checked for JavaScript
versioning (currently restricted to ES2019 or below), and minified.
Map files are also provided. The distributions have 2 versions
IIFE and ESM. See `/front-end/`.

The `ui.js` library is also build into a Node.js library
`/nodes/libs/ui.js` so that it can be utilised in nodes such as
`uib-html`. It is also made available as standalone browser versions
in both IIFE and ESM versions. See `/front-end/`.
