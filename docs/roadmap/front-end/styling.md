---
title: Styling roadmap
description: >
    This page is a working document to track the development of the front-end styling for uibuilder. It is not intended to be a comprehensive list of all features or changes, but rather a high-level overview of the main areas of development.
    It is expected that this page will be updated frequently as development progresses and new features are added or changed.
    The main styling for uibuilder comes from the uib-brand.css file.
created: 2026-04-19 14:45:25
updated: 2026-04-19 19:22:13
author: Julian Knight (Totally Information)
---

## To do
* [ ] Make `form > label` use a variable for `align-self`.
* [ ] Add more css vars for styling buttons. [Ref](https://discourse.nodered.org/t/uibuilder-button/98970/21)

## Other
* Move uib-brand.css to a new sub-package. Publish separately.
* Enhance CSS with ideas from [OpenProps](https://open-props.style).

* Add nav menu formatting. include `header nav` & `aside nav` variants.

* Forms:

  * Allow for blank line spanning the form width.
  * Allow for information line spanning the form width.

* Something similar to the sidebar status panel but segmented. Choose number of segments.

* Make `input[type="color"]` starting colour the brand colour. Can only be done via JavaScript.

* Check `input:valid` pseudo-class defaults

* Improve input/form elements. [Ref](https://developer.mozilla.org/en-US/docs/Web/CSS/:required)

* Add treeview formatting. [ref](https://iamkate.com/code/tree-views/)

* Consider an "Easy Read" variation:

  * Easy read means:

    * wide margins
    * images on the left
    * larger text (14 to 16pt)
    * bigger spaces between lines (1.5 spacing in a word processor for example) - already done in the base.
    * 1 idea per image
