---
title: Configuring UIBUILDER Templates
description: |
  Describes the structure of a template package and how to deploy them.
created: 2022-04-09 19:06:00
lastUpdated: 2023-09-30 13:04:09
updated: 2023-12-30 17:01:41
---

UIBUILDER has a feature that lets you quickly create a web app based on a template configuration.

## Creating

You can create a flow with a `uibuilder` node, set the URL and deploy (which creates the folder structure), change your front-end code including any build-step, local libraries, API's, etc. Add a README file and make any changes you need to package.json.

## Using

You can then put that whole folder structure into a GitHub repository which can then be referenced when you want to create a new copy of the app. Simply create a new flow with a `uibuilder` node, set the URL, deploy. Then change the template to the githubname/reponame and the whole thing will overwrite the current folder.

## Template Structure

TBC. Currently, please see the example external template at [TotallyInformation/uib-template-svelte-simple](https://github.com/TotallyInformation/uib-template-svelte-simple) or [TotallyInformation/uib-template-test](https://github.com/TotallyInformation/uib-template-test).

## Additional information

* Some additional information on templates can be found in the [Configuring UIBUILDER](uib-configuration?id=ltuibrootgtltinstance-urlgt) page.
* There is a catalogue of external templates at https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/External-Templates-Catalogue - please feel free to add your own templates there or let me know and I can add them for you.
