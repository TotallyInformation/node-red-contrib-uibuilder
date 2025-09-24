---
title: Configuring UIBUILDER Templates
description: |
  Describes the structure of a template package and how to deploy them.
created: 2022-04-09 19:06:00
lastUpdated: 2023-09-30 13:04:09
updated: 2025-09-24 16:17:44
---

UIBUILDER has a feature that lets you quickly create a web app based on a template configuration. A template is a set of files and folders that make up the definition of a UIBUILDER web app instance. It includes the HTML, CSS, JavaScript, and any other assets needed to run the app.

Templates make it very easy to share and deploy pre-configured UIBUILDER web apps. You can create your own templates and share them with others, or use templates created by the community. This may be particularly useful for commercial organisations wanting standard apps for their customers.

## Creating

You can create a flow with a `uibuilder` node, set the URL and deploy (which creates the folder structure), change your front-end code including any build-steps, local development dependencies, API's, etc. Add a README file and make any changes you need to `package.json`.

Once you have a working app, transfer the whole folder structure from `<uibRoot>/<instance-url>` to a GitHub or GitLab repository (or anywhere else where the underlying [degit](https://github.com/Rich-Harris/degit) tool can access it). You can then reference that repository when you want to create a new copy of the app.

> [!TIP]
> Don't forget to keep any sensitive information out of the repository.

## Using

To use a template, create a flow with a `uibuilder` node, set the URL and deploy (which creates the folder structure). Then change the template to "Load an external template using Degit" and put the githubname/reponame (or other Degit compatible name) into the "External" field. On pressing "Load & Overwrite" and accepting the warning, the whole thing will overwrite the current set of folders and files.

The new template will be ready to use immediately. You may need to run `npm install` or other build steps if the template requires it. You can do this from the command line or from the new "Scripts" tab on the uibuilder node.

> [!WARNING]
> Loading a template overwrites existing files with the same names in your `<uibRoot>/<url>` server folder. So make sure you take copies before pressing the Load button if you don't want to lose them.

## Template Structure

TBC. Currently, please see one of the existing external templates or the test template. You can find these on the [Totally Information GitHub site](https://github.com/TotallyInformation?tab=repositories&q=uib-).

## Additional information

* Some additional information on templates can be found in the [Configuring UIBUILDER](uib-configuration?id=ltuibrootgtltinstance-urlgt) page.

* There is a catalogue of external templates at https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/External-Templates-Catalogue - please feel free to add your own templates there or let me know and I can add them for you.
