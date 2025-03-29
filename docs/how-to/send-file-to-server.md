---
title: How to send files from the browser to the Node-RED server
description: |
  Describes how to send a file to the Node-RED server using an HTML input.
created: 2025-03-28 16:16:19
updated: 2025-03-29 13:28:01
---

## Overview
This document describes how to send a file to the Node-RED server using an HTML input element. This is useful for uploading files from the client to the server.

## HTML Input Element

The HTML input element is used to create a file upload field. The `type` attribute is set to `file`, which allows the user to select a file from their local file system.

```html
<!-- User selects a single file from their local file system -->
<input type="file" id="fileInput" />
<!-- User selects multiple files from their local file system -->
<input type="file" id="fileInputMulti" multiple />
<!-- User captures a photo using their mobile device front camera -->
<input type="file" id="fileInputWebcam" capture="user" />
<!-- Use accept="image/*", accept="video/*", or accept="audio/*" to limit the file types if desired -->
<!-- Use capture="environment" to use the rear camera on mobile devices instead of the front -->
```

I have missed out the accessibility requirements from the above example. Please make sure that you use sensible labels.

I've also missed out a wrapping `<form>` element. If you are wanting to capture multiple inputs from a user, you should wrap the inputs in a `<form>` element. This is important for accessibility and usability. Please use the uibuilder examples for the `uib-element` node that are built into the Node-RED Editor's Import Library to create a well-formed example for reference.

With UIBUILDER, you could also use the Form element with the `uib-element` node to build your form.

## Sending the File to the Server

When the user selects a file, you can make use of uibuilder's `uibuilder.eventSend(event)` function to send the file to the server. The `event` parameter is an object that contains information about the event that triggered the function, it is generated automatically by the browser.

For a full form example, you can use the following HTML code which only sends the form inputs on the press of a butter.

```html
<form id="myForm">
  <input type="file" id="fileInput" />
  <div title="Type: file">
    <label for="r3a-file-multi">Multiple files:</label>
    <input id="r3a-file-multi" type="file" multiple title="Type: file" />
  </div>
  <div>
    <button type="button" title="Send the form data back to Node-RED"
      onclick="uibuilder.eventSend(event)" id="sform1-btn-send"
    >
      Send
    </button>
    <button type="button" title="Reset the form"
      onclick="event.srcElement.form.reset" id="sform1-btn-reset"
    >
      Reset
    </button>
  </div>
</form>
```

For a stand-alone input example, you can use the following HTML code which sends the file as soon as the user has input it.

```html
<input id="file-multi" type="file"
  multiple="multiple" onchange="uib.eventSend(event)"
/>
```

Note that, if using uibuilder's `uib-element` node, it creates the form and the event handlers for you.
