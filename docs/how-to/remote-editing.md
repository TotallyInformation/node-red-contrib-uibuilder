---
title: Editing front-end files remotely
description: |
  Front-end HTML, CSS, and JS files for a uibuilder instance reside on the Node-RED server
  typically. This page describes how to edit those files remotely.
created: 2025-12-09 12:05:52
updated: 2025-12-09 12:20:53
---

When working with a Node-RED instance running on a remote server (e.g., a cloud server or a Raspberry Pi on your local network), the uibuilder instance files exist on the server and therefore not easily editable from your local development machine.

The uibuilder node provides a basic file editor that can be used to edit the front-end files directly from the Node-RED editor. However, this editor is quite limited and not ideal for complex editing tasks.

There are a couple of approaches to have a better editing experience:

1. **Remote Development Extensions**: Some code editors, like Visual Studio Code, offer remote development extensions (e.g., Remote - SSH) that allow you to open a remote folder on the server directly in your local editor. This provides a seamless editing experience without needing to manually sync files.

   > [!TIP]
   > The Edit link provided in the uibuilder node will attempt to provide a valid Visual Studio Code Remote - SSH URL. Clicking the link will open the remote folder in VSCode if everything is set up correctly.
   >
   > The link can be edited to match your specific configuration if needed. See the "Advanced" tab in the node's edit dialog for more details.

2. **Mount Remote Filesystem Locally**: Use tools like SSHFS (for Linux and macOS) or WinFsp with SSHFS-Win (for Windows) to mount the remote server's filesystem on your local machine. This way, you can use your favorite local code editor (like VSCode, Sublime Text, etc.) to edit the files directly as if they were on your local machine.

   > [!TIP]
   > Edit the uibuilder node's "Edit" link to point to the mounted local path for easier access.

3. **Use a Version Control System**: Set up a Git repository for your uibuilder front-end files. You can clone the repository on your local machine, make changes, and then push them back to the remote server. You can automate the deployment process using hooks or CI/CD pipelines to update the files on the server whenever you push changes to the repository.

4. **File Synchronization Tools**: Use file synchronization tools like rsync or Unison to keep your local and remote files in sync. You can set up scripts to automate the synchronization process whenever you make changes locally.

5. **Web-based IDEs**: Consider using web-based IDEs like Theia or Code-Server that can be hosted on your remote server. These IDEs provide a full-featured development environment accessible through a web browser, allowing you to edit files directly on the server.

   > [!TIP]
   > https://github.com/gitpod-io/openvscode-server is one option. It is an open-source version of VSCode that can be run on a remote server.


> [!NOTE]
> If using VSCode, whether locally or remotely, remember to run `npm install` in the instance folder root to install some standard development dependencies like ESLint. This will help maintain code quality and formatting consistency.
