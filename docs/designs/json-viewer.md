---
title: Advanced JSON Viewer web component
description: |
  This document outlines the design ideas and definitions for an advanced JSON Viewer web component. It may include features, implementation details, and potential enhancements. The content is intended for discussion, guidance, and future development.
created: 2026-05-09 11:34:12
updated: 2026-05-11 12:57:17
status: live in v7.7
since: v7.7
---

## Concept

A vanilla web component that will render JSON data. It will include folding of nested properties, basic syntax highlighting, search, copy property paths and/or property values.

It should allow properties not normally serializable to be rendered in a useful way, such as functions, symbols, and circular references. In these cases, the "value" should be rendered as a string that shows the property type and some relevant information, such as the function name or symbol description. With the string wrapped in something that visually distinguishes it from regular string values, such as a different color or a special icon.

## Base requirements

* [x] MUST Accept a JavaScript object as input.
* [x] MUST Accept a JSON object or string as input.
* [x] MUST Render the input as HTML without the need for DOM processing (so that it works in Node.js as well as the browser).
* [x] Nested properties MUST be visually nested.
* [x] Nested properties MUST be collapsible/expandable.
* [x] MUST have syntax highlighting for different data types (strings, numbers, booleans, null, undefined, functions, symbols).
* [x] MUST have search functionality to find properties by name or value.
* [x] MUST have the ability to copy property paths and/or values to the clipboard.
* [x] MUST handle circular references gracefully, indicating them in the UI without causing errors.
* [x] MUST provide a clean and user-friendly interface for viewing complex JSON data.
* [x] MUST have both IIFE and ESM builds available for use in different environments.
* [x] MUST use the ti-base-component as a base for consistent styling and behavior with other uibuilder components.
* [x] MUST support keyboard navigation of the tree (arrow keys to traverse, Enter/Space to toggle collapse) to satisfy WCAG 2.2 AA keyboard accessibility requirements.
* [x] MUST use appropriate ARIA roles (`role="tree"`, `role="treeitem"`, `aria-expanded`) so screen readers can announce the tree structure correctly.
* [x] MUST expose configuration via HTML attributes (e.g. `max-depth`, `collapsed`, `theme`) in addition to JavaScript property assignment, so the component can be used declaratively in HTML.
* [x] MUST use the light DOM if possible.

* [x] SHOULD be performant even with large JSON objects, potentially using lazy rendering for deeply nested structures.
* [x] SHOULD display an inline item count on collapsed nodes (e.g. `Array [12]`, `Object {5}`) so users can gauge the size of a branch without expanding it.
* [x] SHOULD support a configurable initial expansion depth (default: 2 levels), collapsing deeper branches automatically on first render to keep large objects readable.
* [x] SHOULD provide a single-click collapse-all / expand-all control at the top of the component.
* [x] SHOULD expose CSS custom properties (e.g. `--json-viewer-bg`, `--json-viewer-string-color`) so consumers can theme the component and support both light and dark modes without modifying shadow DOM styles.
* [x] SHOULD dispatch typed CustomEvents (`json-viewer:copy`, `json-viewer:search`, `json-viewer:toggle`) on relevant user interactions so parent applications can react without polling.

* [x] MAY use the existing uibuilder client syntaxHighlight function as a guide for syntax highlighting, but MUST NOT have it as a dependency
* ~~MAY use an external library but this would need to be bundled with the component and not require additional dependencies and allow offline use.~~
* [x] MAY include JavaScript callable API's for:
  * Updating the rendered JSON data dynamically after initial render by assigning new values to any depth in the tree, with the component efficiently re-rendering only the affected branches.
  * Returning the rendered HTML as a string for server-side rendering or integration into other frameworks that may not support web components natively.
* [x] MAY support filtering the visible tree by data type (string, number, boolean, null, etc.) via a small toolbar control, complementing the existing search feature without duplicating it.
* [x] MAY allow read-only inline editing of scalar values (strings, numbers, booleans) with the edited value emitted via a `json-viewer:change` CustomEvent and `uibuilder.send` if uibuilder is available, keeping the component useful beyond pure viewing.
  * [x] In edit mode, objects and arrays SHOULD have an "add property" button.
  * [x] In edit mode, properties SHOULD have a "delete" button to remove them from the JSON structure.

## Design specifics

* **Custom element tag name**: `<json-viewer>`

* **SSR/Browser use**: The resulting built module will export both the web component class for browser use and a static function for server-side rendering of HTML strings, allowing flexibility in different environments. When applied in the browser, the component will auto-define itself on load, but the SSR function can be imported and used independently in Node.js or other server environments without DOM access. The component will use the static function internally for its own rendering logic, ensuring consistency between SSR and client-side rendering while avoiding unnecessary DOM dependencies in the SSR code path. It does not matter that the source code will contain DOM references, as long as the built version and SSR output function can be used without executing those parts of the code.

* Component HTML Attributes:
  * `data` (string or object) — the JSON data to render, either as a JSON string or a JavaScript object.
  * `max-depth` (number) — the maximum depth to which the tree should be expanded on initial render (default: 2).
  * `collapsed` (boolean) — whether all nodes should be collapsed by default (overrides `max-depth` if true).
  * `filter-type` (string) — a data type to filter by (e.g. "string", "number"), showing only nodes of that type and their ancestors.
  * `editable` (boolean) — whether scalar values should be editable inline.

* **Build process**: The component will be built using ESBUILD with both IIFE and ESM outputs and configured as per other builds in uibuilder. The source code will be written in modern JavaScript (ES2020+) and transpiled as needed for compatibility. The build will produce two bundled files (IIFE and ESM) that includes all necessary code and dependencies, allowing it to be used in any environment without additional setup. The build process will utilise the `bin/build.js` script with appropriate configuration to ensure consistency with other components and proper integration into the overall project build pipeline. There will be new npm scripts added to `package.json` for building the component, such as `build:json-viewer`. The watcher will be updated to auto-rebuild on source changes. (Note: the old gulp-based build process is being phased out in favor of ESBUILD, but the final integration details will depend on the current state of the project at the time of implementation.)

* **File locations**: The source code for the component will be located in `src/components/json-viewer/` to keep it organized with other components. The built outputs will be placed in `front-end/utils/` to make them easily accessible for import in other parts of the project.

* **Testing**: While Vitest is the preferred testing framework, it has not yet been implemented. So no test file is required at this stage.
