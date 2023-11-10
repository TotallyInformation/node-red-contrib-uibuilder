This folder contains a sub-folder for each custom web component included in the uibuilder main package.

ESBUILD is called from GULP to build loadable versions of each element as needed. 

Some components (eg uib-var) are built directly into the uibuilder front-end library.
Others may be built as separate loadable components and in that case, they will appear in the `/front-end/components/` folder in both IIFE and ESM minimised versions with map files.

