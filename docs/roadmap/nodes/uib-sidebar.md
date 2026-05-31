---
title: Road map for the uib-sidebar node
description: |
  This page is a working document to track the development of the uib-sidebar node. It is not intended to be a comprehensive list of all features or changes, but rather a high-level overview of the main areas of development. It is expected that this page will be updated frequently as development progresses and new features are added or changed.
created: 2026-05-30 13:13:05
updated: 2026-05-30 13:13:10
author: Julian Knight (Totally Information)
---

  * [ ] Create a node-red action to display the tab.
  * [ ] If an input element is part of a form, only send the form data when the form is submitted rather than immediately. 
  * [ ] Add a link to the help sidebar that has an `onclick` handler to show the uib sidebar.
  * [ ] Add file-upload support to the sidebar. This is not currently supported in the sidebar. A message is sent back containing the file meta-data but currently the file is not.
  * [ ] Allow file uploads larger than the max message size by splitting the file into chunks and reassembling on the server.
  * [ ] Add processing for fieldsets/radiobuttons.
  * [ ] Allow processing of content editable divs.
  
  * [ ] May want an alternative simpler input msg (as well as the full msg type) with just topic/payload that uses topic for html-id and payload for `value` if it exists on the element or innerText/HTML.
  * [ ] May want to have multiple tabs possible by adding a name setting to the node. Restricting to a single sidebar for now.
  * [ ] Might need a flag in the uibuilder setting.js prop that allows/disallows HTML content. Or maybe turns off DOMPurify.
  * [ ] Maybe cross-check with my dom/tinyDOM library to see if it can be used to simplify the code.
