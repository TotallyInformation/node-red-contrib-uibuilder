This folder contains source code for uibuilder.

Split between `editor` (the node's html file), `runtime` (the node's js file and any libs in a sub-folder) and `fe` for the front-end library.

Not all of the above have separate source code as yet but as uibuilder gets more complex, it makes sense to split the code and use a build
step to assemble and optimise the usable code.